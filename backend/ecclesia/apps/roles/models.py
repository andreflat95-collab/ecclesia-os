"""Models de permissões RBAC com row-level security.

Arquitetura:
- RolePermission: permissão por perfil + módulo (ex: "admin" pode "members.edit")
- MinistryLeaderPermission: permissão contextual — líder do ministério X
  pode gerenciar membros APENAS do ministério X (row-level security)
"""
from __future__ import annotations

from django.db import models

from ecclesia.apps.accounts.models import ChurchRole
from ecclesia.apps.core.models import BaseModel


class RolePermission(BaseModel):
    """Permissão de um perfil (ChurchRole) sobre um módulo/ação.

    Exemplos:
    - Perfil "Secretaria" → módulo "members", ação "edit"
    - Perfil "Pastor" → módulo "finance", ação "view"
    - Perfil "Admin" → módulo "*", ação "*" (superuser)
    """

    role = models.ForeignKey(
        ChurchRole,
        on_delete=models.CASCADE,
        related_name="permissions",
        verbose_name="perfil",
    )
    module = models.CharField(
        "módulo",
        max_length=50,
        help_text="Ex: members, ministries, cells, worship, finance, events, scheduling, visitors",
    )
    action = models.CharField(
        "ação",
        max_length=50,
        help_text="Ex: view, create, edit, delete, manage_members",
    )

    class Meta:
        verbose_name = "permissão de perfil"
        verbose_name_plural = "permissões de perfis"
        ordering = ["role", "module", "action"]
        constraints = [
            models.UniqueConstraint(
                fields=["role", "module", "action"],
                name="unique_role_permission",
                condition=models.Q(is_active=True),
            )
        ]

    def __str__(self) -> str:
        return f"{self.role.name}:{self.module}.{self.action}"
