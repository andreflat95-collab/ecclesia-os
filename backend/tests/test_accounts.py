"""Testes do app accounts (User manager e autenticação Supabase)."""
from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from rest_framework import exceptions

from ecclesia.apps.accounts.authentication import SupabaseJWTAuthentication

from .conftest import make_supabase_token

User = get_user_model()
pytestmark = pytest.mark.django_db


def test_create_user_sem_senha_fica_inutilizavel():
    user = User.objects.create_user(email="a@b.com")
    assert user.has_usable_password() is False
    assert user.is_staff is False


def test_create_superuser_tem_senha_e_flags():
    user = User.objects.create_superuser(email="admin@b.com", password="x123456!")
    assert user.is_staff and user.is_superuser
    assert user.check_password("x123456!")


def _authenticate(token: str):
    auth = SupabaseJWTAuthentication()

    class _Req:
        META = {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    return auth.authenticate(_Req())


def test_jwt_valido_cria_usuario_espelhado():
    token = make_supabase_token(email="novo@igreja.test", full_name="Novo Membro")
    user, returned = _authenticate(token)
    assert user.email == "novo@igreja.test"
    assert user.full_name == "Novo Membro"
    assert user.supabase_id is not None
    assert User.objects.filter(supabase_id=user.supabase_id).count() == 1


def test_jwt_reutiliza_usuario_existente():
    import uuid

    sub = str(uuid.uuid4())
    _authenticate(make_supabase_token(sub=sub, email="x@igreja.test"))
    _authenticate(make_supabase_token(sub=sub, email="x@igreja.test"))
    assert User.objects.filter(supabase_id=sub).count() == 1


def test_jwt_expirado_falha():
    token = make_supabase_token(expired=True)
    with pytest.raises(exceptions.AuthenticationFailed):
        _authenticate(token)


def test_jwt_assinatura_invalida_falha():
    import jwt as pyjwt

    bad = pyjwt.encode(
        {"sub": "1", "aud": "authenticated", "exp": 9999999999},
        "segredo-errado",
        algorithm="HS256",
    )
    with pytest.raises(exceptions.AuthenticationFailed):
        _authenticate(bad)
