"""ViewSets da API de ministérios."""
from __future__ import annotations

from django.db import transaction
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from ecclesia.apps.members.models import Member

from .models import Ministry, MinistryMember
from .serializers import (
    MinistryDetailSerializer,
    MinistryMemberSerializer,
    MinistrySerializer,
)


class MinistryViewSet(viewsets.ModelViewSet):
    """CRUD de ministérios.

    Um líder só vê e gerencia o seu próprio ministério. Admins veem todos.
    """

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "category", "leader__full_name"]
    ordering_fields = ["name", "category", "created_at", "member_count"]

    def get_queryset(self):
        qs = Ministry.objects.active().select_related("leader", "vice_leader")
        user = self.request.user
        if user.is_authenticated and hasattr(user, "member") and user.member:
            member = user.member
            # Líder vê apenas ministérios que lidera
            if not user.is_staff and member.led_ministries.active().exists():
                return qs.filter(leader=member)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MinistryDetailSerializer
        return MinistrySerializer

    @transaction.atomic
    def perform_create(self, serializer: MinistrySerializer) -> None:
        ministry = serializer.save()
        # Se o líder foi definido, já cria o vínculo como líder
        if ministry.leader:
            MinistryMember.objects.get_or_create(
                ministry=ministry,
                member=ministry.leader,
                defaults={"role": "Líder", "status": MinistryMember.Status.ACTIVE},
            )


class MinistryMemberViewSet(viewsets.ModelViewSet):
    """CRUD de afiliações membro↔ministério.

    - Líder do ministério: pode adicionar/remover/editar apenas no SEU ministério.
    - Admin: acesso total.
    - Membro comum: vê apenas suas próprias afiliações.
    """

    serializer_class = MinistryMemberSerializer
    filter_backends = [filters.OrderingFilter]
    filterset_fields = ["ministry", "status"]
    ordering_fields = ["ministry__name", "member__full_name", "joined_date"]

    def get_queryset(self):
        qs = (
            MinistryMember.objects.active()
            .select_related("ministry", "member")
        )
        user = self.request.user
        if user.is_authenticated and hasattr(user, "member") and user.member:
            member = user.member
            if user.is_staff:
                return qs
            # Líder: vê membros dos ministérios que lidera
            if member.led_ministries.active().exists():
                return qs.filter(ministry__leader=member)
            # Membro comum: vê apenas suas próprias afiliações
            return qs.filter(member=member)
        return qs.none()

    @transaction.atomic
    def perform_create(self, serializer: MinistryMemberSerializer) -> None:
        instance = serializer.save()
        # Se o membro ainda não está vinculado a nenhum ministério, sugere
        # o status espiritual "Membro" se for visitante
        member = instance.member
        if member.spiritual_status == Member.SpiritualStatus.VISITOR:
            from ecclesia.apps.members.models import Member as M
            if member.ministry_memberships.active().count() >= 2:
                member.spiritual_status = M.SpiritualStatus.MEMBER
                member.save(update_fields=["spiritual_status", "updated_at"])

    @action(detail=False, methods=["get"], url_path="my-ministries")
    def my_ministries(self, request: Request) -> Response:
        """Lista os ministérios do membro logado."""
        user = request.user
        if not user.is_authenticated or not hasattr(user, "member") or not user.member:
            return Response([], status=status.HTTP_200_OK)
        memberships = self.get_queryset().filter(member=user.member)
        serializer = self.get_serializer(memberships, many=True)
        return Response(serializer.data)
