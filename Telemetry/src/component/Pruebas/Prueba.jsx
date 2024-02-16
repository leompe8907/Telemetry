import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Prueba = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [resultData, setResultData] = useState(null);
  const [filteredData, setFilteredData] = useState([]); // Nuevo estado para almacenar datos filtrados
  const [error, setError] = useState(null);

  // suma total de segundos de los objetos filtrados
  const [generalDuration, setGeneralDuration] = useState(null)
  // suma total de segundos de los objtos filtrados por franja horaria
  const [sumByTimeSlot, setSumByTimeSlot] = useState({Manaña: 0,Tarde: 0,Noche: 0,Madrugada: 0});
  // estado de los canales y su suma por horas
  const [dataName, setDataName] = useState({})

  const handleSearch = async () => {
    try {
      // Verificar que se hayan seleccionado fechas
      if (!startDate || !endDate) {
        setError(new Error('Por favor, selecciona fechas de inicio y fin.'));
        return;
      }

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

      // Mostrar los datos filtrados por consola
      console.log("Datos filtrados:", filteredData);

      // Actualizar el estado con los resultados filtrados
      setResultData(filteredData);
      setError(null);
    } catch (error) {
      // Manejar errores de la API
      setFilteredData([]); // Limpiar el array en caso de error
      setResultData(null);
      setError(error);
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

    setGeneralDuration(totalDataDuration)
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
      Madrugada : 0
    };

    filteredData.forEach(result => {
      const dataDuration = result.dataDuration;
      const times = result.timeDate
      console.log("times: ",times)
      console.log("duration: ",dataDuration)

  
      if (times >= 4 && times < 12) {
        sums.Mañana += dataDuration;
      } else if (times >= 12 && times < 18) {
        sums.Tarde += dataDuration;
      } else if (times >= 18 && times < 23){
        sums.Noche += dataDuration;
      } else {
        sums.Madrugada += dataDuration
      }
    })
    console.log("sums:", sums); 

    // Actualizar el estado con las sumas por franja horaria
    setSumByTimeSlot(sums);
  };

  // Función para filtrar los dataName con la suma de dataDuration
  const dictDataDurationByDataName = () => {
    if (filteredData.length === 0) {
      return {}; // Retorna un objeto vacío si no hay datos filtrados
    }
    const sums = {};

    filteredData.forEach(result => {
      const name = result.dataName;
      const duration = result.dataDuration;
    
      sums[name] = (sums[name] || 0) + duration;
    });
    console.log(sums)
    setDataName(sums)
    console.log("dataname: ",dataName)

  };


  // Puedes utilizar los datos filtrados fuera de la función handleSearch
  useEffect(() => {
    // Ejemplo: Imprimir los datos filtrados en la consola cuando cambien
    console.log("Datos filtrados actualizados:", filteredData);

    console.log(generalDuration)
    sumDataDurationByTimeSlot();

    // Ejemplo: Imprimir la suma de dataDuration
    console.log("Suma de dataDuration:", sumDataDuration());

 // Ejemplo: Obtener el diccionario de dataName con la suma de dataDuration
    dictDataDurationByDataName();
//  console.log("Diccionario de dataName con suma de dataDuration:", dataDict);
  }, [filteredData]);
  return (
    <>
    <div>
      <h2>Formulario de Filtro por Fechas</h2>
      <form>
        <label>
          Fecha de inicio:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <br />
        <label>
          Fecha de fin:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <br />
        <button type="button" onClick={handleSearch}>
          Buscar
        </button>
      </form>

      {/* Mostrar los resultados o errores */}
      {resultData && (
        <div>
          <h3>Resultados:</h3>
          <pre>{JSON.stringify(resultData, null, 2)}</pre>
        </div>
      )}
      {error && <p>Error: {error.message}</p>}
    </div>
    <div>
      <p id="result">La suma total de dataDuration es: {generalDuration}</p>
    </div>
    <div>
      <table>
        <thead>
          <tr>
            <th>Franja Horaria</th>
            <th>Suma Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mañana</td>
            <td>{sumByTimeSlot.Mañana}</td>
          </tr>
          <tr>
            <td>Tarde</td>
            <td>{sumByTimeSlot.Tarde}</td>
          </tr>
          <tr>
            <td>Noche</td>
            <td>{sumByTimeSlot.Noche}</td>
          </tr>
          <tr>
            <td>Madrugada</td>
            <td>{sumByTimeSlot.Madrugada}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h2>Tabla de Resultados</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre de Datos</th>
            <th>Duración Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(dataName).map(([name, totalDuration]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{totalDuration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default Prueba;
