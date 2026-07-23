"""Configuração do app cells."""
from __future__ import annotations

from django.apps import AppConfig


class CellsConfig(AppConfig):
    """App de células, pequenos grupos e presença."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "ecclesia.apps.cells"
    label = "cells"
    verbose_name = "Células e Grupos"
