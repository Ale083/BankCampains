// frontend/src/cases/AssociatedData.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProbabilityDisplay from '../components/ProbabilityDisplay';
import JustificationDisplay from '../components/JustificationDisplay';
import RecommendationDisplay from '../components/RecommendationDisplay';
import { ProbabilityInterpreter } from '../utils/probabilityStrategies';
import { predictProbability } from '../api/predictions';
import './AssociatedData.css';

/**
 * Normaliza cualquier forma de respuesta de probabilidad
 * a un shape estándar:
 * {
 *   probabilidad: number (0–1),
 *   nivel: string,
 *   threshold_usado: number (0–1),
 *   clase: number
 * }
 */
function normalizeProbabilityData(raw) {
  if (!raw) return null;

  // Por si el wrapper devuelve { data: {...} }
  const data = raw.data ?? raw;

  const prob =
    data.probabilidad ??
    data.probability ??
    data.proba ??
    0;

  const nivel =
    data.nivel ??
    data.level ??
    '';

  const threshold =
    data.threshold_usado ??
    data.threshold_used ??
    data.threshold ??
    0.25;

  const clase =
    data.clase ??
    data.class ??
    0;

  return {
    probabilidad: Number(prob) || 0,
    nivel,
    threshold_usado: Number(threshold) || 0.25,
    clase: Number(clase) || 0,
  };
}

/**
 * Página para mostrar "Datos Asociados" - REQ-3 y REQ-4
 * Permite visualizar la probabilidad de aceptación del producto bancario
 * para un cliente ficticio que viene desde Análisis de casos (si existe).
 */
const AssociatedData = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Cliente y probabilidad que vienen desde Análisis de casos (si vienen)
  const clientFromCases = location.state?.client || null;
  const probabilityFromCasesRaw = location.state?.probabilityData || null;
  const topFeaturesFromCases = location.state?.probabilityData?.top_features || null;

  // Normalizamos lo que viene de Análisis de casos
  const probabilityFromCases = normalizeProbabilityData(probabilityFromCasesRaw);

  // Datos por defecto (solo fallback si entran directo)
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
    nr_employed: 5228.1,
  };

  // Si viene cliente desde casos, usamos ese; si no, usamos el mock
  const effectiveProspectData = clientFromCases || mockProspectData;

  const [probabilityData, setProbabilityData] = useState(probabilityFromCases);
  const [topFeatures, setTopFeatures] = useState(topFeaturesFromCases);
  const [loading, setLoading] = useState(!probabilityFromCases);
  const [loadingJustification, setLoadingJustification] = useState(!topFeaturesFromCases);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  
  useEffect(() => {
    const loadProbability = async () => {
     
      if (hasLoaded || (probabilityFromCases && topFeaturesFromCases)) {
        return;
      }

      setHasLoaded(true);
      setError(null);
      setLoading(!probabilityFromCases);
      setLoadingJustification(!topFeaturesFromCases);

      try {
        const rawResult = await predictProbability(effectiveProspectData);

       
        const normalized = probabilityFromCases || normalizeProbabilityData(rawResult);
        setProbabilityData(normalized);
        
       
        const features = rawResult?.top_features || null;
        setTopFeatures(features);
      } catch (err) {
        setError(
          'Error al calcular la probabilidad. Por favor, intenta de nuevo.'
        );
        console.error('Error loading probability:', err);
      } finally {
        setLoading(false);
        setLoadingJustification(false);
      }
    };

    loadProbability();
  }, [effectiveProspectData, probabilityFromCases, topFeaturesFromCases, hasLoaded]);

  // Obtener interpretación de la probabilidad usando Strategy Pattern
  const getInterpretation = () => {
    if (!probabilityData) return null;
    return ProbabilityInterpreter.interpret(probabilityData.probabilidad);
  };

  const interpretation = getInterpretation();

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header title="Datos Asociados" />

      {/* Componente de justificación */}
      <div style={{ padding: '24px 32px 0 32px' }}>
        {(loadingJustification || !topFeatures) ? (
          <div style={{
            background: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: 12,
            padding: 24,
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p>Calculando justificación...</p>
          </div>
        ) : (
          <JustificationDisplay
            top_features={topFeatures}
            probabilidad={probabilityData?.probabilidad}
            nivel={probabilityData?.nivel}
          />
        )}
      </div>

      {/* Componente de recomendación */}
      <div style={{ padding: '0 32px' }}>
        <RecommendationDisplay
          probabilidad={probabilityData?.probabilidad}
        />
      </div>

      <div
        style={{
          padding: '24px 16px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {(loading && !probabilityFromCases) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              fontSize: 16,
              color: '#6b7280',
            }}
          >
            Calculando probabilidad...
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '16px',
              color: '#991b1b',
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {(!loading || probabilityFromCases) && !error && probabilityData && interpretation && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 24,
              }}
            >
              {/* Tarjeta de Probabilidad de Aceptación */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '32px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gridColumn: '1 / -1',
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#1f2937',
                    marginBottom: 24,
                    textAlign: 'center',
                  }}
                >
                  Probabilidad de Aceptación
                </div>

                {/* Indicador de Probabilidad */}
                <ProbabilityDisplay
                  probabilidad={probabilityData.probabilidad}
                  nivel={interpretation.level}
                />

                {/* Barra de Riesgo (Baja / Media / Alta) */}
                <div
                  style={{
                    marginTop: 32,
                    width: '100%',
                    display: 'flex',
                    gap: 8,
                    justifyContent: 'center',
                  }}
                >
                  {['Baja', 'Media', 'Alta'].map((level) => {
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
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? colors[level] : '#9ca3af',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {level}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Información Adicional */}
                <div
                  style={{
                    marginTop: 32,
                    padding: '16px 24px',
                    background: '#f3f4f6',
                    borderRadius: 8,
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16,
                      fontSize: 14,
                    }}
                  >
                    <div>
                      <div style={{ color: '#6b7280', marginBottom: 4 }}>
                        Decisión
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: interpretation.color,
                        }}
                      >
                        {interpretation.recommendation.decision}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', marginBottom: 4 }}>
                        Threshold
                      </div>
                      <div
                        style={{ fontWeight: 600, color: '#1f2937' }}
                      >
                        {(probabilityData.threshold_usado * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aquí luego podrías mostrar un resumen del cliente effectiveProspectData */}
            </div>

            {/* 🔹 Botón de volver a Análisis de casos (abajo a la derecha) */}
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: 16,
              }}
            >
              <button
                type="button"
                onClick={() => navigate(-1)} // si quieres algo fijo: navigate('/analisis-de-casos')
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #9ca3af',
                  background: '#f9fafb',
                  color: '#374151',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Volver a Análisis de casos
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssociatedData;
