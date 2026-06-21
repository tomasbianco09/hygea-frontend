import React, { useState, useEffect } from 'react';
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-nuevo" style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setShowClienteModal(true)}>+ Registrar Cliente</button>
          <button className="btn-nueva-venta" onClick={() => setShowVentaModal(true)}>+ Nueva Venta</button>
        </div>
      </div>

      {error && <div style={{ backgroundColor: '#fde8e8', color: '#e74c3c', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold' }}>⚠️ {error}</div>}

      <div className="ventas-cards">
        <div className="vcard"><div className="vcard-info"><span className="vcard-label">Caja Total (BD)</span><span className="vcard-value">${ingresosTotales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span><span className="vcard-trend positivo">↑ Acumulado</span></div><div className="vcard-icon azul">🛒</div></div>
        <div className="vcard"><div className="vcard-info"><span className="vcard-label">Operaciones</span><span className="vcard-value">{ventas.length}</span><span className="vcard-trend neutro">Facturas</span></div><div className="vcard-icon verde">📝</div></div>
      </div>

      <div className="page-card">
        <h3 className="ultimas-titulo">Historial de Auditoría Interna</h3>
        {cargando ? <h3 style={{ color: '#34495e', padding: '20px' }}>🔄 Consultando registros...</h3> : (
          <table className="ventas-tabla">
            <thead>
              <tr><th>Factura #</th><th>Cliente / Paciente</th><th>Fecha Emisión</th><th>Método de Pago</th><th>Obra Social</th><th>Monto Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.factura}>
                  <td><strong>#{v.factura}</strong></td><td>{v.cliente}</td><td>{v.fecha}</td><td>{v.metodo_pago}</td>
                  <td><span className={v.obraSocial !== '-' ? 'badge-psico' : ''} style={{ backgroundColor: v.obraSocial !== '-' ? '#3498db' : 'transparent', color: v.obraSocial !== '-' ? 'white' : 'inherit', padding: v.obraSocial !== '-' ? '3px 8px' : '0', borderRadius: '3px', fontSize: '12px', fontWeight: 'bold' }}>{v.obraSocial}</span></td>
                  <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>${parseFloat(v.total).toFixed(2)}</td><td><span className="badge completado">COMPLETADO</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL 1: REGISTRAR NUEVO CLIENTE */}
      {showClienteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', marginBottom: '20px' }}>👥 Ficha de Nuevo Cliente</h3>
            <form onSubmit={manejarGuardarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>
                ID de Cliente (Número único):
                <input type="number" required placeholder="Ej: 111" value={nuevoClienteId} onChange={e => setNuevoClienteId(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>
                Nombre y Apellido completo:
                <input type="text" required placeholder="Ej: Tomas..." value={nuevoClienteNombre} onChange={e => setNuevoClienteNombre(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>
                Documento Nacional de Identidad (DNI):
                <input type="text" required placeholder="Solo números" value={nuevoClienteDni} onChange={e => setNuevoClienteDni(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>
                Asociar Cobertura Médica (Obra Social):
                <select value={nuevoClienteOS} onChange={e => setNuevoClienteOS(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                  <option value="">-- Sin Cobertura (Particular) --</option>
                  {obrasSociales.map(os => (
                    <option key={os.obra_social_id} value={os.obra_social_id}>{os.nombre_obra_social}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
                <input type="checkbox" checked={nuevoClienteFrecuente} onChange={e => setNuevoClienteFrecuente(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                Marcar como Cliente Frecuente
              </label>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setShowClienteModal(false)} style={{ padding: '8px 15px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Alta de Cliente</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EMITIR VENTA */}
      {showVentaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #34495e', paddingBottom: '10px' }}>🧾 Emitir Comprobante de Venta</h3>
            <form onSubmit={manejarConfirmarVenta} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>Número de Factura Único:<input type="number" required placeholder="Ej: 511" value={nuevaFacturaId} onChange={e => setNuevaFacturaId(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} /></label>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>Método de Pago:
                  <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                    <option value="Efectivo">Efectivo</option><option value="Tarjeta Débito">Tarjeta Débito</option><option value="Tarjeta Crédito">Tarjeta Crédito</option><option value="Mercado Pago">Mercado Pago</option><option value="Transferencia">Transferencia</option>
                  </select>
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>Asociar Paciente (Catálogo):
                <select value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                  <option value="">-- Consumidor Final (Particular) --</option>
                  {clientes.map(c => ( <option key={c.cliente_id} value={c.cliente_id}>{c.nombre} [DNI: {c.dni}] - Cobertura: {c.obra_social}</option> ))}
                </select>
              </label>

              <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', backgroundColor: '#f9f9f9' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>🛒 Cargar Medicamento</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select value={medSeleccionadoId} onChange={e => setMedSeleccionadoId(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                    <option value="">-- Seleccionar fármaco --</option>
                    {medicamentos.map(m => ( <option key={m.medicamento_id} value={m.medicamento_id} disabled={m.stock_actual <= 0}>{m.nombre_comercial} (${m.precio_venta}) - Disp: {m.stock_actual} u.</option> ))}
                  </select>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" min="1" value={cantidadInput} onChange={e => setCantidadInput(e.target.value)} style={{ padding: '8px', width: '70px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="number" placeholder="ID Receta (Opcional)" value={recetaInput} onChange={e => setRecetaInput(e.target.value)} style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }} />
                    <button type="button" onClick={agregarAlCarrito} style={{ padding: '8px 15px', background: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Añadir</button>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #eee', borderRadius: '4px', minHeight: '60px', padding: '5px' }}>
                {carrito.length === 0 ? <p style={{ textAlign: 'center', color: '#95a5a6', fontSize: '13px' }}>Mostrador vacío.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead><tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}><th>Item</th><th>Cant</th><th>Unitario</th><th>Total</th></tr></thead>
                    <tbody>
                      {carrito.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '4px 0' }}>{item.nombre}</td><td>{item.cantidad}</td><td>${item.precio_unitario.toFixed(2)}</td><td>${(item.precio_unitario * item.cantidad).toFixed(2)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '5px', borderTop: '2px solid #ddd', paddingTop: '10px' }}>
                <span style={{ fontSize: '13px', color: '#7f8c8d' }}>Subtotal: ${calcularSubtotalCarrito().toFixed(2)}</span>
                {obtenerClienteActivo() && obtenerClienteActivo().obra_social_id && <span style={{ fontSize: '13px', color: '#2980b9' }}>Cobertura: {obtenerClienteActivo().obra_social}</span>}
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#27ae60' }}>TOTAL: ${calcularTotalFinal().toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
                <button type="button" onClick={() => { setShowVentaModal(false); setCarrito([]); }} style={{ padding: '8px 15px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cerrar</button>
                <button type="submit" style={{ padding: '8px 15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>🧾 Emitir Comprobante</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas_facturacion;