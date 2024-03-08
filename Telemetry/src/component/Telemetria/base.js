import { useState, useEffect } from 'react';
import { CV } from "../../cv/cv";

const Telemetria = () => {
  const [telemetriaData, setTelemetriaData] = useState([]);
  const [sentRecordIds, setSentRecordIds] = useState(new Set());
  const [stopFetching, setStopFetching] = useState(true);

  const limit = 1000;

  const fetchTelemetriaData = async (pageNumber) => {
    try {
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
        const newTelemetryRecords = result.answer.telemetryRecordEntries.filter(
          (record) => !sentRecordIds.has(record.recordId)
        );

        const modifiedTelemetryRecords = newTelemetryRecords.map((record) => ({
          ...record,
          dataDate: obtenerFechaFormateada(record.timestamp),
          timeDate: obtenerHoraFormateada(record.timestamp),
        }));

        setSentRecordIds((prevIds) => new Set([...prevIds, ...modifiedTelemetryRecords.map((record) => record.recordId)]));
        setTelemetriaData((prevData) => [...prevData, ...modifiedTelemetryRecords]);

        if (!result.answer.hasDuplicate) {
          await sendDataToDjango(modifiedTelemetryRecords);
          // Continúa la lógica aquí si es necesario
        } else {
          console.log('Deteniendo la consulta debido a registros duplicados');
          setStopFetching(true);
          throw new Error('Registros duplicados encontrados. Deteniendo la consulta.');
        }

        return result;
      } else {
        console.error('Failed to fetch result:', result.errorMessage);
        return result;
      }
    } catch (error) {
      console.error('Error fetching telemetry data:', error);
      return { success: false, errorMessage: error.message };
    }
  };

  const sendDataToDjango = async (telemetryData) => {
    try {
      const result = await fetch('http://localhost:8000/telemetria/dataTelemetria/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telemetryData),
      });

      let responseData;
      try {
        responseData = await result.json();
        if (responseData.status === 'success' && responseData.message === 'Duplicate record') {
          console.log('Deteniendo la consulta debido a registros duplicados');
          setStopFetching(true);
          return;
        }
      } catch (error) {
        console.error('Error al analizar la respuesta JSON:', error);
        throw error;
      }

      console.log('Resultado de data_telemetria:', responseData);
    } catch (error) {
      console.error('Error al enviar datos a Django:', error);
      return { success: false, errorMessage: error.message };
    }
  };

  const obtenerFechaFormateada = (timestamp) => {
    const fecha = new Date(timestamp);
    return fecha.toISOString().split('T')[0];
  };

  const obtenerHoraFormateada = (timestamp) => {
    const data = new Date(timestamp);
    const hora = data.getHours();
    return hora;
  };

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
        console.error('Error fetching telemetry data:', error);
      }
    };

    fetchAllData();
  }, [stopFetching]);
};

export default Telemetria;
