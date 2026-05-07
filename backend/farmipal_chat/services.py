import logging
import time

import requests

from farmipal_diagnosis.constants import CHAT_ENDPOINT, MODEL_ID

from .constants import (
    CHAT_SYSTEM_PROMPT,
    LANGUAGES,
    MAX_TOKENS,
    REQUEST_TIMEOUT,
    TEMPERATURE,
)

logger = logging.getLogger(__name__)


def chat(
    messages: list[dict],
    language: str = "en",
) -> dict:
    """
    Send a chat conversation to the LLM and return the assistant's reply.

    Parameters
    ----------
    messages : list[dict]
        List of {role, content} dicts representing the conversation history.
    language : str
        "en" or "sw"

    Returns
    -------
    dict with keys: reply, sources, suggested_followups, language
    """
    t0 = time.time()
    language_name = LANGUAGES.get(language, "English")

    payload = {
        "model": MODEL_ID,
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS,
        "messages": [
            {
                "role": "system",
                "content": CHAT_SYSTEM_PROMPT.format(language=language_name),
            },
            *messages,
        ],
    }

    response = requests.post(
        CHAT_ENDPOINT,
        json=payload,
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()

    raw_text = response.json()["choices"][0]["message"]["content"]

    result = {
        "reply": raw_text,
        "sources": [],
        "suggested_followups": [],
        "language": language,
        "_meta": {
            "model": MODEL_ID,
            "language": language,
            "message_count": len(messages),
            "elapsed_s": round(time.time() - t0, 2),
        },
    }

    return result
