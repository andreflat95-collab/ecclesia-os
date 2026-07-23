"""Admin para o app de comunicações."""
from __future__ import annotations

from django.contrib import admin

from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["title", "recipient_type", "status", "total_recipients", "sent_count", "created_at"]
    list_filter = ["status", "recipient_type"]
    search_fields = ["title", "body"]
    readonly_fields = ["total_recipients", "sent_count", "failed_count", "sent_at"]
