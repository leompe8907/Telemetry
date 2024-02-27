import React from 'react';
import NavBar from '../../component/Navbar/Navbar'
import Texto from '../../component/Text/Texto';
import "./Home.scss"

function Home() {
  return (
    <>
        <div className='Home'>
            <NavBar/>
            <Texto/>
        </div>
    </>
  )
}

export default Home