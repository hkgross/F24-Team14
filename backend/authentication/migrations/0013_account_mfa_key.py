# Generated by Django 4.2.11 on 2024-11-25 17:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0012_account_sponsor_app_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='account',
            name='MFA_KEY',
            field=models.CharField(default='null', max_length=32),
            preserve_default=False,
        ),
    ]
