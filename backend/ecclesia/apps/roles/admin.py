"""Admin de permissões de perfil."""
from __future__ import annotations

from django.contrib import admin

from .models import RolePermission


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    """Admin de permissões de perfil."""

    list_display = ("role", "module", "action", "is_active")
    list_filter = ("role", "module", "is_active")
    search_fields = ("role__name", "module", "action")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Permissão", {"fields": ("role", "module", "action")}),
        ("Sistema", {"fields": ("is_active", "created_at", "updated_at")}),
    )
