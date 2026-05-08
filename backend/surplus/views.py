import json
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .agent import run_surplus_agent
from .geo import region_to_coords

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def surplus_view(request):
    try:
        body = json.loads(request.body) if request.body else {}

        crop = body.get("crop", "maize")
        region = body.get("region", "nakuru")
        language = body.get("language", "en")
        lat, lon = region_to_coords(region)
        price_change_7d = body.get("price_change_7d", -4.1)

        result = run_surplus_agent(
            crop=crop,
            region=region,
            lat=lat,
            lon=lon,
            language=language,
            price_change_7d=price_change_7d,
        )

        response_data = {
            "crop": result["crop"],
            "region": result["region"],
            "risk_score": result["risk_score"],
            "risk_level": result["risk_level"],
            "confidence": result["confidence"],
            "risk_reasons": result["risk_reasons"],
            "narrative": result["narrative"],
            "weather_summary": result["weather_summary"],
            "enso_data": result["enso_data"],
            "season": result["season"],
            "alternatives": result["alternatives"],
            "best_alternative_market": result.get("best_alternative_market"),
            "triggered_factors": result.get("triggered_factors", []),
            "generated_at": result["generated_at"],
        }

        return JsonResponse(response_data, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.exception("Surplus analysis failed")
        return JsonResponse(
            {"error": f"Surplus analysis unavailable: {str(e)}"},
            status=503,
        )
