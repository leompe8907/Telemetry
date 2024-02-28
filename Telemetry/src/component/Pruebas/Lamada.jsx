import React, { useEffect } from 'react';
import axios from 'axios';

function Lamada() {
  useEffect(() => {
    // Realizar la conexión con la API
    const response = axios.post(`http://localhost:8000/telemetria/merged/`);

    console.log(response)

  }, []);

  return (
    <div>Llamada</div>
  );
}

export default Lamada;
