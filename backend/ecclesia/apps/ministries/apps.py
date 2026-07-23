"""Configuração do app de Ministérios."""
from __future__ import annotations

from django.apps import AppConfig


class MinistriesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ecclesia.apps.ministries"
    verbose_name = "Ministérios"
