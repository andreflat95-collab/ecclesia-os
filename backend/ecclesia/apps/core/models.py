"""Models base, mixins e managers compartilhados pelo projeto.

Convenções:
- Todo model de negócio herda de :class:`BaseModel` (UUID pk + timestamps + soft delete).
- O manager padrão (``objects``) retorna **todos** os registros, para não quebrar
  relacionamentos e o Django Admin. Use ``Model.objects.active()`` para filtrar
  apenas registros ativos. ``delete()`` faz soft delete por padrão; use
  ``hard_delete()`` para remoção física.
"""
from __future__ import annotations

import uuid

from django.db import models
from django.utils import timezone


class TimestampMixin(models.Model):
    """Adiciona campos de auditoria temporal."""

    created_at = models.DateTimeField("criado em", auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField("atualizado em", auto_now=True)

    class Meta:
        abstract = True


class AddressMixin(models.Model):
    """Campos de endereço reutilizáveis (residência, contato)."""

    zip_code = models.CharField("CEP", max_length=9, blank=True)
    street = models.CharField("logradouro", max_length=255, blank=True)
    number = models.CharField("número", max_length=20, blank=True)
    complement = models.CharField("complemento", max_length=120, blank=True)
    neighborhood = models.CharField("bairro", max_length=120, blank=True)
    city = models.CharField("cidade", max_length=120, blank=True)
    state = models.CharField("UF", max_length=2, blank=True)

    class Meta:
        abstract = True

    @property
    def full_address(self) -> str:
        """Monta o endereço em uma única linha legível."""
        parts = [
            " ".join(p for p in [self.street, self.number] if p).strip(),
            self.complement,
            self.neighborhood,
            " - ".join(p for p in [self.city, self.state] if p).strip(),
            self.zip_code,
        ]
        return ", ".join(p for p in parts if p)


class BaseQuerySet(models.QuerySet):
    """QuerySet com helpers de soft delete."""

    def active(self) -> "BaseQuerySet":
        """Retorna apenas registros ativos (não removidos)."""
        return self.filter(is_active=True)

    def inactive(self) -> "BaseQuerySet":
        """Retorna apenas registros inativos (soft-deleted)."""
        return self.filter(is_active=False)

    def delete(self):  # type: ignore[override]
        """Soft delete em massa."""
        return self.update(is_active=False, updated_at=timezone.now())

    def hard_delete(self):
        """Remoção física em massa."""
        return super().delete()


class BaseManager(models.Manager.from_queryset(BaseQuerySet)):
    """Manager padrão baseado em :class:`BaseQuerySet`."""


class BaseModel(TimestampMixin):
    """Model base com UUID, timestamps e soft delete.

    Attributes:
        id: Chave primária UUID.
        is_active: ``False`` indica registro removido logicamente.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_active = models.BooleanField("ativo", default=True, db_index=True)

    objects = BaseManager()

    class Meta:
        abstract = True
        ordering = ["-created_at"]

    def delete(self, using=None, keep_parents=False):  # type: ignore[override]
        """Realiza soft delete marcando ``is_active=False``."""
        self.is_active = False
        self.save(using=using, update_fields=["is_active", "updated_at"])

    def hard_delete(self, using=None, keep_parents=False):
        """Remove o registro fisicamente do banco."""
        return super().delete(using=using, keep_parents=keep_parents)

    def restore(self, using=None) -> None:
        """Reativa um registro previamente removido."""
        self.is_active = True
        self.save(using=using, update_fields=["is_active", "updated_at"])
