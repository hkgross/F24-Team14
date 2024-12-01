# Generated by Django 5.1.1 on 2024-09-19 16:58

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='About',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('team_num', models.IntegerField()),
                ('version_num', models.FloatField()),
                ('release_date', models.DateField()),
                ('product_name', models.CharField(max_length=30)),
                ('product_description', models.CharField(max_length=200)),
            ],
            options={
                'db_table': 'about',
            },
        ),
    ]
