"""Rotas da API de membros."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import FamilyViewSet, MemberViewSet, TagViewSet

router = DefaultRouter()
router.register("members", MemberViewSet, basename="member")
router.register("families", FamilyViewSet, basename="family")
router.register("tags", TagViewSet, basename="tag")

urlpatterns = router.urls
