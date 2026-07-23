"""Serializers da API de ministérios."""
from __future__ import annotations

from rest_framework import serializers

from ecclesia.apps.members.models import Member

from .models import Ministry, MinistryMember


class MinistryMemberSerializer(serializers.ModelSerializer):
    """Serializer de afiliação membro↔ministério."""

    member_name = serializers.CharField(source="member.full_name", read_only=True)
    ministry_name = serializers.CharField(source="ministry.name", read_only=True)

    class Meta:
        model = MinistryMember
        fields = [
            "id",
            "ministry",
            "ministry_name",
            "member",
            "member_name",
            "role",
            "status",
            "joined_date",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MinistrySerializer(serializers.ModelSerializer):
    """Serializer de ministérios."""

    member_count = serializers.IntegerField(read_only=True)
    leader_name = serializers.SerializerMethodField()
    vice_leader_name = serializers.SerializerMethodField()

    class Meta:
        model = Ministry
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "category",
            "leader",
            "leader_name",
            "vice_leader",
            "vice_leader_name",
            "photo",
            "founded_date",
            "member_count",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_leader_name(self, obj: Ministry) -> str:
        return obj.leader.full_name if obj.leader_id else ""

    def get_vice_leader_name(self, obj: Ministry) -> str:
        return obj.vice_leader.full_name if obj.vice_leader_id else ""


class MinistryDetailSerializer(MinistrySerializer):
    """Serializer detalhado de ministério com lista de membros."""

    members = MinistryMemberSerializer(source="memberships", many=True, read_only=True)

    class Meta(MinistrySerializer.Meta):
        fields = MinistrySerializer.Meta.fields + ["members"]
