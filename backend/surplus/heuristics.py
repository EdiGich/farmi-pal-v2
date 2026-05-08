from dataclasses import dataclass, field
from .data_sources import WeatherData, EnsoData
from .season_calendar import SeasonCalendar


@dataclass
class SurplusScore:
    total: int
    risk_level: str
    factors: list[dict]
    confidence: str


SCORING_RULES = [
    {"rule": "peak_harvest_month",        "weight": 25,
     "description": "Currently in peak harvest window for this crop/region"},
    {"rule": "harvest_imminent",          "weight": 15,
     "description": "Harvest within 4 weeks — supply surge approaching"},
    {"rule": "rainfall_above_average",    "weight": 20,
     "description": "Rainfall 15%+ above average → above-normal yields expected"},
    {"rule": "enso_surplus_signal",       "weight": 15,
     "description": "El Niño phase → enhanced long rains → higher East Africa yields"},
    {"rule": "no_drought_stress",         "weight": 10,
     "description": "No drought months in last 12 → uninterrupted growing season"},
    {"rule": "neighbor_counties_harvesting", "weight": 15,
     "description": "3+ neighboring counties in simultaneous harvest"},
    {"rule": "regional_countries_harvesting", "weight": 10,
     "description": "Tanzania/Uganda in peak harvest → regional supply glut"},
    {"rule": "price_already_falling",     "weight": 15,
     "description": "Market price declining >5% already — supply pressure starting"},
    {"rule": "road_access_risk",          "weight": 10,
     "description": "Road access limited by rains → surplus trapped in region"},
    {"rule": "high_fertilizer_uptake",    "weight": 10,
     "description": "Fertilizer subsidy active → higher input use → above-avg yields"},
]


def compute_surplus_risk(
    crop: str,
    region: str,
    weather: WeatherData,
    enso: EnsoData,
    market_price_change_7d: float,
    season_calendar: SeasonCalendar,
    fertilizer_subsidy_active: bool = True,
    chirps_anomaly: float = None
) -> SurplusScore:
    raw_score = 0
    factors = []

    def check(rule_name: str, condition: bool, reason: str):
        nonlocal raw_score
        rule = next((r for r in SCORING_RULES if r["rule"] == rule_name), None)
        if not rule:
            return
        triggered = condition
        if triggered:
            raw_score += rule["weight"]
        factors.append({
            "rule": rule_name,
            "weight": rule["weight"],
            "triggered": triggered,
            "reason": reason if triggered else rule["description"]
        })

    rainfall_anomaly = chirps_anomaly if chirps_anomaly is not None else weather.anomaly_pct

    check("peak_harvest_month",
          season_calendar.is_peak_harvest(crop, region),
          f"{region} is in peak harvest for {crop} this month")

    weeks_to_harvest = season_calendar.weeks_to_harvest(crop, region) or 99
    check("harvest_imminent",
          0 < weeks_to_harvest <= 4,
          f"Harvest approximately {weeks_to_harvest} weeks away")

    check("rainfall_above_average",
          rainfall_anomaly > 15,
          f"Rainfall {rainfall_anomaly:+.0f}% vs historical average — above-normal yield expected")

    check("enso_surplus_signal",
          enso.phase == "el_nino" and enso.east_africa_effect == "surplus_risk",
          f"El Niño ONI={enso.oni_value:+.1f}°C ({enso.trend}) — enhances East Africa long rains")

    check("no_drought_stress",
          weather.drought_months_last_12 == 0,
          "No drought months in growing season — full yield potential")

    neighbor_counties = season_calendar.harvesting_neighbor_counties(crop, region)
    check("neighbor_counties_harvesting",
          len(neighbor_counties) >= 2,
          f"{len(neighbor_counties)} neighboring counties also harvesting: {', '.join(neighbor_counties)}")

    regional_countries = season_calendar.regional_countries_harvesting(crop)
    check("regional_countries_harvesting",
          len(regional_countries) > 0,
          f"Regional surplus from: {', '.join(regional_countries)} — import competition reduced")

    check("price_already_falling",
          market_price_change_7d < -5.0,
          f"Price already down {market_price_change_7d:.1f}% this week — early supply pressure")

    check("road_access_risk",
          season_calendar.is_road_season_risk(region),
          f"Road access limited in {region} during this season — surplus may be trapped locally")

    current_year = season_calendar.today.year
    check("high_fertilizer_uptake",
          fertilizer_subsidy_active and current_year >= 2023,
          "Government fertilizer subsidy active this season → higher input use → above-avg yields")

    max_raw = sum(r["weight"] for r in SCORING_RULES)
    normalized = int((raw_score / max_raw) * 100)

    if normalized >= 65:
        risk_level = "critical"
    elif normalized >= 45:
        risk_level = "high"
    elif normalized >= 25:
        risk_level = "medium"
    else:
        risk_level = "low"

    triggered_count = sum(1 for f in factors if f["triggered"])
    if chirps_anomaly is not None and triggered_count >= 4:
        confidence = "high"
    elif triggered_count >= 2:
        confidence = "medium"
    else:
        confidence = "low"

    return SurplusScore(
        total=normalized,
        risk_level=risk_level,
        factors=factors,
        confidence=confidence
    )
