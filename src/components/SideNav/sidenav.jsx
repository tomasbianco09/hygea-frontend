import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconHome, IconBox, IconFactory, IconReceipt, IconClipboard, IconChart } from '../Icons/icons';
import './sidenav.css';

const enlaces = [
  { to: '/', label: 'Inicio', icon: IconHome, end: true },
  { to: '/inventario', label: 'Inventario', icon: IconBox },
  { to: '/proveedores', label: 'Proveedores', icon: IconFactory },
  { to: '/ventas-facturacion', label: 'Ventas y Facturación', icon: IconReceipt },
  { to: '/recetas', label: 'Recetas', icon: IconClipboard },
  { to: '/reportes', label: 'Reportes', icon: IconChart },
];

const SideNav = () => {
  return (
    <aside className="sidenav">
      <ul className="sidenav-menu">
        {enlaces.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => isActive ? 'sidenav-link active' : 'sidenav-link'}
            >
              <Icon size={17} className="sidenav-icon" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SideNav;
