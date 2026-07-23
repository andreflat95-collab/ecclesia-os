"""Configuração do app members."""
from __future__ import annotations

from django.apps import AppConfig


class MembersConfig(AppConfig):
    """App de gestão de membros e famílias."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "ecclesia.apps.members"
    label = "members"
    verbose_name = "Membros e Famílias"
