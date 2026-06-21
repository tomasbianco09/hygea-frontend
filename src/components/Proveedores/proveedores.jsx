import React, { useState, useEffect } from 'react';
import { IconAlertTriangle, IconSearch, IconRefresh, IconPencil, IconTrash, IconFactory } from '../Icons/icons';
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
        .catch(() => {
          alert(`Restricción SQL: No se puede eliminar el proveedor porque tiene pedidos o medicamentos vinculados en el sistema.`);
        });
    }
  };

  return (
    <div className="page-card">
      <div className="prov-header">
        <h2 className="prov-titulo">Gestión de Proveedores (En Vivo)</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Proveedor</button>
      </div>

      <div className="info-banner">
        Administre los canales de contacto directos de las droguerías homologadas.
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
          placeholder="Buscar proveedores por ID o Nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cargando ? (
        <div className="loading-text"><IconRefresh size={16} className="spin" /> Cargando canales de contacto...</div>
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
                <td className="celda-fuerte">{p.nombre_proveedor}</td>
                <td className="celda-suave">{p.mail_proveedor}</td>
                <td className="celda-mono">{p.tel_proveedor}</td>
                <td className="acciones">
                  <button className="btn-icon" title="Editar"><IconPencil size={16} /></button>
                  <button className="btn-icon danger" title="Eliminar" onClick={() => eliminar(p.proveedor_id)}><IconTrash size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= VENTANA MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title"><IconFactory size={18} /> Registrar Nuevo Proveedor</h3>
            <form onSubmit={manejarGuardar} className="modal-form">

              <label className="form-field">
                ID del Proveedor (Numérico único):
                <input type="number" required value={nuevoId} onChange={e => setNuevoId(e.target.value)} />
              </label>

              <label className="form-field">
                Nombre de la Droguería:
                <input type="text" required value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
              </label>

              <label className="form-field">
                Correo Electrónico:
                <input type="email" required value={nuevoMail} onChange={e => setNuevoMail(e.target.value)} />
              </label>

              <label className="form-field">
                Teléfono Comercial:
                <input type="text" required value={nuevoTel} onChange={e => setNuevoTel(e.target.value)} />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar en BD</button>
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
