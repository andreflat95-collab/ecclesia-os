"""Testes da API de membros (CRUD + autenticação)."""
from __future__ import annotations

import pytest

from .factories import FamilyFactory, MemberFactory

pytestmark = pytest.mark.django_db


def test_listar_membros_exige_autenticacao(api_client):
    resp = api_client.get("/api/members/")
    assert resp.status_code in (401, 403)


def test_listar_membros_autenticado(auth_client):
    MemberFactory.create_batch(2)
    resp = auth_client.get("/api/members/")
    assert resp.status_code == 200
    assert resp.data["count"] == 2


def test_criar_membro(auth_client):
    family = FamilyFactory()
    payload = {
        "full_name": "João da Silva",
        "phone": "11988887777",
        "spiritual_status": "visitor",
        "family": str(family.pk),
    }
    resp = auth_client.post("/api/members/", payload, format="json")
    assert resp.status_code == 201, resp.data
    assert resp.data["display_name"] == "João da Silva"


def test_soft_delete_some_da_listagem(auth_client):
    member = MemberFactory()
    resp = auth_client.delete(f"/api/members/{member.pk}/")
    assert resp.status_code == 204
    resp = auth_client.get("/api/members/")
    assert resp.data["count"] == 0


def test_healthcheck(api_client):
    resp = api_client.get("/health/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
