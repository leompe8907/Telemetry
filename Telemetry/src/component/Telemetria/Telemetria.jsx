import { useState, useEffect } from 'react';
import { CV } from "../../cv/cv";

const Telemetria = () => {
  const [telemetriaData, setTelemetriaData] = useState([]);
  const [stopFetching, setStopFetching] = useState(false);

  const limit = 1000;

  const fetchData = async (pageNumber) => {
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
        return result.answer.telemetryRecordEntries;
      } else {
        console.error('Failed to fetch result:', result.errorMessage);
        return [];
      }
    } catch (error) {
      console.error('Error fetching telemetry data:', error);
      return [];
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

      const responseData = await result.json();
      console.log('Resultado de data_telemetria:', responseData);

      if (responseData.status === 'success' && responseData.message === 'Duplicate record') {
        console.log('Deteniendo la consulta debido a registros duplicados');
        setStopFetching(true); // Detener la descarga de datos
      }
    } catch (error) {
      console.error('Error al enviar datos a Django:', error);
    }
  };

  useEffect(() => {
    const fetchDataRecursive = async (pageNumber) => {
      let currentPage = pageNumber;
      while (!stopFetching) {
        try {
          const data = await fetchData(currentPage);
          if (data.length > 0) {
            const modifiedData = data.map(record => ({
              ...record,
              dataDate: getDataDate(record.timestamp),
              timeDate: getTimeDate(record.timestamp)
            }));
            setTelemetriaData(prevData => [...prevData, ...modifiedData]);
            await sendDataToDjango(modifiedData);
            currentPage += limit;
          } else {
            break;
          }
        } catch (error) {
          console.error('Error fetching telemetry data:', error);
          break;
        }
      }
    };

    fetchDataRecursive(0);
  }, [stopFetching]);

  const getTimeDate = (timestamp) => {
    const data = new Date(timestamp);
    const hora = data.getHours();
    return hora;
  };

  const getDataDate = (timestamp) => {
    const fecha = new Date(timestamp);
    return fecha.toISOString().split('T')[0];
  };

  return null; // Opcional: reemplazar con el contenido JSX necesario
};

export default Telemetria;
