import React, { useState, useEffect} from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import 'chart.js/auto';
import NavBar from '../../component/Navbar/Navbar';
import './DashOTT.scss';

function DashOTT() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false); 

  // suma total de segundos de los objetos filtrados
  const [generalDuration, setGeneralDuration] = useState(null)
  // suma total de dispositivos filtrados
  const [device, setDevice] = useState(0)
  // suma total de segundos de los objtos filtrados por franja horaria
  const [sumByTimeSlot, setSumByTimeSlot] = useState({Manaña: 0,Tarde: 0,Noche: 0,Madrugada: 0});
  // canales con suma de segundos divididos por franja horaria
  const [sumChannelTimeSlot, setSumChannelTimeSlot] = useState({Manaña: {},Tarde: {},Noche: {},Madrugada: {}});
  // estado de los canales y su suma por horas
  const [dataName, setDataName] = useState({})
  // estado de las leyendas
  const [leyendaActual, setLeyendaActual] = useState('');

  const [smartcardChartData, setSmartcardChartData] = useState(null);


  const Leyendas = [
    "Durante el período comprendido entre " + startDate + " y " + endDate +  " hemos examinado minuciosamente los registros, los cuales revelan que se han acumulado un total de " + generalDuration + " segundos de actividad en " + device + " dispositivos. Esta información proporciona una visión detallada del tiempo de uso y la distribución de la actividad en los diferentes dispositivos.",
    
    "Los datos recopilados desde " +startDate+ " hasta " +endDate+ " han sido sometidos a un análisis exhaustivo, destacando un patrón significativo de "+generalDuration+ " segundos de actividad en " +device+ " dispositivos. Este análisis proporciona una comprensión profunda de la dinámica de uso a lo largo del período de estudio.",
    
    "En el análisis de los registros correspondientes al periodo de " +startDate+" a "+endDate+", se ha constatado un total de "+generalDuration+" segundos de utilización en "+device+" dispositivos. Este análisis detallado nos permite identificar tendencias, picos y valles en la actividad, arrojando luz sobre el comportamiento de los usuarios en diferentes momentos.",
    
    "Los registros recolectados desde "+startDate+" hasta "+endDate+" ofrecen un panorama completo de la actividad, mostrando que se han registrado "+generalDuration+" segundos de uso en "+device+" dispositivos. Este análisis no solo destaca la duración total, sino que también proporciona información valiosa sobre la frecuencia y la distribución de la actividad a lo largo del tiempo.",
    
    "La revisión de los datos recopilados durante el periodo de "+startDate+" a "+endDate+" revela una duración acumulada de "+generalDuration+" segundos de actividad en "+device+" dispositivos. Este análisis detallado es esencial para comprender la variabilidad en el tiempo de uso y la intensidad de la actividad en diferentes momentos del día.",
    
    "Al examinar los registros desde "+startDate+" hasta "+endDate+", se ha identificado un total de "+generalDuration+" segundos de actividad en "+device+" dispositivos. Este análisis proporciona una visión completa de la duración y la distribución de la actividad, permitiendo una comprensión más profunda de los patrones de uso.",
    
    "El análisis de los registros recopilados desde "+startDate+" hasta "+endDate+" pone de manifiesto que se ha observado una duración total de "+generalDuration+" segundos de actividad en "+device+" dispositivos. Este examen detallado proporciona insights cruciales sobre la variabilidad temporal en el uso de los dispositivos.",
    
    "Hemos evaluado minuciosamente la información obtenida desde "+startDate+" hasta "+endDate+", y los resultados indican que se ha registrado un total de "+generalDuration+" segundos de actividad en "+device+" dispositivos. Este análisis profundo es esencial para comprender la dinámica y los patrones de uso en diferentes momentos del periodo estudiado.",
    
    "Durante el periodo de "+startDate+" a "+endDate+", hemos examinado con detalle los registros, evidenciando "+generalDuration+" segundos de actividad en "+device+" dispositivos. Este análisis proporciona una visión integral de la distribución del tiempo de uso, permitiendo identificar momentos de mayor y menor actividad.",
    
    "Los registros recopilados desde "+startDate+" hasta "+endDate+" han sido meticulosamente analizados, revelando un total de "+generalDuration+" segundos de actividad en "+device+" dispositivos. Este análisis exhaustivo es fundamental para comprender la variabilidad temporal y los patrones de uso en la población de dispositivos estudiada."
  ]

  const handleSearch = async () => {
    try {
      // Realizar la conexión con la API
      axios.get(`http://localhost:8000/telemetria/mergedOTT/`)
      .then(response => {
        console.log('Datos recibidos:', response.data);

        // Filtrar los resultados por rango de fechas
        const allData = response.data;
        const filteredData = allData.filter(result => {
          const dataDate = new Date(result.dataDate).getTime();
          return dataDate >= new Date(startDate).getTime() && dataDate <= new Date(endDate).getTime();
        });
        setFilteredData(filteredData);
      })

      // Almacenar los datos filtrados en el estado
      setFilteredData(filteredData);

      // Actualizar el estado para indicar que se ha enviado el formulario
      setFormSubmitted(true);

    } catch (error) {
      // Manejar errores de la API
      setFilteredData([]); // Limpiar el array en caso de error
      // También podrías manejar el estado de formSubmitted aquí si deseas
    }
  };

  // Función para sumar el parámetro dataDuration de los objetos filtrados
  const sumDataDuration = () => {
    // Verificar que haya datos filtrados
    if (filteredData.length === 0) {
      console.error("No hay datos filtrados para sumar.");
      return;
    }
  
    // Sumar dataDuration de todos los objetos filtrados
    const totalDataDuration = filteredData.reduce((accumulator, result) => {
      return accumulator + (result.dataDuration || 0);
    }, 0);
  
    // Actualizar el estado con la suma total de dataDuration
    setGeneralDuration(totalDataDuration);
  };

  // Función para sumar el parámetro smarrcardId de los objetos filtrados
  const sumSmartcardId = () => {
    // Verificar que haya datos filtrados
    if (filteredData.length === 0) {
      console.error("No hay datos filtrados para sumar.");
      return;
    }
    let counter = 0
    filteredData.forEach(result => {
      const smartcard = result.smartcardId;
      if (smartcard !== undefined && smartcard !== null && smartcard !== "") {
        counter += 1;
      }
    })
    console.log(counter)
    setDevice(counter)
  }

   // Función para sumar el dataDuration según la franja horaria
  const sumDataDurationByTimeSlot = () => {
   // Verificar que haya datos filtrados
   if (filteredData.length === 0) {
     console.error("No hay datos filtrados para sumar.");
     return;
   }

   // Inicializar objetos para almacenar las sumas por franja horaria
   const sums = {
     Mañana: 0,
     Tarde: 0,
     Noche: 0,
     Madrugada: 0
   };

   // Iterar sobre los datos filtrados
   filteredData.forEach(result => {
     const dataDuration = result.dataDuration;
     const times = result.timeDate;

     // Sumar dataDuration según la franja horaria
     if (times >= 4 && times < 12) {
       sums.Mañana += dataDuration;
     } else if (times >= 12 && times < 18) {
       sums.Tarde += dataDuration;
     } else if (times >= 18 && times < 23) {
       sums.Noche += dataDuration;
     } else {
       sums.Madrugada += dataDuration;
     }
   });

   // Actualizar el estado con las sumas por franja horaria
   setSumByTimeSlot(sums);
  };

  //Función para organizar los dataName con la suma de dataDuration según su franja horaria
  const channelsHoursByTimeSlot = () => {
    // Verificar que haya datos filtrados
    if (filteredData.length === 0) {
      // Si no hay datos, retorna un objeto vacío
      return {};
    }
  
    // Inicializar objetos para almacenar las sumas por franja horaria
    const sums = {
      Mañana: {},
      Tarde: {},
      Noche: {},
      Madrugada: {}
    };
  
    // Iterar sobre los datos filtrados
    filteredData.forEach(result => {
      const dataDuration = result.dataDuration;
      const times = result.timeDate;
      const name = result.dataName;
  
      // Actualizar las sumas según la franja horaria y el nombre del canal
      if (times >= 4 && times < 12) {
        sums.Mañana[name] = (sums.Mañana[name] || 0) + dataDuration;
      } else if (times >= 12 && times < 18) {
        sums.Tarde[name] = (sums.Tarde[name] || 0) + dataDuration;
      } else if (times >= 18 && times < 23) {
        sums.Noche[name] = (sums.Noche[name] || 0) + dataDuration;
      } else {
        sums.Madrugada[name] = (sums.Madrugada[name] || 0) + dataDuration;
      }
    });
  
    // Actualizar el estado con las sumas por franja horaria y canal
    setSumChannelTimeSlot(sums);
  };

    // Función para suma de dataDuration los dataName filtrados 
  const dictDataDurationByDataName = () => {
    // Verificar que haya datos filtrados
    if (filteredData.length === 0) {
      // Si no hay datos, retorna un objeto vacío
      return {};
    }
  
    // Inicializar un array para almacenar las sumas como pares clave-valor
    const sumsArray = [];
  
    // Iterar sobre los datos filtrados
    filteredData.forEach(result => {
      const name = result.dataName;
      const duration = result.dataDuration;
    
      // Buscar el índice de la entrada actual en el array
      const index = sumsArray.findIndex(item => item.name === name);
    
      // Si la entrada ya existe, sumar la duración; de lo contrario, agregar una nueva entrada
      if (index !== -1) {
        sumsArray[index].duration += duration;
      } else {
        sumsArray.push({ name, duration });
      }
    });
  
    // Ordenar el array por duración de mayor a menor
    sumsArray.sort((a, b) => b.duration - a.duration);
  
    // Convertir el array ordenado de nuevo a un objeto
    const sortedSums = {};
    sumsArray.forEach(item => {
      sortedSums[item.name] = item.duration;
    });
  
    // Actualizar el estado con las sumas por nombre de datos ordenadas
    setDataName(sortedSums);
  };

  // Función de leyenda
  const LeyendaAleatoria = async () => {

    const indiceAleatorio = Math.floor(Math.random() * Leyendas.length);
    setLeyendaActual(Leyendas[indiceAleatorio]);
  };



  // Puedes utilizar los datos filtrados fuera de la función handleSearch
  useEffect(() => {
    sumDataDuration();
    sumSmartcardId()
    sumDataDurationByTimeSlot();
    dictDataDurationByDataName();
    channelsHoursByTimeSlot()
    LeyendaAleatoria()
  }, [filteredData]);


  useEffect(() => {
    // Función para crear o actualizar un gráfico
    const createOrUpdateChart = (canvasId, data) => {
      const existingChart = Chart.getChart(canvasId);

      if (existingChart) {
        existingChart.destroy();
      }

      const ctx = document.getElementById(canvasId);
      new Chart(ctx, data);
    };

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
    // Crear o actualizar el gráfico de Franaja de horas
    if (sumByTimeSlot) {
      const colors = generateRandomColors(Object.values(sumByTimeSlot).length); // Utilizar Object.values para obtener los valores del objeto
      createOrUpdateChart('sumByTimeSlot', {
        type: 'doughnut',
        data: {
          labels: ['Mañana', 'Tarde', 'Noche', 'Madrugada'],
          datasets: [{
            label: 'Suma de horas',
            data: [sumByTimeSlot.Mañana, sumByTimeSlot.Tarde, sumByTimeSlot.Noche, sumByTimeSlot.Madrugada],
            backgroundColor: colors,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }],
        },
      });
    }

    // Crear o actualizar el gráfico de Franaja de horas
    if (dataName ) {
      const colors = generateRandomColors(Object.values(dataName).length); // Utilizar Object.values para obtener los valores del objeto
      if (dataName && Object.keys(dataName).length > 0) {
        const labels = Object.keys(dataName);
        const data = Object.values(dataName);
        createOrUpdateChart('dataName', {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Suma de duración',
                data: data,
                backgroundColor: colors,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }
        });
      }
    }

    if(sumChannelTimeSlot){
      
    }

    },[sumByTimeSlot, dataName])

  return (
    <>
      <div className='containerGlobal'>
        <div className='containerNav'>
          <NavBar />
        </div>
        <div className='containerGeneralInformation'>
          <div className="containerGeneral">
            <div className="containerGeneralForms">
              <form className='containerForm'>
                <h2>Formulario de Filtro por Fechas</h2>
                <div className="containerInput">
                  <label className='date'> Fecha de inicio </label>
                  <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
                </div>
                <div className="containerInput">
                  <label className='date'>  Fecha de fin </label>
                  <input  id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
                </div>
                <button className='button' type="button" onClick={handleSearch}>Buscar</button>
              </form>
            </div>
            {formSubmitted && (
              <div className="containerGeneralTable">
                <div className="containerGeneral Leyendas">
                  <div>
                    <p >{leyendaActual}</p>
                  </div>
                </div>
            
                {/*Franaja horarias*/}
                <div className='containerGeneralTable TableTimeZone'>
                  <div className='containerTableType tableTypeTimeZone'>
                    <table className='containerTable tableTimeZone'>
                      <thead className='containerTableThead TableTheadTimeZone'>
                        <tr className='containerTableTr TableTrTimeZone'>
                          <th className='containerTableTh'>Franja horaria</th>
                          <th className='containerTableTh'>Suma de horas</th>
                        </tr>
                      </thead>
                      <tbody className='containerTableTBody tableTBodyTimeZone'>
                        <tr className='containerTableTr tableTrTimeZone'>
                          <td className='containerTableTh'>Mañana</td>
                          <td className='containerTableTh'>{sumByTimeSlot.Mañana}</td>
                        </tr>
                        <tr className='containerTableTr tableTrTimeZone'>
                          <td className='containerTableTh'>Tarde</td>
                          <td className='containerTableTh'>{sumByTimeSlot.Tarde}</td>
                        </tr>
                        <tr className='containerTableTr tableTrTimeZone'>
                          <td className='containerTableTh'>Noche</td>
                          <td className='containerTableTh'>{sumByTimeSlot.Noche}</td>
                        </tr>
                        <tr className='containerTableTr tableTrTimeZone'>
                          <td className='containerTableTh'>Madrugada</td>
                          <td className='containerTableTh'>{sumByTimeSlot.Madrugada}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>


                {/* Canales por franja horaria */}
                <div className='containerGeneralTable TableTimeZonesOTT'>
                  <div className='TableTimeZoneOTT'>
                    <h2 className='containerTittle'>Tabla de Resultados por Franja Horaria y DataName</h2>
                    <div className='containerTableType TableZoneOTT'>
                      <table className='containerTable'>
                        <thead className='containerTableThead'>
                          <tr className='containerTableTr'>
                            <th className='containerTableTh'>Franja Horaria</th>
                            <th className='containerTableTh'>Nombre de Datos</th>
                            <th className='containerTableTh'>Duración Total</th>
                          </tr>
                        </thead>
                        <tbody className='containerTableTBody'>
                          {Object.entries(sumChannelTimeSlot).map(([timeSlot, dataNames]) => (
                            Object.entries(dataNames).map(([dataName, totalDuration]) => (
                              <tr className='containerTableTr'  key={`${timeSlot}-${dataName}`}>
                                <td className='containerTableTh'>{timeSlot}</td>
                                <td className='containerTableTh'>{dataName}</td>
                                <td className='containerTableTh'>{totalDuration}</td>
                              </tr>
                            ))
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className='containerGraphType'>
                    <canvas id="sumByTimeSlot"></canvas>
                  </div>
                </div>


                {/* Duracion de los OTT*/}
                <div className='containerGeneralTable TableOTT'>
                  <div className='containerTableOTT'>
                    <h2 className='containerTittle'>Tabla de Resultados</h2>
                    <div className='containerTableType TableTypeOTT'>
                      <div className='containerTableType'>
                        <table className='containerTable'>
                          <thead className='containerTableThead'>
                            <tr className='containerTableTr'>
                              <th>Nombre de Canales</th>
                              <th>Duración Total</th>
                            </tr>
                          </thead>
                          <tbody className='containerTableTBody'>
                            {Object.entries(dataName).map(([name, totalDuration]) => (
                              <tr className='containerTableTr TableTrOTT' key={name}>
                                <td className='containerTableTh'>{name}</td>
                                <td className='containerTableTh'>{totalDuration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className='containerGraphType graficaOTT'>
                    <canvas id="dataName"></canvas>
                  </div>
                </div>
                          
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashOTT;
