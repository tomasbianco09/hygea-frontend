import React, { useState, useEffect } from 'react';
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
      .catch(err => alert(`⚠️ Error al archivar: ${err.message}`));
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
        <button className="btn-nueva-receta" onClick={() => setShowNuevaModal(true)}>+ Nueva Receta</button>
      </div>

      <div className="recetas-info">
        Validación de vigencia legal y auditoría de matrículas activas en la sucursal.
      </div>

      {error && (
        <div style={{ backgroundColor: '#fde8e8', color: '#e74c3c', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="recetas-filtros">
        <input
          className="recetas-buscar"
          type="text"
          placeholder="🔍 Buscar recetas por paciente o médico..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select className="recetas-select" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todas">Todas las recetas</option>
          <option value="psicotropico">Controlados / Psicotrópicos</option>
          <option value="normal">Sin restricción</option>
        </select>
      </div>

      {cargando ? (
        <h3 style={{ color: '#34495e', padding: '20px' }}>🔄 Leyendo libros de recetas virtuales...</h3>
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
                <p className="receta-fecha" style={{ fontSize: '13px', color: '#2980b9' }}><strong>Cobertura:</strong> {r.obra_social}</p>
                
                {r.psicotropico && <span className="badge-psico" style={{ display: 'inline-block', marginTop: '10px', backgroundColor: '#e67e22', color: 'white', padding: '3px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' }}>REQUERIMIENTO ARCHIVADO</span>}
              </div>
              <div className="receta-card-footer">
                <button className="btn-ver" onClick={() => abrirVisualizador(r)} style={{ width: '100%' }}>👁️ Ver Orden Médica</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL: CARGAR NUEVA RECETA ================= */}
      {showNuevaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', marginBottom: '20px' }}>📋 Registrar Receta Médica</h3>
            <form onSubmit={manejarGuardarReceta} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>
                Número de Receta (ID Único):
                <input type="number" required placeholder="Ej: 311" value={nuevaRecetaId} onChange={e => setNuevaRecetaId(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>
                Matrícula del Profesional:
                <input type="text" required placeholder="Ej: M-5521" value={matriculaMedico} onChange={e => setMatriculaMedico(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>
                Válida hasta (Fecha de caducidad):
                <input type="date" required value={fechaValidez} onChange={e => setFechaValidez(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>
                Seleccionar Paciente Emisor:
                <select required value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                  <option value="">-- Seleccione el paciente --</option>
                  {clientes.map(c => (
                    <option key={c.cliente_id} value={c.cliente_id}>{c.nombre} (Cobertura: {c.obra_social})</option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowNuevaModal(false)} style={{ padding: '8px 15px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 15px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Archivar Receta</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VISUALIZADOR RECTÁNGULO DE ORDEN MÉDICA ================= */}
      {showVerModal && recetaActiva && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', width: '450px', borderRadius: '6px', border: '2px solid #2c3e50', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', fontFamily: 'Courier New, monospace' }}>
            
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #2c3e50', paddingBottom: '15px' }}>
              <h2 style={{ margin: 0, color: '#2c3e50', letterSpacing: '1px' }}>ORDEN MÉDICA DIGITAL</h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>DOCUMENTO DE AUDITORÍA INTERNA</p>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
              <p style={{ margin: 0 }}><strong>RECETA REGISTRO:</strong> #{recetaActiva.id}</p>
              <p style={{ margin: 0 }}><strong>PROFESIONAL:</strong> {recetaActiva.medico} ({recetaActiva.especialidad})</p>
              <p style={{ margin: 0 }}><strong>MATRÍCULA:</strong> {recetaActiva.matricula}</p>
              <p style={{ margin: 0 }}><strong>PACIENTE:</strong> {recetaActiva.paciente}</p>
              <p style={{ margin: 0 }}><strong>COBERTURA:</strong> {recetaActiva.obra_social}</p>
              <p style={{ margin: 0 }}><strong>VALIDEZ LÍMITE:</strong> {recetaActiva.fecha}</p>
              
              <div style={{ borderTop: '1px solid #ccc', marginTop: '10px', paddingTop: '10px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#c0392b' }}>RP. / TRATAMIENTO DISPENSADO:</p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {recetaActiva.medicamentos.map((m, i) => (
                    <li key={i} style={{ margin: '4px 0', fontWeight: 'bold' }}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', borderTop: '2px dashed #2c3e50', paddingTop: '15px' }}>
              <button onClick={() => setShowVerModal(false)} style={{ padding: '8px 25px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
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