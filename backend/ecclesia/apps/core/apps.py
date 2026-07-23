"""Configuração do app core."""
from __future__ import annotations

from django.apps import AppConfig


class CoreConfig(AppConfig):
    """App com models base, mixins e utilidades compartilhadas."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "ecclesia.apps.core"
    label = "core"
    verbose_name = "Núcleo"
