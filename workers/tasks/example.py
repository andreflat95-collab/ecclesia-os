"""Task de exemplo para validar a infraestrutura Celery."""
from __future__ import annotations

from workers.celery_app import celery_app


@celery_app.task(name="workers.tasks.ping")
def ping() -> str:
    """Retorna ``pong`` — usada para smoke test do worker."""
    return "pong"
