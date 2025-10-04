import { BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login';
import Products from './pages/Products';

function App() {
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

export default App