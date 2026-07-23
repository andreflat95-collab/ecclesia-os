"""Admin de membros, famílias e tags, com importação/exportação CSV/Excel."""
from __future__ import annotations

from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from .models import Family, Member, Tag


class MemberResource(resources.ModelResource):
    """Recurso de import/export de membros (CSV, XLSX, etc.)."""

    class Meta:
        model = Member
        skip_unchanged = True
        report_skipped = True
        fields = (
            "id",
            "full_name",
            "social_name",
            "birth_date",
            "gender",
            "marital_status",
            "occupation",
            "phone",
            "email",
            "emergency_contact",
            "emergency_phone",
            "spiritual_status",
            "conversion_date",
            "baptism_date",
            "member_since",
            "has_special_needs",
            "special_needs_detail",
            "family",
            "city",
            "state",
            "is_active",
        )


class FamilyResource(resources.ModelResource):
    """Recurso de import/export de famílias."""

    class Meta:
        model = Family
        skip_unchanged = True
        fields = ("id", "name", "phone", "city", "state", "is_active")


class MemberInline(admin.TabularInline):
    """Membros vinculados a uma família."""

    model = Member
    fk_name = "family"
    extra = 0
    fields = ("full_name", "phone", "spiritual_status", "is_active")
    show_change_link = True


@admin.register(Member)
class MemberAdmin(ImportExportModelAdmin):
    """Admin de membros com importação/exportação."""

    resource_class = MemberResource
    list_display = ("full_name", "phone", "spiritual_status", "cell", "family", "is_active")
    list_filter = ("spiritual_status", "gender", "is_active", "tags", "cell")
    search_fields = ("full_name", "social_name", "phone", "email")
    autocomplete_fields = ("family", "user", "cell")
    filter_horizontal = ("tags",)
    readonly_fields = ("created_at", "updated_at")
    list_select_related = ("family", "cell")
    fieldsets = (
        ("Identidade", {"fields": ("full_name", "social_name", "birth_date", "gender", "marital_status", "occupation", "photo")}),
        ("Contato", {"fields": ("phone", "email", "emergency_contact", "emergency_phone")}),
        ("Endereço", {"fields": ("zip_code", "street", "number", "complement", "neighborhood", "city", "state")}),
        ("Vínculos", {"fields": ("cell", "family", "user", "tags")}),
        ("Jornada espiritual", {"fields": ("spiritual_status", "conversion_date", "baptism_date", "member_since", "notes")}),
        ("Necessidades especiais", {"fields": ("has_special_needs", "special_needs_detail")}),
        ("LGPD", {"fields": ("consent_data_processing", "consent_communications", "consent_date")}),
        ("Sistema", {"fields": ("is_active", "created_at", "updated_at")}),
    )


@admin.register(Family)
class FamilyAdmin(ImportExportModelAdmin):
    """Admin de famílias com importação/exportação."""

    resource_class = FamilyResource
    list_display = ("name", "phone", "city", "head", "is_active")
    list_filter = ("city", "state", "is_active")
    search_fields = ("name", "phone", "city")
    autocomplete_fields = ("head",)
    inlines = (MemberInline,)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Admin de tags de segmentação."""

    list_display = ("name", "slug", "color", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
