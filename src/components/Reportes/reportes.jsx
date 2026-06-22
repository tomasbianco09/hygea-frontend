import React, { useState, useEffect } from 'react';
import { IconAlertTriangle, IconRefresh } from '../Icons/icons';
import './reportes.css';

// Paleta sobria para las barras dinámicas, en línea con la identidad visual del sistema
const PALETA_COLORES = ['#33524a', '#a9824c', '#8b4a42', '#51626e', '#7a8a6e', '#9c6b4f', '#5c7a52'];

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
      </div>

      {error && (
        <div className="alert-banner">
          <IconAlertTriangle size={16} /> {error}
        </div>
      )}

      {cargando ? (
        <div className="loading-text"><IconRefresh size={16} className="spin" /> Computando estadísticas comerciales en MySQL...</div>
      ) : (
        <>
          {/* Gráficos Dinámicos Reales con Barras Nativas */}
          <div className="reportes-graficos">
            <div className="grafico-card grafico-full">
              <h3 className="grafico-titulo">Volumen de Unidades Despachadas por Categoría</h3>
              <div className="grafico-barras">
                {datosCategorias.map((cat, index) => {
                  const porcentaje = (cat.total_vendido / maxVendido) * 100;
                  const colorBarra = PALETA_COLORES[index % PALETA_COLORES.length];

                  return (
                    <div key={index} className="grafico-fila">
                      <span className="grafico-etiqueta">{cat.categoria}</span>
                      <div className="grafico-pista">
                        <div
                          className="grafico-relleno"
                          style={{ width: `${porcentaje}%`, backgroundColor: colorBarra }}
                        />
                      </div>
                      <span className="grafico-valor">{cat.total_vendido} u.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabla de medicamentos más vendidos real de la base de datos */}
          <div className="page-card">
            <h3 className="tabla-titulo">Top 5: Medicamentos con Mayor Rotación Comercial</h3>
            <table className="reportes-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="col-centro">Cantidad Vendida</th>
                  <th className="col-centro">Stock Disponible</th>
                  <th className="col-derecha">Ingresos Brutos</th>
                </tr>
              </thead>
              <tbody>
                {masVendidos.map((m, i) => (
                  <tr key={i}>
                    <td className="celda-fuerte">{m.producto}</td>
                    <td>{m.categoria}</td>
                    <td className="col-centro celda-exito">{m.cantidad} u.</td>
                    <td className={`col-centro ${m.stock < 10 ? 'celda-critica' : ''}`}>
                      {m.stock} unidades
                    </td>
                    <td className="col-derecha celda-fuerte">${parseFloat(m.ingresos).toFixed(2)}</td>
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
