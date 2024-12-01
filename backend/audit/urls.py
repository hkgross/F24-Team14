from django.urls import include, path
from .views import *

urlpatterns = [
    path("", AuditLogView.as_view(), name="index"),
    path("notifications/", UserHistoryView.as_view(), name="notifications"),
]