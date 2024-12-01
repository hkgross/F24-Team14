from django.db import models
from authentication.models import Account_Sponsor

# Create your models here.
class PointHistory(models.Model):
    HISTORY_ID = models.AutoField(primary_key=True)
    POINT_CHANGE = models.IntegerField()
    POINT_CHANGE_TIME = models.DateTimeField()
    class STATUS_CHOICES(models.TextChoices):
        COMPLETED = "completed"
        IN_PROGRESS = "in_progress"
        cancelled = "cancelled"
        refunded = "refunded"
    STATUS = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES.choices
    )
    ITEM_ID = models.IntegerField()
    ACC_SPONSOR_ID = models.ForeignKey(Account_Sponsor, on_delete=models.SET_NULL)
    