"""Serializers da API de células."""
from __future__ import annotations

from rest_framework import serializers

from ecclesia.apps.members.models import Member

from .models import Cell, CellAttendance, CellMeeting


class CellSerializer(serializers.ModelSerializer):
    """Serializer de células."""

    full_address = serializers.CharField(read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    location = serializers.JSONField(read_only=True)
    leader_name = serializers.SerializerMethodField()

    class Meta:
        model = Cell
        fields = [
            "id",
            "name",
            "description",
            "day_of_week",
            "time",
            "leader",
            "leader_name",
            "co_leader",
            "capacity",
            "is_public",
            "latitude",
            "longitude",
            "location",
            "member_count",
            "zip_code",
            "street",
            "number",
            "complement",
            "neighborhood",
            "city",
            "state",
            "full_address",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_leader_name(self, obj: Cell) -> str:
        return obj.leader.full_name if obj.leader_id else ""


class CellAttendanceSerializer(serializers.ModelSerializer):
    """Serializer de presenças em célula."""

    member_name = serializers.CharField(source="member.full_name", read_only=True)
    cell_name = serializers.CharField(source="cell.name", read_only=True)

    class Meta:
        model = CellAttendance
        fields = [
            "id",
            "cell",
            "cell_name",
            "member",
            "member_name",
            "meeting_date",
            "present",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CellMeetingSerializer(serializers.ModelSerializer):
    """Serializer de relatórios semanais de célula."""

    cell_name = serializers.CharField(source="cell.name", read_only=True)

    class Meta:
        model = CellMeeting
        fields = [
            "id",
            "cell",
            "cell_name",
            "date",
            "report",
            "attendance_count",
            "new_visitors",
            "decisions",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class NearbyQuerySerializer(serializers.Serializer):
    """Query params para busca de células próximas."""

    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    radius_km = serializers.FloatField(default=5.0, min_value=0.5, max_value=50.0)
