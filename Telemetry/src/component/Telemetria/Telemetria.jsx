import { useState, useEffect } from 'react';
import { CV } from "../../cv/cv";

const Telemetria = () => {
  const [telemetriaData, setTelemetriaData] = useState([]);
  const [sentRecordIds, setSentRecordIds] = useState(new Set());
  const [stopFetching, setStopFetching] = useState(true); // Bandera para detener el bucle
  const limit = 1000; // parámetro de función que indica el limite de registro a traer por consulta


  // Función para obtener datos de telemetría desde CV
  const fetchTelemetriaData = async (pageNumber) => {
    try {
      // Llamada a CV para obtener la lista de registros de telemetría
      const result = await new Promise((resolve) => {
        CV.call(
          "getListOfTelemetryRecords",
          {
            sessionId: localStorage.getItem("sessionID"),
            offset: pageNumber,
            limit: limit,
            orderBy: "recordId",
            orderDir: "DESC"
          },
          (result) => resolve(result)
        );
      });

      if (result.success) {
        // Filtra registros no enviados previamente
        const newTelemetryRecords = result.answer.telemetryRecordEntries.filter(
          (record) => !sentRecordIds.has(record.recordId)
        );

        // Actualiza los IDs de registros enviados
        setSentRecordIds((prevIds) => new Set([...prevIds, ...newTelemetryRecords.map((record) => record.recordId)]));
        // Agrega nuevos registros a la lista actual
        setTelemetriaData((prevData) => [...prevData, ...newTelemetryRecords]);

        // Envía datos a Django solo si no hay registros duplicados
        if (!result.answer.hasDuplicate) {
          await sendDataToDjango(newTelemetryRecords);
          // Continúa la lógica aquí si es necesario
        } else {
          // Detén la consulta o maneja la lógica correspondiente si hay registros duplicados
          console.log('Deteniendo la consulta debido a registros duplicados');
          setStopFetching(true); // Establece la bandera para detener el bucle
          throw new Error('Registros duplicados encontrados. Deteniendo la consulta.');
        }

        return result;
      } else {
        // Manejo de errores al obtener datos de telemetría
        console.error('Failed to fetch result:', result.errorMessage);
        return result;
      }
    } catch (error) {
      // Manejo de errores generales al obtener datos de telemetría
      console.error('Error fetching telemetry data:', error);
      return { success: false, errorMessage: error.message };
    }
  };

  // Función para enviar datos de telemetría a Django
  const sendDataToDjango = async (telemetryData) => {
    try {
      // Itera sobre cada registro y envíalo a Django
      for (const telemetryRecord of telemetryData) {
        // Desestructura el registro para obtener sus propiedades
        const {
          recordId,
          subscriberCode,
          deviceId,
          smartcardId,
          anonymized,
          actionId,
          actionKey,
          date,
          timestamp,
          manual,
          reaonId,
          reasonKey,
          dataNetId,
          dataTsId,
          dataSeviceId,
          dataId,
          dataName,
          dataPrice,
          dataDuration,
          whoisCountry,
          whoisIsp,
          ipId,
          ip,
          profileId
        } = telemetryRecord;

        console.log(timestamp)

        console.log("Record ID:", recordId);
        console.log("Subscriber Code:", subscriberCode);

        const timestampWithTimeZone = timestamp + 'Z';  // Agregar 'Z' para indicar la zona horaria UTC
        const dateTime = new Date(timestampWithTimeZone);
        const dataDate = dateTime.toISOString().split('T')[0]
        const timeDate = dateTime.toISOString().split('T')[1].split('.')[0];

        console.log(dataDate)
        console.log(timeDate)


        let result;
        try {
          // Realiza una solicitud HTTP para enviar datos a Django
          result = await fetch('http://localhost:8000/telemetria/dataTelemetria/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recordId,
              subscriberCode,
              deviceId,
              smartcardId,
              anonymized,
              actionId,
              actionKey,
              date,
              timestamp,
              manual,
              reaonId,
              reasonKey,
              dataNetId,
              dataTsId,
              dataSeviceId,
              dataId,
              dataName,
              dataPrice,
              dataDuration,
              whoisCountry,
              whoisIsp,
              ipId,
              ip,
              profileId,
              dataDate,
              timeDate
            }),
          });
        } catch (error) {
          // Manejo de errores en la solicitud HTTP
          console.error('Error en la solicitud HTTP:', error);
          throw error;
        }

        let responseData;
        try {
          // Analiza la respuesta JSON
          responseData = await result.json();
          // Verifica si la respuesta indica un duplicado
          if (responseData.status === 'success' && responseData.message === 'Duplicate record') {
            console.log('Deteniendo la consulta debido a registros duplicados');
            setStopFetching(true); // Establece la bandera para detener el bucle
            return; // Sal del bucle
          }
        } catch (error) {
          // Manejo de errores al analizar la respuesta JSON
          console.error('Error al analizar la respuesta JSON:', error);
          throw error;
        }

        // Muestra información de la respuesta de Django en la consola
        console.log('Resultado de data_telemetria:', responseData);
      }

      return { success: true };
    } catch (error) {
      // Manejo de errores durante el envío de datos a Django
      console.error('Error al enviar datos a Django:', error);
      return { success: false, errorMessage: error.message };
    }
  };

  // Efecto secundario para cargar datos de telemetría al montar el componente
  useEffect(() => {
    const fetchAllData = async () => {
      let pageNumber = 0;
      try {
        while (stopFetching) {
          const result = await fetchTelemetriaData(pageNumber);
          if (!result.success || result.answer.telemetryRecordEntries.length === 0) break;
          pageNumber += limit;
        }
      } catch (error) {
        // Manejo de errores al obtener datos de telemetría
        console.error('Error fetching telemetry data:', error);
      }
    };

    fetchAllData();
  }, [stopFetching]);

};

export default Telemetria;
