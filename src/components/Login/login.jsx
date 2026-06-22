import React, { useState } from 'react';
import { IconPill } from '../Icons/icons';
import './login.css';

const API_URL = 'https://hygea-backend-production.up.railway.app/api';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Guardamos la sesión en localStorage para que sobreviva recargas de página
        localStorage.setItem('user_session', JSON.stringify(data.usuario));
        onLoginSuccess(data.usuario);
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch {
      setError('No se pudo conectar con el servidor. Verificá tu conexión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="login-header">
          <span className="login-logo"><IconPill size={28} /></span>
          <h1 className="login-titulo">Hygeia Nexus</h1>
          <p className="login-subtitulo">Sistema de Gestión de Farmacia</p>
        </div>

        <form onSubmit={manejarEnvio} className="login-form">

          <label className="login-field">
            Usuario
            <input
              type="text"
              placeholder="Ingresá tu usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className="login-field">
            Contraseña
            <input
              type="password"
              placeholder="Ingresá tu contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <button type="submit" className="login-btn" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>

        </form>

        <div className="login-footer">
          <span className="login-status-dot"></span>
          Servidores operando de forma reglamentaria
        </div>

      </div>
    </div>
  );
};

export default Login;
