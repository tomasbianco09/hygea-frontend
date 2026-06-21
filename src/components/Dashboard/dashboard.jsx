import { useState } from 'react';
import { IconChart, IconAlertTriangle, IconBox } from '../Icons/icons';

export default function Dashboard() {
  // Simulamos datos basados en tu base de datos Hygeia Nexus
  const [medicamentos] = useState([
    { id: 1, nombre: "Ibuprofeno 600mg", laboratorio: "Bayer", stock: 5, precio: 1200 },
    { id: 2, nombre: "Amoxicilina 500mg", laboratorio: "Roemmers", stock: 45, precio: 3500 },
    { id: 3, nombre: "Losartán 50mg", laboratorio: "Bagó", stock: 8, precio: 2100 },
    { id: 4, nombre: "Paracetamol 500mg", laboratorio: "Genfar", stock: 80, precio: 800 },
  ]);

  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '20px', backgroundColor: 'var(--color-bg)' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
        <IconChart size={22} /> Panel de Control - Hygeia Nexus
      </h1>
      <p style={{ color: 'var(--color-text-soft)' }}>Gestión del sistema de la farmacia y control de stock.</p>

      {/* Tarjetas de Resumen Rápido */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', padding: '15px', borderRadius: 'var(--radius-md)', flex: 1 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconAlertTriangle size={18} /> Alertas de Stock</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>2 Medicamentos críticos</p>
        </div>
        <div style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)', padding: '15px', borderRadius: 'var(--radius-md)', flex: 1 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconBox size={18} /> Total Productos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{medicamentos.length} Registrados</p>
        </div>
      </div>

      {/* Tabla de Stock */}
      <h2 style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Inventario de Medicamentos</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--color-primary-dark)', color: 'var(--color-text-on-dark)', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Medicamento</th>
            <th style={{ padding: '12px' }}>Laboratorio</th>
            <th style={{ padding: '12px' }}>Precio de Venta</th>
            <th style={{ padding: '12px' }}>Stock Actual</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.map((med) => (
            <tr key={med.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '12px' }}>{med.id}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{med.nombre}</td>
              <td style={{ padding: '12px' }}>{med.laboratorio}</td>
              <td style={{ padding: '12px' }}>${med.precio}</td>
              <td style={{
                padding: '12px',
                color: med.stock < 10 ? 'var(--color-danger)' : 'var(--color-success)',
                fontWeight: 'bold'
              }}>
                {med.stock} {med.stock < 10 ? '(Stock Bajo)' : '(Ok)'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
