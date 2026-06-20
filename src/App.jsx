import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SideNav from "./components/sidenav/sidenav";
import NavBar from "./components/navbar/navbar"; // <--- 1. Importado arriba
import Home from "./components/Home/home";
import Inventario from "./components/Inventario/inventario";
import Proveedores from "./components/Proveedores/proveedores";
import Ventas_facturacion from "./components/Ventas-facturacion/ventas-fact";
import Recetas from "./components/Recetas/recetas";
import Reportes from "./components/Reportes/reportes";
import Footer from "./components/Footer/footer";

import "./App.css"; 

function App() {
  return (
    <Router>
      {/* Contenedor general vertical */}
      <div className="app-global-container">
        
        {/* 2. El NavBar queda arriba de todo, cruzando de punta a punta */}
        <NavBar />

        {/* Contenedor de abajo (Horizontal: Menú + Contenido) */}
        <div className="app-layout">
          {/* El menú lateral ahora arranca abajo del NavBar */}
          <SideNav />

          {/* El espacio del contenido y el footer */}
          <div className="main-viewport">
            <main className="content-container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/ventas-facturacion" element={<Ventas_facturacion/>}/>
                <Route path="/recetas" element={<Recetas />} />
                <Route path="/reportes" element={<Reportes />} />
              </Routes>
            </main>

            {/* El footer al final de la visualización */}
            <Footer />
          </div>
        </div>

      </div>
    </Router>
  );
}

export default App;