"""Roteamento raiz do projeto EcclesiaOS."""
from __future__ import annotations

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.urls import include, path


def healthcheck(_request) -> JsonResponse:
    """Endpoint simples de verificação de saúde."""
    return JsonResponse({"status": "ok", "service": "ecclesia-backend"})


urlpatterns = [
    path("health/", healthcheck, name="health"),
    path("admin/", admin.site.urls),
    path("api/", include("ecclesia.apps.members.urls")),
    path("api/", include("ecclesia.apps.cells.urls")),
    path("api/", include("ecclesia.apps.ministries.urls")),
    path("api/", include("ecclesia.apps.visitors.urls")),
    path("api/", include("ecclesia.apps.roles.urls")),
    path("api/", include("ecclesia.apps.communications.urls")),
    path("api/", include("ecclesia.apps.events.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
