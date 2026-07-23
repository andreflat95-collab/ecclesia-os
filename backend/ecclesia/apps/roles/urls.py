"""Rotas da API de permissões RBAC."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import RolePermissionViewSet

router = DefaultRouter()
router.register("role-permissions", RolePermissionViewSet, basename="role-permission")

urlpatterns = router.urls
