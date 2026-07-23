"""Aplicação Celery do EcclesiaOS.

Stub da Fase 1: configura o broker/result backend via variáveis de ambiente e
registra as tasks de exemplo. As filas reais (comunicação, finanças, jornada)
são implementadas nas fases correspondentes.
"""
from __future__ import annotations

import os

from celery import Celery

celery_app = Celery(
    "ecclesia",
    broker=os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/1"),
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
)

celery_app.autodiscover_tasks(["workers.tasks"])
