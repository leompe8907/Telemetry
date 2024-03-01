import React, { useEffect } from 'react';
import axios from 'axios';

function Lamada() {
  useEffect(() => {
    // Realizar la conexión con la API
    const OTT = axios.post(`http://localhost:8000/telemetria/mergeddataOTT/`);
    console.log(OTT)

    const DVB = axios.post(`http://localhost:8000/telemetria/mergeddataDVB/`);
    console.log(DVB)


  }, []);

  return (
    <div>Llamada</div>
  );
}

export default Lamada;
