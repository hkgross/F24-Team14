from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import NotificationPreferenceGetter, NotificationPreferenceSaver, UpdatePointsNotificationView,UpdatePurchaseNotificationView, UpdatePurchaseErrorNotificationView

urlpatterns = [
    path("getpreferences/", NotificationPreferenceGetter.as_view(), name='getpreferences'),
    path("savepreferences/", NotificationPreferenceSaver.as_view(), name='savepreferences'),
    path("updatePointsNot/",UpdatePointsNotificationView.as_view(), name='updatePointsNot'),
    path("updatePurchaseNot/", UpdatePurchaseNotificationView.as_view(), name='updatePurchaseNot'),
    path("updatePurchaseErrorNot/", UpdatePurchaseErrorNotificationView.as_view(), name='updatePurchaseErrorNot'),
]
