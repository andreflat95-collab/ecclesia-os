"""Serializers da API de permissões RBAC."""
from __future__ import annotations

from rest_framework import serializers

from .models import RolePermission


class RolePermissionSerializer(serializers.ModelSerializer):
    """Serializer de permissões de perfil."""

    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = RolePermission
        fields = [
            "id",
            "role",
            "role_name",
            "module",
            "action",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
