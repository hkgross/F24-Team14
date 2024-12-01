# Generated by Django 5.1.1 on 2024-10-07 16:35

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Sponsors',
            fields=[
                ('SPONSOR_ID', models.AutoField(primary_key=True, serialize=False)),
                ('PT_VALUE', models.FloatField(blank=True, null=True)),
                ('NAME', models.CharField(max_length=255)),
                ('DESCRIPTION', models.CharField(max_length=255)),
                ('CREATION_DATE', models.DateTimeField()),
            ],
            options={
                'db_table': 'SPONSORS',
            },
        ),
    ]
