# Generated by Django 4.2.11 on 2024-10-21 17:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_rename_last_login_account_last_login'),
    ]

    operations = [
        migrations.RenameField(
            model_name='account',
            old_name='LAST_LOGIN',
            new_name='last_login',
        ),
    ]
