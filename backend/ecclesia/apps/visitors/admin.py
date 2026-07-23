"""Admin de visitantes com workflow de follow-up."""
from __future__ import annotations

from django.contrib import admin

from .models import Visitor


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    """Admin de visitantes."""

    list_display = (
        "full_name", "phone", "visit_date", "how_found",
        "follow_up_stage", "interested_ministry", "wants_cell",
    )
    list_filter = (
        "follow_up_stage", "how_found", "visit_date",
        "wants_cell", "is_active",
    )
    search_fields = ("full_name", "phone", "email", "notes")
    autocomplete_fields = ("interested_ministry", "converted_member")
    readonly_fields = (
        "created_at", "updated_at",
        "first_contact_at", "cell_invite_at", "service_invite_at",
    )
    fieldsets = (
        ("Identificação", {"fields": ("full_name", "phone", "email")}),
        ("Visita", {"fields": ("visit_date", "how_found", "how_found_detail")}),
        ("Interesses", {"fields": ("interested_ministry", "wants_cell")}),
        ("Follow-up", {
            "fields": (
                "follow_up_stage",
                "first_contact_at", "cell_invite_at", "service_invite_at",
                "converted_member",
            ),
        }),
        ("Observações", {"fields": ("notes",)}),
        ("Sistema", {"fields": ("is_active", "created_at", "updated_at")}),
    )
