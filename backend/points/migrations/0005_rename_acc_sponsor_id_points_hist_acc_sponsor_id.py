# Generated by Django 4.2.11 on 2024-11-04 22:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('points', '0004_remove_points_hist_account_id_points_acc_sponsor_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='points',
            old_name='ACC_SPONSOR_ID',
            new_name='HIST_ACC_SPONSOR_ID',
        ),
    ]
