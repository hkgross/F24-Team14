from django.db import models
from datetime import datetime

class Sponsors(models.Model):
    SPONSOR_ID = models.AutoField(primary_key=True)
    PT_VALUE = models.FloatField(null=True, blank=True)
    NAME = models.CharField(max_length=255)
    DESCRIPTION = models.CharField(max_length=255)
    CREATION_DATE = models.DateTimeField(default=datetime.now)
    CAT_MEDIA_TYPE = models.CharField(max_length=11, null=True, blank=True)
    CAT_EXPLICIT = models.SmallIntegerField(null=True, blank=True)
    class Meta:
        db_table = 'SPONSORS'

    def __str__(self):
        return self.NAME