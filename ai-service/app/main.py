"""Microserviço de IA do EcclesiaOS (FastAPI).

Stub da Fase 1: expõe apenas um healthcheck. O agente de IA no WhatsApp
(RAG com LangChain + pgvector), webhooks e check-in entram na Fase 3+.
"""
from __future__ import annotations

from fastapi import FastAPI

app = FastAPI(title="EcclesiaOS AI Service", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    """Verificação de saúde do serviço."""
    return {"status": "ok", "service": "ecclesia-ai"}
