import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import "./DashOTT.scss"

function DashOTT() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [smartcardCounts, setSmartcardCounts] = useState([]);
  const [dataNameCounts, setDataNameCounts] = useState([]);
  const [dataNameSumDurations, setDataNameSumDurations] = useState([]);
  const [dataNameAverages, setDataNameAverages] = useState([]);

  const [smartcardChartData, setSmartcardChartData] = useState(null);
  const [dataNameChartData, setDataNameChartData] = useState(null);
  const [dataDurationChartData, setDataDurationChartData] = useState(null);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const searchAndCountSmartcards = (start, end) => {
    const startTimestamp = new Date(start).getTime();
    const endTimestamp = new Date(end).getTime();

    const range = IDBKeyRange.bound(startTimestamp, endTimestamp);

    const request = indexedDB.open('TelemetryDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const dataOTTtryTransaction = db.transaction(['dataOTT'], 'readonly');
      const dataOTT = dataOTTtryTransaction.objectStore('dataOTT');

      const index = dataOTT.index('timestampIndex');
      const requestAllObjects = index.getAll(range);

      requestAllObjects.onsuccess = (event) => {
        const result = event.target.result;
        const counts = {};
        result.forEach((item) => {
          const smartcardId = item.smartcardId;
          counts[smartcardId] = (counts[smartcardId] || 0) + 1;
        });

        const sortedCounts = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .reduce((acc, [smartcardId, count]) => {
            acc[smartcardId] = count;
            return acc;
          }, {});

        setSmartcardCounts(sortedCounts);
      };

      requestAllObjects.onerror = (event) => {
        console.error("Error al obtener los objetos:", event.target.error);
      };
    };
  };

  const searchAndCountDataNames = (start, end) => {
    const startTimestamp = new Date(start).getTime();
    const endTimestamp = new Date(end).getTime();

    const range = IDBKeyRange.bound(startTimestamp, endTimestamp);

    const request = indexedDB.open('TelemetryDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const dataOTTtryTransaction = db.transaction(['dataOTT'], 'readonly');
      const dataOTT = dataOTTtryTransaction.objectStore('dataOTT');

      const index = dataOTT.index('timestampIndex');
      const requestAllObjects = index.getAll(range);

      requestAllObjects.onsuccess = (event) => {
        const result = event.target.result;
        const counts = {};
        result.forEach((item) => {
          const dataName = item.dataName;
          counts[dataName] = (counts[dataName] || 0) + 1;
        });

        const sortedCounts = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .reduce((acc, [dataName, count]) => {
            acc[dataName] = count;
            return acc;
          }, {});
        
        const sums = {};
        result.forEach((item) => {
          const dataName = item.dataName;
          const dataDuration = item.dataDuration;
          sums[dataName] = (sums[dataName] || 0) + dataDuration;
        });
      
        const sumsInHours = {};
        Object.entries(sums).forEach(([dataName, sumDuration]) => {
          sumsInHours[dataName] = sumDuration / 3600;
        });
      
        const totalSumDuration = Object.values(sums).reduce((acc, sum) => acc + sum, 0);
        const totalSumDurationInHours = totalSumDuration / 3600;
      
        const averages = {};
        Object.entries(sumsInHours).forEach(([dataName, sumDuration]) => {
          averages[dataName] = (sumDuration / totalSumDurationInHours) * 100;
        });

        setDataNameCounts(sortedCounts);
        setDataNameAverages(averages);
      };

      requestAllObjects.onerror = (event) => {
        console.error("Error al obtener los objetos:", event.target.error);
      };
    };
  };

  const searchAndSumDataDuration = (start, end) => {
    const startTimestamp = new Date(start).getTime();
    const endTimestamp = new Date(end).getTime();

    const range = IDBKeyRange.bound(startTimestamp, endTimestamp);

    const request = indexedDB.open('TelemetryDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const dataOTTtryTransaction = db.transaction(['dataOTT'], 'readonly');
      const dataOTT = dataOTTtryTransaction.objectStore('dataOTT');

      const index = dataOTT.index('timestampIndex');
      const requestAllObjects = index.getAll(range);

      requestAllObjects.onsuccess = (event) => {
        const result = event.target.result;
        const sums = {};
        result.forEach((item) => {
          const dataName = item.dataName;
          const dataDuration = item.dataDuration;
          sums[dataName] = (sums[dataName] || 0) + dataDuration;
        });

        const sumsInHours = {};
        Object.entries(sums).forEach(([dataName, sumDuration]) => {
          sumsInHours[dataName] = sumDuration / 3600;
        });

        setDataNameSumDurations(sumsInHours);
      };

      requestAllObjects.onerror = (event) => {
        console.error("Error al obtener los objetos:", event.target.error);
      };
    };
  };

  const handleSearch = () => {
    searchAndCountSmartcards(startDate, endDate);
    searchAndCountDataNames(startDate, endDate);
    searchAndSumDataDuration(startDate, endDate);
  };

  useEffect(() => {
    const updateChartData = () => {
      const smartcardData = Object.entries(smartcardCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([smartcardId, count]) => ({ smartcardId, count }));

      const dataNameData = Object.entries(dataNameCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([dataName, count]) => ({ 
          dataName, 
          count, 
          average: dataNameAverages[dataName] ? dataNameAverages[dataName].toFixed(2) : 0 }));

      const dataDurationData = Object.entries(dataNameSumDurations)
        .sort((a, b) => b[1] - a[1])
        .map(([dataName, sumDuration]) => ({
          dataName,
          sumDuration: sumDuration.toFixed(2),
          average: dataNameAverages[dataName] ? dataNameAverages[dataName].toFixed(2) : 0,
        }));

      setSmartcardChartData(smartcardData);
      setDataNameChartData(dataNameData);
      setDataDurationChartData(dataDurationData);
    };

    updateChartData();
  }, [smartcardCounts, dataNameCounts, dataNameSumDurations, dataNameAverages]);

  useEffect(() => {
    const createOrUpdateChart = (canvasId, data) => {
      const existingChart = Chart.getChart(canvasId);

      if (existingChart) {
        existingChart.destroy();
      }

      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, data);
    };
     // Crear o actualizar el gráfico de smartcardId
     if (smartcardChartData) {
      const colors = generateRandomColors(smartcardChartData.length); // Una función para generar colores aleatorios
    
      createOrUpdateChart('smartcardChart', {
        type: 'pie',
        data: {
          labels: smartcardChartData.map((data) => data.smartcardId),
          datasets: [{
            label: 'Número de veces',
            data: smartcardChartData.map((data) => data.count),
            backgroundColor: colors,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }],
        },
      });
    }
    
    // Función para generar colores aleatorios
    function generateRandomColors(numColors) {
      const colors = [];
      for (let i = 0; i < numColors; i++) {
        const color = getRandomColor();
        colors.push(color);
      }
      return colors;
    }
    
    // Función para obtener un color aleatorio en formato rgba
    function getRandomColor() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      const alpha = 0.6; // Puedes ajustar la transparencia según tus preferencias
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Crear o actualizar el gráfico de dataName
    if (dataNameChartData) {
      createOrUpdateChart('dataNameChart', {
        type: 'bar',
        data: {
          labels: dataNameChartData.map((data) => data.dataName), // Obtener las etiquetas directamente de dataNameChartData
          datasets: [
            {
              label: 'Número de veces',
              data: dataNameChartData.map((data) => data.count),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
            {
              label: 'Promedio (%)',
              data: dataNameChartData.map((data) => data.average),
              backgroundColor: 'rgba(255, 205, 86, 0.2)',
              borderColor: 'rgba(255, 205, 86, 1)',
              borderWidth: 1,
            },
          ],
        },
      });
    }

    // Crear o actualizar el gráfico de dataDuration
    if (dataDurationChartData) {
      createOrUpdateChart('dataDurationChart', {
        type: 'bar',
        data: {
          labels: dataDurationChartData.map((data) => data.dataName),
          datasets: [{
            label: 'Suma de dataDuration',
            data: dataDurationChartData.map((data) => data.sumDuration),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          }],
        },
      });
    }
  }, [smartcardChartData, dataNameChartData, dataDurationChartData]);

  return (
    <>
      <div className='containerGeneralInformation'>
        <div className='containerGeneral'>
          <div className='containerGeneralForms'>
            <form className='containerForm'>
              <div className='containerInput'>
                <label className='date' htmlFor="startDate">Fecha de inicio:</label>
                <input type="date" id="startDate" name="startDate" value={startDate} onChange={handleStartDateChange} />
              </div>
              <div className='containerInput'>
                <label className='date' htmlFor="endDate">Fecha de fin:</label>
                <input type="date" id="endDate" name="endDate" value={endDate} onChange={handleEndDateChange} />
              </div>
              <button className='button' type="button" onClick={handleSearch}>Buscar</button>
            </form>
          </div>
          <div className='containerGeneralTables'>

          <div className='containerGeneralTable'>
              <div className='containerTableType'>
                <h2 className='containerTittle'>Resultados duracion de OTT</h2>
                <table className='containerTable'>
                  <thead className='containerTableThead'>
                    <tr className='containerTableTr'>
                      <th className='containerTableTh'>OTT</th>
                      <th className='containerTableTh'>Suma de dataDuration</th>
                    </tr>
                  </thead>
                  <tbody className='containerTableTBody'>
                    {Object.entries(dataNameSumDurations)
                      .sort((a, b) => b[1] - a[1])
                      .map(([dataName, sumDuration]) => (
                        <tr className='containerTableTr' key={dataName}>
                          <td className='containerTableTh'>{dataName}</td>
                          <td className='containerTableTh'> {sumDuration.toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className='containerGraphType'>
                <h2 className='containerTittle'>Gráfico de Resultados duracion de OTT</h2>
                <canvas id="dataDurationChart" width="400" height="200"></canvas>
              </div>
            </div>
            
            <div className='containerGeneralTable'>
              <div className='containerTableType'>
                <h2 className='containerTittle'>Resultado de Tarjetas</h2>
                <table className='containerTable'>
                  <thead className='containerTableThead'>
                    <tr className='containerTableTr'>
                      <th className='containerTableTh'>Tarjeta</th>
                      <th className='containerTableTh'>Número repeticiones</th>
                    </tr>
                  </thead>
                  <tbody className='containerTableTBody'>
                    {Object.entries(smartcardCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([smartcardId, count]) => (
                        <tr className='containerTableTr' key={smartcardId}>
                          <td className='containerTableTh'>{smartcardId}</td>
                          <td className='containerTableTh'>{count}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className='containerGraphType'>
                <h2 className='containerTittle'>Gráfico de smartcardId</h2>
                <canvas id="smartcardChart" width="400" height="200"></canvas>
              </div>
            </div>

            <div className='containerGeneralTable'>
              <div className='containerTableType'>
                <h2 className='containerTittle'>Resultados canales OTT</h2>
                <table className='containerTable'>
                  <thead className='containerTableThead'>
                    <tr className='containerTableTr'>
                      <th className='containerTableTh'>Canal OTT</th>
                      <th className='containerTableTh'>Número de veces</th>
                      <th className='containerTableTh'>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody className='containerTableTBody'>
                    {Object.entries(dataNameCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([dataName, count]) => (
                        <tr className='containerTableTr' key={dataName}>
                          <td className='containerTableTh'>{dataName}</td>
                          <td className='containerTableTh'>{count}</td>
                          <td className='containerTableTh'>{dataNameAverages[dataName] ? dataNameAverages[dataName].toFixed(2) : 0}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className='containerGraphType'>
                <h2 className='containerTittle'>Gráfico OTT</h2>
                <canvas id="dataNameChart" width="400" height="200"></canvas>
              </div>
            </div>
                        
          </div>
        </div>
      </div>
    </>
  );
}

export default DashOTT;
