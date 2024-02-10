## permite convertir los modelos en json
from rest_framework import serializers
from .models import Telemetria

class TelemetriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telemetria
        fields = '__all__'