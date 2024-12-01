from django.db import models

class About(models.Model):
    ABOUT_ID = models.IntegerField(primary_key=True)
    PRODUCT_NAME = models.CharField(max_length=255)
    TEAM_NUM = models.IntegerField()
    VERSION_NUM = models.FloatField()
    ABOUT_DESC = models.CharField(max_length=255)
    RELEASE_DATE = models.DateTimeField()

    class Meta:
        db_table = 'about'

    def _str_(self):
        return self.title