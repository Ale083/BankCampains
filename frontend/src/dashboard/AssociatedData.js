import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ProbabilityDisplay from '../components/ProbabilityDisplay';
import { ProbabilityInterpreter } from '../utils/probabilityStrategies';
import { predictProbability } from '../api/predictions';
import './AssociatedData.css';

/**
 * Página para mostrar "Datos Asociados" - REQ-3 y REQ-4
 * Permite visualizar la probabilidad de aceptación del producto bancario
 */
const AssociatedData = () => {
  const [probabilityData, setProbabilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simulación de datos de prospect para demostración
  // En producción, estos datos vendrían de un formulario o de la sesión del usuario
  const mockProspectData = {
    age: 42,
    job: 'admin.',
    marital: 'married',
    education: 'university.degree',
    default: 'no',
    housing: 'yes',
    loan: 'yes',
    contact: 'cellular',
    month: 'may',
    day_of_week: 'mon',
    campaign: 1,
    pdays: 999,
    previous: 0,
    poutcome: 'nonexistent',
    emp_var_rate: 1.4,
    cons_price_idx: 93.918,
    cons_conf_idx: -42.5,
    euribor3m: 4.963,
    nr_employed: 5228.1
  };


  const loadProbability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictProbability(mockProspectData);
      setProbabilityData(result);
    } catch (err) {
      setError('Error al calcular la probabilidad. Por favor, intenta de nuevo.');
      console.error('Error loading probability:', err);
    } finally {
      setLoading(false);
    }
  }, []);

    // Cargar probabilidad al montar el componente
  useEffect(() => {
    loadProbability();
  }, [loadProbability]);

  // Obtener interpretación de la probabilidad usando Strategy Pattern
  const getInterpretation = () => {
    if (!probabilityData) return null;
    return ProbabilityInterpreter.interpret(probabilityData.probabilidad);
  };

  const interpretation = getInterpretation();

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header title="Datos Asociados" />

      <div style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            fontSize: 16,
            color: '#6b7280',
          }}>
            Calculando probabilidad...
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '16px',
            color: '#991b1b',
            marginBottom: 24,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && probabilityData && interpretation && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 24,
          }}>
            {/* Tarjeta de Probabilidad de Aceptación */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '32px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gridColumn: '1 / -1',
            }}>
              <div style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: 24,
                textAlign: 'center',
              }}>
                Probabilidad de Aceptación
              </div>

              {/* Indicador de Probabilidad */}
              <ProbabilityDisplay
                probabilidad={probabilityData.probabilidad}
                nivel={interpretation.level}
              />

              {/* Barra de Riesgo (Baja / Media / Alta) */}
              <div style={{
                marginTop: 32,
                width: '100%',
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
              }}>
                {['Baja', 'Media', 'Alta'].map(level => {
                  const isActive = level === interpretation.level;
                  const colors = {
                    Baja: '#10b981',
                    Media: '#f59e0b',
                    Alta: '#ef4444',
                  };

                  return (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        maxWidth: 80,
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          height: 8,
                          background: isActive ? colors[level] : '#e5e7eb',
                          borderRadius: 4,
                          marginBottom: 8,
                          transition: 'all 0.3s ease',
                        }}
                      />
                      <div style={{
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? colors[level] : '#9ca3af',
                        transition: 'all 0.3s ease',
                      }}>
                        {level}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Información Adicional */}
              <div style={{
                marginTop: 32,
                padding: '16px 24px',
                background: '#f3f4f6',
                borderRadius: 8,
                width: '100%',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  fontSize: 14,
                }}>
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: 4 }}>Decisión</div>
                    <div style={{
                      fontWeight: 600,
                      color: interpretation.color,
                    }}>
                      {interpretation.recommendation.decision}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: 4 }}>Threshold</div>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>
                      {(probabilityData.threshold_usado * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociatedData;
