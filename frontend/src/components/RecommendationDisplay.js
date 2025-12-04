// frontend/src/components/RecommendationDisplay.js
import React from 'react';
import AccessFacade from '../auth/AccessFacade.js';

const RecommendationDisplay = ({ probabilidad, thresholds }) => {
  // Si el usuario no tiene permiso para ver la recomendación, ocultar todo
  if (!AccessFacade.puedeVerRecomendacionSugerida()) {
    return null;
  }

  if (probabilidad === null || probabilidad === undefined) {
    return null;
  }

  const defaultThresholds = {
    contactoInmediato: 75,
    segundoIntento: 50,
  };

  const effectiveThresholds = thresholds || defaultThresholds;
  const percentage = Math.round(Number(probabilidad || 0) * 100);

  const isHighPriority =
    percentage >= effectiveThresholds.contactoInmediato;
  const isMediumPriority =
    percentage >= effectiveThresholds.segundoIntento &&
    percentage < effectiveThresholds.contactoInmediato;
  const isLowPriority = percentage < effectiveThresholds.segundoIntento;

  const getRecommendationStyle = () => {
    if (isHighPriority) {
      return {
        backgroundColor: '#f0f9ff',
        borderColor: '#93c5fd',
        titleColor: '#1e40af',
        textColor: '#1e3a8a',
      };
    }
    if (isMediumPriority) {
      return {
        backgroundColor: '#fffbeb',
        borderColor: '#fcd34d',
        titleColor: '#92400e',
        textColor: '#78350f',
      };
    }
    return {
      backgroundColor: '#fef3f2',
      borderColor: '#fecaca',
      titleColor: '#991b1b',
      textColor: '#7f1d1d',
    };
  };

  const getRecommendationText = () => {
    if (isHighPriority) return 'Contacto inmediato - Alta prioridad';
    if (isMediumPriority) return 'Segundo intento - Seguimiento programado';
    return 'No priorizar seguimiento';
  };

  const styles = getRecommendationStyle();

  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        backgroundColor: styles.backgroundColor,
        border: `1px solid ${styles.borderColor}`,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <h5
        style={{
          margin: '0 0 8px 0',
          fontSize: 16,
          fontWeight: 600,
          color: styles.titleColor,
        }}
      >
        Acción recomendada:
      </h5>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: styles.textColor,
          lineHeight: 1.5,
        }}
      >
        {getRecommendationText()}
      </p>
      <p
        style={{
          margin: '8px 0 0 0',
          fontSize: 12,
          color: '#6b7280',
          fontStyle: 'italic',
        }}
      >
        Reglas actuales: Contacto inmediato ≥ {effectiveThresholds.contactoInmediato}% ·
        Segundo intento ≥ {effectiveThresholds.segundoIntento}% · No priorizar &lt;{' '}
        {effectiveThresholds.segundoIntento}%.
      </p>
    </div>
  );
};

export default RecommendationDisplay;
