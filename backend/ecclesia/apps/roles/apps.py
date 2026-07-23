"""Configuração do app de Perfis e Permissões."""
from __future__ import annotations

from django.apps import AppConfig


class RolesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ecclesia.apps.roles"
    verbose_name = "Perfis e Permissões"
