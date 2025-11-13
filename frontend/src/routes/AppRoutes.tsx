import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from '../pages/Home'
import Login from '../pages/Login';
import Products from '../pages/Products/Products';
import Dashboard from '../pages/Dashboard';
import CierreCaja from '../pages/CierreCaja/CierreCaja';
import Gastos from '../pages/Gastos/Gastos';
import '../App.css'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/iniciar-sesion' element={<Login/>}/>
        <Route path='/productos' element={<Products/>}/>  
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/cierre-caja' element={<CierreCaja/>}/>
        <Route path='/gastos' element={<Gastos/>}/>
      </Routes>
    </BrowserRouter>
  )
}

