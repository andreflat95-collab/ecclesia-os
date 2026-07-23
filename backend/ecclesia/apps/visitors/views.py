"""ViewSets da API de visitantes."""
from __future__ import annotations

from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Visitor
from .serializers import VisitorSerializer


class VisitorViewSet(viewsets.ModelViewSet):
    """CRUD de visitantes com workflow de follow-up."""

    serializer_class = VisitorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["full_name", "phone", "email", "notes"]
    ordering_fields = ["visit_date", "full_name", "follow_up_stage"]

    def get_queryset(self):
        return Visitor.objects.active().select_related(
            "interested_ministry", "converted_member"
        )

    @action(detail=True, methods=["post"], url_path="advance-follow-up")
    def advance_follow_up(self, request: Request, pk: str | None = None) -> Response:
        """Avança o follow-up para a próxima etapa.

        Fluxo: NEW → CONTACTED → CELL_INVITED → SERVICE_INVITED → CONVERTED
        """
        visitor = self.get_object()
        stage_order = [
            Visitor.FollowUpStage.NEW,
            Visitor.FollowUpStage.CONTACTED,
            Visitor.FollowUpStage.CELL_INVITED,
            Visitor.FollowUpStage.SERVICE_INVITED,
        ]
        current = visitor.follow_up_stage
        now = timezone.now()

        if current == Visitor.FollowUpStage.NEW:
            visitor.follow_up_stage = Visitor.FollowUpStage.CONTACTED
            visitor.first_contact_at = now
        elif current == Visitor.FollowUpStage.CONTACTED:
            visitor.follow_up_stage = Visitor.FollowUpStage.CELL_INVITED
            visitor.cell_invite_at = now
        elif current == Visitor.FollowUpStage.CELL_INVITED:
            visitor.follow_up_stage = Visitor.FollowUpStage.SERVICE_INVITED
            visitor.service_invite_at = now
        elif current == Visitor.FollowUpStage.SERVICE_INVITED:
            visitor.follow_up_stage = Visitor.FollowUpStage.CONVERTED
        else:
            return Response(
                {"detail": "Etapa atual não permite avanço automático."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visitor.save(update_fields=[
            "follow_up_stage", "first_contact_at", "cell_invite_at",
            "service_invite_at", "updated_at",
        ])
        serializer = self.get_serializer(visitor)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="convert-to-member")
    def convert_to_member(self, request: Request, pk: str | None = None) -> Response:
        """Converte um visitante em membro, criando o Member se necessário.

        Body: ``{"member_id": "uuid-opcional"}`` — se omitido, cria novo Member.
        """
        visitor = self.get_object()
        member_id = request.data.get("member_id")

        from ecclesia.apps.members.models import Member as MemberModel

        if member_id:
            member = MemberModel.objects.get(pk=member_id)
        else:
            member = MemberModel.objects.create(
                full_name=visitor.full_name,
                phone=visitor.phone,
                email=visitor.email,
                spiritual_status=MemberModel.SpiritualStatus.MEMBER,
            )

        visitor.follow_up_stage = Visitor.FollowUpStage.CONVERTED
        visitor.converted_member = member
        visitor.save(update_fields=["follow_up_stage", "converted_member", "updated_at"])

        serializer = self.get_serializer(visitor)
        return Response(serializer.data)
