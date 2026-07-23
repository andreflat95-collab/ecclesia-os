"""Fixtures compartilhadas dos testes."""
from __future__ import annotations

import time
import uuid

import jwt
import pytest
from django.conf import settings
from rest_framework.test import APIClient


def make_supabase_token(
    sub: str | None = None,
    email: str = "membro@igreja.test",
    full_name: str = "Membro Teste",
    expired: bool = False,
) -> str:
    """Gera um JWT no formato do Supabase para uso nos testes.

    Args:
        sub: UUID do usuário (gerado se omitido).
        email: E-mail do usuário.
        full_name: Nome em ``user_metadata``.
        expired: Quando ``True``, emite um token já expirado.
    """
    now = int(time.time())
    payload = {
        "sub": sub or str(uuid.uuid4()),
        "email": email,
        "aud": settings.SUPABASE_JWT_AUDIENCE,
        "role": "authenticated",
        "iat": now,
        "exp": now - 10 if expired else now + 3600,
        "user_metadata": {"full_name": full_name},
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


@pytest.fixture
def api_client() -> APIClient:
    """Cliente de API sem autenticação."""
    return APIClient()


@pytest.fixture
def auth_client() -> APIClient:
    """Cliente de API autenticado com um JWT Supabase válido."""
    client = APIClient()
    token = make_supabase_token()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client
