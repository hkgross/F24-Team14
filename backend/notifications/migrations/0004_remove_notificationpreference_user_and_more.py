# Generated by Django 4.2.11 on 2024-11-18 21:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0003_remove_notificationpreference_order_error_noti_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notificationpreference',
            name='user',
        ),
        migrations.AddField(
            model_name='notificationpreference',
            name='username',
            field=models.CharField(default='blank', max_length=255, unique=True),
            preserve_default=False,
        ),
    ]
