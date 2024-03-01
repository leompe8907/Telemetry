import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Telemetria from './component/Telemetria/Telemetria';
import Login from './page/Login/Login';
import DashOTT from './page/DashOTT/DashOTT';
import Prueba from './component/Pruebas/Prueba';
import Lamada from './component/Pruebas/Lamada';
import Home from './page/Home/Home';
import DashDVB from './page/DashDVB/DashDVB';


function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/telemetria' element={<Telemetria/>}/>
          <Route path='/DashOTT' element={<DashOTT/>}/>
          <Route path='/DashDVB' element={<DashDVB/>}/>
          <Route path='/prueba' element={<Prueba/>}/>
          <Route path='/llamada' element={<Lamada/>}/>
          <Route path='/Login' element={<Login/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
