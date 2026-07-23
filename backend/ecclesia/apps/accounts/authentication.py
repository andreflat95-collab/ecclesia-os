"""Autenticação via JWT do Supabase para a API (DRF).

O Supabase Auth é a fonte de verdade. Esta classe valida o token ``Bearer``
emitido pelo Supabase (HS256, assinado com ``SUPABASE_JWT_SECRET``) e espelha o
usuário localmente, criando-o na primeira requisição (``supabase_id`` = ``sub``).
"""
from __future__ import annotations

from typing import Any

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()


class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    """Autentica requisições usando o JWT emitido pelo Supabase Auth."""

    keyword = "Bearer"

    def authenticate(self, request) -> tuple[Any, str] | None:
        """Valida o header ``Authorization: Bearer <jwt>``.

        Returns:
            Tupla ``(user, token)`` quando autenticado, ou ``None`` quando não há
            header (permitindo que outros autenticadores tentem).

        Raises:
            AuthenticationFailed: Token ausente, malformado, expirado ou inválido.
        """
        header = authentication.get_authorization_header(request).split()
        if not header or header[0].lower() != self.keyword.lower().encode():
            return None
        if len(header) == 1:
            raise exceptions.AuthenticationFailed("Token não informado.")
        if len(header) > 2:
            raise exceptions.AuthenticationFailed("Header de autorização inválido.")

        token = header[1].decode("utf-8")
        payload = self._decode(token)
        user = self._get_or_create_user(payload)
        return user, token

    def authenticate_header(self, request) -> str:
        return self.keyword

    def _decode(self, token: str) -> dict[str, Any]:
        secret = settings.SUPABASE_JWT_SECRET
        if not secret:
            raise exceptions.AuthenticationFailed("SUPABASE_JWT_SECRET não configurado.")
        try:
            return jwt.decode(
                token,
                secret,
                algorithms=settings.SUPABASE_JWT_ALGORITHMS,
                audience=settings.SUPABASE_JWT_AUDIENCE,
                options={"require": ["exp", "sub"]},
            )
        except jwt.ExpiredSignatureError as exc:
            raise exceptions.AuthenticationFailed("Token expirado.") from exc
        except jwt.InvalidTokenError as exc:
            raise exceptions.AuthenticationFailed("Token inválido.") from exc

    def _get_or_create_user(self, payload: dict[str, Any]):
        sub = payload.get("sub")
        if not sub:
            raise exceptions.AuthenticationFailed("Token sem identificador de usuário.")

        email = (payload.get("email") or "").lower()
        metadata = payload.get("user_metadata") or {}
        full_name = metadata.get("full_name") or metadata.get("name") or ""

        user, created = User.objects.get_or_create(
            supabase_id=sub,
            defaults={"email": email or f"{sub}@supabase.local", "full_name": full_name},
        )

        if not created:
            changed = []
            if email and user.email != email:
                user.email = email
                changed.append("email")
            if full_name and user.full_name != full_name:
                user.full_name = full_name
                changed.append("full_name")
            if changed:
                user.save(update_fields=changed)

        if not user.is_active:
            raise exceptions.AuthenticationFailed("Usuário inativo.")
        return user
