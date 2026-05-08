import json
import logging
import time

import requests

from farmipal_diagnosis.constants import CHAT_ENDPOINT, MODEL_ID

from .data_sources import get_weather_data, get_enso_data, get_chirps_anomaly
from .heuristics import compute_surplus_risk
from .season_calendar import SeasonCalendar

logger = logging.getLogger(__name__)

LANGUAGES = {
    "en": "English",
    "sw": "Swahili",
}

SYSTEM_PROMPT = """You are a surplus risk intelligence agent for smallholder farmers in East Africa.

You will be given:
1. A heuristic surplus risk score (0-100) with triggered factors
2. Weather data (rainfall forecast, anomaly, drought history)
3. ENSO phase (El Niño / La Niña / neutral)
4. Market price trend

Synthesize a plain-language warning in {language}. Include:
1. A 2-sentence risk summary — direct, not alarmist
2. Whether to sell now, store, or process — with one clear recommendation
3. Confidence level and why

Key East Africa knowledge:
- El Niño enhances Kenya long rains (MAM) → higher yields → surplus risk
- La Niña suppresses OND short rains → drought → deficit risk
- North Rift (Trans Nzoia, Uasin Gishu, Nakuru) harvests Nov-Dec simultaneously
- Tanzania surplus = reduced import demand = Kenya price falls
- Road flooding (Apr-Jun in Western, Oct-Dec in North Rift) traps surplus locally

Keep response to 3-4 sentences. Be direct. Farmers need a clear recommendation.
"""


def run_surplus_agent(
    crop: str,
    region: str,
    lat: float,
    lon: float,
    language: str = "en",
    fertilizer_subsidy_active: bool = True,
    price_change_7d: float = -4.1,
) -> dict:
    t0 = time.time()
    language_name = LANGUAGES.get(language, "English")
    calendar = SeasonCalendar()
    county = region.lower().replace(" ", "_")

    # Step 1: Gather data deterministically
    weather = get_weather_data(lat, lon)
    enso = get_enso_data()
    chirps_anomaly = get_chirps_anomaly(county)

    # Step 2: Run heuristic scoring engine
    score = compute_surplus_risk(
        crop=crop,
        region=region,
        weather=weather,
        enso=enso,
        market_price_change_7d=price_change_7d,
        season_calendar=calendar,
        fertilizer_subsidy_active=fertilizer_subsidy_active,
        chirps_anomaly=chirps_anomaly,
    )

    triggered = [f for f in score.factors if f["triggered"]]
    triggered_reasons = "; ".join(f.get("reason", f["rule"]) for f in triggered)

    # Step 3: Build alternatives
    alternatives = _get_alternatives(score.risk_level, crop, region)

    # Step 4: Generate narrative via vLLM
    narrative = _generate_narrative(
        crop=crop,
        region=region,
        score=score,
        weather=weather,
        enso=enso,
        triggered_reasons=triggered_reasons,
        language_name=language_name,
    )

    # Step 5: Build response matching README spec
    return {
        "crop": crop,
        "region": region.capitalize(),
        "risk_score": score.total,
        "risk_level": score.risk_level,
        "confidence": score.confidence,
        "risk_reasons": [f["rule"] for f in triggered],
        "triggered_factors": [{"rule": f["rule"], "reason": f.get("reason", "")} for f in triggered],
        "narrative": narrative,
        "weather_summary": {
            "forecast_rainfall_14d_mm": weather.forecast_14d_mm,
            "anomaly_pct": weather.anomaly_pct,
            "drought_months_last_12": weather.drought_months_last_12,
            "outlook": (
                "Wetter than average — yields expected above normal across region"
                if weather.anomaly_pct > 15
                else "Near-average rainfall expected"
                if weather.anomaly_pct > -15
                else "Drier than average — yields may be below normal"
            ),
        },
        "enso_data": {
            "phase": enso.phase,
            "oni_value": round(enso.oni_value, 2),
            "trend": enso.trend,
            "interpretation": {
                "el_nino": "El Niño enhances East Africa long rains → above-average yields → surplus risk",
                "la_nina": "La Niña suppresses short rains → drought risk → deficit",
                "neutral": "Near-average rainfall expected this season",
            }.get(enso.phase, ""),
        },
        "season": calendar.get_current_season(),
        "alternatives": alternatives,
        "best_alternative_market": _get_best_market(region),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "_meta": {
            "model": MODEL_ID,
            "language": language,
            "elapsed_s": round(time.time() - t0, 2),
        },
    }


