# Generated by Django 5.0.1 on 2024-02-16 15:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('telemetria', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='telemetria',
            name='timeDate',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]