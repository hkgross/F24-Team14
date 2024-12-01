from rest_framework import serializers
from .models import NotificationPreference

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['username', 'order_error_enabled', 'order_placed_enabled', 'points_added_enabled']