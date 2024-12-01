# Generated by Django 4.2.11 on 2024-10-28 18:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0008_account_failed_attempts_account_lockout_until'),
        ('points', '0002_points_source_points_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='points',
            name='SPONSOR_USER_ID',
            field=models.ForeignKey(db_column='SPONSOR_USER_ID', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sponsor_history', to='authentication.account'),
        ),
        migrations.AlterField(
            model_name='points',
            name='HIST_ACCOUNT_ID',
            field=models.ForeignKey(db_column='HIST_ACCOUNT_ID', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='user_history', to='authentication.account'),
        ),
    ]
