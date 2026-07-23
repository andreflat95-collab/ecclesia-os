"""Admin para o app de eventos."""
from __future__ import annotations

from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "event_type", "start_date", "recurrence", "is_featured", "is_active"]
    list_filter = ["event_type", "recurrence", "is_featured", "is_active"]
    search_fields = ["title", "description", "location"]
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "start_date"
