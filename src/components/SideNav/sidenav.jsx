import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidenav.css';

const SideNav = () => {
  return (
    <aside className="sidenav">
      <ul className="sidenav-menu">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'sidenav-link active' : 'sidenav-link'}>
            📦 Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/inventario" className={({ isActive }) => isActive ? 'sidenav-link active' : 'sidenav-link'}>
            📦 Inventario
          </NavLink>
        </li>
        <li>
          <NavLink to="/proveedores" className={({ isActive }) => isActive ? 'sidenav-link active' : 'sidenav-link'}>
            🏭 Proveedores
          </NavLink>
        </li>
        <li>
          <NavLink to="/ventas-facturacion" className={({ isActive }) => isActive ? 'sidenav-link active' : 'sidenav-link'}>
            🧾 Ventas y Facturación
          </NavLink>
        </li>
        <li>
          <NavLink to="/recetas" className={({ isActive }) => isActive ? 'sidenav-link active' : 'sidenav-link'}>
            📋 Recetas
          </NavLink>
        </li>
        <li>
          <NavLink to="/reportes" className={({ isActive }) => isActive ? 'sidenav-link active' : 'sidenav-link'}>
            📊 Reportes
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default SideNav;