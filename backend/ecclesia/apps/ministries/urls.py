"""Rotas da API de ministérios."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import MinistryMemberViewSet, MinistryViewSet

router = DefaultRouter()
router.register("ministries", MinistryViewSet, basename="ministry")
router.register("ministry-members", MinistryMemberViewSet, basename="ministry-member")

urlpatterns = router.urls
