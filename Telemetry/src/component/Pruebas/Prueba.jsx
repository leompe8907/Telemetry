import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Prueba = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [resultData, setResultData] = useState(null);
  const [filteredData, setFilteredData] = useState([]); // Nuevo estado para almacenar datos filtrados
  const [error, setError] = useState(null);

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
    if (filteredData.length === 0) {
      return 0; // Retorna 0 si no hay datos filtrados
    }

    // Sumar dataDuration de todos los objetos filtrados
    const totalDataDuration = filteredData.reduce((accumulator, result) => {
      return accumulator + (result.dataDuration || 0);
    }, 0);

    return totalDataDuration;
  };

   // Función para sumar el dataDuration según la franja horaria
   const sumDataDurationByTimeSlot = (timeSlot) => {
    if (filteredData.length === 0) {
      return 0; // Retorna 0 si no hay datos filtrados
    }
    // Filtrar los datos según la franja horaria
    const dataByTimeSlot = filteredData.filter((result) => {
      const hour = parseInt(result.timeDate.split(':')[0], 10);
      
      if (timeSlot === 'mañana') {
        return hour >= 5 && hour < 12;
      } else if (timeSlot === 'tarde') {
        return hour >= 12 && hour < 18;
      } else if (timeSlot === 'noche') {
        return (hour >= 18 && hour <= 23) || (hour >= 0 && hour < 5);
      }

      return false;
    });

    // Sumar dataDuration de los resultados filtrados por franja horaria
    const totalDataDuration = dataByTimeSlot.reduce((accumulator, result) => {
      return accumulator + (result.dataDuration || 0);
    }, 0);

    return totalDataDuration;
  };

// Función para crear un diccionario de dataName con la suma de dataDuration
const dictDataDurationByDataName = () => {
  if (filteredData.length === 0) {
    return {}; // Retorna un objeto vacío si no hay datos filtrados
  }

  // Crear el diccionario de dataName con la suma de dataDuration
  const dataDict = filteredData.reduce((accumulator, result) => {
    const dataName = result.dataName;

    // Sumar dataDuration al valor existente o comenzar desde 0 si es la primera vez
    accumulator[dataName] = (accumulator[dataName] || 0) + (result.dataDuration || 0);

    return accumulator;
  }, {});

  return dataDict;
};


  // Puedes utilizar los datos filtrados fuera de la función handleSearch
  useEffect(() => {
    // Ejemplo: Imprimir los datos filtrados en la consola cuando cambien
    console.log("Datos filtrados actualizados:", filteredData);

    // Ejemplo: Imprimir la suma de dataDuration según la franja horaria
    console.log("Suma de dataDuration en la mañana:", sumDataDurationByTimeSlot('mañana'));
    console.log("Suma de dataDuration en la tarde:", sumDataDurationByTimeSlot('tarde'));
    console.log("Suma de dataDuration en la noche:", sumDataDurationByTimeSlot('noche'));

    // Ejemplo: Imprimir la suma de dataDuration
    console.log("Suma de dataDuration:", sumDataDuration());

 // Ejemplo: Obtener el diccionario de dataName con la suma de dataDuration
 const dataDict = dictDataDurationByDataName();
 console.log("Diccionario de dataName con suma de dataDuration:", dataDict);
  }, [filteredData]);
  return (
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
  );
};

export default Prueba;
