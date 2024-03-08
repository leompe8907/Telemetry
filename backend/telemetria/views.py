# Importa las bibliotecas y módulos necesarios
from django.views.decorators.csrf import csrf_exempt  # Desactiva la protección CSRF
from django.views.decorators.http import require_POST  # Requiere que la solicitud sea de tipo POST
from django.http import JsonResponse  # Devuelve respuestas HTTP en formato JSON
from rest_framework.views import APIView  # Clase base para vistas basadas en clases en Django REST framework
from rest_framework import viewsets  # Clase para definir vistas de conjunto en Django REST framework
from .serializer import TelemetriaSerializer, MergedTelemetricOTTSerializer, MergedTelemetricDVBSerializer, MergedTelemetricCatchupSerializer # Importa los serializadores necesarios
from .models import Telemetria, MergedTelemetricOTT, MergedTelemetricDVB  # Importa los modelos necesarios
import json  # Módulo para trabajar con datos JSON
from rest_framework import status
from rest_framework.response import Response  # Clase para manejar respuestas HTTP
from django.db import IntegrityError

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
        data_batch = json.loads(request.body.decode('utf-8'))

        # Lista para almacenar respuestas individuales para cada registro en el lote
        responses = []
        telemetria_instances = []

        # Crear instancias de Telemetria
        for data in data_batch:
            existing_record = Telemetria.objects.filter(recordId=data.get('recordId')).first()
            if existing_record:
                responses.append({'status': 'success', 'message': 'Duplicate record'})
            else:
                telemetria_instances.append(Telemetria(
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
                ))

        # Guardar instancias de Telemetria en la base de datos
        Telemetria.objects.bulk_create(telemetria_instances)

        # Crear respuestas exitosas
        responses.extend([{'status': 'success'} for _ in telemetria_instances])

        # Devolver las respuestas para cada registro en el lote
        return JsonResponse(responses, safe=False)
    except Exception as e:
        # En caso de error, devuelve una respuesta de error con un mensaje
        return JsonResponse({'status': 'error', 'message': str(e)})


class MergedDataOTT(APIView):
    @staticmethod
    def FilterAndSumData():
        # Filtra los datos de Telemetria con actionId 7 y 8
        telemetria_data_actionid7 = Telemetria.objects.filter(actionId=7)
        telemetria_data_actionid8 = Telemetria.objects.filter(actionId=8)

        # Serializa los datos obtenidos
        serialized_data_actionid7 = TelemetriaSerializer(telemetria_data_actionid7, many=True).data
        serialized_data_actionid8 = TelemetriaSerializer(telemetria_data_actionid8, many=True).data

        # Lista para almacenar los datos fusionados
        merged_data = []

        # Itera sobre los datos con actionId 8
        for item8 in serialized_data_actionid8:
            # Busca un elemento coincidente en los datos con actionId 7
            matching_item7 = next((item7 for item7 in serialized_data_actionid7 if item7['dataId'] == item8['dataId']), None)
            
            # Si hay coincidencia, agrega la propiedad 'dataName' de actionId 7 a los datos de actionId 8
            if matching_item7:
                item8['dataName'] = matching_item7['dataName']
            
            # Agrega el elemento modificado a la lista de datos fusionados
            merged_data.append(item8)

        # Verifica y almacena en la base de datos MergedTelemetricOTT
        for merged_item in merged_data:
            record_id = merged_item.get('recordId')
            if record_id and not MergedTelemetricOTT.objects.filter(recordId=record_id).exists():
                # Si el recordId no está en la base de datos, almacenarlo
                MergedTelemetricOTT.objects.create(**merged_item)
        
        # Devuelve los datos fusionados
        return merged_data

