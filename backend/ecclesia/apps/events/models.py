"""Models de eventos, programações e calendário da igreja."""
from __future__ import annotations

from django.db import models

from ecclesia.apps.core.models import BaseModel


class Event(BaseModel):
    """Evento ou programação da igreja (culto, reunião, conferência, etc.)."""

    class EventType(models.TextChoices):
        SERVICE = "service", "Culto"
        PRAYER_MEETING = "prayer_meeting", "Reunião de Oração"
        CONFERENCE = "conference", "Conferência"
        YOUTH = "youth", "Jovens"
        WOMEN = "women", "Mulheres"
        MEN = "men", "Homens"
        CHILDREN = "children", "Infantil"
        SOCIAL = "social", "Ação Social"
        TRAINING = "training", "Treinamento"
        OTHER = "other", "Outro"

    class Recurrence(models.TextChoices):
        NONE = "none", "Não se repete"
        DAILY = "daily", "Diariamente"
        WEEKLY = "weekly", "Semanalmente"
        BIWEEKLY = "biweekly", "Quinzenalmente"
        MONTHLY = "monthly", "Mensalmente"

    title = models.CharField("título", max_length=255)
    slug = models.SlugField("identificador", max_length=255, unique=True)
    description = models.TextField("descrição", blank=True)
    event_type = models.CharField(
        "tipo", max_length=20, choices=EventType.choices, default=EventType.OTHER
    )
    recurrence = models.CharField(
        "recorrência", max_length=15, choices=Recurrence.choices, default=Recurrence.NONE
    )

    start_date = models.DateTimeField("data e hora de início", db_index=True)
    end_date = models.DateTimeField("data e hora de término", null=True, blank=True)
    location = models.CharField("local", max_length=255, blank=True)
    address = models.TextField("endereço", blank=True)

    image = models.ImageField("imagem/banner", upload_to="events/images/", null=True, blank=True)
    contact_name = models.CharField("contato", max_length=120, blank=True)
    contact_phone = models.CharField("telefone do contato", max_length=20, blank=True)

    ministry = models.ForeignKey(
        "ministries.Ministry",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
        verbose_name="ministério organizador",
    )
    max_attendees = models.PositiveIntegerField("vagas", null=True, blank=True)
    is_featured = models.BooleanField("destaque", default=False)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_events",
        verbose_name="criado por",
    )

    class Meta:
        verbose_name = "evento"
        verbose_name_plural = "eventos"
        ordering = ["start_date"]
        indexes = [
            models.Index(fields=["start_date", "is_active"]),
            models.Index(fields=["event_type", "is_active"]),
        ]

    def __str__(self) -> str:
        return self.title
