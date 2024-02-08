## elnazar la base de datos para el admin
from django.contrib import admin
from .models import Telemetria
admin.site.register(Telemetria)