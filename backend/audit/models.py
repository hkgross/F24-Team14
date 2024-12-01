from django.db import models
from datetime import datetime
from authentication.models import Account
from sponsors.models import Sponsors
from datetime import datetime

class Audit(models.Model):
    EVENT_ID = models.IntegerField(primary_key=True)
    AUDIT_SPONSOR_ID = models.ForeignKey(Sponsors, on_delete=models.SET_NULL,
                        db_column="AUDIT_SPONSOR_ID", null=True)
    AUDIT_ACCOUNT_ID = models.ForeignKey(Account, on_delete=models.SET_NULL,
                        db_column="AUDIT_ACCOUNT_ID", null=True)
    EVENT_TYPE = models.CharField(max_length=255)
    DESCRIPTION = models.CharField(max_length=255)
    EVENT_TIME = models.DateTimeField(default=datetime.now)

    class Meta:
        db_table = "AUDIT"

    def __str__(self):
        return self.EVENT_ID