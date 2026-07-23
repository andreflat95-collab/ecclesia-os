"""Models de ministérios e afiliação de membros.

Arquitetura:
- Ministry: representa um ministério (Louvor, Infantil, Social, etc.)
- MinistryMember: vínculo entre Member e Ministry com função e status

Row-level security: o líder só gerencia membros do SEU ministério.
"""
from __future__ import annotations

from django.db import models

from ecclesia.apps.core.models import BaseModel


class Ministry(BaseModel):
    """Ministério, departamento ou área de serviço da igreja.

    Categorias pré-definidas servem para agrupamento visual e para que
    módulos especializados (children, worship, social) estendam o
    comportamento de ministérios de categoria específica.
    """

    class Category(models.TextChoices):
        WORSHIP = "worship", "Louvor"
        CHILDREN = "children", "Infantil"
        YOUTH = "youth", "Jovens"
        COUPLES = "couples", "Casais"
        WOMEN = "women", "Mulheres"
        MEN = "men", "Homens"
        SOCIAL = "social", "Ação Social"
        PRAYER = "prayer", "Intercessão"
        TEACHING = "teaching", "Ensino/Discipulado"
        COMMUNICATION = "communication", "Comunicação"
        RECEPTION = "reception", "Recepção"
        ARTS = "arts", "Artes (Teatro/Dança)"
        OTHER = "other", "Outro"

    name = models.CharField("nome", max_length=120, db_index=True)
    slug = models.SlugField("identificador", max_length=120, unique=True)
    description = models.TextField("descrição", blank=True)
    category = models.CharField(
        "categoria",
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
        db_index=True,
    )
    leader = models.ForeignKey(
        "members.Member",
        on_delete=models.PROTECT,
        related_name="led_ministries",
        verbose_name="líder",
        null=True,
        blank=True,
    )
    vice_leader = models.ForeignKey(
        "members.Member",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vice_led_ministries",
        verbose_name="vice-líder",
    )
    photo = models.ImageField("foto/capa", upload_to="ministries/photos/", null=True, blank=True)
    founded_date = models.DateField("data de fundação", null=True, blank=True)

    class Meta:
        verbose_name = "ministério"
        verbose_name_plural = "ministérios"
        ordering = ["category", "name"]

    def __str__(self) -> str:
        return self.name

    @property
    def member_count(self) -> int:
        """Quantidade de membros ativos no ministério."""
        return self.memberships.filter(
            is_active=True, status=MinistryMember.Status.ACTIVE
        ).count()


class MinistryMember(BaseModel):
    """Vínculo entre um membro da igreja e um ministério.

    Um membro pode participar de vários ministérios simultaneamente,
    cada um com função e status independentes.
    """

    class Status(models.TextChoices):
        ACTIVE = "active", "Ativo"
        AWAY = "away", "Afastado"
        LEAVE = "leave", "Licença"

    ministry = models.ForeignKey(
        Ministry,
        on_delete=models.CASCADE,
        related_name="memberships",
        verbose_name="ministério",
    )
    member = models.ForeignKey(
        "members.Member",
        on_delete=models.CASCADE,
        related_name="ministry_memberships",
        verbose_name="membro",
    )
    role = models.CharField("função", max_length=120, blank=True, help_text="Ex: Violonista, Professor 3-5 anos, Coordenador")
    status = models.CharField(
        "status",
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    joined_date = models.DateField("data de entrada", null=True, blank=True)
    notes = models.TextField("observações", blank=True)

    class Meta:
        verbose_name = "membro de ministério"
        verbose_name_plural = "membros de ministérios"
        ordering = ["ministry", "member__full_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["ministry", "member"],
                name="unique_ministry_member",
                condition=models.Q(is_active=True),
            )
        ]

    def __str__(self) -> str:
        return f"{self.member.full_name} → {self.ministry.name}"
