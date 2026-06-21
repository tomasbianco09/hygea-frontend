import React from 'react';
import { IconPill } from '../Icons/icons';
import './navbar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="navbar-icon"><IconPill size={20} /></span>
        <span className="navbar-title">Sistema de Gestión de Farmacia</span>
      </div>
      <div className="navbar-right">
        <span className="navbar-sucursal">COFAM &middot; Mendoza</span>
      </div>
    </nav>
  );
};

export default NavBar;
