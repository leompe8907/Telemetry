from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TelemetriaViewSet, DataAccionId8, ProcessMergedDataView , DataTelemetria

# Configura el enrutador para la vista de conjunto TelemetriaViewSet
router = DefaultRouter()
router.register(r'telemetria', TelemetriaViewSet, basename='telemetria')

# Definir las URL para las vistas de Django
urlpatterns = [
    path("dataTelemetria/", DataTelemetria, name='data_telemetria'),  # Vista para manejar datos de telemetría
    path('mergeddata/', ProcessMergedDataView.as_view(), name='data'),
    path('merged/', DataAccionId8.as_view(), name='merged_telemetric_data'),
]

# Agregar las rutas del enrutador a las URL de Django
urlpatterns += router.urls