from django.db import models
from sponsors.models import Sponsors

# Create your models here.
class Catalog(models.Model):
    CATALOG_ID = models.AutoField(primary_key=True)
    CAT_SPONSOR_ID = models.ForeignKey(Sponsors,db_column="CAT_SPONSOR_ID", on_delete=models.CASCADE)
    ITEM_ID = models.IntegerField()
    
    class Meta:
        db_table = "CATALOG"