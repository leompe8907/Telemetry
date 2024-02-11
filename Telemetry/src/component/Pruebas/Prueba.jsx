import React, { useState } from 'react';
import axios from 'axios';

const Prueba = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const url = `http://localhost:8000/telemetria/merged/copia/${startDate}/${endDate}/`;
      const url1 = `http://localhost:8000/telemetria/telemetria/merged/`;

      const response = await axios.get(url);
      const response1 = await axios.get(url1);

      console.log(response.data);
      console.log(response1.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al recuperar datos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (startDate && endDate) {
      fetchData();
    } else {
      setError('Por favor, seleccione ambas fechas.');
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
        <button type="submit" disabled={loading}>
          Consultar Datos
        </button>
      </form>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Prueba;
