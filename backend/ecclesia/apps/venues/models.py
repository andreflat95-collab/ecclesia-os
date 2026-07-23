"""Models de áreas de lazer, quadras e reservas da igreja."""
from __future__ import annotations

from django.db import models

from ecclesia.apps.core.models import BaseModel


class Venue(BaseModel):
    """Espaço físico da igreja disponível para reserva (quadra, churrasqueira, salão)."""

    class VenueType(models.TextChoices):
        SPORTS_COURT = "sports_court", "Quadra Poliesportiva"
        SOCCER_FIELD = "soccer_field", "Campo de Futebol"
        VOLLEYBALL = "volleyball", "Quadra de Vôlei"
        BASKETBALL = "basketball", "Quadra de Basquete"
        BBQ_AREA = "bbq_area", "Área de Churrasco"
        HALL = "hall", "Salão de Festas"
        PLAYGROUND = "playground", "Parquinho"
        OTHER = "other", "Outro"

    name = models.CharField("nome", max_length=120)
    venue_type = models.CharField("tipo", max_length=20, choices=VenueType.choices, default=VenueType.SPORTS_COURT)
    description = models.TextField("descrição", blank=True)
    capacity = models.PositiveIntegerField("capacidade (pessoas)", null=True, blank=True)
    location = models.CharField("localização", max_length=255, blank=True)
    image = models.ImageField("foto", upload_to="venues/", null=True, blank=True)

    # Regras
    requires_approval = models.BooleanField("requer aprovação", default=False)
    max_hours_per_booking = models.PositiveSmallIntegerField("horas máx. por reserva", default=4)
    min_days_advance = models.PositiveSmallIntegerField("dias mín. de antecedência", default=1)

    class Meta:
        verbose_name = "espaço/quadra"
        verbose_name_plural = "espaços/quadras"
        ordering = ["venue_type", "name"]

    def __str__(self) -> str:
        return f"{self.get_venue_type_display()}: {self.name}"


class VenueBooking(BaseModel):
    """Reserva de um espaço por um ministério ou membro."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        APPROVED = "approved", "Aprovado"
        REJECTED = "rejected", "Rejeitado"
        CANCELLED = "cancelled", "Cancelado"

    venue = models.ForeignKey(
        Venue, on_delete=models.CASCADE, related_name="bookings", verbose_name="espaço"
    )
    ministry = models.ForeignKey(
        "ministries.Ministry",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="venue_bookings",
        verbose_name="ministério",
    )
    title = models.CharField("título do evento", max_length=255)
    description = models.TextField("descrição", blank=True)
    date = models.DateField("data", db_index=True)
    start_time = models.TimeField("horário de início")
    end_time = models.TimeField("horário de término")
    contact_name = models.CharField("responsável", max_length=120)
    contact_phone = models.CharField("telefone", max_length=20, blank=True)
    attendees_count = models.PositiveIntegerField("número de participantes", null=True, blank=True)
    status = models.CharField("status", max_length=15, choices=Status.choices, default=Status.PENDING, db_index=True)
    notes = models.TextField("observações", blank=True)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="venue_bookings",
        verbose_name="criado por",
    )

    class Meta:
        verbose_name = "reserva"
        verbose_name_plural = "reservas"
        ordering = ["-date", "start_time"]
        indexes = [models.Index(fields=["venue", "date"]), models.Index(fields=["status"])]

    def __str__(self) -> str:
        return f"{self.title} — {self.venue.name} ({self.date})"
