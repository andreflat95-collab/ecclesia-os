"""Admin de ministérios e afiliações."""
from __future__ import annotations

from django.contrib import admin

from .models import Ministry, MinistryMember


class MinistryMemberInline(admin.TabularInline):
    """Membros vinculados a um ministério."""

    model = MinistryMember
    fk_name = "ministry"
    extra = 0
    fields = ("member", "role", "status", "joined_date")
    autocomplete_fields = ("member",)
    show_change_link = True


@admin.register(Ministry)
class MinistryAdmin(admin.ModelAdmin):
    """Admin de ministérios."""

    list_display = ("name", "category", "leader", "member_count", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("name", "description", "leader__full_name")
    autocomplete_fields = ("leader", "vice_leader")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Identificação", {"fields": ("name", "slug", "description", "category")}),
        ("Liderança", {"fields": ("leader", "vice_leader")}),
        ("Mídia", {"fields": ("photo", "founded_date")}),
        ("Sistema", {"fields": ("is_active", "created_at", "updated_at")}),
    )
    inlines = [MinistryMemberInline]


@admin.register(MinistryMember)
class MinistryMemberAdmin(admin.ModelAdmin):
    """Admin de afiliações membro↔ministério."""

    list_display = ("member", "ministry", "role", "status", "joined_date")
    list_filter = ("status", "ministry__category", "ministry")
    search_fields = ("member__full_name", "ministry__name", "role")
    autocomplete_fields = ("member", "ministry")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Vínculo", {"fields": ("ministry", "member")}),
        ("Detalhes", {"fields": ("role", "status", "joined_date", "notes")}),
        ("Sistema", {"fields": ("is_active", "created_at", "updated_at")}),
    )
