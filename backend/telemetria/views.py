# Create your views here.
from datetime import datetime
from rest_framework.response import Response # Importa la clase Response de Django REST framework para manejar respuestas HTTP
from rest_framework.views import APIView # Importa la clase APIView de Django REST framework para crear vistas basadas en clases
from django.http import JsonResponse # Importa la función JsonResponse de Django para devolver respuestas HTTP en formato JSON
from rest_framework import viewsets # Importa la clase viewsets de Django REST framework para definir vistas de conjunto
from .serializer import TelemetriaSerializer # Importa el serializador TelemetriaSerializer desde el módulo actual
from .models import Telemetria, MergedTelemetricActionId8 # Importa el modelo Telemetria desde el módulo actual
from django.views.decorators.http import require_POST # Importa el decorador require_POST para limitar las solicitudes HTTP a POST
from django.views.decorators.csrf import csrf_exempt # Importa el decorador csrf_exempt para deshabilitar la protección CSRF en la vista
from rest_framework import status
import json # Importa el módulo json para trabajar con datos JSON


# Define una vista de conjunto usando Django REST framework
class TelemetriaViewSet(viewsets.ModelViewSet):
    serializer_class = TelemetriaSerializer  # Establece la clase de serializador para la vista
    queryset = Telemetria.objects.all()  # Obtiene todos los objetos Telemetria de la base de datos

# Decora la vista para deshabilitar la protección CSRF y permitir solicitudes POST sin autenticación
@csrf_exempt
@require_POST
def DataTelemetria(request):
    try:
        # Parsea los datos del cuerpo de la solicitud como JSON
        data = json.loads(request.body.decode('utf-8'))
        
        # Verificar si el registro ya existe en la base de datos
        existing_record = Telemetria.objects.filter(recordId=data.get('recordId')).first()

        if existing_record:
            # Si el registro ya existe, devuelve una respuesta indicando que es un duplicado
            return JsonResponse({'status': 'success', 'message': 'Duplicate record'})

        # Crea una instancia de Telemetria con los datos proporcionados
        telemetria = Telemetria(
            actionId=data.get('actionId'),
            actionKey=data.get('actionKey'),
            anonymized=data.get('anonymized'),
            dataDuration=data.get('dataDuration'),
            dataId=data.get('dataId'),
            dataName=data.get('dataName'),
            dataNetId=data.get('dataNetId'),
            dataPrice=data.get('dataPrice'),
            dataSeviceId=data.get('dataSeviceId'),
            dataTsId=data.get('dataTsId'),
            date=data.get('date'),
            deviceId=data.get('deviceId'),
            ip=data.get('ip'),
            ipId=data.get('ipId'),
            manual=data.get('manual'),
            profileId=data.get('profileId'),
            reaonId=data.get('reaonId'),
            reasonKey=data.get('reasonKey'),
            recordId=data.get('recordId'),
            smartcardId=data.get('smartcardId'),
            subscriberCode=data.get('subscriberCode'),
            timestamp=data.get('timestamp'),
            dataDate=data.get('dataDate'),
            timeDate=data.get('timeDate'),
            whoisCountry=data.get('whoisCountry'),
            whoisIsp=data.get('whoisIsp')
        )

         # Guarda la instancia de Telemetria en la base de datos
        telemetria.save()

        # Devuelve una respuesta de éxito
        return JsonResponse({'status': 'success'})
    except Exception as e:
        # En caso de error, devuelve una respuesta de error con un mensaje
        return JsonResponse({'status': 'error', 'message': str(e)})


class MergedTelemetricData(APIView):    
    @staticmethod
    def filterAndSumData():
        # Obtener datos filtrados por actionId=7
        telemetria_data_actionid7 = Telemetria.objects.filter(actionId=7)
        
        # Obtener datos filtrados por actionId=8
        telemetria_data_actionid8 = Telemetria.objects.filter(actionId=8)
        
        # Serializar los datos
        serialized_data_actionid7 = TelemetriaSerializer(telemetria_data_actionid7, many=True).data
        serialized_data_actionid8 = TelemetriaSerializer(telemetria_data_actionid8, many=True).data
        
        # Fusionar los datos
        merged_data = []
        for item8 in serialized_data_actionid8:
            matching_item7 = next((item7 for item7 in serialized_data_actionid7 if item7['dataId'] == item8['dataId']), None)
            if matching_item7:
                item8['dataName'] = matching_item7['dataName']
            merged_data.append(item8)

        return Response({'all_data': merged_data})

    @csrf_exempt
    @require_POST
    def DataActionId8(request):
        try:
            merged_data = MergedTelemetricData.filterAndSumData()
            for i in merged_data:
                # Crear el existing_record dentro del bucle
                existing_record = MergedTelemetricActionId8.objects.filter(recordId=i.get('recordId')).first()
                # Verificar si el registro ya existe
                if existing_record:
                    # Si el registro ya existe, continua con el próximo elemento en merged_data
                    continue
                # Si el registro no existe, crea una nueva instancia de MergedTelemetricActionId8
                new_record = MergedTelemetricActionId8(
                    actionId=i.get('actionId'),
                    actionKey=i.get('actionKey'),
                    anonymized=i.get('anonymized'),
                    data=i.get('data'),
                    dataDuration=i.get('dataDuration'),
                    dataId=i.get('dataId'),
                    dataName=i.get('dataName'),
                    dataNetId=i.get('dataNetId'),
                    dataPrice=i.get('dataPrice'),
                    dataSeviceId=i.get('dataSeviceId'),
                    dataTsId=i.get('dataTsId'),
                    date=i.get('date'),
                    deviceId=i.get('deviceId'),
                    ip=i.get('ip'),
                    ipId=i.get('ipId'),
                    manual=i.get('manual'),
                    profileId=i.get('profileId'),
                    reaonId=i.get('reaonId'),
                    reasonKey=i.get('reasonKey'),
                    recordId=i.get('recordId'),
                    smartcardId=i.get('smartcardId'),
                    subscriberCode=i.get('subscriberCode'),
                    timestamp=i.get('timestamp'),
                    dataDate=i.get('dataDate'),
                    timeDate=i.get('timeDate'),
                    whoisCountry=i.get('whoisCountry'),
                    whoisIsp=i.get('whoisIsp')
                )
    
                # Guardar la nueva instancia en la base de datos
                new_record.save()

            # Si el bucle se completa sin encontrar duplicados, devolver una respuesta de éxito
            return JsonResponse({'status': 'success', 'message': 'No duplicates found'})
        except Exception as e:
            # En caso de cualquier otro error, devuelve una respuesta de error con un mensaje
            return JsonResponse({'status': 'error', 'message': str(e)})