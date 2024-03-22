import { useState, useEffect } from 'react';
import { CV } from "../../cv/cv";
import pako from 'pako';


const Telemetria = () => {
  const [telemetriaData, setTelemetriaData] = useState([]);

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
            orderBy: "timestamp",
            orderDir: "DESC"
          },
          (result) => resolve(result)
        );
      });
      if (!result.success) {
        throw new Error(`Error al obtener datos: ${result.errorMessage}`);
      }

      return result.answer.telemetryRecordEntries;
    } catch (error) {
      console.error(`Error al obtener datos de telemetría: ${error.message}`);
      return [];
    }
  };

  const sendDataToDjango = async (telemetryData) => {
    try {
      // Comprimir los datos antes de enviarlos
      const compressedData = compressData(telemetryData);
      
      await fetch('http://localhost:8000/telemetria/dataTelemetria/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Encoding': 'gzip' // Indica que los datos están comprimidos
        },
        body: compressedData,
      });
    } catch (error) {
      console.error('Error al enviar datos a Django:', error);
    }
  };

  const compressData = (data) => {
    // Convierte los datos a JSON
    const jsonData = JSON.stringify(data);
    // Comprime los datos utilizando gzip
    const compressedData = pako.gzip(jsonData, { level: 9 });
    return compressedData;
  };

  useEffect(() => {
    const fetchDataRecursive = async (pageNumber) => {
      let currentPage = pageNumber;
      while (true) {
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
  }, []);

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
