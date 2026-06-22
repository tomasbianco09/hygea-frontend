import React, { useState, useEffect } from 'react';
import { IconAlertTriangle, IconSearch, IconRefresh, IconTrash, IconFactory } from '../Icons/icons';
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

  // --- SECCION PARA ESPACIAR AUTOMATICAMENTE EL VALOR AL INGRESAR UN TELEFONO ---
  const formatearTelefonoFlexible = (valor) => {
    // Si el usuario borra todo, limpiamos el campo
    if (!valor) return '';

    // Intentamos separar el código de país escrito manualmente (ej: +54, +56, 0054)
    // Buscamos si el usuario puso un espacio para separar el prefijo
    const partes = valor.split(' ');
    
    // Si todavía está escribiendo el código de país (no puso espacios)
    if (partes.length === 1) {
      return valor; 
    }

    // Si ya puso un espacio, el primer elemento es el prefijo de país (ej: "+54")
    const prefijoPais = partes[0];
    
    // Juntamos el resto del texto y nos quedamos solo con los números para formatear el cuerpo
    const cuerpoNumeros = partes.slice(1).join('').replace(/\D/g, '');

    if (cuerpoNumeros.length === 0) {
      return `${prefijoPais} `;
    }

    let cuerpoFormateado = '';

    // Aplicamos los espacios y guiones sobre el cuerpo del numero segun su longitud
    if (cuerpoNumeros.length <= 3) {
      // Ej: +54 261
      cuerpoFormateado = cuerpoNumeros;
    } else if (cuerpoNumeros.length <= 6) {
      // Ej: +54 261 425
      cuerpoFormateado = `${cuerpoNumeros.substring(0, 3)} ${cuerpoNumeros.substring(3)}`;
    } else {
      // Ej: +54 261 425-5555 o móviles +54 9 11 2345-6789
      if (cuerpoNumeros.startsWith('9') && cuerpoNumeros.length > 7) {
        // Formato móvil AR con el 9 intermedio: prefijo 9 [2 dígitos área] [4 dígitos]-[4 dígitos]
        cuerpoFormateado = `${cuerpoNumeros.substring(0, 1)} ${cuerpoNumeros.substring(1, 3)} ${cuerpoNumeros.substring(3, 7)}-${cuerpoNumeros.substring(7, 11)}`;
      } else {
        // Formato fijo comercial estándar: [3 dígitos] [3 dígitos]-[4 dígitos]
        cuerpoFormateado = `${cuerpoNumeros.substring(0, 3)} ${cuerpoNumeros.substring(3, 6)}-${cuerpoNumeros.substring(6, 10)}`;
      }
    }

    return `${prefijoPais} ${cuerpoFormateado}`.trim();
  };

  const manejarCambioTelefono = (e) => {
    const telefonoProcesado = formatearTelefonoFlexible(e.target.value);
    setNuevoTel(telefonoProcesado);
  };

  // --- FUNCIÓN PARA ENVIAR EL NUEVO PROVEEDOR A PYTHON ---
  const manejarGuardar = (e) => {
    e.preventDefault();

    const proveedorData = {
      proveedor_id: parseInt(nuevoId),
      nombre_proveedor: nuevoNombre, 
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

  // --- FUNCIÓN ELIMINAR ---
  const eliminar = (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al proveedor #${id}?`)) {
      fetch(`https://hygea-backend-production.up.railway.app/api/proveedores/${id}`, {
        method: 'DELETE'
      })
        .then((res) => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.error) });
          return res.json();
        })
        .then(() => {
          cargarProveedores(); 
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
                  <button className="btn-icon danger" title="Eliminar" onClick={() => eliminar(p.proveedor_id)}><IconTrash size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/*  VENTANA MODAL  */}
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

              {/* INPUT FLEXIBLE: CÓDIGO DE PAÍS + NÚMERO FORMATEADO AUTOMÁTICO */}
              <label className="form-field">
                Teléfono Comercial:
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: +54 261 455-5555" 
                  value={nuevoTel} 
                  onChange={manejarCambioTelefono} 
                />
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