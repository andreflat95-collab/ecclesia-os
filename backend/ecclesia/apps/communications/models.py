"""Models de comunicações: informativos, mensagens e disparos.

Cada :class:`Message` define um informativo com filtros de destinatários
(por ministério, status espiritual, tags, células ou todos). O envio real
(WhatsApp, e-mail, etc.) é delegado ao serviço de IA (Fase 3), mas a
estrutura de dados já suporta rastreamento de status por destinatário.
"""
from __future__ import annotations

from django.db import models

from ecclesia.apps.core.models import BaseModel


class Message(BaseModel):
    """Informativo ou mensagem em massa.

    Attributes:
        recipient_type: Define o escopo dos destinatários.
        The ``recipient_data`` armazena os IDs selecionados como JSON
        (ex.: ``{"ministry_ids": [1, 3], "tag_ids": [5]}``).
    """

    class RecipientType(models.TextChoices):
        ALL_MEMBERS = "all_members", "Todos os membros"
        ALL_VISITORS = "all_visitors", "Todos os visitantes"
        EVERYONE = "everyone", "Todos (membros + visitantes)"
        BY_MINISTRY = "by_ministry", "Por ministério"
        BY_STATUS = "by_status", "Por status espiritual"
        BY_TAG = "by_tag", "Por tag"
        BY_CELL = "by_cell", "Por célula"
        CUSTOM_LIST = "custom_list", "Lista personalizada"

    class Status(models.TextChoices):
        DRAFT = "draft", "Rascunho"
        SCHEDULED = "scheduled", "Agendado"
        SENDING = "sending", "Enviando"
        SENT = "sent", "Enviado"
        FAILED = "failed", "Falhou"

    title = models.CharField("título", max_length=255)
    body = models.TextField("mensagem")

    recipient_type = models.CharField(
        "tipo de destinatário",
        max_length=20,
        choices=RecipientType.choices,
        default=RecipientType.ALL_MEMBERS,
    )
    recipient_data = models.JSONField(
        "filtro de destinatários",
        default=dict,
        blank=True,
        help_text="IDs selecionados por categoria (ministry_ids, tag_ids, cell_ids, status_list)",
    )

    status = models.CharField(
        "status",
        max_length=15,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    scheduled_at = models.DateTimeField("agendado para", null=True, blank=True)
    sent_at = models.DateTimeField("enviado em", null=True, blank=True)

    total_recipients = models.PositiveIntegerField("total de destinatários", default=0)
    sent_count = models.PositiveIntegerField("enviados com sucesso", default=0)
    failed_count = models.PositiveIntegerField("falhas", default=0)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_messages",
        verbose_name="criado por",
    )

    class Meta:
        verbose_name = "mensagem"
        verbose_name_plural = "mensagens"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    @property
    def recipient_label(self) -> str:
        """Descrição legível do escopo de destinatários."""
        return self.get_recipient_type_display()
