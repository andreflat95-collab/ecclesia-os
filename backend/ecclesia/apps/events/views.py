"""ViewSets da API de eventos."""
from __future__ import annotations

from datetime import date

from django.db.models import Q
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    """CRUD de eventos/programações."""

    serializer_class = EventSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "location", "contact_name"]
    ordering_fields = ["start_date", "title", "event_type", "created_at"]

    def get_queryset(self):
        return Event.objects.active().select_related("ministry", "created_by")

    @action(detail=False, methods=["get"], url_path="upcoming")
    def upcoming(self, request: Request) -> Response:
        """Próximos eventos (a partir de hoje)."""
        qs = self.get_queryset().filter(
            Q(start_date__gte=date.today()) | Q(recurrence__in=["daily", "weekly", "biweekly", "monthly"])
        ).order_by("start_date")[:20]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="calendar")
    def calendar(self, request: Request) -> Response:
        """Eventos de um mês específico (query params: year, month)."""
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month))
        qs = self.get_queryset().filter(
            start_date__year=year, start_date__month=month
        ).order_by("start_date")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
