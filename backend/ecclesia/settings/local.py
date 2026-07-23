"""Configurações locais com SQLite — dev rápido, sem Supabase/Postgres.

Uso: ``python manage.py runserver --settings=ecclesia.settings.local``
"""
from __future__ import annotations

from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
    }
}

# Segredo de teste para JWT (não usar em produção)
SUPABASE_JWT_SECRET = "local-dev-secret-with-at-least-32-characters!!"
SUPABASE_URL = ""
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# API pública para desenvolvimento local (sem Supabase Auth)
REST_FRAMEWORK["DEFAULT_AUTHENTICATION_CLASSES"] = [  # noqa: F405
    "rest_framework.authentication.SessionAuthentication",
]
REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"] = [  # noqa: F405
    "rest_framework.permissions.AllowAny",
]
CORS_ALLOW_ALL_ORIGINS = True
