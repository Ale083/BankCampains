import React from 'react';

/**
 * Componente para mostrar la probabilidad de aceptación en forma de indicador circular
 * similar a un velocímetro
 */
const ProbabilityDisplay = ({ probabilidad = 0, nivel = 'Baja' }) => {
  // Convertir probabilidad a porcentaje (0-100)
  const percentage = Math.round(probabilidad * 100);
  
  // Determinar color según nivel
  const getLevelColor = () => {
    switch (nivel?.toLowerCase()) {
      case 'alta':
        return '#ef4444'; // rojo
      case 'media':
        return '#f59e0b'; // naranja/amarillo
      case 'baja':
      default:
        return '#10b981'; // verde
    }
  };

  const levelColor = getLevelColor();

  // Calcular el ángulo de rotación para la aguja (0° a 180°)
  const angle = (percentage / 100) * 180 - 90;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}>
      {/* Indicador circular tipo velocímetro */}
      <div style={{
        position: 'relative',
        width: 200,
        height: 120,
        marginTop: 20,
      }}>
        {/* Fondo del velocímetro */}
        <svg
          viewBox="0 0 200 120"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          {/* Arco de fondo gris */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />

          {/* Arco de color según el nivel */}
          <path
            d={`M 20 100 A 80 80 0 0 1 ${20 + 160 * (percentage / 100)} ${100 - Math.sqrt(6400 - Math.pow(160 * (percentage / 100) - 80, 2))}`}
            stroke={levelColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />

          {/* Escala de colores: verde-naranja-rojo */}
          <path d="M 20 100 A 80 80 0 0 1 50 25" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M 50 25 A 80 80 0 0 1 150 25" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M 150 25 A 80 80 0 0 1 180 100" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.3" />
        </svg>

        {/* Aguja indicadora */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            width: 4,
            height: 70,
            background: '#1f2937',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            borderRadius: '2px 2px 0 0',
            transition: 'transform 0.5s ease-out',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />

        {/* Centro de la aguja */}
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            left: '50%',
            width: 16,
            height: 16,
            background: '#1f2937',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
      </div>

      {/* Porcentaje y nivel */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}>
        <div style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#1f2937',
        }}>
          {percentage}%
        </div>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: levelColor,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {nivel}
        </div>
      </div>
    </div>
  );
};

export default ProbabilityDisplay;
