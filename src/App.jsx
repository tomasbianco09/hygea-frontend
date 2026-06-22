import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SideNav from "./components/SideNav/sidenav";
import NavBar from "./components/NavBar/navbar";
import Home from "./components/Home/home";
import Inventario from "./components/Inventario/inventario";
import Proveedores from "./components/Proveedores/proveedores";
import Ventas_facturacion from "./components/Ventas-facturacion/ventas-fact";
import Recetas from "./components/Recetas/recetas";
import Reportes from "./components/Reportes/reportes";
import Footer from "./components/Footer/footer";
import Login from "./components/Login/login";

import "./App.css";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem("user_session");
    if (sesionGuardada) {
      setUsuario(JSON.parse(sesionGuardada));
    }
    setVerificandoSesion(false);
  }, []);

  const manejarLoginExitoso = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const manejarCerrarSesion = () => {
    localStorage.removeItem("user_session");
    setUsuario(null);
  };

  if (verificandoSesion) {
    return <div className="loading-text">Cargando Hygeia Nexus...</div>;
  }

  if (!usuario) {
    return <Login onLoginSuccess={manejarLoginExitoso} />;
  }

  return (
    <Router>
      <div className="app-global-container">
        <NavBar usuario={usuario} onLogout={manejarCerrarSesion} />
        <div className="app-layout">
          <SideNav />
          <div className="main-viewport">
            <main className="content-container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/ventas-facturacion" element={<Ventas_facturacion />} />
                <Route path="/recetas" element={<Recetas />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
