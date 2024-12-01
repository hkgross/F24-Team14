from django.db import models
from datetime import datetime
from authentication.models import Account, Account_Sponsor

# ADJUST MODEL LATER TO ACCOMODATE DRIVER WITH MANY SPONSORS

# Points
class Points(models.Model):
    HISTORY_ID = models.AutoField(primary_key=True)
    POINT_CHANGE = models.IntegerField()
    POINT_CHANGE_DATE = models.DateTimeField(default=datetime.now)
    class Status(models.TextChoices):
        COMPLETED = "COMPLETED"
        IN_PROGRESS = "IN_PROGRESS"
        CANCELLED = "CANCELLED"
        REFUNDED = "REFUNDED"
    STATUS = models.CharField(choices=Status.choices, max_length=255, 
                        default=Status.IN_PROGRESS)
    ITEM_ID = models.IntegerField(null=True)
    HIST_ACC_SPONSOR_ID = models.ForeignKey(Account_Sponsor, on_delete=models.SET_NULL,
                        db_column="HIST_ACC_SPONSOR_ID", null=True, 
                        related_name='user_history')
    class Source(models.TextChoices):
        ORDER = "ORDER"
        SPONSOR = "SPONSOR"
    SOURCE = models.CharField(choices=Source.choices, max_length=255, default=Source.SPONSOR)
    REASON = models.CharField(max_length=255, null=True)
    SPONSOR_USER_ID = models.ForeignKey(Account, on_delete=models.SET_NULL, 
                        db_column="SPONSOR_USER_ID", null=True, related_name="sponsor_history")

    class Meta: 
        db_table = "POINT_HISTORY"
    
    def __str__(self):
        return self.HISTORY_ID
        