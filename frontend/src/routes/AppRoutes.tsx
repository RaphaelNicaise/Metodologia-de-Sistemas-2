import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from '../pages/Home'
import Login from '../pages/Login';
import Products from '../pages/Products';
import '../App.css'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/iniciar-sesion' element={<Login/>}/>
        <Route path='/productos' element={<Products/>}/>  
      </Routes>
    </BrowserRouter>
  )
}

