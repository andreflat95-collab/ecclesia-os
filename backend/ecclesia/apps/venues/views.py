"""ViewSets da API de áreas de lazer."""
from __future__ import annotations

from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Venue, VenueBooking
from .serializers import VenueSerializer, VenueBookingSerializer


class VenueViewSet(viewsets.ModelViewSet):
    """CRUD de espaços/quadras."""

    queryset = Venue.objects.active()
    serializer_class = VenueSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "venue_type"]


class VenueBookingViewSet(viewsets.ModelViewSet):
    """CRUD de reservas."""

    serializer_class = VenueBookingSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "contact_name", "venue__name", "ministry__name"]

    def get_queryset(self):
        return (
            VenueBooking.objects.active()
            .select_related("venue", "ministry", "created_by")
        )

    def perform_create(self, serializer: VenueBookingSerializer) -> None:
        serializer.save(status=VenueBooking.Status.PENDING)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request: Request, pk: str | None = None) -> Response:
        booking = self.get_object()
        booking.status = VenueBooking.Status.APPROVED
        booking.save(update_fields=["status"])
        return Response(VenueBookingSerializer(booking).data)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request: Request, pk: str | None = None) -> Response:
        booking = self.get_object()
        booking.status = VenueBooking.Status.REJECTED
        booking.save(update_fields=["status"])
        return Response(VenueBookingSerializer(booking).data)

    @action(detail=False, methods=["get"], url_path="by-date")
    def by_date(self, request: Request) -> Response:
        """Reservas de uma data específica (?date=YYYY-MM-DD)."""
        date_str = request.query_params.get("date")
        if not date_str:
            return Response({"detail": "Parâmetro ?date= obrigatório"}, status=400)
        qs = self.get_queryset().filter(date=date_str)
        return Response(VenueBookingSerializer(qs, many=True).data)
