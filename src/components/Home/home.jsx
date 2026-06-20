import React from 'react';
import './home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenido a Hygea Nexus</h1>
        <p>Tu solución integral de salud</p>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h2>Gestiona tu salud de forma inteligente</h2>
          <p>Accede a tus registros médicos, reserva citas y recibe seguimiento personalizado.</p>
          <button className="cta-button">Comenzar Ahora</button>
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Registros Médicos</h3>
            <p>Acceso seguro a todos tus datos de salud en un solo lugar.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Reserva de Citas</h3>
            <p>Agenda tus consultas con médicos especialistas fácilmente.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3>Medicamentos</h3>
            <p>Gestiona tu historial de medicamentos y recibe recordatorios.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Seguimiento</h3>
            <p>Monitorea tu progreso de salud con análisis detallados.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
