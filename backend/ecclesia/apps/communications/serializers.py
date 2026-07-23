"""Serializers da API de comunicações."""
from __future__ import annotations

from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    """Serializer de mensagens/informativos."""

    recipient_label = serializers.CharField(read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "title",
            "body",
            "recipient_type",
            "recipient_data",
            "recipient_label",
            "status",
            "scheduled_at",
            "sent_at",
            "total_recipients",
            "sent_count",
            "failed_count",
            "created_by",
            "created_by_name",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id", "status", "sent_at", "total_recipients",
            "sent_count", "failed_count", "created_at", "updated_at",
        ]

    def get_created_by_name(self, obj: Message) -> str:
        if obj.created_by:
            return obj.created_by.full_name or obj.created_by.email
        return "—"

    def create(self, validated_data: dict) -> Message:
        """Associa o usuário logado como criador."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)
