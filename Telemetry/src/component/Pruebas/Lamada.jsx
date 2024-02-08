import React, { useEffect } from 'react';
import setMergedData  from "./Prueba";

function Lamada() {
  useEffect(() => {
    // Llama a la función setMergedData
    setMergedData(/* pasas los argumentos si es necesario */);

    // Si setMergedData actualiza un estado en Prueba.js, podrías imprimir el estado actualizado
    // Puedes modificar el siguiente código según la estructura de tu estado y la información que desees imprimir
    console.log('Estado actualizado desde setMergedData:', setMergedData());
  }, []);

  return (
    <div>Llamada</div>
  );
}

export default Lamada;
