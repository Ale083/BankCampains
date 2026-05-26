// frontend/src/cases/AssociatedData.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProbabilityDisplay from '../components/ProbabilityDisplay';
import JustificationDisplay from '../components/JustificationDisplay';
import RecommendationDisplay from '../components/RecommendationDisplay';
import { ProbabilityInterpreter } from '../utils/probabilityStrategies';
import { clientEvaluator } from '../utils/clientEvaluationTemplate';
import AccessFacade from '../auth/AccessFacade';
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

// 🔹 Claves compartidas con CaseAnalysisPage para cliente base
const BASE_CLIENT_KEY = 'bankApp_baseClient';

// 🔹 Datos por defecto (solo fallback si no hay nada guardado ni viene de Análisis de casos)
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

const AssociatedData = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Cliente y probabilidad que vienen desde Análisis de casos (si vienen)
  const clientFromCases = location.state?.client || null;
  const probabilityFromCasesRaw = location.state?.probabilityData || null;
  const topFeaturesFromCases =
    location.state?.probabilityData?.top_features || null;

  const probabilityFromCases = normalizeProbabilityData(
    probabilityFromCasesRaw
  );

  // Cliente efectivo
  const [effectiveProspectData, setEffectiveProspectData] = useState(
    clientFromCases || null
  );

  const [probabilityData, setProbabilityData] = useState(
    probabilityFromCases
  );
  const [topFeatures, setTopFeatures] = useState(topFeaturesFromCases);
  const [loading, setLoading] = useState(!probabilityFromCases);
  const [loadingJustification, setLoadingJustification] = useState(
    !topFeaturesFromCases
  );
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [showThresholdConfig, setShowThresholdConfig] = useState(false);
  const [thresholds, setThresholds] = useState({
    contactoInmediato: 75,
    segundoIntento: 50,
    noPriorizar: 50,
  });

  // 🔹 Nuevo: umbral de decisión del modelo (para "Se predice Sí")
  const [modelDecisionThreshold, setModelDecisionThreshold] = useState(75);

  // Resolver cliente
  useEffect(() => {
    if (clientFromCases) {
      return;
    }

    try {
      const storedClient = localStorage.getItem(BASE_CLIENT_KEY);
      if (storedClient) {
        const parsed = JSON.parse(storedClient);
        setEffectiveProspectData(parsed);
        return;
      }
    } catch (err) {
      console.error(
        'Error leyendo cliente base desde localStorage en Datos Asociados:',
        err
      );
    }

    setEffectiveProspectData(mockProspectData);
  }, [clientFromCases]);

  // Calcular probabilidad si hace falta
  useEffect(() => {
    const loadProbability = async () => {
      if (
        hasLoaded ||
        !effectiveProspectData ||
        (probabilityFromCases && topFeaturesFromCases)
      ) {
        return;
      }

      setHasLoaded(true);
      setError(null);
      setLoading(!probabilityFromCases);
      setLoadingJustification(!topFeaturesFromCases);

      try {
        const fullResult = await clientEvaluator.evaluateClient(
          effectiveProspectData
        );

        const prediction = fullResult.prediction || {};
        const normalized =
          probabilityFromCases || normalizeProbabilityData(prediction);
        setProbabilityData(normalized);

        const features = prediction.top_features || null;
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
  }, [
    effectiveProspectData,
    probabilityFromCases,
    topFeaturesFromCases,
    hasLoaded,
  ]);

  // Cargar thresholds y umbral de modelo desde localStorage
  useEffect(() => {
    const STORAGE_KEY = 'bankCampains_contact_thresholds';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThresholds({
          contactoInmediato: Math.round(
            (parsed.contactoInmediato || 0.75) * 100
          ),
          segundoIntento: Math.round((parsed.segundoIntento || 0.5) * 100),
          noPriorizar: Math.round((parsed.noPriorizar || 0.5) * 100),
        });

        if (parsed.modelDecisionUmbral != null) {
          setModelDecisionThreshold(
            Math.round((parsed.modelDecisionUmbral || 0.75) * 100)
          );
        }
      } catch (error) {
        console.error('Error loading thresholds:', error);
      }
    }
  }, []);

  const updateThreshold = (key, value) => {
    if (!AccessFacade.puedeDefinirValoresParametricos()) {
      return;
    }

    const numValue = parseInt(value, 10);
    if (Number.isNaN(numValue) || numValue < 0 || numValue > 100) return;

    setThresholds((prev) => ({
      ...prev,
      [key]: numValue,
    }));
  };

  const updateModelDecisionThreshold = (value) => {
    if (!AccessFacade.puedeDefinirValoresParametricos()) {
      return;
    }

    const numValue = parseInt(value, 10);
    if (Number.isNaN(numValue) || numValue < 1 || numValue > 100) return;

    setModelDecisionThreshold(numValue);
  };

  const saveThresholds = () => {
    if (!AccessFacade.puedeDefinirValoresParametricos()) {
      alert('No tienes permisos para modificar los umbrales de contacto');
      return;
    }

    if (thresholds.contactoInmediato <= thresholds.segundoIntento) {
      alert(
        'El umbral de "Contacto Inmediato" debe ser mayor que "Segundo Intento"'
      );
      return;
    }

    try {
      const STORAGE_KEY = 'bankCampains_contact_thresholds';
      const configForBackend = {
        contactoInmediato: thresholds.contactoInmediato / 100,
        segundoIntento: thresholds.segundoIntento / 100,
        noPriorizar: thresholds.noPriorizar / 100,
        modelDecisionUmbral: modelDecisionThreshold / 100,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(configForBackend));

      window.dispatchEvent(
        new CustomEvent('contactThresholdsUpdated', {
          detail: configForBackend,
        })
      );

      alert('Umbrales guardados exitosamente');
      setShowThresholdConfig(false);
    } catch (error) {
      console.error('Error saving thresholds:', error);
      alert('Error al guardar los umbrales');
    }
  };

  const getInterpretation = () => {
    if (!probabilityData) return null;
    // Aquí usamos el umbral configurable del modelo
    return ProbabilityInterpreter.interpret(
      probabilityData.probabilidad,
      {
        contactoInmediato: modelDecisionThreshold,
        segundoIntento: thresholds.segundoIntento,
      }
    );
  };

  const interpretation = getInterpretation();

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header title="Datos Asociados" />

      <div
        style={{
          padding: '24px 16px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {loading && !probabilityFromCases && (
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

        {(!loading || probabilityFromCases) &&
          !error &&
          probabilityData &&
          interpretation && (
            <>
              {/* Layout lado a lado: Probabilidad y Justificación */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: 24,
                  marginBottom: 24,
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
                              background: isActive
                                ? colors[level]
                                : '#e5e7eb',
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
                        <div
                          style={{
                            color: '#6b7280',
                            marginBottom: 4,
                          }}
                        >
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
                        <div
                          style={{
                            color: '#6b7280',
                            marginBottom: 4,
                          }}
                        >
                          Threshold base modelo
                        </div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#1f2937',
                          }}
                        >
                          {(
                            probabilityData.threshold_usado * 100
                          ).toFixed(2)}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Justificación */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '32px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  {loadingJustification || !topFeatures ? (
                    <div
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        padding: 24,
                        textAlign: 'center',
                        color: '#6b7280',
                      }}
                    >
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
              </div>

              {/* Componente de recomendación - ancho completo */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  marginBottom: 24,
                }}
              >
                <RecommendationDisplay
                  probabilidad={probabilityData?.probabilidad}
                  thresholds={thresholds}
                />

                {/* Botón para cambiar umbrales - solo si tiene permisos */}
                {AccessFacade.puedeDefinirValoresParametricos() && (
                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      onClick={() =>
                        setShowThresholdConfig(!showThresholdConfig)
                      }
                      style={{
                        padding: '12px 20px',
                        border: '1px solid #3b82f6',
                        background: 'transparent',
                        color: '#3b82f6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>Cambiar Umbrales</span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '400',
                          color: '#6b7280',
                        }}
                      >
                        Contacto Inmediato: {thresholds.contactoInmediato}%-
                        100% | Segundo Intento: {thresholds.segundoIntento}%-
                        {thresholds.contactoInmediato - 1}% | No Priorizar: 0%-
                        {thresholds.segundoIntento - 1}%
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Panel de configuración de umbrales - solo si tiene permisos */}
              {showThresholdConfig &&
                AccessFacade.puedeDefinirValoresParametricos() && (
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      padding: '24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      marginBottom: 24,
                      border: '2px solid #3b82f6',
                    }}
                  >
                    <h3
                      style={{
                        margin: '0 0 16px 0',
                        color: '#1f2937',
                        fontSize: '18px',
                      }}
                    >
                      Cambiar Umbrales de Contacto y Modelo
                    </h3>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px',
                      }}
                    >
                      {/* Contacto Inmediato */}
                      <div
                        style={{
                          border: '2px solid #ef4444',
                          borderRadius: '8px',
                          padding: '16px',
                          background: '#fef2f2',
                        }}
                      >
                        <h4
                          style={{
                            margin: '0 0 8px 0',
                            color: '#ef4444',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}
                        >
                          Contacto Inmediato
                        </h4>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={thresholds.contactoInmediato}
                            onChange={(e) =>
                              updateThreshold(
                                'contactoInmediato',
                                e.target.value
                              )
                            }
                            style={{
                              padding: '8px',
                              border: '1px solid #ef4444',
                              borderRadius: '4px',
                              width: '60px',
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: '600',
                            }}
                          />
                          <span
                            style={{ fontSize: '14px', color: '#ef4444' }}
                          >
                            % - 100%
                          </span>
                        </div>
                      </div>

                      {/* Segundo Intento */}
                      <div
                        style={{
                          border: '2px solid #f59e0b',
                          borderRadius: '8px',
                          padding: '16px',
                          background: '#fffbeb',
                        }}
                      >
                        <h4
                          style={{
                            margin: '0 0 8px 0',
                            color: '#f59e0b',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}
                        >
                          Segundo Intento
                        </h4>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={thresholds.segundoIntento}
                            onChange={(e) =>
                              updateThreshold(
                                'segundoIntento',
                                e.target.value
                              )
                            }
                            style={{
                              padding: '8px',
                              border: '1px solid #f59e0b',
                              borderRadius: '4px',
                              width: '60px',
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: '600',
                            }}
                          />
                          <span
                            style={{ fontSize: '14px', color: '#f59e0b' }}
                          >
                            % - {thresholds.contactoInmediato - 1}%
                          </span>
                        </div>
                      </div>

                      {/* No Priorizar */}
                      <div
                        style={{
                          border: '2px solid #6b7280',
                          borderRadius: '8px',
                          padding: '16px',
                          background: '#f9fafb',
                        }}
                      >
                        <h4
                          style={{
                            margin: '0 0 8px 0',
                            color: '#6b7280',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}
                        >
                          No Priorizar
                        </h4>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              width: '60px',
                              textAlign: 'center',
                              fontSize: '14px',
                              background: '#f3f4f6',
                              color: '#6b7280',
                              fontWeight: '600',
                            }}
                          >
                            0
                          </span>
                          <span
                            style={{ fontSize: '14px', color: '#6b7280' }}
                          >
                            % - {thresholds.segundoIntento - 1}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nuevo bloque: umbral de decisión del modelo */}
                    <div
                      style={{
                        marginBottom: '24px',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '2px dashed #3b82f6',
                        background: '#eff6ff',
                      }}
                    >
                      <h4
                        style={{
                          margin: '0 0 8px 0',
                          color: '#1d4ed8',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}
                      >
                        Umbral de decisión del modelo (Se predice "Sí")
                      </h4>
                      <p
                        style={{
                          margin: '0 0 8px 0',
                          fontSize: '12px',
                          color: '#1e40af',
                        }}
                      >
                        Este umbral controla a partir de qué probabilidad el
                        modelo interpreta la clasificación como "Se predice Sí".
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={modelDecisionThreshold}
                          onChange={(e) =>
                            updateModelDecisionThreshold(e.target.value)
                          }
                          style={{
                            padding: '8px',
                            border: '1px solid #3b82f6',
                            borderRadius: '4px',
                            width: '80px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}
                        />
                        <span
                          style={{ fontSize: '14px', color: '#1e40af' }}
                        >
                          % (por defecto: 75%)
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <button
                        onClick={() => setShowThresholdConfig(false)}
                        style={{
                          padding: '10px 16px',
                          border: '1px solid #9ca3af',
                          background: 'transparent',
                          color: '#374151',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                      >
                        Cancelar
                      </button>

                      <button
                        onClick={saveThresholds}
                        style={{
                          padding: '10px 16px',
                          border: 'none',
                          background: '#3b82f6',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px',
                        }}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}

              {/* 🔹 Botón de volver a Análisis de casos */}
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
                  onClick={() => navigate(-1)}
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
