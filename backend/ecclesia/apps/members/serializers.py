"""Serializers da API de membros e famílias."""
from __future__ import annotations

from rest_framework import serializers

from .models import Family, Member, Tag


class TagSerializer(serializers.ModelSerializer):
    """Serializer de tags de segmentação."""

    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "color"]


class FamilySerializer(serializers.ModelSerializer):
    """Serializer de famílias."""

    full_address = serializers.CharField(read_only=True)

    class Meta:
        model = Family
        fields = [
            "id",
            "name",
            "phone",
            "head",
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


class MemberSerializer(serializers.ModelSerializer):
    """Serializer de membros."""

    display_name = serializers.CharField(read_only=True)
    full_address = serializers.CharField(read_only=True)
    tags = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.active(), required=False
    )

    class Meta:
        model = Member
        fields = [
            "id",
            "full_name",
            "social_name",
            "display_name",
            "birth_date",
            "gender",
            "marital_status",
            "occupation",
            "phone",
            "email",
            "photo",
            "emergency_contact",
            "emergency_phone",
            "cell",
            "family",
            "user",
            "tags",
            "spiritual_status",
            "conversion_date",
            "baptism_date",
            "member_since",
            "has_special_needs",
            "special_needs_detail",
            "notes",
            "consent_data_processing",
            "consent_communications",
            "consent_date",
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
