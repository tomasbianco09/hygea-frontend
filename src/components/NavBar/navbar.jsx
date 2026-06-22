import React from 'react';
import { IconPill } from '../Icons/icons';
import './navbar.css';

const NavBar = ({ usuario, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="navbar-icon"><IconPill size={20} /></span>
        <span className="navbar-title">Sistema de Gestión de Farmacia</span>
      </div>
      <div className="navbar-right">
        <span className="navbar-sucursal">COFAM &middot; Mendoza</span>
        {usuario && (
          <>
            <span className="navbar-usuario">{usuario.nombre}</span>
            <button className="navbar-logout" onClick={onLogout}>Cerrar sesión</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
