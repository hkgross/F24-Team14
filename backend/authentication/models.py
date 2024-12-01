from django.db import models
from sponsors.models import Sponsors

class Account(models.Model):
    ACCOUNT_ID = models.AutoField(primary_key=True)
    NAME = models.CharField(max_length=255)
    ADDRESS = models.CharField(max_length=255)
    # ACC_SPONSOR_ID = models.ForeignKey(Sponsors, on_delete=models.SET_NULL, 
    #                 null=True, db_column="ACC_SPONSOR_ID")
    CREATION_DATE = models.DateTimeField()
    class STATUS(models.TextChoices):
        ACTIVE = "active"
        INACTIVE = "inactive"
        DELETED = "deleted"
    STATUS = models.CharField(
        max_length=10,
        choices=STATUS.choices
    )
    LAST_LOGIN = models.DateTimeField()   
    class ACCOUNT_TYPE(models.TextChoices):
        DRIVER = "driver"
        SPONSOR = "sponsor"
        ADMIN = "admin"
    ACCOUNT_TYPE = models.CharField(
        max_length=10,
        choices=ACCOUNT_TYPE.choices
    )
    FAILED_ATTEMPTS = models.IntegerField(default=0)
    LOCKOUT_UNTIL = models.DateTimeField(null=True, blank=True)
    # NUM_POINTS = models.IntegerField()
    BIRTHDAY = models.DateField()
    USERNAME = models.CharField(max_length=255)
    EMAIL = models.CharField(max_length=255)
    BIO = models.CharField(max_length=255)
    PASSWORD = models.CharField(max_length=255)
    MFA_KEY = models.CharField(max_length=32)

    USERNAME_FIELD = 'USERNAME'
    REQUIRED_FIELDS = ['USERNAME']
    # ACC_SPONSORS = models.ManyToManyField(Sponsors, through='ACCOUNT_SPONSOR')

    class Meta:
        db_table = "ACCOUNTS"

    def __str__(self):
        return self.USERNAME

class Account_Sponsor(models.Model):
    ACC_SPONSOR_ID = models.AutoField(primary_key=True)
    ACCOUNT_ID = models.ForeignKey(Account,db_column="ACCOUNT_ID", on_delete=models.CASCADE)
    SPONSOR_ID = models.ForeignKey(Sponsors,db_column="SPONSOR_ID", on_delete=models.CASCADE)
    NUM_POINTS = models.IntegerField()
    class STATUS_CHOICES(models.TextChoices):
        OPEN = "open"
        ACCEPTED = "accepted"
        REJECTED = "rejected"
        INACTIVE = "inactive"
    STATUS = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES.choices
    )
    HIRING_DESC = models.CharField(max_length=255)
    REJECT_DESC = models.CharField(max_length=255)
    APP_DATE = models.DateTimeField()
    class Meta:
        db_table = "ACCOUNT_SPONSOR"
# Use for later for password reset
# Might just remove
class Token(models.Model):
    ID = models.AutoField(primary_key=True)
    TOKEN = models.CharField(max_length=255)
    CREATED_AT = models.DateTimeField()
    EXPIRES_AT = models.DateTimeField()
    USER_ID = models.ForeignKey(Account, on_delete=models.CASCADE)
    IS_USED = models.BooleanField(default=False)

    class Meta: 
        db_table = "TOKEN"