// frontend/src/components/JustificationDisplay.js
import React from 'react';
import { generarJustificacion } from '../utils/justifications';

const JustificationDisplay = ({ top_features, probabilidad, nivel }) => {

  if (!top_features || !Array.isArray(top_features) || top_features.length === 0 || 
      probabilidad === null || probabilidad === undefined) {
    return (
      <div style={{
        background: '#f9fafb',
        border: '1px solid #d1d5db',
        borderRadius: 12,
        padding: 24,
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <p>Defina y guarde un cliente para ver la justificación de la predicción</p>
      </div>
    );
  }

  const percentage = Math.round(probabilidad * 100);
  const justifications = generarJustificacion(top_features);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ 
        margin: '0 0 16px 0', 
        fontSize: 20, 
        fontWeight: 600,
        color: '#1f2937'
      }}>
        Justificación del resultado:
      </h4>
      
      <p style={{ 
        margin: '0 0 16px 0',
        fontSize: 15,
        color: '#374151',
        lineHeight: 1.6
      }}>
        Dada una configuración de un cliente X, se podría obtener un resultado de {nivel?.toLowerCase()} probabilidad, 
        el cual obedece a:
      </p>
      
      <p style={{ 
        margin: '0 0 12px 0',
        fontSize: 15,
        fontWeight: 600,
        color: '#1f2937',
        lineHeight: 1.6
      }}>
        Esta probabilidad del {percentage}% es {nivel?.toLowerCase()} principalmente porque:
      </p>
      
      {justifications && justifications.length > 0 ? (
        <ul style={{ 
          margin: 0,
          paddingLeft: 24,
          fontSize: 15,
          color: '#374151',
          lineHeight: 1.6
        }}>
          {justifications.map((justification, index) => (
            <li key={index} style={{ marginBottom: 8 }}>
              {justification}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ 
          margin: 0,
          fontSize: 15,
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          No se pudo generar la justificación para esta predicción.
        </p>
      )}

      {/* Acción recomendada */}
      <div style={{
        marginTop: 24,
        padding: 16,
        backgroundColor: percentage < 30 ? '#fef3f2' : percentage < 60 ? '#fffbeb' : '#f0f9ff',
        border: `1px solid ${percentage < 30 ? '#fecaca' : percentage < 60 ? '#fcd34d' : '#93c5fd'}`,
        borderRadius: 8
      }}>
        <h5 style={{
          margin: '0 0 8px 0',
          fontSize: 16,
          fontWeight: 600,
          color: percentage < 30 ? '#991b1b' : percentage < 60 ? '#92400e' : '#1e40af'
        }}>
          Acción recomendada:
        </h5>
        <p style={{
          margin: 0,
          fontSize: 14,
          color: percentage < 30 ? '#7f1d1d' : percentage < 60 ? '#78350f' : '#1e3a8a',
          lineHeight: 1.5
        }}>
          {percentage < 30 
            ? "No priorizar seguimiento - Probabilidad baja de conversión"
            : percentage < 60 
            ? "Segundo intento - Probabilidad moderada, considerar estrategia alternativa"
            : "Contacto inmediato - Alta probabilidad de conversión"}
        </p>
      </div>
    </div>
  );
};

export default JustificationDisplay;
