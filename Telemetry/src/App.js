import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Telemetria from './component/Telemetria/Telemetria';
import Login from './page/Login/Login';
import DashOTT from './page/DashOTT/DashOTT';
import Prueba from './component/Pruebas/Prueba';
import Lamada from './component/Pruebas/Lamada';
import NavBar from './component/Navbar/Navbar';
import Home from './page/Home/Home';


function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/telemetria' element={<Telemetria/>}/>
          <Route path='/home' element={<Home/>}/>
          <Route path='/DashOTT' element={<DashOTT/>}/>
          <Route path='/prueba' element={<Prueba/>}/>
          <Route path='/llamada' element={<Lamada/>}/>
          <Route path='/navbar' element={<NavBar/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
