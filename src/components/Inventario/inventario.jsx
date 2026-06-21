import React, { useState, useEffect } from 'react';
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
      medicamento_id: parseInt(medSeleccionado),
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
          <button className="btn-nuevo" onClick={() => setShowModal(true)}>+ Nuevo Lote</button>
        </div>
      </div>

      <div className="inv-info">
        Visualizando catálogo unificado. Los ingresos de lotes impactan directamente los totales en stock.
      </div>

      {error && <div style={{ color: '#e74c3c', marginBottom: '15px', fontWeight: 'bold' }}>⚠️ {error}</div>}

      <input
        className="inv-buscar"
        type="text"
        placeholder="🔍 Buscar medicamentos por ID o Nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <h3 style={{ color: '#34495e' }}> Conectando con MySQL...</h3>
      ) : (
        <table className="inv-tabla">
          <thead>
            <tr>
              <th>ID Base</th>
              <th>Medicamento</th>
              <th>Laboratorio</th>
              <th>Receta</th>
              <th>Precio Venta</th>
              <th className="txt-centro">Stock Actual</th>
              <th className="txt-centro">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((m) => (
              <tr key={m.medicamento_id}>
                <td>#{m.medicamento_id}</td>
                <td style={{ fontWeight: 'bold' }}>{m.nombre_comercial}</td>
                <td>{m.laboratorio}</td>
                <td>{m.requiere_receta ? 'OBLIGATORIA' : 'Venta Libre'}</td>
                <td>${parseFloat(m.precio_venta).toFixed(2)}</td>
                <td className="txt-centro" style={{ color: m.stock_actual < 10 ? '#e74c3c' : 'inherit', fontWeight: m.stock_actual < 10 ? 'bold' : 'normal' }}>
                  {m.stock_actual} u.
                </td>
                <td className="txt-centro">
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
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '420px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', marginBottom: '20px' }}>📦 Registrar Ingreso de Lote</h3>
            <form onSubmit={manejarGuardarLote} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 'bold' }}>
                Código de Lote (Ej: LOT-IBU-99):
                <input type="text" required placeholder="LOT-XXX-000" value={codigoLote} onChange={e => setCodigoLote(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 'bold' }}>
                Seleccionar Medicamento (Catálogo Oficial):
                <select required value={medSeleccionado} onChange={e => setMedSeleccionado(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                  <option value="">-- Elija un producto de la base de datos --</option>
                  {medicamentos.map(m => (
                    <option key={m.medicamento_id} value={m.medicamento_id}>
                      #{m.medicamento_id} - {m.nombre_comercial} ({m.laboratorio})
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 'bold' }}>
                Fecha de Vencimiento:
                <input type="date" required value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 'bold' }}>
                Cantidad de Unidades entrantes:
                <input type="number" min="1" required placeholder="Ej: 50" value={cantidadStock} onChange={e => setCantidadStock(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 15px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Ingresar a Stock</button>
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