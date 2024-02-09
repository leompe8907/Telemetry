import React, { useState } from 'react';
import axios from 'axios';

const Prueba = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    try {
      // Construir la URL con las fechas seleccionadas
      const url = `http://localhost:8000/telemetria/telemetria/merged/totalhoras/?start_date=${startDate}&end_date=${endDate}`;

      const response = await axios.get(url);

      console.log(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validación básica de fechas
    if (startDate && endDate) {
      console.log(startDate)
      // Llamar a la función de fetchData con las fechas
      fetchData();
    } else {
      console.error('Por favor, seleccione ambas fechas.');
    }
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
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
        <button type="submit">Consultar Datos</button>
      </form>
    </div>
  );
};

export default Prueba;
