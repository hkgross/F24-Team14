# Generated by Django 4.2.11 on 2024-10-26 15:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_account_failed_attempts_account_lockout_until'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='account',
            name='failed_attempts',
        ),
        migrations.RemoveField(
            model_name='account',
            name='last_login',
        ),
    ]
