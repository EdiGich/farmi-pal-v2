import base64
import json
import logging
import re
import time
from io import BytesIO
from pathlib import Path

import requests as req
from PIL import Image

logger = logging.getLogger(__name__)

from .constants import (
    CHAT_ENDPOINT,
    DIAGNOSIS_SYSTEM_PROMPT,
    LANGUAGES,
    MAX_TOKENS,
    MODEL_ID,
    REQUEST_TIMEOUT,
    TEMPERATURE,
    TEST_IMG_DIR,
)


def build_diagnosis_user_prompt(crop_hint: str = "") -> str:
    if crop_hint:
        return (
            f"The farmer says this is a photo of their {crop_hint} crop. "
            "Please diagnose the condition shown in the image."
        )
    return "Please diagnose the crop and condition shown in this image."


def extract_json_from_response(raw_text: str) -> dict:
    text = raw_text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fence_match:
        try:
            return json.loads(fence_match.group(1))
        except json.JSONDecodeError:
            pass

    brace_start = text.find("{")
    brace_end = text.rfind("}")

    if brace_start != -1 and brace_end != -1 and brace_end > brace_start:
        candidate = text[brace_start: brace_end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(
                f"Could not parse JSON after all extraction attempts.\n"
                f"Raw model output:\n{raw_text}", e.doc, e.pos
            )

    raise ValueError(
        f"No JSON object found in model response.\n"
        f"Raw output was:\n{raw_text}"
    )


MAX_IMAGE_SIZE = (1024, 1024)


def load_image_from_url(url: str, save_path: Path | None = None) -> tuple[Image.Image, str]:
    headers = {"User-Agent": "Mozilla/5.0 (FarmiPal diagnosis bot)"}
    r = req.get(url, headers=headers, timeout=15)
    r.raise_for_status()

    content_type = r.headers.get("Content-Type", "")
    if "image" not in content_type:
        raise ValueError(f"URL did not return an image (Content-Type: {content_type})")

    img = Image.open(BytesIO(r.content)).convert("RGB")
    img.thumbnail(MAX_IMAGE_SIZE)

    if save_path:
        img.save(save_path)

    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=80)
    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    data_uri = f"data:image/jpeg;base64,{b64}"
    return img, data_uri


def load_image_from_file(file_path: str | Path) -> tuple[Image.Image, str]:
    file_path = Path(file_path)
    img = Image.open(file_path).convert("RGB")
    img.thumbnail(MAX_IMAGE_SIZE)

    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=80)
    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    data_uri = f"data:image/jpeg;base64,{b64}"
    return img, data_uri


def load_image_from_bytes(raw_bytes: bytes) -> tuple[Image.Image, str]:
    img = Image.open(BytesIO(raw_bytes)).convert("RGB")
    img.thumbnail(MAX_IMAGE_SIZE)

    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=80)
    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    data_uri = f"data:image/jpeg;base64,{b64}"
    return img, data_uri


def call_vllm_vision(image_uri: str, language: str = "en", crop_hint: str = "") -> dict:
    language_name = LANGUAGES.get(language, "English")

    payload = {
        "model": MODEL_ID,
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS,
        "messages": [
            {
                "role": "system",
                "content": DIAGNOSIS_SYSTEM_PROMPT.replace("{language}", language_name),
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": image_uri},
                    },
                    {
                        "type": "text",
                        "text": build_diagnosis_user_prompt(crop_hint),
                    },
                ],
            },
        ],
    }

    try:
        response = req.post(CHAT_ENDPOINT, json=payload, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        
        resp_json = response.json()
        raw_text = resp_json["choices"][0]["message"]["content"]
        logger.info(f"LLM Raw Response: {raw_text}")
        
        result = extract_json_from_response(raw_text)
    except Exception as e:
        logger.error(f"vLLM call or parsing failed: {str(e)}")
        if 'response' in locals() and response.status_code != 200:
            logger.error(f"vLLM Error Body: {response.text}")
        raise ValueError(f"Diagnosis model failed to provide a valid response: {str(e)}")

    defaults = {
        "crop_identified": "Unknown",
        "condition": "Unknown",
        "confidence": "low",
        "severity": "unknown",
        "is_healthy": False,
        "explanation": "",
        "immediate_steps": [],
        "watch_for": "",
        "cannot_identify": False,
    }
    for key, default_val in defaults.items():
        result.setdefault(key, default_val)

    return result


def diagnose(image_source, language: str = "en", crop_hint: str = "") -> dict:
    start_time = time.time()
    pil_img = None
    image_uri = None
    source_type = "unknown"

    from django.core.files.uploadedfile import UploadedFile

    if isinstance(image_source, UploadedFile):
        pil_img, image_uri = load_image_from_bytes(image_source.read())
        source_type = "upload"

    elif isinstance(image_source, bytes):
        pil_img, image_uri = load_image_from_bytes(image_source)
        source_type = "upload"

    elif isinstance(image_source, (str, Path)):
        source = str(image_source)
        if source.startswith("http://") or source.startswith("https://"):
            # Pass the URL directly to the LLM instead of downloading it.
            # This avoids backend timeouts and is often what modern vision LLMs prefer.
            image_uri = source
            source_type = "url"
        else:
            pil_img, image_uri = load_image_from_file(source)
            source_type = "file"
    else:
        raise TypeError(f"Unsupported image_source type: {type(image_source)}")

    if not image_uri:
        raise ValueError("Failed to resolve image URI from source.")

    result = call_vllm_vision(image_uri, language=language, crop_hint=crop_hint)

    result["_meta"] = {
        "model": MODEL_ID,
        "language": language,
        "source_type": source_type,
        "image_size": f"{pil_img.width}x{pil_img.height}" if pil_img else "remote",
        "elapsed_s": round(time.time() - start_time, 2),
    }

    return result
