import React from 'react';
import './footer.css';

const Footer = () => {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-brand">Hygeia Nexus</span>
          <span className="footer-separator">|</span>
          <p className="footer-copy">&copy; {anioActual} Todos los derechos reservados.</p>
        </div>
        <div className="footer-right">
          <span className="footer-tag">v3.1.0-Prod</span>
          <span className="footer-status-dot"></span>
          <span className="footer-system">Auditoría Conectada</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;