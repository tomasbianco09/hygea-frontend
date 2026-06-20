import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import SideNav from './components/SideNav/SideNav';
import Home from './components/Home/home';
import Inventario from './components/Inventario/inventario';
import Proveedores from './components/Proveedores/proveedores';
import Recetas from './components/Recetas/recetas';
import Reportes from './components/Reportes/reportes';
import Ventas_facturacion from './components/Ventas-facturacion/ventas-fact';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <NavBar/>
      <div className="layout">
        <SideNav/>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/inventario" element={<Inventario/>}/>
            <Route path="/proveedores" element={<Proveedores/>}/>
            <Route path="/recetas" element={<Recetas/>}/>
            <Route path="/reportes" element={<Reportes/>}/>
            <Route path="/ventas-facturacion" element={<Ventas_facturacion/>}/>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;