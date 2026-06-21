import React, { useState, useEffect } from 'react';
import { IconAlertTriangle, IconSearch, IconRefresh, IconBox } from '../Icons/icons';
import './inventario.css';

const estadoClase = (estado) => {
  if (estado === 'OK') return 'estado ok';
  if (estado === 'REPONER') return 'estado reponer';
  return 'estado';
};

const Inventario = () => {
  const [busqueda, setBusqueda] = useState('');
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // --- ESTADOS PARA CONTROLAR EL MODAL DE NUEVO LOTE ---
  const [showModal, setShowModal] = useState(false);
  const [codigoLote, setCodigoLote] = useState('');
  const [medSeleccionado, setMedSeleccionado] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [cantidadStock, setCantidadStock] = useState('');

  const cargarInventario = () => {
    fetch('https://hygea-backend-production.up.railway.app/api/medicamentos')
      .then((response) => {
        if (!response.ok) throw new Error('Error al solicitar los datos');
        return response.json();
      })
      .then((data) => {
        setMedicamentos(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo conectar con el servidor de Hygeia Nexus');
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  // --- FUNCIÓN PARA ENVIAR EL LOTE BLINDADO A PYTHON ---
  const manejarGuardarLote = (e) => {
    e.preventDefault();

    const loteData = {
      codigo_lote: codigoLote,
      medicamento_id: parseInt(medSeleccionado), // ID limpio directo del <select>
      fecha_vencimiento: fechaVencimiento,
      cantidad_stock: parseInt(cantidadStock)
    };

    fetch('https://hygea-backend-production.up.railway.app/api/lotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loteData)
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.error) });
        return res.json();
      })
      .then(() => {
        // Si sale bien: refrescamos stock en vivo, cerramos modal y limpiamos campos
        cargarInventario();
        setShowModal(false);
        setCodigoLote('');
        setMedSeleccionado('');
        setFechaVencimiento('');
        setCantidadStock('');
      })
      .catch(err => alert(`Error de validación: ${err.message}`));
  };

  const filtrados = medicamentos.filter((m) =>
    m.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.medicamento_id.toString().includes(busqueda)
  );

  return (
    <div className="page-card">
      <div className="inv-header">
        <h2 className="inv-titulo">Control de Stock (Base de Datos en Vivo)</h2>
        <div className="inv-acciones">
          {/* Al hacer clic abrimos el Modal Regulado */}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Lote</button>
        </div>
      </div>

      <div className="info-banner">
        Visualizando catálogo unificado. Los ingresos de lotes impactan directamente los totales en stock.
      </div>

      {error && (
        <div className="alert-banner">
          <IconAlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="search-field">
        <IconSearch size={16} />
        <input
          type="text"
          placeholder="Buscar medicamentos por ID o Nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cargando ? (
        <div className="loading-text"><IconRefresh size={16} className="spin" /> Conectando con MySQL...</div>
      ) : (
        <table className="inv-tabla">
          <thead>
            <tr>
              <th>ID Base</th>
              <th>Medicamento</th>
              <th>Laboratorio</th>
              <th>Receta</th>
              <th>Precio Venta</th>
              <th>Stock Actual</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((m) => (
              <tr key={m.medicamento_id}>
                <td>#{m.medicamento_id}</td>
                <td className="celda-fuerte">{m.nombre_comercial}</td>
                <td>{m.laboratorio}</td>
                <td>{m.requiere_receta ? 'OBLIGATORIA' : 'Venta Libre'}</td>
                <td>${parseFloat(m.precio_venta).toFixed(2)}</td>
                <td className={m.stock_actual < 10 ? 'celda-critica' : ''}>
                  {m.stock_actual} u.
                </td>
                <td>
                  <span className={estadoClase(m.stock_actual < 10 ? 'REPONER' : 'OK')}>
                    {m.stock_actual < 10 ? 'CRÍTICO' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* VENTANA MODAL PARA INGRESO DE LOTES VALIDADO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title"><IconBox size={18} /> Registrar Ingreso de Lote</h3>
            <form onSubmit={manejarGuardarLote} className="modal-form">

              <label className="form-field">
                Código de Lote (Ej: LOT-IBU-99):
                <input type="text" required placeholder="LOT-XXX-000" value={codigoLote} onChange={e => setCodigoLote(e.target.value)} />
              </label>

              <label className="form-field">
                Seleccionar Medicamento (Catálogo Oficial):
                <select required value={medSeleccionado} onChange={e => setMedSeleccionado(e.target.value)}>
                  <option value="">-- Elija un producto de la base de datos --</option>
                  {medicamentos.map(m => (
                    <option key={m.medicamento_id} value={m.medicamento_id}>
                      #{m.medicamento_id} - {m.nombre_comercial} ({m.laboratorio})
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                Fecha de Vencimiento:
                <input type="date" required value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} />
              </label>

              <label className="form-field">
                Cantidad de Unidades entrantes:
                <input type="number" min="1" required placeholder="Ej: 50" value={cantidadStock} onChange={e => setCantidadStock(e.target.value)} />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Ingresar a Stock</button>
              </div>

            </form>
          </div>
        </div>
      )}

      <div className="inv-footer">
        <span>Mostrando {filtrados.length} de {medicamentos.length} medicamentos</span>
      </div>
    </div>
  );
};

export default Inventario;
