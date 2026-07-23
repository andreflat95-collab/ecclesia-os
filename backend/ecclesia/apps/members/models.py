"""Models de membros, famílias e segmentação (tags).

A jornada espiritual é representada por :class:`Member.SpiritualStatus`
(Visitante → Decidido → Batizando → Membro → Líder), base para o pipeline da
Fase 7.
"""
from __future__ import annotations

from django.conf import settings
from django.db import models

from ecclesia.apps.core.models import AddressMixin, BaseModel


class Tag(BaseModel):
    """Etiqueta livre para segmentação de membros (faixa etária, interesse, etc.)."""

    name = models.CharField("nome", max_length=60, unique=True)
    slug = models.SlugField("identificador", max_length=60, unique=True)
    color = models.CharField("cor (hex)", max_length=7, blank=True, default="#6B7280")

    class Meta:
        verbose_name = "tag"
        verbose_name_plural = "tags"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Family(BaseModel, AddressMixin):
    """Agrupamento de membros por residência."""

    name = models.CharField("nome da família", max_length=255)
    phone = models.CharField("telefone", max_length=20, blank=True)
    head = models.ForeignKey(
        "members.Member",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="headed_families",
        verbose_name="responsável",
    )

    class Meta:
        verbose_name = "família"
        verbose_name_plural = "famílias"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Member(BaseModel, AddressMixin):
    """Pessoa cadastrada no CRM (visitante, membro ou líder)."""

    class Gender(models.TextChoices):
        MALE = "male", "Masculino"
        FEMALE = "female", "Feminino"
        OTHER = "other", "Outro"
        UNINFORMED = "uninformed", "Não informado"

    class SpiritualStatus(models.TextChoices):
        VISITOR = "visitor", "Visitante"
        DECIDED = "decided", "Decidido"
        BAPTIZING = "baptizing", "Batizando"
        MEMBER = "member", "Membro"
        LEADER = "leader", "Líder"

    class MaritalStatus(models.TextChoices):
        SINGLE = "single", "Solteiro(a)"
        MARRIED = "married", "Casado(a)"
        DIVORCED = "divorced", "Divorciado(a)"
        WIDOWED = "widowed", "Viúvo(a)"
        UNINFORMED = "uninformed", "Não informado"

    # ── Identidade ──
    full_name = models.CharField("nome completo", max_length=255, db_index=True)
    social_name = models.CharField("nome social", max_length=255, blank=True)
    birth_date = models.DateField("data de nascimento", null=True, blank=True)
    gender = models.CharField(
        "sexo", max_length=12, choices=Gender.choices, default=Gender.UNINFORMED
    )
    marital_status = models.CharField(
        "estado civil",
        max_length=12,
        choices=MaritalStatus.choices,
        default=MaritalStatus.UNINFORMED,
    )
    occupation = models.CharField("profissão", max_length=120, blank=True)

    # ── Contato ──
    phone = models.CharField("telefone", max_length=20, blank=True, db_index=True)
    email = models.EmailField("e-mail", blank=True)
    photo = models.ImageField("foto", upload_to="members/photos/", null=True, blank=True)
    emergency_contact = models.CharField("contato de emergência", max_length=255, blank=True)
    emergency_phone = models.CharField("telefone de emergência", max_length=20, blank=True)

    # ── Vínculos ──
    family = models.ForeignKey(
        Family,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
        verbose_name="família",
    )
    cell = models.ForeignKey(
        "cells.Cell",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
        verbose_name="célula",
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="member",
        verbose_name="usuário (login)",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="members", verbose_name="tags")

    # ── Jornada espiritual ──
    spiritual_status = models.CharField(
        "status espiritual",
        max_length=12,
        choices=SpiritualStatus.choices,
        default=SpiritualStatus.VISITOR,
        db_index=True,
    )
    conversion_date = models.DateField("data de decisão", null=True, blank=True)
    baptism_date = models.DateField("data de batismo", null=True, blank=True)
    member_since = models.DateField("membro desde", null=True, blank=True)
    notes = models.TextField("observações", blank=True)

    # ── Necessidades especiais ──
    has_special_needs = models.BooleanField("possui necessidades especiais?", default=False)
    special_needs_detail = models.TextField("detalhes das necessidades", blank=True)

    # ── LGPD ──
    consent_data_processing = models.BooleanField("consente tratamento de dados", default=False)
    consent_communications = models.BooleanField("consente comunicações", default=False)
    consent_date = models.DateTimeField("data do consentimento", null=True, blank=True)

    class Meta:
        verbose_name = "membro"
        verbose_name_plural = "membros"
        ordering = ["full_name"]
        indexes = [models.Index(fields=["spiritual_status", "is_active"])]

    def __str__(self) -> str:
        return self.full_name

    @property
    def display_name(self) -> str:
        """Nome social quando informado; caso contrário, nome completo."""
        return self.social_name or self.full_name
