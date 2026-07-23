"""Serializers da API de visitantes."""
from __future__ import annotations

from rest_framework import serializers

from .models import Visitor


class VisitorSerializer(serializers.ModelSerializer):
    """Serializer de visitantes."""

    interested_ministry_name = serializers.CharField(
        source="interested_ministry.name", read_only=True
    )
    converted_member_name = serializers.CharField(
        source="converted_member.full_name", read_only=True
    )

    class Meta:
        model = Visitor
        fields = [
            "id",
            "full_name",
            "phone",
            "email",
            "visit_date",
            "how_found",
            "how_found_detail",
            "interested_ministry",
            "interested_ministry_name",
            "wants_cell",
            "follow_up_stage",
            "first_contact_at",
            "cell_invite_at",
            "service_invite_at",
            "converted_member",
            "converted_member_name",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id", "first_contact_at", "cell_invite_at",
            "service_invite_at", "created_at", "updated_at",
        ]
