"""Rotas da API de áreas de lazer."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import VenueViewSet, VenueBookingViewSet

router = DefaultRouter()
router.register("venues", VenueViewSet, basename="venue")
router.register("venue-bookings", VenueBookingViewSet, basename="venue-booking")

urlpatterns = router.urls
