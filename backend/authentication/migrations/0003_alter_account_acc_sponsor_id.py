# Generated by Django 5.1.1 on 2024-10-06 01:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_alter_account_acc_sponsor_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='account',
            name='ACC_SPONSOR_ID',
            field=models.ForeignKey(db_column='ACC_SPONSOR_ID', null=True, on_delete=django.db.models.deletion.SET_NULL, to='authentication.sponsor'),
        ),
    ]
