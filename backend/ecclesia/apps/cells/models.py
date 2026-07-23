"""Models de células (pequenos grupos), reuniões e presença.

Cada célula possui coordenadas (lat/lon) que, em produção com PostGIS (Supabase),
permitem busca por proximidade via ``ST_DWithin``. Em desenvolvimento/testes o
fallback usa a fórmula de Haversine em Python puro.
"""
from __future__ import annotations

import math

from django.db import models, connection
from django.db.models import QuerySet

from ecclesia.apps.core.models import AddressMixin, BaseModel


class CellQuerySet(QuerySet):
    """QuerySet com busca geográfica."""

    def nearby(
        self, lat: float, lon: float, radius_km: float = 5.0
    ) -> QuerySet:
        """Filtra células dentro de um raio (km).

        Em PostgreSQL + PostGIS usa ``ST_DWithin`` otimizado (índice GiST).
        Caso contrário, filtra em Python usando Haversine (adequado para volumes
        pequenos em desenvolvimento/testes).
        """
        if connection.vendor == "postgresql":
            from django.db.models.expressions import RawSQL
            return self.filter(
                is_active=True,
            ).extra(
                where=[
                    "ST_DWithin("
                    "ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, "
                    "ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, %s"
                    ")"
                ],
                params=[lon, lat, radius_km * 1000],
            )

        ids = []
        for cell in self.active():
            cell_lat = float(getattr(cell, "latitude", 0) or 0)
            cell_lon = float(getattr(cell, "longitude", 0) or 0)
            dist = _haversine(lat, lon, cell_lat, cell_lon)
            if dist <= radius_km:
                ids.append(cell.pk)
        return self.filter(pk__in=ids)

    def active(self) -> QuerySet:
        """Atalho para células ativas."""
        return self.filter(is_active=True)


class Cell(BaseModel, AddressMixin):
    """Célula ou pequeno grupo."""

    class DayOfWeek(models.TextChoices):
        MONDAY = "monday", "Segunda-feira"
        TUESDAY = "tuesday", "Terça-feira"
        WEDNESDAY = "wednesday", "Quarta-feira"
        THURSDAY = "thursday", "Quinta-feira"
        FRIDAY = "friday", "Sexta-feira"
        SATURDAY = "saturday", "Sábado"
        SUNDAY = "sunday", "Domingo"

    name = models.CharField("nome da célula", max_length=255)
    description = models.TextField("descrição", blank=True)

    day_of_week = models.CharField(
        "dia da semana", max_length=10, choices=DayOfWeek.choices, db_index=True
    )
    time = models.TimeField("horário", null=True, blank=True)

    leader = models.ForeignKey(
        "members.Member",
        on_delete=models.PROTECT,
        related_name="led_cells",
        verbose_name="líder",
    )
    co_leader = models.ForeignKey(
        "members.Member",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="coled_cells",
        verbose_name="co-líder",
    )

    capacity = models.PositiveSmallIntegerField("capacidade (pessoas)", default=20)
    is_public = models.BooleanField("visível no mapa", default=True)

    latitude = models.FloatField("latitude", null=True, blank=True)
    longitude = models.FloatField("longitude", null=True, blank=True)

    objects = CellQuerySet.as_manager()

    class Meta:
        verbose_name = "célula"
        verbose_name_plural = "células"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    @property
    def location(self) -> tuple[float, float] | None:
        """Retorna (lat, lon) quando ambos informados."""
        if self.latitude is not None and self.longitude is not None:
            return self.latitude, self.longitude
        return None

    @property
    def member_count(self) -> int:
        """Número de membros ativos vinculados à célula."""
        return self.members.active().count()


class CellAttendance(BaseModel):
    """Registro de presença de um membro em uma reunião de célula."""

    cell = models.ForeignKey(
        Cell, on_delete=models.CASCADE, related_name="attendances", verbose_name="célula"
    )
    member = models.ForeignKey(
        "members.Member",
        on_delete=models.CASCADE,
        related_name="cell_attendances",
        verbose_name="membro",
    )
    meeting_date = models.DateField("data da reunião", db_index=True)
    present = models.BooleanField("presente", default=True)
    notes = models.TextField("observações", blank=True)

    class Meta:
        verbose_name = "presença em célula"
        verbose_name_plural = "presenças em células"
        ordering = ["-meeting_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["member", "cell", "meeting_date"],
                name="uq_attendance_member_cell_date",
            )
        ]

    def __str__(self) -> str:
        status = "✓" if self.present else "✗"
        return f"{self.member} — {self.cell} — {self.meeting_date} {status}"


class CellMeeting(BaseModel):
    """Relatório semanal da célula (preenchido pelo líder)."""

    cell = models.ForeignKey(
        Cell, on_delete=models.CASCADE, related_name="meetings", verbose_name="célula"
    )
    date = models.DateField("data da reunião", db_index=True)
    report = models.TextField("relatório", blank=True)
    attendance_count = models.PositiveSmallIntegerField("presentes", default=0)
    new_visitors = models.PositiveSmallIntegerField("visitantes novos", default=0)
    decisions = models.PositiveSmallIntegerField("decisões", default=0)
    notes = models.TextField("anotações do líder", blank=True)

    class Meta:
        verbose_name = "relatório de célula"
        verbose_name_plural = "relatórios de células"
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(
                fields=["cell", "date"], name="uq_meeting_cell_date"
            )
        ]

    def __str__(self) -> str:
        return f"{self.cell} — {self.date}"


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distância em km entre dois pontos (fórmula de Haversine)."""
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
