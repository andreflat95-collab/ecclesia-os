"""ViewSets da API de permissões RBAC."""
from __future__ import annotations

from rest_framework import filters, viewsets

from .models import RolePermission
from .serializers import RolePermissionSerializer


class RolePermissionViewSet(viewsets.ModelViewSet):
    """CRUD de permissões de perfil (admin apenas)."""

    queryset = RolePermission.objects.active().select_related("role")
    serializer_class = RolePermissionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["role__name", "module", "action"]
    ordering_fields = ["role__name", "module", "action"]
