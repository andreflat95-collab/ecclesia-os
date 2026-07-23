"""Testes do app cells (células, presenças, relatórios, proximidade)."""
from __future__ import annotations

import pytest
from django.db import connection

from .factories import CellFactory, CellAttendanceFactory, CellMeetingFactory, MemberFactory

pytestmark = pytest.mark.django_db


# ── Cell ────────────────────────────────────────────────────────────────────

def test_criar_celula():
    cell = CellFactory(name="Célula Central", capacity=30)
    assert cell.name == "Célula Central"
    assert cell.is_active is True
    assert cell.member_count == 0


def test_member_count_com_membros():
    cell = CellFactory()
    MemberFactory.create_batch(3, cell=cell)
    assert cell.member_count == 3


def test_cell_nearby_com_haversine_sqlite():
    """Com SQLite (fallback) o nearby filtra por Haversine."""
    sp = CellFactory(latitude=-23.5505, longitude=-46.6333)  # SP centro
    rj = CellFactory(latitude=-22.9068, longitude=-43.1729)  # RJ
    bh = CellFactory(latitude=-19.9167, longitude=-43.9345)  # BH
    result = CellFactory._meta.model.objects.nearby(-23.55, -46.63, radius_km=10)
    ids = {c.pk for c in result}
    assert sp.pk in ids
    assert rj.pk not in ids
    assert bh.pk not in ids


def test_cell_api_list(auth_client):
    CellFactory.create_batch(3)
    resp = auth_client.get("/api/cells/")
    assert resp.status_code == 200
    assert resp.data["count"] == 3


def test_cell_api_nearby(auth_client):
    sp = CellFactory(latitude=-23.5505, longitude=-46.6333, name="SP Centro")
    CellFactory(latitude=-22.9068, longitude=-43.1729, name="RJ")
    resp = auth_client.get(
        "/api/cells/nearby/?latitude=-23.55&longitude=-46.63&radius_km=10"
    )
    assert resp.status_code == 200
    assert any(c["name"] == "SP Centro" for c in resp.data)


# ── CellAttendance ──────────────────────────────────────────────────────────

def test_register_attendance():
    cell = CellFactory()
    member = MemberFactory(cell=cell)
    att = CellAttendanceFactory(cell=cell, member=member, present=True)
    assert att.present is True
    assert cell.attendances.count() == 1


def test_attendance_unique_member_cell_date():
    att1 = CellAttendanceFactory()
    from ecclesia.apps.cells.models import CellAttendance
    with pytest.raises(Exception):
        CellAttendance.objects.create(
            cell=att1.cell,
            member=att1.member,
            meeting_date=att1.meeting_date,
            present=True,
        )


def test_attendance_api(auth_client):
    cell = CellFactory()
    member = MemberFactory()
    resp = auth_client.post(
        "/api/cell-attendances/",
        {"cell": str(cell.pk), "member": str(member.pk), "meeting_date": "2026-06-20", "present": True},
        format="json",
    )
    assert resp.status_code == 201


# ── CellMeeting ─────────────────────────────────────────────────────────────

def test_meeting_report():
    cell = CellFactory()
    meeting = CellMeetingFactory(cell=cell, attendance_count=12, new_visitors=2, decisions=1)
    assert meeting.cell == cell
    assert meeting.cell.meetings.count() == 1


def test_meeting_api(auth_client):
    cell = CellFactory()
    resp = auth_client.post(
        "/api/cell-meetings/",
        {"cell": str(cell.pk), "date": "2026-06-19", "attendance_count": 8},
        format="json",
    )
    assert resp.status_code == 201
    assert resp.data["cell_name"] == cell.name


# ── Member ↔ Cell link ──────────────────────────────────────────────────────

def test_member_cell_link():
    member = MemberFactory()
    cell = CellFactory()
    member.cell = cell
    member.save()
    assert member.cell == cell
    assert cell.members.filter(pk=member.pk).exists()
