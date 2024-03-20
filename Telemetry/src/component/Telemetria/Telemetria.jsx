import { useState, useEffect } from 'react';
import { CV } from "../../cv/cv";

const Telemetria = () => {
  const [telemetriaData, setTelemetriaData] = useState([]);
  const [stopFetching, setStopFetching] = useState(true);
  const [djangoResponse, setDjangoResponse] = useState(null); // Nuevo estado para almacenar la respuesta de Django

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

      // Almacena la respuesta de Django en el estado
      setDjangoResponse(responseData);
    } catch (error) {
      console.error('Error al enviar datos a Django:', error);
    }
  };

  useEffect(() => {
    const fetchDataRecursive = async (pageNumber) => {
      let currentPage = pageNumber;
      while (stopFetching) {
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

  useEffect(() => {
    let shouldStopFetching = false; // Bandera para detener la descarga de datos
  
    // Iterar sobre los elementos de djangoResponse y mostrar "banana" si el mensaje es "Duplicate record"
    if (djangoResponse) {
      djangoResponse.forEach(response => {
        if (response.message === 'Duplicate record') {
          console.log('banana');
          shouldStopFetching = true; // Establecer la bandera en verdadero
        }
      });
    }
  
    // Actualizar el estado fuera del bucle
    if (shouldStopFetching) {
      setStopFetching(false); // Detener la descarga de datos
    }
    console.log(stopFetching)
  }, [djangoResponse]);
  
  return null; // Opcional: reemplazar con el contenido JSX necesario
};

export default Telemetria;
