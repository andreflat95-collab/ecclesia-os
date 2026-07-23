"""Admin de usuários e papéis eclesiásticos."""
from __future__ import annotations

from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from .models import ChurchRole, User


class UserCreationForm(forms.ModelForm):
    """Formulário de criação de usuário no Admin (define senha local)."""

    password1 = forms.CharField(label="Senha", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirmação", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "full_name")

    def clean_password2(self) -> str:
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("As senhas não conferem.")
        return p2

    def save(self, commit: bool = True) -> User:
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """Formulário de edição de usuário no Admin."""

    password = ReadOnlyPasswordHashField(
        label="Senha",
        help_text=(
            "Senhas não são armazenadas em texto puro. Para usuários do PWA a "
            "autenticação ocorre no Supabase; a senha local serve apenas ao Admin."
        ),
    )

    class Meta:
        model = User
        fields = "__all__"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin do usuário customizado (identificado por e-mail)."""

    add_form = UserCreationForm
    form = UserChangeForm
    model = User

    list_display = ("email", "full_name", "supabase_id", "is_staff", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active", "roles")
    search_fields = ("email", "full_name", "supabase_id")
    ordering = ("email",)
    filter_horizontal = ("roles", "groups", "user_permissions")
    readonly_fields = ("last_login", "created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Identidade", {"fields": ("full_name", "supabase_id")}),
        ("Papéis", {"fields": ("roles",)}),
        (
            "Permissões",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Datas", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "full_name", "password1", "password2")}),
    )


@admin.register(ChurchRole)
class ChurchRoleAdmin(admin.ModelAdmin):
    """Admin do catálogo de papéis eclesiásticos."""

    list_display = ("name", "slug", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
