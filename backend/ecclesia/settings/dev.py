"""Configurações de desenvolvimento."""
from __future__ import annotations

from .base import *  # noqa: F401,F403
from .base import env

DEBUG = True
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS += ["django_extensions"]  # noqa: F405

# E-mails caem no console em dev.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
