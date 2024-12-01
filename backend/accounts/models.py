from django.db import models
from authentication.models import Account


class Account(models.Model):
 
    USERNAME = models.CharField(max_length=255)
    PASSWORD = models.CharField(max_length=255)
    EMAIL = models.EmailField(unique=True)
    ACCOUNT_TYPE = models.CharField(max_length=50)
    last_login = models.DateTimeField(null=True, blank=True)
    failed_attempts = models.IntegerField(default=0)
    lockout_until = models.DateTimeField(null=True, blank=True)
    reset_token = models.CharField(max_length=100, null=True, blank=True) 

    def __str__(self):
        return self.USERNAME


class ListAccounts(Account):
    class Meta:
        proxy = True

        