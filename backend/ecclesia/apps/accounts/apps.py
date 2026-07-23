"""Configuração do app accounts."""
from __future__ import annotations

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """App de autenticação, usuários e papéis eclesiásticos."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "ecclesia.apps.accounts"
    label = "accounts"
    verbose_name = "Contas e Acessos"
