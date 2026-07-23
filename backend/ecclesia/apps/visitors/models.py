"""Models de visitantes e workflow de follow-up.

O workflow padrão após a primeira visita:
1. 1º contato (24h): mensagem de boas-vindas
2. Convite para célula (72h): direcionar para uma célula próxima
3. Convite para culto (7d): reforçar o convite para o próximo culto
"""
from __future__ import annotations

from django.db import models

from ecclesia.apps.core.models import BaseModel


class Visitor(BaseModel):
    """Pessoa que visitou a igreja e ainda não é membro.

    O follow-up é gerenciado pelo campo ``follow_up_stage`` com datas
    de execução em ``first_contact_at``, ``cell_invite_at`` e
    ``service_invite_at``.
    """

    class HowFound(models.TextChoices):
        FRIEND = "friend", "Amigo/Parente"
        SOCIAL_MEDIA = "social_media", "Redes Sociais"
        WEBSITE = "website", "Site da Igreja"
        PASSING_BY = "passing_by", "Passou em frente"
        EVENT = "event", "Evento"
        OTHER = "other", "Outro"

    class FollowUpStage(models.TextChoices):
        NEW = "new", "Novo — aguardando 1º contato"
        CONTACTED = "contacted", "1º contato realizado"
        CELL_INVITED = "cell_invited", "Convidado para célula"
        SERVICE_INVITED = "service_invited", "Convidado para culto"
        CONVERTED = "converted", "Convertido a membro"
        INACTIVE = "inactive", "Não respondeu"

    full_name = models.CharField("nome completo", max_length=255, db_index=True)
    phone = models.CharField("telefone", max_length=20, blank=True, db_index=True)
    email = models.EmailField("e-mail", blank=True)
    visit_date = models.DateField("data da visita", db_index=True)
    how_found = models.CharField(
        "como conheceu",
        max_length=15,
        choices=HowFound.choices,
        default=HowFound.OTHER,
    )
    how_found_detail = models.CharField("detalhe", max_length=255, blank=True)

    # ── Interesses ──
    interested_ministry = models.ForeignKey(
        "ministries.Ministry",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="interested_visitors",
        verbose_name="ministério de interesse",
    )
    wants_cell = models.BooleanField("quer participar de célula?", default=False)

    # ── Follow-up ──
    follow_up_stage = models.CharField(
        "etapa do follow-up",
        max_length=20,
        choices=FollowUpStage.choices,
        default=FollowUpStage.NEW,
        db_index=True,
    )
    first_contact_at = models.DateTimeField("1º contato em", null=True, blank=True)
    cell_invite_at = models.DateTimeField("convite célula em", null=True, blank=True)
    service_invite_at = models.DateTimeField("convite culto em", null=True, blank=True)
    converted_member = models.ForeignKey(
        "members.Member",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="visitor_origin",
        verbose_name="convertido para membro",
    )

    notes = models.TextField("observações", blank=True)

    class Meta:
        verbose_name = "visitante"
        verbose_name_plural = "visitantes"
        ordering = ["-visit_date"]

    def __str__(self) -> str:
        return f"{self.full_name} — {self.visit_date}"
