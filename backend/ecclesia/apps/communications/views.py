"""ViewSets da API de comunicações."""
from __future__ import annotations

from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    """CRUD de mensagens/informativos."""

    serializer_class = MessageSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "body"]
    ordering_fields = ["title", "status", "recipient_type", "created_at", "sent_at"]

    def get_queryset(self):
        return Message.objects.active().select_related("created_by")

    def perform_create(self, serializer: MessageSerializer) -> None:
        msg = serializer.save()
        # Calcula total de destinatários baseado no recipient_type
        self._update_recipient_count(msg)

    def _update_recipient_count(self, msg: Message) -> None:
        """Atualiza ``total_recipients`` com base no tipo e filtros."""
        from ecclesia.apps.members.models import Member
        from ecclesia.apps.visitors.models import Visitor

        count = 0
        rtype = msg.recipient_type
        rdata = msg.recipient_data or {}

        if rtype == Message.RecipientType.ALL_MEMBERS:
            count = Member.objects.active().count()
        elif rtype == Message.RecipientType.ALL_VISITORS:
            count = Visitor.objects.active().count()
        elif rtype == Message.RecipientType.EVERYONE:
            count = Member.objects.active().count() + Visitor.objects.active().count()
        elif rtype == Message.RecipientType.BY_MINISTRY:
            ids = rdata.get("ministry_ids", [])
            if ids:
                count = Member.objects.active().filter(
                    ministry_memberships__ministry_id__in=ids,
                    ministry_memberships__is_active=True,
                ).distinct().count()
        elif rtype == Message.RecipientType.BY_STATUS:
            statuses = rdata.get("status_list", [])
            if statuses:
                count = Member.objects.active().filter(
                    spiritual_status__in=statuses
                ).count()
        elif rtype == Message.RecipientType.BY_TAG:
            ids = rdata.get("tag_ids", [])
            if ids:
                count = Member.objects.active().filter(tags__id__in=ids).distinct().count()
        elif rtype == Message.RecipientType.BY_CELL:
            ids = rdata.get("cell_ids", [])
            if ids:
                count = Member.objects.active().filter(cell_id__in=ids).count()
        elif rtype == Message.RecipientType.CUSTOM_LIST:
            member_ids = rdata.get("member_ids", [])
            visitor_ids = rdata.get("visitor_ids", [])
            count = len(member_ids) + len(visitor_ids)

        if count != msg.total_recipients:
            Message.objects.filter(pk=msg.pk).update(total_recipients=count)

    @action(detail=True, methods=["post"], url_path="send")
    def send(self, request: Request, pk: str | None = None) -> Response:
        """Dispara o envio da mensagem (mock — Fase 3 integrará WhatsApp/E-mail)."""
        msg = self.get_object()
        if msg.status not in (Message.Status.DRAFT, Message.Status.SCHEDULED):
            return Response(
                {"detail": "Mensagem já foi enviada ou está em envio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Recalcula destinatários
        self._update_recipient_count(msg)
        msg.refresh_from_db()

        # Mock: marca como enviada (Fase 3: delegar ao Celery/Evolution API)
        from django.utils import timezone
        msg.status = Message.Status.SENT
        msg.sent_at = timezone.now()
        msg.sent_count = msg.total_recipients
        msg.save(update_fields=["status", "sent_at", "sent_count"])

        return Response(MessageSerializer(msg).data)
