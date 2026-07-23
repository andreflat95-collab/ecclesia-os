"""Serializers da API de áreas de lazer."""
from __future__ import annotations

from rest_framework import serializers

from .models import Venue, VenueBooking


class VenueSerializer(serializers.ModelSerializer):
    venue_type_label = serializers.CharField(source="get_venue_type_display", read_only=True)

    class Meta:
        model = Venue
        fields = [
            "id", "name", "venue_type", "venue_type_label", "description",
            "capacity", "location", "image", "requires_approval",
            "max_hours_per_booking", "min_days_advance", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class VenueBookingSerializer(serializers.ModelSerializer):
    venue_name = serializers.CharField(source="venue.name", read_only=True)
    venue_type = serializers.CharField(source="venue.venue_type", read_only=True)
    ministry_name = serializers.CharField(source="ministry.name", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = VenueBooking
        fields = [
            "id", "venue", "venue_name", "venue_type", "ministry", "ministry_name",
            "title", "description", "date", "start_time", "end_time",
            "contact_name", "contact_phone", "attendees_count",
            "status", "status_label", "notes", "created_by", "created_by_name",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]

    def get_created_by_name(self, obj: VenueBooking) -> str:
        if obj.created_by:
            return obj.created_by.full_name or obj.created_by.email
        return "—"

    def create(self, validated_data: dict) -> VenueBooking:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)
