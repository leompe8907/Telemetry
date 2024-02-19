import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashOTT.scss';

function DashOTT() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false); 

  // suma total de segundos de los objetos filtrados
  const [generalDuration, setGeneralDuration] = useState(null)
  // suma total de segundos de los objtos filtrados por franja horaria
  const [sumByTimeSlot, setSumByTimeSlot] = useState({Manaña: 0,Tarde: 0,Noche: 0,Madrugada: 0});
  // suma total 
  const [sumChannelTimeSlot, setSumChannelTimeSlot] = useState({Manaña: {},Tarde: {},Noche: {},Madrugada: {}});
  // estado de los canales y su suma por horas
  const [dataName, setDataName] = useState({})

  const handleSearch = async () => {
    try {
      // Realizar la conexión con la API
      const response = await axios.get(`http://localhost:8000/telemetria/merged/`);
      
      // Obtener los datos de la respuesta
      const allData = response.data.all_data;

      // Filtrar los resultados por rango de fechas
      const filteredData = allData.filter((result) => {
        const dataDate = new Date(result.dataDate).getTime();
        return dataDate >= new Date(startDate).getTime() && dataDate <= new Date(endDate).getTime();
      });

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

  //Función para filtrar los dataName con la suma de dataDuration según su franja horaria
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

  // Función para filtrar los dataName con la suma de dataDuration
  const dictDataDurationByDataName = () => {
    // Verificar que haya datos filtrados
    if (filteredData.length === 0) {
      // Si no hay datos, retorna un objeto vacío
      return {};
    }

    // Inicializar un objeto para almacenar las sumas por nombre de datos
    const sums = {};

    // Iterar sobre los datos filtrados
    filteredData.forEach(result => {
      const name = result.dataName;
      const duration = result.dataDuration;

      // Actualizar las sumas por nombre de datos
      sums[name] = (sums[name] || 0) + duration;
    });

    // Actualizar el estado con las sumas por nombre de datos
    setDataName(sums);
  };



  // Puedes utilizar los datos filtrados fuera de la función handleSearch
  useEffect(() => {
    sumDataDuration();
    sumDataDurationByTimeSlot();
    dictDataDurationByDataName();
    channelsHoursByTimeSlot()
  }, [filteredData]);

  return (
    <>
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
            <div className="containerGeneralTables">
              <div className="containerGeneralTablesLeyenda">
                <div>
                  <p id="result">La suma total de dataDuration es: {generalDuration}</p>
                </div>
              </div>

              {/*Franaja horarias*/}
              <div className='containerGeneralTables TableTimeZone'>
                <div className='containerTableType tableTypeTimeZone'>
                  <table className='containerTable tableTimeZone'>
                    <thead className='containerTableThead TableTheadTimezone'>
                      <tr className='containerTableTr TableTrTimezone'>
                        <th className='containerTableTh'>Franja horaria</th>
                        <th className='containerTableTh'>Suma de horas</th>
                      </tr>
                    </thead>
                    <tbody className='containerTableTBody tableTBodyTimezone'>
                      <tr className='containerTableTr tableTrTimezone'>
                        <td className='containerTableTh'>Mañana</td>
                        <td className='containerTableTh'>{sumByTimeSlot.Mañana}</td>
                      </tr>
                      <tr className='containerTableTr tableTrTimezone'>
                        <td className='containerTableTh'>Tarde</td>
                        <td className='containerTableTh'>{sumByTimeSlot.Tarde}</td>
                      </tr>
                      <tr className='containerTableTr tableTrTimezone'>
                        <td className='containerTableTh'>Noche</td>
                        <td className='containerTableTh'>{sumByTimeSlot.Noche}</td>
                      </tr>
                      <tr className='containerTableTr tableTrTimezone'>
                        <td className='containerTableTh'>Madrugada</td>
                        <td className='containerTableTh'>{sumByTimeSlot.Madrugada}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Duracion de los OTT*/}
              <div className='containerGeneralTable TableOTT'>
                <div className='containerTableType tableTypeOTT'>
                  <h2 className='containerTittle'>Tabla de Resultados</h2>
                  <table className='containerTable tableOTT'>
                    <thead className='containerTableThead TableTheadOTT'>
                      <tr className='containerTableTr TableTrOTT'>
                        <th>Nombre de Canales</th>
                        <th>Duración Total</th>
                      </tr>
                    </thead>
                    <tbody className='containerTableTBody TableTBodyOTT'>
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

              {/* Canales por franja horaria */}
              <div className='containerGeneralTable'>
                <div className='containerTableType'>
                  <h2 className='containerTittle'>Tabla de Resultados por Franja Horaria y DataName</h2>
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashOTT;
