"""ViewSets da API de células."""
from __future__ import annotations

from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from .models import Cell, CellAttendance, CellMeeting
from .serializers import (
    CellAttendanceSerializer,
    CellMeetingSerializer,
    CellSerializer,
    NearbyQuerySerializer,
)


class CellViewSet(viewsets.ModelViewSet):
    """CRUD de células + busca por proximidade geográfica."""

    serializer_class = CellSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "city", "state", "leader__full_name"]
    ordering_fields = ["name", "day_of_week", "city", "created_at"]

    def get_queryset(self):
        return Cell.objects.active().select_related("leader", "co_leader")

    @action(detail=False, methods=["get"], url_path="nearby")
    def nearby(self, request: Request) -> Response:
        """Busca células dentro de um raio (km) a partir de lat/lon.

        Query params: ``latitude``, ``longitude``, ``radius_km`` (padrão 5).
        """
        params = NearbyQuerySerializer(data=request.query_params)
        if not params.is_valid():
            raise ValidationError(params.errors)
        cells = Cell.objects.nearby(
            params.validated_data["latitude"],
            params.validated_data["longitude"],
            params.validated_data["radius_km"],
        ).select_related("leader", "co_leader")
        serializer = self.get_serializer(cells, many=True)
        return Response(serializer.data)


class CellAttendanceViewSet(viewsets.ModelViewSet):
    """CRUD de presenças em reuniões de célula."""

    serializer_class = CellAttendanceSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["meeting_date", "cell__name"]

    def get_queryset(self):
        return (
            CellAttendance.objects.active()
            .select_related("cell", "member")
        )


class CellMeetingViewSet(viewsets.ModelViewSet):
    """CRUD de relatórios semanais de célula."""

    serializer_class = CellMeetingSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["date", "cell__name"]

    def get_queryset(self):
        return CellMeeting.objects.active().select_related("cell")
