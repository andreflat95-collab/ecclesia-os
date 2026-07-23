"""Rotas da API de visitantes."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import VisitorViewSet

router = DefaultRouter()
router.register("visitors", VisitorViewSet, basename="visitor")

urlpatterns = router.urls
