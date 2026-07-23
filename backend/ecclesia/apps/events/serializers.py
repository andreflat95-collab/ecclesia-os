"""Serializers da API de eventos."""
from __future__ import annotations

from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Serializer de eventos/programações."""

    event_type_label = serializers.CharField(source="get_event_type_display", read_only=True)
    recurrence_label = serializers.CharField(source="get_recurrence_display", read_only=True)
    ministry_name = serializers.CharField(source="ministry.name", read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "title", "slug", "description", "event_type", "event_type_label",
            "recurrence", "recurrence_label", "start_date", "end_date",
            "location", "address", "image", "contact_name", "contact_phone",
            "ministry", "ministry_name", "max_attendees", "is_featured",
            "created_by", "created_by_name", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_created_by_name(self, obj: Event) -> str:
        if obj.created_by:
            return obj.created_by.full_name or obj.created_by.email
        return "—"

    def create(self, validated_data: dict) -> Event:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)
