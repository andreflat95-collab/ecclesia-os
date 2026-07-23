"""Rotas da API de células."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import CellViewSet, CellAttendanceViewSet, CellMeetingViewSet

router = DefaultRouter()
router.register("cells", CellViewSet, basename="cell")
router.register("cell-attendances", CellAttendanceViewSet, basename="cell-attendance")
router.register("cell-meetings", CellMeetingViewSet, basename="cell-meeting")

urlpatterns = router.urls
