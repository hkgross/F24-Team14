# Generated by Django 4.2.11 on 2024-11-26 17:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sponsors', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sponsors',
            name='CAT_EXPLICIT',
            field=models.SmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='sponsors',
            name='CAT_MEDIA_TYPE',
            field=models.CharField(blank=True, max_length=11, null=True),
        ),
    ]
