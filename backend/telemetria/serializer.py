## permite convertir los modelos en json
from rest_framework import serializers
from .models import Telemetria, MergedTelemetricActionId8

class TelemetriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telemetria
        fields = '__all__'


class MergedTelemetricActionId8Serializer(serializers.ModelSerializer):
    class Meta:
        model = MergedTelemetricActionId8
        fields = '__all__'