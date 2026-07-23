"""Factories de teste (factory_boy)."""
from __future__ import annotations

import factory
from django.contrib.auth import get_user_model

from ecclesia.apps.accounts.models import ChurchRole
from ecclesia.apps.cells.models import Cell, CellAttendance, CellMeeting
from ecclesia.apps.members.models import Family, Member, Tag

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("email",)

    email = factory.Sequence(lambda n: f"user{n}@igreja.test")
    full_name = factory.Faker("name", locale="pt_BR")


class ChurchRoleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ChurchRole
        django_get_or_create = ("slug",)

    name = factory.Sequence(lambda n: f"Papel {n}")
    slug = factory.Sequence(lambda n: f"papel-{n}")


class TagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Tag
        django_get_or_create = ("slug",)

    name = factory.Sequence(lambda n: f"Tag {n}")
    slug = factory.Sequence(lambda n: f"tag-{n}")


class FamilyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Family

    name = factory.Faker("last_name", locale="pt_BR")
    city = "São Paulo"
    state = "SP"


class CellFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Cell

    name = factory.Sequence(lambda n: f"Célula {n}")
    day_of_week = Cell.DayOfWeek.THURSDAY
    leader = factory.SubFactory("tests.factories.MemberFactory")
    city = "São Paulo"
    state = "SP"
    latitude = -23.5505
    longitude = -46.6333


class MemberFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Member

    full_name = factory.Faker("name", locale="pt_BR")
    phone = factory.Sequence(lambda n: f"1199999{n:04d}")
    spiritual_status = Member.SpiritualStatus.VISITOR


class CellAttendanceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CellAttendance

    cell = factory.SubFactory(CellFactory)
    member = factory.SubFactory(MemberFactory)
    meeting_date = factory.Faker("date_this_year")


class CellMeetingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CellMeeting

    cell = factory.SubFactory(CellFactory)
    date = factory.Faker("date_this_year")
    attendance_count = 10

