import React, { useState, useEffect } from 'react';
import './proveedores.css';

const Proveedores = () => {
  const [busqueda, setBusqueda] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // --- ESTADOS PARA CONTROLAR EL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [nuevoId, setNuevoId] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoMail, setNuevoMail] = useState('');
  const [nuevoTel, setNuevoTel] = useState('');

  // Función para listar reutilizable
  const cargarProveedores = () => {
    fetch('https://hygea-backend-production.up.railway.app/api/proveedores')
      .then((response) => {
        if (!response.ok) throw new Error('Error al traer los proveedores');
        return response.json();
      })
      .then((data) => {
        setProveedores(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo conectar con el servidor de Hygeia Nexus');
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  // --- FUNCIÓN PARA ENVIAR EL NUEVO PROVEEDOR A PYTHON ---
  const manejarGuardar = (e) => {
    e.preventDefault();

    const proveedorData = {
      proveedor_id: parseInt(nuevoId),
      nombre_proveedor: nuevoNombre, // Mapeado exacto a lo que espera tu app.py
      mail_proveedor: nuevoMail,
      tel_proveedor: nuevoTel
    };

    fetch('https://hygea-backend-production.up.railway.app/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proveedorData)
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.error) });
        return res.json();
      })
      .then(() => {
        cargarProveedores();
        setShowModal(false);
        setNuevoId('');
        setNuevoNombre('');
        setNuevoMail('');
        setNuevoTel('');
      })
      .catch(err => alert(`Error al guardar: ${err.message}`));
  };

  const filtrados = proveedores.filter((p) =>
    p.nombre_proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.proveedor_id.toString().includes(busqueda)
  );

  // --- FUNCIÓN ELIMINAR CORREGIDA ---
  const eliminar = (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al proveedor #${id}?`)) {
      
      // ¡Acá cambiamos `${id_prov}` por el `${id}` correcto de la función!
      fetch(`https://hygea-backend-production.up.railway.app/api/proveedores/${id}`, {
        method: 'DELETE'
      })
        .then((res) => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.error) });
          return res.json();
        })
        .then(() => {
          cargarProveedores(); // Refresco automático en pantalla
        })
        .catch((err) => {
          alert(`⚠️ Restricción SQL: No se puede eliminar el proveedor porque tiene pedidos o medicamentos vinculados en el sistema.`);
        });
    }
  };

  return (
    <div className="page-card">
      <div className="prov-header">
        <h2 className="prov-titulo">Gestión de Proveedores (En Vivo)</h2>
        <button className="btn-nuevo" onClick={() => setShowModal(true)}>+ Nuevo Proveedor</button>
      </div>

      <div className="prov-info">
        Administre los canales de contacto directos de las droguerías homologadas.
      </div>

      {error && <div style={{ color: '#e74c3c', marginBottom: '15px', fontWeight: 'bold' }}>⚠️ {error}</div>}

      <input
        className="prov-buscar"
        type="text"
        placeholder="🔍 Buscar proveedores por ID o Nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <h3 style={{ color: '#34495e' }}>Cargando canales de contacto...</h3>
      ) : (
        <table className="prov-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre / Droguería</th>
              <th>Email de Contacto</th>
              <th>Teléfono comercial</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.proveedor_id}>
                <td>#{p.proveedor_id}</td>
                <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>{p.nombre_proveedor}</td>
                <td style={{ color: '#7f8c8d' }}>{p.mail_proveedor}</td>
                <td style={{ fontFamily: 'monospace' }}>{p.tel_proveedor}</td>
                <td className="acciones">
                  <button className="btn-eliminar" onClick={() => eliminar(p.proveedor_id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/*  VENTANA MODAL AGREGAR PROVEEDOR  */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', marginBottom: '20px' }}>📦 Registrar Nuevo Proveedor</h3>
            <form onSubmit={manejarGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 'bold' }}>
                ID del Proveedor (Numérico único):
                <input type="number" required value={nuevoId} onChange={e => setNuevoId(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 'bold' }}>
                Nombre de la Droguería:
                <input type="text" required value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 'bold' }}>
                Correo Electrónico:
                <input type="email" required value={nuevoMail} onChange={e => setNuevoMail(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontWeight: 'bold' }}>
                Teléfono Comercial:
                <input type="text" required value={nuevoTel} onChange={e => setNuevoTel(e.target.value)} style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </label>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 15px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar en BD</button>
              </div>

            </form>
          </div>
        </div>
      )}

      <div className="prov-footer">
        <span>Mostrando {filtrados.length} de {proveedores.length} proveedores</span>
      </div>
    </div>
  );
};

export default Proveedores;