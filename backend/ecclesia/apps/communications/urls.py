"""Rotas da API de comunicações."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import MessageViewSet

router = DefaultRouter()
router.register("messages", MessageViewSet, basename="message")

urlpatterns = router.urls
