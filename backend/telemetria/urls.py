from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import  TelemetriaViewSet, DataTelemetria, MergedDataOTT, MergedDataDVB 

# Configura el enrutador para la vista de conjunto TelemetriaViewSet
router = DefaultRouter()
router.register(r'telemetria', TelemetriaViewSet, basename='telemetria')

# Definir las URL para las vistas de Django
urlpatterns = [
    path("dataTelemetria/", DataTelemetria),  # Vista para manejar datos de telemetría
    path('mergeddataott/', MergedDataOTT.as_view()), # Iteracion, post y get de los datos de OTT
    path('mergeddataDVB/', MergedDataDVB.as_view()), # Iteracion, post y get de los datos de DVB
]

# Agregar las rutas del enrutador a las URL de Django
urlpatterns += router.urls