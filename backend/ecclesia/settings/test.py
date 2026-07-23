"""Configurações de teste: SQLite em memória, sem dependência de Postgres/Supabase."""
from __future__ import annotations

from .base import *  # noqa: F401,F403

DEBUG = False

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Segredo determinístico para assinar/validar JWTs nos testes.
SUPABASE_JWT_SECRET = "test-secret-key-with-at-least-32-characters!!"
SUPABASE_JWT_AUDIENCE = "authenticated"

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
