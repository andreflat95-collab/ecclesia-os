"""Admin de células, presenças e relatórios."""
from __future__ import annotations

from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from .models import Cell, CellAttendance, CellMeeting


class CellResource(resources.ModelResource):
    """Recurso de import/export de células."""

    class Meta:
        model = Cell
        skip_unchanged = True
        fields = (
            "id", "name", "day_of_week", "time",
            "leader", "co_leader", "city", "state",
            "latitude", "longitude", "capacity", "is_public",
        )


class CellAttendanceInline(admin.TabularInline):
    model = CellAttendance
    fk_name = "cell"
    extra = 0
    fields = ("member", "meeting_date", "present")
    show_change_link = True


@admin.register(Cell)
class CellAdmin(ImportExportModelAdmin):
    """Admin de células."""

    resource_class = CellResource
    list_display = ("name", "leader", "day_of_week", "city", "member_count", "is_public")
    list_filter = ("day_of_week", "city", "is_public", "is_active")
    search_fields = ("name", "city", "leader__full_name")
    autocomplete_fields = ("leader", "co_leader")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Identificação", {"fields": ("name", "description")}),
        ("Reunião", {"fields": ("day_of_week", "time")}),
        ("Liderança", {"fields": ("leader", "co_leader")}),
        ("Localização", {"fields": ("latitude", "longitude", "zip_code", "street", "number", "complement", "neighborhood", "city", "state")}),
        ("Configuração", {"fields": ("capacity", "is_public")}),
        ("Sistema", {"fields": ("is_active", "created_at", "updated_at")}),
    )
    inlines = [CellAttendanceInline]


@admin.register(CellAttendance)
class CellAttendanceAdmin(admin.ModelAdmin):
    """Admin de presenças em célula."""

    list_display = ("member", "cell", "meeting_date", "present")
    list_filter = ("present", "cell", "meeting_date")
    search_fields = ("member__full_name", "cell__name")
    autocomplete_fields = ("member", "cell")


@admin.register(CellMeeting)
class CellMeetingAdmin(admin.ModelAdmin):
    """Admin de relatórios semanais de célula."""

    list_display = ("cell", "date", "attendance_count", "new_visitors", "decisions")
    list_filter = ("cell", "date")
    search_fields = ("cell__name",)
    autocomplete_fields = ("cell",)
