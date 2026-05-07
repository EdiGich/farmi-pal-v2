import json
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .constants import MODEL_ID, VLLM_BASE_URL
from .services import diagnose

logger = logging.getLogger(__name__)

CONFIDENCE_MAP = {
    "high": 0.9,
    "medium": 0.7,
    "low": 0.4,
}


def health_view(request):
    """Health check — returns vLLM endpoint status without hitting it."""
    return JsonResponse({
        "status": "ok",
        "vllm_endpoint": VLLM_BASE_URL,
        "model": MODEL_ID,
    })


@csrf_exempt
@require_http_methods(["POST"])
def diagnosis_view(request):
    try:
        image_source = None
        language = request.POST.get("language", "en")
        crop_hint = request.POST.get("crop_type", "") or request.POST.get("crop_hint", "")

        if request.FILES.get("image"):
            image_source = request.FILES["image"].read()

        if image_source is None:
            try:
                body = json.loads(request.body) if request.body else {}
                url = body.get("image_url", "")
                if url:
                    image_source = url
                    if "language" in body:
                        language = body["language"]
                    crop_hint = body.get("crop_type", "") or body.get("crop_hint", "") or crop_hint
            except (json.JSONDecodeError, AttributeError):
                pass

        if image_source is None:
            return JsonResponse(
                {"error": "No image provided. Send as 'image' file upload or 'image_url' in JSON body."},
                status=400,
            )

        result = diagnose(image_source, language=language, crop_hint=crop_hint)

        confidence_str = result.get("confidence", "low")
        confidence = CONFIDENCE_MAP.get(confidence_str, 0.4)

        crop = result.get("crop_identified", "Unknown")
        condition = result.get("condition", "Unknown")
        label = f"{crop}" if condition == "Healthy" else f"{crop} - {condition}"

        response_data = {
            "label": label,
            "label_key": condition,
            "confidence": confidence,
            "severity": result.get("severity", "unknown"),
            "is_healthy": result.get("is_healthy", False),
            "explanation": result.get("explanation", ""),
            "steps": result.get("immediate_steps", []),
            "watch_for": result.get("watch_for", ""),
            "cannot_identify": result.get("cannot_identify", False),
            "model_version": result.get("_meta", {}).get("model", ""),
        }

        return JsonResponse(response_data, status=200)

    except ValueError as e:
        return JsonResponse(
            {"error": str(e)},
            status=422,
        )
    except Exception as e:
        logger.exception("Diagnosis failed")
        return JsonResponse(
            {"error": f"Diagnosis service unavailable: {str(e)}"},
            status=503,
        )
