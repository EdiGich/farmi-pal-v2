import json
import logging
import time
from datetime import datetime, timedelta

import requests

from farmipal_diagnosis.constants import CHAT_ENDPOINT, MODEL_ID

from .constants import MARKET_SYSTEM_PROMPT, LANGUAGES
from .news_search import MarketNewsSearcher

logger = logging.getLogger(__name__)


# ── Mock price data ────────────────────────────────────────────────────

MOCK_PRICE_DATA = {
    "maize": {
        "nakuru": {"price": 3200, "volatility": "medium", "trend": "rising"},
        "eldoret": {"price": 3450, "volatility": "low", "trend": "rising"},
        "nairobi": {"price": 3500, "volatility": "medium", "trend": "stable"},
        "kisumu": {"price": 3100, "volatility": "high", "trend": "falling"},
    },
    "tomato": {
        "nakuru": {"price": 4500, "volatility": "high", "trend": "rising"},
        "eldoret": {"price": 4200, "volatility": "medium", "trend": "stable"},
        "nairobi": {"price": 5000, "volatility": "low", "trend": "rising"},
        "kisumu": {"price": 3800, "volatility": "high", "trend": "falling"},
    },
    "wheat": {
        "nakuru": {"price": 4000, "volatility": "low", "trend": "stable"},
        "eldoret": {"price": 4200, "volatility": "low", "trend": "rising"},
        "nairobi": {"price": 4300, "volatility": "low", "trend": "stable"},
        "kisumu": {"price": 3900, "volatility": "medium", "trend": "falling"},
    },
    "potato": {
        "nakuru": {"price": 2800, "volatility": "medium", "trend": "rising"},
        "eldoret": {"price": 3000, "volatility": "low", "trend": "rising"},
        "nairobi": {"price": 3200, "volatility": "low", "trend": "stable"},
        "kisumu": {"price": 2600, "volatility": "medium", "trend": "falling"},
    },
}

UNITS = {"maize": "90kg bag", "tomato": "50kg crate", "wheat": "90kg bag", "potato": "50kg bag"}


def _generate_price_history(current_price: float, days: int = 30) -> list[dict]:
    """Generate a realistic price history that trends toward current_price."""
    history = []
    price = current_price * 0.88
    step = (current_price - price) / days
    for i in range(days, 0, -1):
        noise = ((hash(f"day{i}") % 100) - 50) * 2
        price += step + noise * 0.5
        history.append({
            "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
            "price": round(max(price, current_price * 0.4), 0),
        })
    return history


def _compute_change(history: list[dict], days: int) -> float:
    if len(history) < days + 1:
        return 0.0
    old_price = history[-(days + 1)]["price"]
    if old_price == 0:
        return 0.0
    current = history[-1]["price"]
    return round((current - old_price) / old_price * 100, 1)


def _fetch_price_data(crop: str, region: str) -> dict:
    crop = crop.lower()
    region = region.lower()
    regional_data = MOCK_PRICE_DATA.get(crop, {}).get(region, {})
    if not regional_data:
        return {"error": f"No data for {crop} in {region}"}

    current_price = regional_data["price"]
    history = _generate_price_history(float(current_price), 30)
    change_7d = _compute_change(history, 7)
    change_30d = _compute_change(history, 30)

    all_regions = MOCK_PRICE_DATA.get(crop, {})
    best = None
    for r, d in all_regions.items():
        if r != region and d["price"] > current_price:
            if best is None or d["price"] > best["price"]:
                best = {"name": r.capitalize(), "price": d["price"]}

    regional_rank = sorted(
        all_regions.keys(),
        key=lambda r: all_regions[r]["price"],
        reverse=True,
    ).index(region) + 1

    return {
        "crop": crop,
        "region": region.capitalize(),
        "currency": "KES",
        "unit": UNITS.get(crop, "kg"),
        "current_price": current_price,
        "price_change_7d": change_7d,
        "price_change_30d": change_30d,
        "trend": regional_data["trend"],
        "volatility": regional_data["volatility"],
        "regional_rank": regional_rank,
        "total_regions": len(all_regions),
        "best_nearby_market": best,
        "history": history[-14:],
    }


def _search_news(crop: str, region: str, price_change_pct: float) -> list[dict]:
    searcher = MarketNewsSearcher()
    try:
        results = searcher.search_news(crop=crop, region=region, price_change_pct=price_change_pct)
    except Exception as e:
        logger.warning("News search failed: %s", e)
        results = []

    return [
        {
            "title": r.title,
            "summary": r.summary,
            "source": r.source,
            "published": r.published_at,
            "tags": r.relevance_tags,
        }
        for r in results
    ]


# ── Agent entry point ──────────────────────────────────────────────────

def run_market_agent(crop: str, region: str, language: str = "en") -> dict:
    t0 = time.time()
    language_name = LANGUAGES.get(language, "English")

    market_data = _fetch_price_data(crop, region)
    if "error" in market_data:
        return market_data

    price_change = market_data.get("price_change_7d", 0)
    articles = _search_news(crop, region, price_change)

    # Build a concise data summary for the LLM
    best_market = market_data.get("best_nearby_market")
    best_line = f"Best nearby: {best_market['name']} at KES {best_market['price']}" if best_market else ""
    news_line = ""
    if articles:
        top = articles[0]
        news_line = f"News: {top['title']} — {top['summary'][:150]}"

    user_prompt = (
        f"Price: KES {market_data['current_price']} ({market_data['unit']})\n"
        f"7d: {price_change}% | 30d: {market_data['price_change_30d']}%\n"
        f"Trend: {market_data['trend']} | Volatility: {market_data['volatility']}\n"
        f"Rank: {market_data['regional_rank']}/{market_data['total_regions']}\n"
    )
    if best_line:
        user_prompt += best_line + "\n"
    if news_line:
        user_prompt += news_line + "\n"
    user_prompt += "\nGive 2-3 sentence analysis in {language}. Say sell or wait and why."

    messages = [
        {
            "role": "system",
            "content": MARKET_SYSTEM_PROMPT.format(language=language_name),
        },
        {
            "role": "user",
            "content": user_prompt.format(language=language_name),
        },
    ]

    payload = {
        "model": MODEL_ID,
        "temperature": 0.2,
        "max_tokens": 300,
        "messages": messages,
    }

    try:
        response = requests.post(CHAT_ENDPOINT, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        market_data["narrative"] = result["choices"][0]["message"].get("content", "")
    except Exception as e:
        logger.error("vLLM narrative generation failed: %s", e)
        market_data["narrative"] = "Market data retrieved."

    market_data["_meta"] = {
        "model": MODEL_ID,
        "language": language,
        "elapsed_s": round(time.time() - t0, 2),
    }

    return market_data