def _generate_narrative(
    crop: str,
    region: str,
    score,
    weather,
    enso,
    triggered_reasons: str,
    language_name: str,
) -> str:
    enso_desc = {
        "el_nino": f"El Niño (ONI={enso.oni_value:+.1f}°C, {enso.trend}) — enhances long rains",
        "la_nina": f"La Niña (ONI={enso.oni_value:+.1f}°C, {enso.trend}) — suppresses short rains",
        "neutral": "ENSO neutral — near-average rainfall expected",
    }.get(enso.phase, "ENSO data unavailable")

    prompt = (
        f"Crop: {crop}\nRegion: {region}, Kenya\n"
        f"Risk score: {score.total}/100 ({score.risk_level})\n"
        f"Confidence: {score.confidence}\n"
        f"Triggered factors: {triggered_reasons}\n"
        f"Weather: {weather.forecast_14d_mm}mm forecast, {weather.anomaly_pct:+.0f}% anomaly, "
        f"{weather.drought_months_last_12} drought months\n"
        f"ENSO: {enso_desc}\n"
        f"Season: {weather.temp_max_avg:.0f}°C avg temp\n\n"
        f"Give a 3-4 sentence surplus risk warning in {language_name}. "
        f"Say sell now, store, or process — and why."
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT.format(language=language_name)},
        {"role": "user", "content": prompt},
    ]

    try:
        response = requests.post(
            CHAT_ENDPOINT,
            json={
                "model": MODEL_ID,
                "temperature": 0.2,
                "max_tokens": 400,
                "messages": messages,
            },
            timeout=60,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"].get("content", "")
    except Exception as e:
        logger.error("vLLM narrative generation failed: %s", e)
        return f"{crop} surplus risk in {region} is {score.risk_level} (score: {score.total}/100). {len([f for f in score.factors if f['triggered']])} risk factors triggered."


def _get_alternatives(risk_level: str, crop: str, region: str) -> list[dict]:
    region_label = region.capitalize()
    common = [
        {
            "type": "sell_early",
            "label": "Sell within 2 weeks",
            "rationale": "Before peak market saturation hits",
            "action": f"Contact {region_label} market traders now. Price expected to drop further.",
        },
        {
            "type": "store",
            "label": "Use certified storage",
            "rationale": "Wait 8-10 weeks for post-harvest price recovery",
            "action": f"Nearest certified warehouse: NCPB {region_label}.",
        },
        {
            "type": "process",
            "label": "Process into flour/value-added",
            "rationale": "Adds ~40% value, avoids direct commodity market",
            "action": "Smallholder milling cooperatives active in your area.",
        },
    ]
    if risk_level in ("critical", "high"):
        return common
    if risk_level == "medium":
        return [
            {
                "type": "sell_early",
                "label": "Monitor market for 1-2 weeks",
                "rationale": "Price hasn't dropped significantly yet",
                "action": "Check market prices daily.",
            },
            {
                "type": "store",
                "label": "Prepare storage",
                "rationale": "In case prices start falling",
                "action": "NCPB has storage capacity available.",
            },
            {
                "type": "process",
                "label": "Dry and clean produce",
                "rationale": "Improve quality for better price",
                "action": "Well-dried produce sells at premium.",
            },
        ]
    return [
        {
            "type": "sell_early",
            "label": "Sell at current price",
            "rationale": "Market is stable",
            "action": "Prices expected to remain stable this week.",
        },
        {
            "type": "store",
            "label": "Short-term storage",
            "rationale": "Wait for seasonal price increase",
            "action": "Store in dry conditions.",
        },
        {
            "type": "process",
            "label": "Prepare for next season",
            "rationale": "Plan crop rotation",
            "action": "Consider planting vegetables for market demand.",
        },
    ]


def _get_best_market(region: str) -> dict | None:
    alt_markets = {
        "nakuru": {"name": "Eldoret", "price_premium_pct": 8, "distance_km": 90},
        "eldoret": {"name": "Nakuru", "price_premium_pct": 5, "distance_km": 90},
        "nairobi": {"name": "Nakuru", "price_premium_pct": -5, "distance_km": 160},
        "kisumu": {"name": "Eldoret", "price_premium_pct": 10, "distance_km": 120},
        "trans_nzoia": {"name": "Eldoret", "price_premium_pct": 6, "distance_km": 60},
    }
    key = region.lower().replace(" ", "_").replace("-", "_")
    market = alt_markets.get(key)
    if market:
        return {**market, "saturation_risk": "low" if market["price_premium_pct"] > 0 else "high"}
    return None
