"""Rotas da API de eventos."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import EventViewSet

router = DefaultRouter()
router.register("events", EventViewSet, basename="event")

urlpatterns = router.urls
