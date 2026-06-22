import React, { useState, useEffect } from 'react';
import { IconAlertTriangle, IconSearch, IconRefresh, IconEye, IconClipboard } from '../Icons/icons';
import './recetas.css';

const Recetas = () => {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [recetas, setRecetas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // --- ESTADOS PARA NUEVA RECETA ---
  const [showNuevaModal, setShowNuevaModal] = useState(false);
  const [nuevaRecetaId, setNuevaRecetaId] = useState('');
  const [matriculaMedico, setMatriculaMedico] = useState('');
  const [fechaValidez, setFechaValidez] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');

  // --- ESTADOS PARA VER RECETA ---
  const [showVerModal, setShowVerModal] = useState(false);
  const [recetaActiva, setRecetaActiva] = useState(null);

  // --- CONFIGURACIÓN DE CONEXIÓN MIGRADA A PRODUCTION ---
  const cargarDatosRecetas = () => {
    Promise.all([
      fetch('https://hygea-backend-production.up.railway.app/api/recetas').then(res => res.json()),
      fetch('https://hygea-backend-production.up.railway.app/api/clientes').then(res => res.json())
    ])
      .then(([dataRecetas, dataClientes]) => {
        setRecetas(dataRecetas);
        setClientes(dataClientes);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo sincronizar el archivo digital de recetas desde la nube');
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarDatosRecetas();
  }, []);

  // --- ACCIÓN: ENVIAR NUEVA RECETA A PYTHON (MIGRADO) ---
  const manejarGuardarReceta = (e) => {
    e.preventDefault();
    if (!clienteSeleccionado) return;

    const pacienteObj = clientes.find(c => c.cliente_id === parseInt(clienteSeleccionado));

    const payload = {
      receta_id: parseInt(nuevaRecetaId),
      medico_matricula: matriculaMedico,
      validez_hasta: fechaValidez,
      cliente_id: pacienteObj.cliente_id,
      obra_social_id: pacienteObj.obra_social_id // Hereda automáticamente la OS del cliente
    };

    fetch('https://hygea-backend-production.up.railway.app/api/recetas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.error) });
        return res.json();
      })
      .then(() => {
        cargarDatosRecetas(); // Recarga la grilla en tiempo real
        setShowNuevaModal(false);
        setNuevaRecetaId('');
        setMatriculaMedico('');
        setFechaValidez('');
        setClienteSeleccionado('');
      })
      .catch(err => alert(`Error al archivar: ${err.message}`));
  };

  // --- ACCIÓN: LEER/VER RECETA EN PANTALLA ---
  const abrirVisualizador = (receta) => {
    setRecetaActiva(receta);
    setShowVerModal(true);
  };

  const filtradas = recetas.filter(r => {
    const coincideBusqueda =
      r.paciente.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.medico.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro =
      filtro === 'todas' ||
      (filtro === 'psicotropico' && r.psicotropico) ||
      (filtro === 'normal' && !r.psicotropico);
    return coincideBusqueda && coincideFiltro;
  });

  return (
    <div className="recetas-wrapper">
      <div className="recetas-header">
        <h2 className="recetas-titulo">Gestión de Recetas (Archivo Digital)</h2>
        <button className="btn btn-primary" onClick={() => setShowNuevaModal(true)}>+ Nueva Receta</button>
      </div>

      <div className="info-banner">
        Validación de vigencia legal y auditoría de matrículas activas en la sucursal.
      </div>

      {error && (
        <div className="alert-banner">
          <IconAlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="recetas-filtros">
        <div className="search-field" style={{ marginBottom: 0, flex: 1 }}>
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Buscar recetas por paciente o médico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select className="recetas-select" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todas">Todas las recetas</option>
          <option value="psicotropico">Controlados / Psicotrópicos</option>
          <option value="normal">Sin restricción</option>
        </select>
      </div>

      {cargando ? (
        <div className="loading-text"><IconRefresh size={16} className="spin" /> Leyendo libros de recetas virtuales...</div>
      ) : (
        <div className="recetas-grid">
          {filtradas.map((r) => (
            <div key={r.id} className="receta-card">
              <div className="receta-card-header">
                <span className="receta-id">Receta #{r.id}</span>
                <span className="receta-medico">{r.medico}</span>
              </div>
              <div className="receta-card-body">
                <p className="receta-paciente"><strong>Paciente:</strong> {r.paciente}</p>
                <p className="receta-fecha"><strong>Vence:</strong> {r.fecha}</p>
                <p className="receta-cobertura"><strong>Cobertura:</strong> {r.obra_social}</p>

                {r.psicotropico && <span className="badge-controlado">REQUERIMIENTO ARCHIVADO</span>}
              </div>
              <div className="receta-card-footer">
                <button className="btn-ver" onClick={() => abrirVisualizador(r)}>
                  <IconEye size={15} /> Ver Orden Médica
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL: CARGAR NUEVA RECETA ================= */}
      {showNuevaModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title"><IconClipboard size={18} /> Registrar Receta Médica</h3>
            <form onSubmit={manejarGuardarReceta} className="modal-form">

              <label className="form-field">
                Número de Receta (ID Único):
                <input type="number" required placeholder="Ej: 311" value={nuevaRecetaId} onChange={e => setNuevaRecetaId(e.target.value)} />
              </label>

              <label className="form-field">
                Matrícula del Profesional:
                <input type="text" required placeholder="Ej: M-5521" value={matriculaMedico} onChange={e => setMatriculaMedico(e.target.value)} />
              </label>

              <label className="form-field">
                Válida hasta (Fecha de caducidad):
                <input type="date" required value={fechaValidez} onChange={e => setFechaValidez(e.target.value)} />
              </label>

              <label className="form-field">
                Seleccionar Paciente Emisor:
                <select required value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)}>
                  <option value="">-- Seleccione el paciente --</option>
                  {clientes.map(c => (
                    <option key={c.cliente_id} value={c.cliente_id}>{c.nombre} (Cobertura: {c.obra_social})</option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNuevaModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Archivar Receta</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VISUALIZADOR DE ORDEN MÉDICA ================= */}
      {showVerModal && recetaActiva && (
        <div className="modal-overlay">
          <div className="receta-visor">

            <div className="visor-encabezado">
              <h2>ORDEN MÉDICA DIGITAL</h2>
              <p>DOCUMENTO DE AUDITORÍA INTERNA</p>
            </div>

            <div className="visor-cuerpo">
              <p><strong>RECETA REGISTRO:</strong> #{recetaActiva.id}</p>
              <p><strong>PROFESIONAL:</strong> {recetaActiva.medico} ({recetaActiva.especialidad})</p>
              <p><strong>MATRÍCULA:</strong> {recetaActiva.matricula}</p>
              <p><strong>PACIENTE:</strong> {recetaActiva.paciente}</p>
              <p><strong>COBERTURA:</strong> {recetaActiva.obra_social}</p>
              <p><strong>VALIDEZ LÍMITE:</strong> {recetaActiva.fecha}</p>

              <div className="visor-tratamiento">
                <p className="visor-rp">RP. / TRATAMIENTO DISPENSADO:</p>
                <ul>
                  {recetaActiva.medicamentos.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="visor-pie">
              <button className="btn btn-primary" onClick={() => setShowVerModal(false)}>
                Cerrar Visor
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Recetas;