class ProcessMergedDataOTT(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Aquí puedes llamar a tu lógica para procesar y almacenar los datos
            merged_data = MergedDataOTT.FilterAndSumData()

            # Devuelve una respuesta con los datos fusionados
            return Response({"message": merged_data }, status=status.HTTP_200_OK)
        except Exception as e:
            # En caso de error, devuelve una respuesta de error con el mensaje
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DataAccionOTT(APIView):
    def get(self, request, *args, **kwargs):
        # Obtiene todos los objetos de la tabla MergedTelemetricOTT en la base de datos
        data = MergedTelemetricOTT.objects.all()
        
        # Serializa los datos obtenidos utilizando tu propio serializador
        serializer = MergedTelemetricOTTSerializer(data, many=True)
        
        # Devuelve una respuesta con los datos serializados
        return Response(serializer.data, status=status.HTTP_200_OK)

class MergedDataDVB(APIView):
    @staticmethod
    def FilterAndSumData():
        # Filtra los datos de Telemetria con actionId 5 y 6
        telemetria_data_actionid5 = Telemetria.objects.filter(actionId=5)
        telemetria_data_actionid6 = Telemetria.objects.filter(actionId=6)
        
        # Serializa los datos obtenidos
        serialized_data_actionid5 = TelemetriaSerializer(telemetria_data_actionid5, many=True).data
        serialized_data_actionid6 = TelemetriaSerializer(telemetria_data_actionid6, many=True).data
        
        # Lista para almacenar los datos fusionados
        merged_data = []

        # Itera sobre los datos con actionId 6
        for item6 in serialized_data_actionid6:
            # Busca un elemento coincidente en los datos con actionId 5
            matching_item5 = next((item5 for item5 in serialized_data_actionid5 if item5['dataId'] == item6['dataId']), None)
            
            # Si hay coincidencia, agrega la propiedad 'dataName' de actionId 5 a los datos de actionId 6
            if matching_item5:
                item6['dataName'] = matching_item5['dataName']
            
            # Agrega el elemento modificado a la lista de datos fusionados
            merged_data.append(item6)

        # Verifica y almacena en la base de datos MergedTelemetricDVB
        for merged_item in merged_data:
            record_id = merged_item.get('recordId')
            if record_id and not MergedTelemetricDVB.objects.filter(recordId=record_id).exists():
                # Si el recordId no está en la base de datos, almacenarlo
                MergedTelemetricDVB.objects.create(**merged_item)
        
        # Devuelve los datos fusionados
        return merged_data

class ProcessMergedDataDVB(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Aquí puedes llamar a tu lógica para procesar y almacenar los datos
            merged_data = MergedDataDVB.FilterAndSumData()

            # Devuelve una respuesta con los datos fusionados
            return Response({"message": merged_data }, status=status.HTTP_200_OK)
        except Exception as e:
            # En caso de error, devuelve una respuesta de error con el mensaje
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DataAccionId6(APIView):
    def get(self, request, *args, **kwargs):
        # Obtiene todos los objetos de la tabla MergedTelemetricDVB en la base de datos
        data = MergedTelemetricDVB.objects.all()
        
        # Serializa los datos obtenidos utilizando tu propio serializador
        serializer = MergedTelemetricDVBSerializer(data, many=True)
        
        # Devuelve una respuesta con los datos serializados
        return Response(serializer.data, status=status.HTTP_200_OK)

class  MergeDataCatchup(APIView):
    @staticmethod
    def FilterAndSumData():
        # Filtra los datos de Telemetria con actionId 5 y 6
        telemetria_data_actionid16 = Telemetria.objects.filter(actionId=16)
        telemetria_data_actionid17 = Telemetria.objects.filter(actionId=17)
        telemetria_data_actionid18 = Telemetria.objects.filter(actionId=18)

        # Serializa los datos obtenidos
        serialized_data_actionid16 = TelemetriaSerializer(telemetria_data_actionid16, many=True).data
        serialized_data_actionid17 = TelemetriaSerializer(telemetria_data_actionid17, many=True).data
        serialized_data_actionid18 = TelemetriaSerializer(telemetria_data_actionid18, many=True).data

        # Lista para almacenar los datos fusionados
        merge_data17 = []
        # Itera sobre los datos con actionId 6
        for item17 in serialized_data_actionid17:
            # Busca un elemento coincidente en los datos con actionId16
            matching_item16 = next((item16 for item16 in serialized_data_actionid16 if item16['dataId'] == item17['dataId']), None)
            
            # Si hay coincidencia, agrega la propiedad 'dataName' de actionId 16 a los datos de actionId 17
            if matching_item16:
                item17['dataName'] = matching_item16['dataName']
            
            # Agrega el elemento modificado a la lista de datos fusionados
            merge_data17.append(item17)

        merge_data18 = []
        for item18 in serialized_data_actionid18:
            # Busca un elemento coincidente en los datos con actionId16
            matching_item16 = next((item16 for item16 in serialized_data_actionid16 if item16['dataId'] == item18['dataId']), None)
            
            # Si hay coincidencia, agrega la propiedad 'dataName' de actionId 16 a los datos de actionId 18
            if matching_item16:
                item18['dataName'] = matching_item16['dataName']
            
            # Agrega el elemento modificado a la lista de datos fusionados
            merge_data18.append(item18)

        return merge_data18, merge_data17