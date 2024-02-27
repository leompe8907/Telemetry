// Importa las dependencias necesarias
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.scss'

// Define el componente NavBar
const NavBar = () => {
  return (
    <nav className='navbar'>
      <ul className='navbar-list'>
        <li className='navbar-item'>
          <Link to="/dashott" className='navbar-link'>OTT</Link>
        </li>
        <li className='navbar-item'>
          <Link to="/cast" className='navbar-link'>DVB / MultiCast</Link>
        </li>
        <li className='navbar-item'>
          <Link to="/vod" className='navbar-link'>VOD</Link>
        </li>
        <li className='navbar-item'>
          <Link to="/catchup" className='navbar-link'>Catchup</Link>
        </li>
      </ul>
    </nav>
  );
};

// Exporta el componente para que pueda ser utilizado en otros archivos
export default NavBar;