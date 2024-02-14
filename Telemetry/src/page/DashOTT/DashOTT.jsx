import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashOTT.scss';

const url = `http://localhost:8000/telemetria/merged/`;

function DashOTT() {
  const [data, setData] = useState(null);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filteredData, setFilteredData] = useState([]);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const filterData = (startDate, endDate, data) => {
    try {
      const filteredData = data.filter((item) => {
        const itemDate = new Date(item.dataDate); // Asumiendo que dataDate es una cadena
        return itemDate >= startDate && itemDate <= endDate;
      });
      return filteredData;
    } catch (error) {
      // Manejar errores aquí, p.ej., mostrar un mensaje de error
      console.error("Error al filtrar la data:", error);
      return []; // Retornar una data vacía en caso de error
    }
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:8000/telemetria/merged/');
          setData(response);
          console.log(data)
        } catch (error) {
          setError(error);
        }
      };
    
      fetchData();
  }, []);

  const handleSubmit = () => {
    const filteredData = filterData(startDate, endDate, data);
    setFilteredData(filteredData);
  };

  if (isLoading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className='containerGeneralForms'>
      <form className='containerForm'>
        <div className='containerInput'>
          <label className='date' htmlFor="startDate">Fecha de inicio:</label>
          <input type="date" id="startDate" name="startDate" value={startDate} onChange={handleStartDateChange} />
        </div>
        <div className='containerInput'>
          <label className='date' htmlFor="endDate">Fecha de fin:</label>
          <input type="date" id="endDate" name="endDate" value={endDate} onChange={handleEndDateChange} />
        </div>
        <button className='button' type="button" onClick={handleSubmit}>Buscar</button>
      </form>
      {filteredData.map((item) => (
        <div key={item.id}>
          <h2>{item.dataName}</h2>
          <p>{item.dataId}</p>
        </div>
      ))}
    </div>
  );
};

export default DashOTT;
