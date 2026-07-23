"""ViewSets da API de membros e famílias."""
from __future__ import annotations

from rest_framework import filters, viewsets

from .models import Family, Member, Tag
from .serializers import FamilySerializer, MemberSerializer, TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    """CRUD de tags de segmentação."""

    queryset = Tag.objects.active()
    serializer_class = TagSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug"]


class FamilyViewSet(viewsets.ModelViewSet):
    """CRUD de famílias."""

    queryset = Family.objects.active().select_related("head")
    serializer_class = FamilySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "phone", "city"]
    ordering_fields = ["name", "created_at"]


class MemberViewSet(viewsets.ModelViewSet):
    """CRUD de membros."""

    serializer_class = MemberSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["full_name", "social_name", "phone", "email"]
    ordering_fields = ["full_name", "created_at"]

    def get_queryset(self):
        """Queryset otimizado evitando N+1 em ``family``/``user``/``tags``."""
        return (
            Member.objects.active()
            .select_related("family", "user")
            .prefetch_related("tags")
        )
