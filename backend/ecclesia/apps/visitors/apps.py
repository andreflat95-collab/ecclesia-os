"""Configuração do app de Visitantes."""
from __future__ import annotations

from django.apps import AppConfig


class VisitorsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ecclesia.apps.visitors"
    verbose_name = "Visitantes"
