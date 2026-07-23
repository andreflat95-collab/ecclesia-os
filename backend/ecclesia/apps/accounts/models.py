"""Usuários, papéis eclesiásticos e identidade espelhada do Supabase.

A autenticação real acontece no Supabase Auth (fonte de verdade). Este model
``User`` espelha a identidade via ``supabase_id`` e guarda dados de autorização
locais (papéis, permissões, flags de staff) usados pelo Django Admin e pela API.
"""
from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from ecclesia.apps.core.models import BaseModel, TimestampMixin


class ChurchRole(BaseModel):
    """Papel/função de uma pessoa dentro da igreja (catálogo editável)."""

    name = models.CharField("nome", max_length=80, unique=True)
    slug = models.SlugField("identificador", max_length=80, unique=True)
    description = models.TextField("descrição", blank=True)

    class Meta:
        verbose_name = "papel eclesiástico"
        verbose_name_plural = "papéis eclesiásticos"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class UserManager(BaseUserManager):
    """Manager do model de usuário customizado (identificado por e-mail)."""

    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError("O e-mail é obrigatório.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        """Cria um usuário comum (ex.: espelhado do Supabase, sem senha local)."""
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        """Cria um superusuário com senha local para acesso ao Django Admin."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superusuário precisa de is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superusuário precisa de is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimestampMixin):
    """Usuário do sistema, espelhando a identidade do Supabase Auth.

    Attributes:
        supabase_id: UUID do usuário no Supabase Auth (``sub`` do JWT). Nulo para
            superusuários criados apenas para o Django Admin.
        email: Identificador de login.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supabase_id = models.UUIDField(
        "ID Supabase", null=True, blank=True, unique=True, db_index=True
    )
    email = models.EmailField("e-mail", unique=True)
    full_name = models.CharField("nome completo", max_length=255, blank=True)

    roles = models.ManyToManyField(
        ChurchRole, related_name="users", blank=True, verbose_name="papéis"
    )

    is_active = models.BooleanField("ativo", default=True)
    is_staff = models.BooleanField("acesso ao admin", default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        verbose_name = "usuário"
        verbose_name_plural = "usuários"
        ordering = ["email"]

    def __str__(self) -> str:
        return self.full_name or self.email

    def get_full_name(self) -> str:
        """Retorna o nome completo (ou o e-mail como fallback)."""
        return self.full_name or self.email

    def get_short_name(self) -> str:
        """Retorna o primeiro nome (ou o e-mail como fallback)."""
        return (self.full_name or self.email).split(" ")[0]
