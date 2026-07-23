"""Admin para o app de áreas de lazer."""
from __future__ import annotations

from django.contrib import admin

from .models import Venue, VenueBooking


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ["name", "venue_type", "capacity", "requires_approval", "is_active"]
    list_filter = ["venue_type", "requires_approval"]


@admin.register(VenueBooking)
class VenueBookingAdmin(admin.ModelAdmin):
    list_display = ["title", "venue", "date", "start_time", "status", "ministry"]
    list_filter = ["status", "venue"]
    search_fields = ["title", "contact_name"]
    date_hierarchy = "date"
