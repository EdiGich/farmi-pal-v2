import json
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .services import chat

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def chat_view(request):
    try:
        body = json.loads(request.body) if request.body else {}

        messages = body.get("messages", [])
        if not messages:
            return JsonResponse(
                {"error": "No messages provided. Send a 'messages' array with at least one message."},
                status=400,
            )

        language = body.get("language", "en")

        result = chat(messages=messages, language=language)

        return JsonResponse(
            {
                "reply": result["reply"],
                "sources": result["sources"],
                "suggested_followups": result["suggested_followups"],
                "language": result["language"],
            },
            status=200,
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON in request body."},
            status=400,
        )
    except Exception as e:
        logger.exception("Chat failed")
        return JsonResponse(
            {"error": f"Chat service unavailable: {str(e)}"},
            status=503,
        )
