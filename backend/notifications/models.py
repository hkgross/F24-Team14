from django.db import models
from django.contrib.auth.models import User

class NotificationPreference(models.Model):
    
    username = models.CharField(max_length=255, unique=True)
    order_error_enabled = models.BooleanField(default=False)
    order_placed_enabled = models.BooleanField(default=False)
    points_added_enabled = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification Preferences for {self.user.username}"