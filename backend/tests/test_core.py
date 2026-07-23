"""Testes do app core (soft delete, base model)."""
from __future__ import annotations

import pytest

from .factories import MemberFactory

pytestmark = pytest.mark.django_db


def test_soft_delete_marca_inativo_sem_remover():
    member = MemberFactory()
    member_id = member.pk

    member.delete()

    member.refresh_from_db()
    assert member.is_active is False
    from ecclesia.apps.members.models import Member

    assert not Member.objects.active().filter(pk=member_id).exists()
    assert Member.objects.filter(pk=member_id).exists()


def test_restore_reativa_registro():
    member = MemberFactory()
    member.delete()
    member.restore()
    assert member.is_active is True


def test_hard_delete_remove_fisicamente():
    member = MemberFactory()
    pk = member.pk
    member.hard_delete()
    from ecclesia.apps.members.models import Member

    assert not Member.objects.filter(pk=pk).exists()


def test_queryset_delete_em_massa_eh_soft():
    MemberFactory.create_batch(3)
    from ecclesia.apps.members.models import Member

    Member.objects.all().delete()
    assert Member.objects.active().count() == 0
    assert Member.objects.count() == 3
