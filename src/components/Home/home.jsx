import React from 'react';
import { IconBox, IconReceipt, IconClipboard, IconChart } from '../Icons/icons';
import './home.css';

const Home = () => {
  // Obtenemos la fecha actual para darle un toque dinámico al mostrador
  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="home-container">
      {/* Cabecera Principal */}
      <header className="home-header">
        <div className="header-meta">Sucursal Centro Activa &middot; {fechaHoy}</div>
        <h1>Hygeia Nexus</h1>
        <p className="subtitle">Ecosistema Integrado de Control Farmacéutico y Auditoría Médica</p>
      </header>

      {/* Sección Hero Informativa */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Operaciones en Tiempo Real (Nube Activa)</h2>
          <p>
            Bienvenido al panel central de administración. La terminal se encuentra conectada de forma directa
            al servidor MySQL. Monitoree las existencias críticas de medicamentos, valide recetas y gestione
            transacciones de obras sociales de manera segura.
          </p>
        </div>
      </section>

      {/* Grilla de Accesos Rápidos Reales */}
      <section className="features-section">
        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon tono-petroleo"><IconBox size={22} /></div>
            <h3>Control de Stock</h3>
            <p>Monitoree las existencias del catálogo oficial y registre ingresos de lotes críticos antes de su vencimiento.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon tono-bronce"><IconReceipt size={22} /></div>
            <h3>Facturación / Ventas</h3>
            <p>Abra el mostrador digital para emitir comprobantes, armar carritos y aplicar coberturas de mutuales en vivo.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon tono-vino"><IconClipboard size={22} /></div>
            <h3>Archivo de Recetas</h3>
            <p>Audite las órdenes médicas y valide matrículas profesionales para la dispensa regulada de psicotrópicos.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon tono-pizarra"><IconChart size={22} /></div>
            <h3>Estadísticas y Rotación</h3>
            <p>Acceda a las métricas del negocio con balances de ingresos brutos y rankings de categorías más vendidas.</p>
          </div>

        </div>
      </section>

      {/* Estado del Sistema — verificador de servidor en la nube */}
      <footer className="home-status">
        <span className="status-indicator"></span> Servidores en la nube operando de forma reglamentaria
      </footer>
    </div>
  );
};

export default Home;
