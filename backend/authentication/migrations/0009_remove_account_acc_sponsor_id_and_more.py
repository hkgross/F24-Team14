# Generated by Django 4.2.11 on 2024-10-28 22:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sponsors', '0001_initial'),
        ('authentication', '0008_account_failed_attempts_account_lockout_until'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='account',
            name='ACC_SPONSOR_ID',
        ),
        migrations.RemoveField(
            model_name='account',
            name='NUM_POINTS',
        ),
        migrations.RemoveField(
            model_name='account',
            name='failed_attempts',
        ),
        migrations.RemoveField(
            model_name='account',
            name='lockout_until',
        ),
        migrations.CreateModel(
            name='Account_Sponsor',
            fields=[
                ('ACC_SPONSOR_ID', models.AutoField(primary_key=True, serialize=False)),
                ('NUM_POINTS', models.IntegerField()),
                ('HIRING_DESC', models.CharField(max_length=255)),
                ('REJECT_DESC', models.CharField(max_length=255)),
                ('APP_DATE', models.DateTimeField()),
                ('ACCOUNT_ID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='authentication.account')),
                ('SPONSOR_ID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sponsors.sponsors')),
            ],
            options={
                'db_table': 'ACCOUNT_SPONSOR',
            },
        ),
        migrations.AddField(
            model_name='account',
            name='FAILED_ATTEMPTS',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='account',
            name='LOCKOUT_UNTIL',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
