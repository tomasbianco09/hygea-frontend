import React, { useState, useEffect } from 'react';
import { IconAlertTriangle, IconRefresh, IconArrowUp, IconCart, IconNote, IconUsers, IconReceipt } from '../Icons/icons';
import './ventas-fact.css';

const Ventas_facturacion = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [obrasSociales, setObrasSociales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // --- ESTADOS MODAL NUEVA VENTA ---
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [nuevaFacturaId, setNuevaFacturaId] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [medSeleccionadoId, setMedSeleccionadoId] = useState('');
  const [cantidadInput, setCantidadInput] = useState(1);
  const [recetaInput, setRecetaInput] = useState('');
  const [carrito, setCarrito] = useState([]);

  // --- NUEVOS ESTADOS: MODAL REGISTRAR CLIENTE ---
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [nuevoClienteId, setNuevoClienteId] = useState('');
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState('');
  const [nuevoClienteDni, setNuevoClienteDni] = useState('');
  const [nuevoClienteFrecuente, setNuevoClienteFrecuente] = useState(false);
  const [nuevoClienteOS, setNuevoClienteOS] = useState('');

  const cargarTodoVentas = () => {
    Promise.all([
      fetch('https://hygea-backend-production.up.railway.app/api/ventas').then(res => res.json()),
      fetch('https://hygea-backend-production.up.railway.app/api/clientes').then(res => res.json()),
      fetch('https://hygea-backend-production.up.railway.app/api/medicamentos').then(res => res.json()),
      fetch('https://hygea-backend-production.up.railway.app/api/obras-sociales').then(res => res.json())
    ])
      .then(([dataVentas, dataClientes, dataMedicamentos, dataOS]) => {
        setVentas(dataVentas);
        setClientes(dataClientes);
        setMedicamentos(dataMedicamentos);
        setObrasSociales(dataOS);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Error al sincronizar canales de datos de facturación con la nube');
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarTodoVentas();
  }, []);

  // --- ACCIÓN: GUARDAR NUEVO CLIENTE EN BASE DE DATOS ---
  const manejarGuardarCliente = (e) => {
    e.preventDefault();

    // CORREGIDO: Usamos parseInt nativo directamente para evitar ReferenceError por hoisting
    const clientePayload = {
      cliente_id: parseInt(nuevoClienteId),
      nombre: nuevoClienteNombre,
      dni: nuevoClienteDni,
      cliente_frecuente: nuevoClienteFrecuente,
      obra_social_id: nuevoClienteOS !== "" ? parseInt(nuevoClienteOS) : null
    };

    fetch('https://hygea-backend-production.up.railway.app/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientePayload)
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.error) });
        return res.json();
      })
      .then(() => {
        cargarTodoVentas(); // Re-lista los clientes para que aparezca el nuevo en Nueva Venta
        setShowClienteModal(false);
        setNuevoClienteId('');
        setNuevoClienteNombre('');
        setNuevoClienteDni('');
        setNuevoClienteFrecuente(false);
        setNuevoClienteOS('');
      })
      .catch(err => alert(`Error al registrar: ${err.message}`));
  };

  // --- FUNCIONES DEL CARRITO ---
  const agregarAlCarrito = () => {
    if (!medSeleccionadoId) return;
    const medReal = medicamentos.find(m => m.medicamento_id === parseInt(medSeleccionadoId));
    const cantidad = parseInt(cantidadInput);
    if (!medReal) return;
    if (medReal.stock_actual < cantidad) {
      alert(`Stock insuficiente. Solo quedan ${medReal.stock_actual} unidades.`);
      return;
    }
    const existente = carrito.find(item => item.medicamento_id === medReal.medicamento_id);
    if (existente) {
      if (medReal.stock_actual < existente.cantidad + cantidad) { alert("Supera el stock."); return; }
      existente.cantidad += cantidad;
      setCarrito([...carrito]);
    } else {
      setCarrito([...carrito, { medicamento_id: medReal.medicamento_id, nombre: medReal.nombre_comercial, precio_unitario: parseFloat(medReal.precio_venta), cantidad, receta_id: recetaInput }]);
    }
    setMedSeleccionadoId(''); setCantidadInput(1); setRecetaInput('');
  };

  const obtenerClienteActivo = () => clientes.find(c => c.cliente_id === parseInt(clienteSeleccionado));
  const calcularSubtotalCarrito = () => carrito.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
  const calcularTotalFinal = () => {
    const sub = calcularSubtotalCarrito();
    const cObj = obtenerClienteActivo();
    if (cObj && cObj.obra_social_id) {
      if (cObj.obra_social.toUpperCase().includes('PAMI')) return sub * 0.60;
      if (cObj.obra_social.toUpperCase().includes('OSDE')) return sub * 0.70;
      return sub * 0.80;
    }
    return sub;
  };

  const manejarConfirmarVenta = (e) => {
    e.preventDefault();
    if (carrito.length === 0) { alert("El carrito está vacío."); return; }
    const cObj = obtenerClienteActivo();
    const payload = {
      venta_id: parseInt(nuevaFacturaId),
      cliente_id: cObj ? cObj.cliente_id : null,
      obra_social_id: cObj ? cObj.obra_social_id : null,
      metodo_pago: metodoPago,
      total: +(Math.round(calcularTotalFinal() + "e+2") + "e-2"),
      carrito: carrito
    };

    // CORREGIDO: Ruta migrada a producción en Railway para evitar bloqueo local
    fetch('https://hygea-backend-production.up.railway.app/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => { if (!res.ok) return res.json().then(err => { throw new Error(err.error) }); return res.json(); })
      .then(() => { cargarTodoVentas(); setShowVentaModal(false); setNuevaFacturaId(''); setClienteSeleccionado(''); setCarrito([]); })
      .catch(err => alert(`Fallo: ${err.message}`));
  };

  const ingresosTotales = ventas.reduce((acc, v) => acc + parseFloat(v.total), 0);

  return (
    <div className="ventas-wrapper">
      <div className="ventas-header">
        <h2 className="ventas-titulo">Ventas y Facturación (En Vivo)</h2>
        <div className="ventas-header-acciones">
          <button className="btn btn-secondary" onClick={() => setShowClienteModal(true)}>+ Registrar Cliente</button>
          <button className="btn btn-primary" onClick={() => setShowVentaModal(true)}>+ Nueva Venta</button>
        </div>
      </div>

      {error && (
        <div className="alert-banner">
          <IconAlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="ventas-cards">
        <div className="vcard">
          <div className="vcard-info">
            <span className="vcard-label">Caja Total (BD)</span>
            <span className="vcard-value">${ingresosTotales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            <span className="vcard-trend positivo"><IconArrowUp size={13} /> Acumulado</span>
          </div>
          <div className="vcard-icon tono-petroleo"><IconCart size={20} /></div>
        </div>
        <div className="vcard">
          <div className="vcard-info">
            <span className="vcard-label">Operaciones</span>
            <span className="vcard-value">{ventas.length}</span>
            <span className="vcard-trend neutro">Facturas</span>
          </div>
          <div className="vcard-icon tono-bronce"><IconNote size={20} /></div>
        </div>
      </div>

      <div className="page-card">
        <h3 className="ultimas-titulo">Historial de Auditoría Interna</h3>
        {cargando ? (
          <div className="loading-text"><IconRefresh size={16} className="spin" /> Consultando registros...</div>
        ) : (
          <table className="ventas-tabla">
            <thead>
              <tr><th>Factura #</th><th>Cliente / Paciente</th><th>Fecha Emisión</th><th>Método de Pago</th><th>Obra Social</th><th>Monto Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.factura}>
                  <td><strong>#{v.factura}</strong></td>
                  <td>{v.cliente}</td>
                  <td>{v.fecha}</td>
                  <td>{v.metodo_pago}</td>
                  <td>{v.obraSocial !== '-' ? <span className="badge-soft petroleo">{v.obraSocial}</span> : v.obraSocial}</td>
                  <td className="celda-fuerte">${parseFloat(v.total).toFixed(2)}</td>
                  <td><span className="badge-soft exito">COMPLETADO</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODAL 1: REGISTRAR NUEVO CLIENTE ================= */}
      {showClienteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title"><IconUsers size={18} /> Ficha de Nuevo Cliente</h3>
            <form onSubmit={manejarGuardarCliente} className="modal-form">

              <label className="form-field">
                ID de Cliente (Número único):
                <input type="number" required placeholder="Ej: 111" value={nuevoClienteId} onChange={e => setNuevoClienteId(e.target.value)} />
              </label>

              <label className="form-field">
                Nombre y Apellido completo:
                <input type="text" required placeholder="Ej: Tomas..." value={nuevoClienteNombre} onChange={e => setNuevoClienteNombre(e.target.value)} />
              </label>

              <label className="form-field">
                Documento Nacional de Identidad (DNI):
                <input type="text" required placeholder="Solo números" value={nuevoClienteDni} onChange={e => setNuevoClienteDni(e.target.value)} />
              </label>

              <label className="form-field">
                Asociar Cobertura Médica (Obra Social):
                <select value={nuevoClienteOS} onChange={e => setNuevoClienteOS(e.target.value)}>
                  <option value="">-- Sin Cobertura (Particular) --</option>
                  {obrasSociales.map(os => (
                    <option key={os.obra_social_id} value={os.obra_social_id}>{os.nombre_obra_social}</option>
                  ))}
                </select>
              </label>

              <label className="form-checkbox">
                <input type="checkbox" checked={nuevoClienteFrecuente} onChange={e => setNuevoClienteFrecuente(e.target.checked)} />
                Marcar como Cliente Frecuente
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowClienteModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Alta de Cliente</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EMITIR VENTA ================= */}
      {showVentaModal && (
        <div className="modal-overlay">
          <div className="modal-box modal-lg">
            <h3 className="modal-title"><IconReceipt size={18} /> Emitir Comprobante de Venta</h3>
            <form onSubmit={manejarConfirmarVenta} className="modal-form">
              <div className="form-field-row">
                <label className="form-field">Número de Factura Único:
                  <input type="number" required placeholder="Ej: 511" value={nuevaFacturaId} onChange={e => setNuevaFacturaId(e.target.value)} />
                </label>
                <label className="form-field">Método de Pago:
                  <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                    <option value="Efectivo">Efectivo</option><option value="Tarjeta Débito">Tarjeta Débito</option><option value="Tarjeta Crédito">Tarjeta Crédito</option><option value="Mercado Pago">Mercado Pago</option><option value="Transferencia">Transferencia</option>
                  </select>
                </label>
              </div>

              <label className="form-field">Asociar Paciente (Catálogo):
                <select value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)}>
                  <option value="">-- Consumidor Final (Particular) --</option>
                  {clientes.map(c => ( <option key={c.cliente_id} value={c.cliente_id}>{c.nombre} [DNI: {c.dni}] - Cobertura: {c.obra_social}</option> ))}
                </select>
              </label>

              <div className="carga-medicamento">
                <h4>Cargar Medicamento</h4>
                <div className="carga-medicamento-body">
                  <select className="carga-select-med" value={medSeleccionadoId} onChange={e => setMedSeleccionadoId(e.target.value)}>
                    <option value="">-- Seleccionar fármaco --</option>
                    {medicamentos.map(m => ( <option key={m.medicamento_id} value={m.medicamento_id} disabled={m.stock_actual <= 0}>{m.nombre_comercial} (${m.precio_venta}) - Disp: {m.stock_actual} u.</option> ))}
                  </select>
                  <div className="carga-medicamento-fila">
                    <input type="number" min="1" className="carga-cantidad" value={cantidadInput} onChange={e => setCantidadInput(e.target.value)} />
                    <input type="number" placeholder="ID Receta (Opcional)" className="carga-receta" value={recetaInput} onChange={e => setRecetaInput(e.target.value)} />
                    <button type="button" className="btn btn-primary" onClick={agregarAlCarrito}>+ Añadir</button>
                  </div>
                </div>
              </div>

              <div className="carrito-box">
                {carrito.length === 0 ? <p className="carrito-vacio">Mostrador vacío.</p> : (
                  <table className="carrito-tabla">
                    <thead><tr><th>Item</th><th>Cant</th><th>Unitario</th><th>Total</th></tr></thead>
                    <tbody>
                      {carrito.map((item, index) => (
                        <tr key={index}><td>{item.nombre}</td><td>{item.cantidad}</td><td>${item.precio_unitario.toFixed(2)}</td><td>${(item.precio_unitario * item.cantidad).toFixed(2)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="carrito-resumen">
                <span className="resumen-subtotal">Subtotal: ${calcularSubtotalCarrito().toFixed(2)}</span>
                {obtenerClienteActivo() && obtenerClienteActivo().obra_social_id && <span className="resumen-cobertura">Cobertura: {obtenerClienteActivo().obra_social}</span>}
                <span className="resumen-total">TOTAL: ${calcularTotalFinal().toFixed(2)}</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowVentaModal(false); setCarrito([]); }}>Cerrar</button>
                <button type="submit" className="btn btn-primary">Emitir Comprobante</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas_facturacion;
