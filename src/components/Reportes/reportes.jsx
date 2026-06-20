import React, { useState, useEffect } from 'react';
import './reportes.css';

// Lista de colores profesionales para las barras dinámicas
const PALETA_COLORES = ['#3498db', '#2ecc71', '#e67e22', '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c'];

const Reportes = () => {
  const [masVendidos, setMasVendidos] = useState([]);
  const [datosCategorias, setDatosCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Sincronización en paralelo con los endpoints en español de app.py
    Promise.all([
      fetch('https://hygea-backend-production.up.railway.app/api/reportes/mas-vendidos').then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      }),
      fetch('https://hygea-backend-production.up.railway.app/api/reportes/categorias').then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
    ])
      .then(([dataMasVendidos, dataCategorias]) => {
        setMasVendidos(dataMasVendidos);
        setDatosCategorias(dataCategorias);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudieron compilar las estadísticas en tiempo real desde Railway');
        setCargando(false);
      });
  }, []);

  // Buscamos el valor máximo vendido para calcular los porcentajes de las barras
  const maxVendido = datosCategorias.length > 0 ? Math.max(...datosCategorias.map(c => c.total_vendido)) : 1;

  return (
    <div className="reportes-wrapper">
      <div className="reportes-header">
        <h2 className="reportes-titulo">Reportes y Estadísticas de Auditoría</h2>
        {/* ❌ El botón de exportar métricas fue removido exitosamente desde aquí */}
      </div>

      {error && (
        <div style={{ backgroundColor: '#fde8e8', color: '#e74c3c', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold' }}>
          ⚠️ {error}
        </div>
      )}

      {cargando ? (
        <h3 style={{ color: '#34495e', padding: '20px' }}>🔄 Computando estadísticas comerciales en MySQL...</h3>
      ) : (
        <>
          {/* Gráficos Dinámicos Reales con Barras Nativas */}
          <div className="reportes-graficos">
            <div className="grafico-card" style={{ width: '100%', flex: 'none' }}>
              <h3 className="grafico-titulo">Volumen de Unidades Despachadas por Categoría</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px 0' }}>
                {datosCategorias.map((cat, index) => {
                  const porcentaje = (cat.total_vendido / maxVendido) * 100;
                  const colorBarra = PALETA_COLORES[index % PALETA_COLORES.length];
                  
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ width: '220px', fontWeight: '500', fontSize: '14px', color: '#2c3e50' }}>{cat.categoria}</span>
                      <div style={{ flex: 1, backgroundColor: '#eaeded', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${porcentaje}%`, 
                          backgroundColor: colorBarra, 
                          height: '100%', 
                          transition: 'width 0.5s ease-in-out' 
                        }} />
                      </div>
                      <span style={{ width: '60px', fontWeight: 'bold', color: '#34495e', fontSize: '14px' }}>{cat.total_vendido} u.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabla de medicamentos más vendidos real de la base de datos */}
          <div className="page-card" style={{ marginTop: '20px' }}>
            <h3 className="tabla-titulo">Top 5: Medicamentos con Mayor Rotación Comercial</h3>
            <table className="reportes-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th style={{ textAlign: 'center' }}>Cantidad Vendida</th>
                  <th style={{ textAlign: 'center' }}>Stock Disponible</th>
                  <th style={{ textAlign: 'right' }}>Ingresos Brutos</th>
                </tr>
              </thead>
              <tbody>
                {masVendidos.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>{m.producto}</td>
                    <td>{m.categoria}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#27ae60' }}>{m.cantidad} u.</td>
                    <td style={{ textAlign: 'center', color: m.stock < 10 ? '#e74c3c' : 'inherit', fontWeight: m.stock < 10 ? 'bold' : 'normal' }}>
                      {m.stock} unidades
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${parseFloat(m.ingresos).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Reportes;