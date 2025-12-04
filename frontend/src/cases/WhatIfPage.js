import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { predictProbability } from '../api/model';
import {
  categoricalOptions,
  numericStats,
  labelMonth,
  labelDayOfWeek,
} from '../utils/bankMetadata';

const VARIABLE_CONFIG = [
  {
    key: 'age',
    label: 'Edad',
    type: 'numeric',
    min: numericStats.age.min,
    max: numericStats.age.max,
    step: 1,
  },
  {
    key: 'campaign',
    label: 'Número de contactos en campaña (campaign)',
    type: 'numeric',
    min: numericStats.campaign.min,
    max: numericStats.campaign.max,
    step: 1,
  },
  {
    key: 'pdays',
    label: 'Días desde el último contacto previo (pdays)',
    type: 'numeric',
    min: numericStats.pdays.min,
    max: numericStats.pdays.max,
    step: 1,
  },
  {
    key: 'previous',
    label: 'Número de contactos previos (previous)',
    type: 'numeric',
    min: numericStats.previous.min,
    max: numericStats.previous.max,
    step: 1,
  },
  {
    key: 'emp_var_rate',
    label: 'Tasa de variación del empleo (emp.var.rate)',
    type: 'numeric',
    min: numericStats['emp.var.rate'].min,
    max: numericStats['emp.var.rate'].max,
    step: 0.1,
  },
  {
    key: 'cons_price_idx',
    label: 'Índice de precios al consumo (cons.price.idx)',
    type: 'numeric',
    min: numericStats['cons.price.idx'].min,
    max: numericStats['cons.price.idx'].max,
    step: 0.001,
  },
  {
    key: 'cons_conf_idx',
    label: 'Índice de confianza del consumidor (cons.conf.idx)',
    type: 'numeric',
    min: numericStats['cons.conf.idx'].min,
    max: numericStats['cons.conf.idx'].max,
    step: 0.1,
  },
  {
    key: 'euribor3m',
    label: 'Euribor 3 meses (euribor3m)',
    type: 'numeric',
    min: numericStats.euribor3m.min,
    max: numericStats.euribor3m.max,
    step: 0.001,
  },
  {
    key: 'nr_employed',
    label: 'Número de empleados (nr.employed)',
    type: 'numeric',
    min: numericStats['nr.employed'].min,
    max: numericStats['nr.employed'].max,
    step: 0.1,
  },

  { key: 'job', label: 'Trabajo (job)', type: 'categorical', optionsKey: 'job' },
  {
    key: 'marital',
    label: 'Estado civil (marital)',
    type: 'categorical',
    optionsKey: 'marital',
  },
  {
    key: 'education',
    label: 'Nivel educativo (education)',
    type: 'categorical',
    optionsKey: 'education',
  },
  {
    key: 'default',
    label: 'Default (default)',
    type: 'categorical',
    optionsKey: 'default',
  },
  {
    key: 'housing',
    label: 'Préstamo hipotecario (housing)',
    type: 'categorical',
    optionsKey: 'housing',
  },
  {
    key: 'loan',
    label: 'Préstamo personal (loan)',
    type: 'categorical',
    optionsKey: 'loan',
  },
  {
    key: 'contact',
    label: 'Canal de contacto (contact)',
    type: 'categorical',
    optionsKey: 'contact',
  },
  {
    key: 'month',
    label: 'Mes de contacto (month)',
    type: 'categorical',
    optionsKey: 'month',
  },
  {
    key: 'day_of_week',
    label: 'Día de la semana (day_of_week)',
    type: 'categorical',
    optionsKey: 'day_of_week',
  },
  {
    key: 'poutcome',
    label: 'Resultado campaña previa (poutcome)',
    type: 'categorical',
    optionsKey: 'poutcome',
  },
];

const btnPrimary = {
  padding: '8px 16px',
  borderRadius: 6,
  border: 'none',
  background: '#4f46e5',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnSecondary = {
  padding: '8px 16px',
  borderRadius: 6,
  border: '1px solid #9ca3af',
  background: '#f9fafb',
  color: '#374151',
  fontWeight: 500,
  cursor: 'pointer',
};

// 🔹 Claves compartidas con CaseAnalysisPage y AssociatedData
const BASE_CLIENT_KEY = 'bankApp_baseClient';
const BASE_CLIENT_PROB_KEY = 'bankApp_baseClientProb';

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return '—';

  if (key === 'month') return `${labelMonth(value)} (${value})`;
  if (key === 'day_of_week') return `${labelDayOfWeek(value)} (${value})`;

  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toString() : value.toFixed(3);
  }

  return String(value);
}

const WhatIfPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Estado del cliente base: primero intentamos tomarlo de location.state
  const [baseClient, setBaseClient] = useState(location.state?.client || null);

  // 🔹 Probabilidad base: primero intentamos tomarla de location.state
  const initialBaseProbFromNav = location.state?.baseProb ?? null;
  const [baseProb, setBaseProb] = useState(initialBaseProbFromNav);

  const [hydrationDone, setHydrationDone] = useState(false);

  const [selectedKey, setSelectedKey] = useState('contact');
  const [simValue, setSimValue] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [scenarios, setScenarios] = useState([]);

  // 🔹 1. Hidratar cliente base desde localStorage si no vino por navegación
  useEffect(() => {
    if (baseClient) {
      // Ya tenemos cliente (desde navegación), solo marcamos que terminamos de hidratar
      setHydrationDone(true);
      return;
    }

    try {
      const storedClient = localStorage.getItem(BASE_CLIENT_KEY);
      if (storedClient) {
        const parsed = JSON.parse(storedClient);
        setBaseClient(parsed);
      }
    } catch (e) {
      console.error(
        'Error leyendo cliente base desde localStorage en WhatIfPage',
        e
      );
    } finally {
      setHydrationDone(true);
    }
  }, [baseClient]);

  // 🔹 2. Una vez que ya intentamos hidratar, si NO hay cliente, avisamos
  useEffect(() => {
    if (!hydrationDone) return;
    if (!baseClient) {
      alert(
        'Para usar "¿Qué pasaría si?" primero debes definir y guardar un cliente base en la pantalla de Análisis de casos.'
      );
    }
  }, [hydrationDone, baseClient]);

  // 🔹 3. Hidratar probabilidad base desde localStorage si no vino por navegación
  useEffect(() => {
    if (!hydrationDone) return;
    if (baseProb != null) return; // ya la tenemos (navegación o cálculo previo)

    try {
      const storedProb = localStorage.getItem(BASE_CLIENT_PROB_KEY);
      if (storedProb) {
        const parsed = JSON.parse(storedProb);
        const prob =
          parsed.probabilidad ??
          parsed.probability ??
          parsed.proba ??
          null;

        if (prob != null) {
          setBaseProb(Number(prob));
          return;
        }
      }
    } catch (e) {
      console.error(
        'Error leyendo probabilidad base desde localStorage en WhatIfPage',
        e
      );
    }
  }, [hydrationDone, baseProb]);

  // 🔹 4. Sin probabilidad base aún -> la calculamos con el modelo
  useEffect(() => {
    const fetchBaseProb = async () => {
      if (!hydrationDone) return;
      if (!baseClient) return;
      if (baseProb != null) return;

      try {
        const result = await predictProbability(baseClient);
        const prob =
          result.probabilidad ??
          result.probability ??
          result.proba ??
          result.prob ??
          null;

        if (prob != null) {
          setBaseProb(Number(prob));
        } else {
          console.warn(
            'Respuesta de predictProbability sin campo claro de probabilidad:',
            result
          );
        }
      } catch (err) {
        console.error(err);
        alert('No se pudo calcular la probabilidad base del cliente.');
      }
    };

    fetchBaseProb();
  }, [hydrationDone, baseClient, baseProb]);

  // 🔹 Sincronizar valor simulado cuando cambia la variable seleccionada o el cliente base
  useEffect(() => {
    if (!baseClient) return;
    setSimValue(baseClient[selectedKey]);
  }, [baseClient, selectedKey]);

  const selectedConfig = useMemo(
    () => VARIABLE_CONFIG.find((v) => v.key === selectedKey),
    [selectedKey]
  );

  const handleSimValueChange = (e) => {
    if (!selectedConfig) return;
    const { type, value } = e.target;

    if (selectedConfig.type === 'numeric') {
      const parsed =
        value === '' ? '' : type === 'number' ? Number(value) : Number(value);
      setSimValue(parsed);
    } else {
      setSimValue(value);
    }
  };

  const handleRecalculate = async () => {
    if (!baseClient || !selectedConfig) return;

    const modifiedClient = {
      ...baseClient,
      [selectedKey]:
        simValue === '' || simValue === null ? baseClient[selectedKey] : simValue,
    };

    try {
      setIsCalculating(true);
      const result = await predictProbability(modifiedClient);
      const newProb =
        result.probabilidad ??
        result.probability ??
        result.proba ??
        result.prob ??
        0;

      const scenario = {
        variableKey: selectedKey,
        variableLabel: selectedConfig.label,
        oldValue: baseClient[selectedKey],
        newValue: modifiedClient[selectedKey],
        baseProb: baseProb,
        newProb: Number(newProb),
      };

      setScenarios((prev) => [scenario, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Error al recalcular la probabilidad para el escenario simulado.');
    } finally {
      setIsCalculating(false);
    }
  };

  const effectiveSimValue =
    simValue === '' || simValue === null
      ? baseClient?.[selectedKey] ?? ''
      : simValue;

  return (
    <>
      <Header title="¿Qué pasaría si?" showNavbar={true} />

      <div
        style={{
          display: 'flex',
          padding: '24px 32px',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 2 }}>
          <h3 style={{ marginTop: 0 }}>Escenario a evaluar:</h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 600 }}>Variable a modificar:</span>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              style={{
                padding: 6,
                borderRadius: 4,
                border: '1px solid #d1d5db',
                minWidth: 260,
              }}
            >
              {VARIABLE_CONFIG.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {selectedConfig && baseClient && (
            <div
              style={{
                display: 'flex',
                gap: 24,
                alignItems: 'flex-end',
                marginBottom: 16,
              }}
            >
              <div>
                <label style={{ fontSize: 13, color: '#4b5563' }}>
                  Valor actual del cliente
                  <div
                    style={{
                      marginTop: 4,
                      padding: '6px 10px',
                      borderRadius: 4,
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      minWidth: 160,
                    }}
                  >
                    {formatValue(selectedKey, baseClient[selectedKey])}
                  </div>
                </label>
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#4b5563' }}>
                  Valor simulado
                  <div style={{ marginTop: 4 }}>
                    {selectedConfig.type === 'numeric' ? (
                      <input
                        type="number"
                        value={effectiveSimValue}
                        onChange={handleSimValueChange}
                        min={selectedConfig.min}
                        max={selectedConfig.max}
                        step={selectedConfig.step}
                        style={{
                          padding: 6,
                          borderRadius: 4,
                          border: '1px solid #d1d5db',
                          minWidth: 160,
                        }}
                      />
                    ) : (
                      <select
                        value={effectiveSimValue}
                        onChange={handleSimValueChange}
                        style={{
                          padding: 6,
                          borderRadius: 4,
                          border: '1px solid #d1d5db',
                          minWidth: 200,
                        }}
                      >
                        {categoricalOptions[selectedConfig.optionsKey].map(
                          (opt) => (
                            <option key={opt} value={opt}>
                              {formatValue(selectedKey, opt)}
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </div>
                </label>
              </div>

              <div>
                <button
                  type="button"
                  style={btnPrimary}
                  onClick={handleRecalculate}
                  disabled={isCalculating || !baseClient || baseProb == null}
                >
                  {isCalculating
                    ? 'Recalculando...'
                    : 'Recalcular probabilidad'}
                </button>
              </div>
            </div>
          )}

          <h4 style={{ margin: '8px 0' }}>Resultados de simulación</h4>
          <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#4b5563' }}>
            Cada fila representa un escenario de “¿qué pasaría si?” modificando
            una sola variable del cliente base.
          </p>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Variable modificada
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Valor actual
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Valor simulado
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Probabilidad resultante
                </th>
              </tr>
            </thead>
            <tbody>
              {scenarios.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      border: '1px solid #d1d5db',
                      padding: '8px',
                      textAlign: 'center',
                      color: '#6b7280',
                      fontSize: 14,
                    }}
                  >
                    Aún no has simulado ningún cambio. Modifica una variable y
                    haz clic en &quot;Recalcular probabilidad&quot;.
                  </td>
                </tr>
              ) : (
                scenarios.map((s, idx) => (
                  <tr key={idx}>
                    <td
                      style={{
                        border: '1px solid #d1d5db',
                        padding: '8px',
                      }}
                    >
                      {s.variableLabel}
                    </td>
                    <td
                      style={{
                        border: '1px solid #d1d5db',
                        padding: '8px',
                      }}
                    >
                      {formatValue(s.variableKey, s.oldValue)}
                    </td>
                    <td
                      style={{
                        border: '1px solid #d1d5db',
                        padding: '8px',
                      }}
                    >
                      {formatValue(s.variableKey, s.newValue)}
                    </td>
                    <td
                      style={{
                        border: '1px solid #d1d5db',
                        padding: '8px',
                      }}
                    >
                      {s.baseProb != null
                        ? `${s.baseProb.toFixed(2)} → ${s.newProb.toFixed(2)}`
                        : s.newProb.toFixed(2)}
                      {s.baseProb != null && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 12,
                            color:
                              s.newProb - s.baseProb >= 0
                                ? '#047857'
                                : '#b91c1c',
                          }}
                        >
                          {s.newProb - s.baseProb >= 0 ? '+' : ''}
                          {((s.newProb - s.baseProb) * 100).toFixed(1)} pp
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            flex: 1.1,
            background: '#e5e7eb',
            padding: '16px 20px',
            borderRadius: 8,
            minHeight: 320,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>
            Resumen del cliente
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: 12,
              rowGap: 8,
              fontSize: 14,
            }}
          >
            <div style={{ fontWeight: 600 }}>Cliente base</div>
            <div style={{ fontWeight: 600 }}>Simulación</div>

            <div>
              <strong>Edad:</strong>{' '}
              {baseClient ? formatValue('age', baseClient.age) : '—'}
            </div>
            <div>
              <strong>Edad:</strong>{' '}
              {baseClient
                ? formatValue(
                    'age',
                    selectedKey === 'age' ? effectiveSimValue : baseClient.age
                  )
                : '—'}
            </div>

            <div>
              <strong>Trabajo:</strong>{' '}
              {baseClient ? formatValue('job', baseClient.job) : '—'}
            </div>
            <div>
              <strong>Trabajo:</strong>{' '}
              {baseClient
                ? formatValue(
                    'job',
                    selectedKey === 'job' ? effectiveSimValue : baseClient.job
                  )
                : '—'}
            </div>

            <div>
              <strong>Contacto:</strong>{' '}
              {baseClient ? formatValue('contact', baseClient.contact) : '—'}
            </div>
            <div>
              <strong>Contacto:</strong>{' '}
              {baseClient
                ? formatValue(
                    'contact',
                    selectedKey === 'contact'
                      ? effectiveSimValue
                      : baseClient.contact
                  )
                : '—'}
            </div>

            <div>
              <strong>Mes:</strong>{' '}
              {baseClient ? formatValue('month', baseClient.month) : '—'}
            </div>
            <div>
              <strong>Mes:</strong>{' '}
              {baseClient
                ? formatValue(
                    'month',
                    selectedKey === 'month'
                      ? effectiveSimValue
                      : baseClient.month
                  )
                : '—'}
            </div>

            <div>
              <strong>Campaña previa:</strong>{' '}
              {baseClient
                ? formatValue('poutcome', baseClient.poutcome)
                : '—'}
            </div>
            <div>
              <strong>Campaña previa:</strong>{' '}
              {baseClient
                ? formatValue(
                    'poutcome',
                    selectedKey === 'poutcome'
                      ? effectiveSimValue
                      : baseClient.poutcome
                  )
                : '—'}
            </div>

            <div style={{ marginTop: 12 }}>
              <strong>Probabilidad base:</strong>{' '}
              {baseProb != null ? baseProb.toFixed(3) : '—'}
            </div>
            <div style={{ marginTop: 12 }}>
              <strong>Última simulación:</strong>{' '}
              {scenarios.length > 0 ? scenarios[0].newProb.toFixed(3) : '—'}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '0 32px 24px 32px',
          gap: 8,
        }}
      >
        <button type="button" style={btnSecondary} onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </>
  );
};

export default WhatIfPage;
