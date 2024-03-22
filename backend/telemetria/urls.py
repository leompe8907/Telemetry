from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import  TelemetriaViewSet, DataTelemetria, MergedDataOTT, ProcessMergedDataDVB, DataAccionDVB

# Configura el enrutador para la vista de conjunto TelemetriaViewSet
router = DefaultRouter()
router.register(r'telemetria', TelemetriaViewSet, basename='telemetria')

# Definir las URL para las vistas de Django
urlpatterns = [
    path("dataTelemetria/", DataTelemetria, name='data_telemetria'),  # Vista para manejar datos de telemetría
    path('mergeddataott/', MergedDataOTT.as_view(), name='dataott'), # envio de datos de ott a la base de datos de OTT
    path('mergeddataDVB/', ProcessMergedDataDVB.as_view(), name='postdvb'), # envio de datos de DVB a la base de datos de DVB
    path('mergedDVB/', DataAccionDVB.as_view(), name='getdvb'), # obtencion de datos desde la base de datos de DVB
]

# Agregar las rutas del enrutador a las URL de Django
urlpatterns += router.urls