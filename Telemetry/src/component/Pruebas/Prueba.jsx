import { useEffect, useState } from 'react';
import axios from 'axios';

const Prueba = () => {
  const [actionId7Data, setActionId7Data] = useState([]);
  const [actionId8Data, setActionId8Data] = useState([]);
  const [mergedData, setMergedData] = useState([]);

  useEffect(() => {
    // Función para obtener datos de una API dada un actionId
    const fetchDataByActionId = async () => {
      try {
        const response = await axios.get('http://localhost:8000/telemetria/telemetria/merged/');
        console.log(response)


      } catch (error) {
        console.error('Error fetching telemetria data for actionId');
      }
    };

    // Llamar a la función para obtener datos de actionId 7
    fetchDataByActionId();

  }, []);

};

export default Prueba;