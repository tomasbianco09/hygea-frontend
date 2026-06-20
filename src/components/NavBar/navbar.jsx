import React from 'react';
import { NavLink } from 'react-router-dom';
import './navbar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="navbar-icon">💊</span>
        <span className="navbar-title">Sistema de Gestión de Farmacia</span>
      </div>
      <div className="navbar-right">
        <span className="navbar-sucursal">COFAM - Mendoza</span>
        <span className="navbar-bell">🔔</span>
      </div>
    </nav>
  );
};

export default NavBar;