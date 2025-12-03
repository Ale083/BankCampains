// frontend/src/components/RecommendationDisplay.js
import React from 'react';
import AccessFacade from '../auth/AccessFacade.js';

const RecommendationDisplay = ({ probabilidad }) => {
  // Verificar permisos - si no tiene permisos, no mostrar nada
  if (!AccessFacade.puedeVerRecomendacionSugerida()) {
    return null;
  }

  if (probabilidad === null || probabilidad === undefined) {
    return null;
  }

  const percentage = Math.round(probabilidad * 100);

  return (
    <div style={{
      marginTop: 24,
      padding: 16,
      backgroundColor: percentage < 30 ? '#fef3f2' : percentage < 60 ? '#fffbeb' : '#f0f9ff',
      border: `1px solid ${percentage < 30 ? '#fecaca' : percentage < 60 ? '#fcd34d' : '#93c5fd'}`,
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
          ? "No priorizar seguimiento"
          : percentage < 60 
          ? "Segundo intento - Seguimiento programado"
          : "Contacto inmediato - Alta prioridad"}
      </p>
    </div>
  );
};

export default RecommendationDisplay;
