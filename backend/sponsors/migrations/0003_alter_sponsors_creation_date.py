# Generated by Django 4.2.11 on 2024-11-26 18:09

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sponsors', '0002_sponsors_cat_explicit_sponsors_cat_media_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sponsors',
            name='CREATION_DATE',
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
    ]
