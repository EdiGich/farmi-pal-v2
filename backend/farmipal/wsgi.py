import os
from pathlib import Path

from django.core.wsgi import get_wsgi_application

# Load .env for local development (Render sets env vars directly)
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "farmipal.settings")

application = get_wsgi_application()
