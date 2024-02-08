import { useState, useEffect } from 'react';
import { CV } from "../../cv/cv";

const Telemetria = () => {

  const [telemetriaData, setTelemetriaData] = useState([]);
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
          },
          (result) => resolve(result)
        );
      });

      if (result.success) {
        const newData = result.answer;
        setTelemetriaData((prevData) => [...prevData, ...newData.telemetryRecordEntries]);

        await sendDataToDjango(newData.telemetryRecordEntries);

        console.log('Telemetria Data:', newData.telemetryRecordEntries);
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
      for (const telemetryRecord of telemetryData) {
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

        const timestampDate = new Date(timestamp);
        const timestampMilliseconds = timestampDate.getTime();

        console.log("Record ID:", recordId);
        console.log("Subscriber Code:", subscriberCode);
        console.log("Timestamp en milisegundos:", timestampMilliseconds);

        let result;
        try {
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
              timestamp: timestampMilliseconds,
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
            }),
          });
        } catch (error) {
          console.error('Error en la solicitud HTTP:', error);
          throw error;
        }

        let responseData;
        try {
          responseData = await result.json();
        } catch (error) {
          console.error('Error al analizar la respuesta JSON:', error);
          throw error;
        }

        console.log('Resultado de data_telemetria:', responseData);
      }

      return { success: true };
    } catch (error) {
      console.error('Error al enviar datos a Django:', error);
      return { success: false, errorMessage: error.message };
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      let pageNumber = 0;
      try {
        while (true) {
          const result = await fetchTelemetriaData(pageNumber);
          if (!result.success || result.answer.telemetryRecordEntries.length === 0) break;
          pageNumber += limit;
        }
      } catch (error) {
        console.error('Error fetching telemetry data:', error);
      }
    };

    fetchAllData();
  }, []);

};

export default Telemetria;
