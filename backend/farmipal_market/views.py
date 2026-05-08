import logging

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .agent import run_market_agent

logger = logging.getLogger(__name__)


@require_http_methods(["GET"])
def market_view(request):
    try:
        crop = request.GET.get("crop", "maize").lower()
        region = request.GET.get("region", "nakuru").lower()
        language = request.GET.get("lang", "en")

        result = run_market_agent(crop=crop, region=region, language=language)

        response_data = {
            "crop": result.get("crop", crop),
            "region": result.get("region", region.capitalize()),
            "currency": result.get("currency", "KES"),
            "unit": result.get("unit", "90kg bag"),
            "current_price": result.get("current_price"),
            "price_change_7d": result.get("price_change_7d"),
            "price_change_30d": result.get("price_change_30d"),
            "trend": result.get("trend", "stable"),
            "volatility": result.get("volatility", "medium"),
            "regional_rank": result.get("regional_rank"),
            "best_nearby_market": result.get("best_nearby_market"),
            "narrative": result.get("narrative", ""),
            "history": result.get("history", []),
            "updated_at": result.get("_meta", {}).get("updated_at", ""),
        }

        return JsonResponse(response_data, status=200)

    except Exception as e:
        logger.exception("Market analysis failed")
        return JsonResponse(
            {"error": f"Market analysis unavailable: {str(e)}"},
            status=503,
        )
