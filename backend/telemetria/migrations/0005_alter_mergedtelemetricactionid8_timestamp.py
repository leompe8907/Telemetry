# Generated by Django 5.0.1 on 2024-02-27 13:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('telemetria', '0004_rename_mergedtelemetricacctionid8_mergedtelemetricactionid8'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mergedtelemetricactionid8',
            name='timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
