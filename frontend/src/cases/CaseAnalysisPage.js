import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

import {
  categoricalOptions,
  numericStats,
  labelMonth,
  labelDayOfWeek,
} from '../utils/bankMetadata';

import {
  getAgeSegment,
  getJobProfile,
  getRiskLevel,
} from '../utils/segments';

import { predictProbability } from '../api/model';



const DATASET_AVG = {
  age: numericStats.age.mean, 
  prob: 0.21,
};

const numericFeatureConfig = [
  { key: 'age', label: 'Edad', statsKey: 'age' },
  {
    key: 'campaign',
    label: 'Número de contactos en campaña (campaign)',
    statsKey: 'campaign',
  },
  {
    key: 'pdays',
    label: 'Días desde el último contacto previo (pdays)',
    statsKey: 'pdays',
  },
  {
    key: 'previous',
    label: 'Número de contactos previos (previous)',
    statsKey: 'previous',
  },
  {
    key: 'emp_var_rate',
    label: 'Tasa variación empleo (emp.var.rate)',
    statsKey: 'emp.var.rate',
  },
  {
    key: 'cons_price_idx',
    label: 'Índice precios al consumidor (cons.price.idx)',
    statsKey: 'cons.price.idx',
  },
  {
    key: 'cons_conf_idx',
    label: 'Índice confianza del consumidor (cons.conf.idx)',
    statsKey: 'cons.conf.idx',
  },
  {
    key: 'euribor3m',
    label: 'Euribor 3 meses (euribor3m)',
    statsKey: 'euribor3m',
  },
  {
    key: 'nr_employed',
    label: 'Número de empleados (nr.employed)',
    statsKey: 'nr.employed',
  },
];

const categoricalFeatureConfig = [
  { key: 'job', label: 'Trabajo (job)' },
  { key: 'marital', label: 'Estado civil (marital)' },
  { key: 'education', label: 'Nivel educativo (education)' },
  { key: 'default', label: 'Default (default)' },
  { key: 'housing', label: 'Préstamo hipotecario (housing)' },
  { key: 'loan', label: 'Préstamo personal (loan)' },
  { key: 'contact', label: 'Canal de contacto (contact)' },
  { key: 'month', label: 'Mes de contacto (month)' },
  { key: 'day_of_week', label: 'Día de la semana (day_of_week)' },
  { key: 'poutcome', label: 'Resultado campaña previa (poutcome)' },
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


const INITIAL_CLIENT = {
  age: Math.round(DATASET_AVG.age),
  job: categoricalOptions.job[0],
  marital: categoricalOptions.marital[2],
  education: categoricalOptions.education[3], 
  default: 'no',
  housing: 'no',
  loan: 'no',
  contact: 'cellular',
  month: 'may',
  day_of_week: 'mon',
  campaign: Math.round(numericStats.campaign.mean),
  pdays: Math.round(numericStats.pdays.mean),
  previous: Math.round(numericStats.previous.mean),
  poutcome: 'nonexistent',
  emp_var_rate: Number(numericStats['emp.var.rate'].mean.toFixed(1)),
  cons_price_idx: Number(numericStats['cons.price.idx'].mean.toFixed(3)),
  cons_conf_idx: Number(numericStats['cons.conf.idx'].mean.toFixed(1)),
  euribor3m: Number(numericStats.euribor3m.mean.toFixed(3)),
  nr_employed: Number(numericStats['nr.employed'].mean.toFixed(1)),
};


function interpretNumericFeature(key, value) {
  const cfg = numericFeatureConfig.find((f) => f.key === key);
  if (!cfg) return '—';

  const stats = numericStats[cfg.statsKey];
  if (!stats || value === '' || value == null || Number.isNaN(value)) {
    return 'Sin dato para esta variable.';
  }

  const { mean, min, max } = stats;
  const range = max - min || 1;
  const diff = value - mean;
  const rel = diff / range;

  if (Math.abs(rel) < 0.05) {
    return 'Muy cercano al promedio del dataset.';
  }
  if (diff > 0) {
    if (rel > 0.4) {
      return 'Valor muy por encima del promedio del dataset.';
    }
    return 'Valor por encima del promedio del dataset.';
  }

  if (rel < -0.4) {
    return 'Valor muy por debajo del promedio del dataset.';
  }
  return 'Valor por debajo del promedio del dataset.';
}

function interpretCategoricalFeature(key, value, client) {
  if (!value) return 'Sin dato para esta variable.';

  if (value === 'unknown') {
    return 'Valor marcado como "unknown": el dataset no tiene información explícita para esta variable.';
  }

  if (key === 'poutcome') {
    if (value === 'success') {
      return 'Campaña previa exitosa: histórico positivo de aceptación.';
    }
    if (value === 'failure') {
      return 'Campaña previa sin éxito: posible menor probabilidad de aceptación.';
    }
    if (value === 'nonexistent') {
      return 'Sin campañas previas registradas: no hay histórico para esta persona.';
    }
  }

  if (key === 'default') {
    if (value === 'yes') {
      return 'Cliente con historial de impago (default): indica alto riesgo financiero.';
    }
    if (value === 'no') {
      return 'Cliente sin historial de impago reportado (default = no).';
    }
  }

  if (key === 'housing' || key === 'loan') {
    const label =
      key === 'housing' ? 'préstamo hipotecario' : 'préstamo personal';
    if (value === 'yes') {
      return `Cliente con ${label}; aumenta el nivel de endeudamiento.`;
    }
    if (value === 'no') {
      return `Cliente sin ${label} vigente según el dataset.`;
    }
  }

  if (key === 'contact') {
    if (value === 'cellular') {
      return 'Canal de contacto: celular. Suele ser más directo y actualizado.';
    }
    if (value === 'telephone') {
      return 'Canal de contacto: teléfono fijo. Podría ser menos efectivo que el celular.';
    }
  }

  if (key === 'month') {
    return `Mes típico de contacto: ${labelMonth(value)}.`;
  }

  if (key === 'day_of_week') {
    return `Día típico de contacto: ${labelDayOfWeek(value)}.`;
  }

  if (key === 'job') {
    const profile = getJobProfile(value);
    return `Ocupación declarada: ${value}. Perfil ocupacional: ${profile}.`;
  }

  if (key === 'marital') {
    return `Estado civil declarado: ${value}.`;
  }

  if (key === 'education') {
    return `Nivel educativo registrado: ${value}.`;
  }

  return `Valor seleccionado: ${value}.`;
}

const CaseAnalysisPage = () => {
  const [draftClient, setDraftClient] = useState(INITIAL_CLIENT);
  const [savedClient, setSavedClient] = useState(null);
  const [clientProb, setClientProb] = useState(null);
  const [clientProbLevel, setClientProbLevel] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    const { type, value } = e.target;
    let parsed = value;

    if (type === 'number') {
      parsed = value === '' ? '' : Number(value);
    }

    setDraftClient((prev) => ({
      ...prev,
      [field]: parsed,
    }));
  };

  const handleSaveClient = async () => {
    setSavedClient(draftClient);

    try {
      setIsCalculating(true);
      const { probability, level } = await predictProbability(draftClient);
      setClientProb(probability);
      setClientProbLevel(level || null);
    } catch (err) {
      console.error(err);
      alert('Error al calcular la probabilidad del cliente.');
    } finally {
      setIsCalculating(false);
    }
  };

  const goToWhatIf = () => {
    if (!savedClient) {
      alert('Primero define y guarda un cliente a evaluar.');
      return;
    }
    navigate('/que-pasaria-si', {
      state: { client: savedClient, baseProb: clientProb },
    });
  };

  const ageInterp = (() => {
    if (!savedClient || savedClient.age == null || savedClient.age === '')
      return '—';
    if (savedClient.age > DATASET_AVG.age + 1) return 'Edad superior al promedio';
    if (savedClient.age < DATASET_AVG.age - 1) return 'Edad inferior al promedio';
    return 'Edad cercana al promedio';
  })();

  const probInterp = (() => {
    if (clientProb == null) return '—';
    if (clientProb >= DATASET_AVG.prob + 0.1)
      return 'Alta probabilidad comparativa frente al promedio del dataset.';
    if (clientProb >= DATASET_AVG.prob - 0.05)
      return 'Probabilidad similar al promedio poblacional.';
    return 'Probabilidad inferior al promedio poblacional.';
  })();

  const ageSegment =
    savedClient && savedClient.age != null
      ? getAgeSegment(savedClient.age)
      : '—';

  const jobProfile =
    savedClient && savedClient.job ? getJobProfile(savedClient.job) : '—';

  const riskLevel = savedClient
    ? getRiskLevel({
        default: savedClient.default,
        housing: savedClient.housing,
        loan: savedClient.loan,
      })
    : '—';

  return (
    <>
      <Header title="Análisis de casos" showNavbar={true} />

      <div
        style={{
          display: 'flex',
          padding: '24px 32px',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 2 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <span style={{ marginRight: 12, fontWeight: 600 }}>
              Cliente a evaluar:
            </span>
            <button
              type="button"
              style={btnPrimary}
              onClick={handleSaveClient}
              disabled={isCalculating}
            >
              {isCalculating
                ? 'Calculando...'
                : savedClient
                ? 'Actualizar cliente base'
                : 'Guardar cliente base'}
            </button>
          </div>

          <h3 style={{ margin: '0 0 8px 0' }}>Comparador contra el cliente promedio</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#4b5563' }}>
            Para cada variable numérica se compara el valor del cliente contra el
            promedio del dataset y se genera una interpretación automática.
          </p>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: 16,
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
                  Variable
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Cliente
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px',
                    textAlign: 'left',
                    fontStyle: 'italic',
                  }}
                >
                  Promedio dataset
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Interpretación
                </th>
              </tr>
            </thead>
            <tbody>
              {numericFeatureConfig.map((cfg) => {
                const value = savedClient ? savedClient[cfg.key] : null;
                const stats = numericStats[cfg.statsKey];
                const mean = stats?.mean ?? null;
                const displayClient =
                  value === '' || value == null ? '—' : value;
                const displayMean =
                  mean == null ? '—' : mean.toFixed(2).replace('.', ',');

                return (
                  <tr key={cfg.key}>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {cfg.label}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {displayClient}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {displayMean}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {savedClient
                        ? cfg.key === 'age'
                          ? ageInterp
                          : interpretNumericFeature(cfg.key, value)
                        : 'Defina y guarde un cliente para ver la interpretación.'}
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                  Probabilidad estimada
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                  {clientProb != null ? clientProb.toFixed(2) : '—'}
                  {clientProbLevel && (
                    <span style={{ marginLeft: 4, fontSize: 12 }}>
                      ({clientProbLevel})
                    </span>
                  )}
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                  {DATASET_AVG.prob.toFixed(2)}
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                  {probInterp}
                </td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ margin: '16px 0 8px 0' }}>Interpretación de variables categóricas</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#4b5563' }}>
            Se describen las variables categóricas relevantes del cliente y su
            significado dentro del contexto del modelo.
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
                  Variable
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Valor del cliente
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Comentario / interpretación
                </th>
              </tr>
            </thead>
            <tbody>
              {categoricalFeatureConfig.map((cfg) => {
                const value = savedClient ? savedClient[cfg.key] : null;
                return (
                  <tr key={cfg.key}>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {cfg.label}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {value || '—'}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {savedClient
                        ? interpretCategoricalFeature(cfg.key, value, savedClient)
                        : 'Defina y guarde un cliente para ver la interpretación.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          style={{
            flex: 2,
            background: '#e5e7eb',
            padding: '16px 20px',
            borderRadius: 8,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Datos del cliente</h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
              fontSize: 14,
            }}
          >
            <div>
              <label>
                Edad<br />
                <input
                  type="number"
                  min={17}
                  max={98}
                  value={draftClient.age}
                  onChange={handleChange('age')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <div>
              <label>
                Trabajo (job)<br />
                <select
                  value={draftClient.job}
                  onChange={handleChange('job')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.job.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Estado civil (marital)<br />
                <select
                  value={draftClient.marital}
                  onChange={handleChange('marital')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.marital.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Educación (education)<br />
                <select
                  value={draftClient.education}
                  onChange={handleChange('education')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.education.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Default (default)<br />
                <select
                  value={draftClient.default}
                  onChange={handleChange('default')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.default.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Préstamo hipotecario (housing)<br />
                <select
                  value={draftClient.housing}
                  onChange={handleChange('housing')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.housing.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Préstamo personal (loan)<br />
                <select
                  value={draftClient.loan}
                  onChange={handleChange('loan')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.loan.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Canal de contacto (contact)<br />
                <select
                  value={draftClient.contact}
                  onChange={handleChange('contact')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.contact.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Mes de contacto (month)<br />
                <select
                  value={draftClient.month}
                  onChange={handleChange('month')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.month.map((opt) => (
                    <option key={opt} value={opt}>
                      {labelMonth(opt)} ({opt})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Día de la semana (day_of_week)<br />
                <select
                  value={draftClient.day_of_week}
                  onChange={handleChange('day_of_week')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.day_of_week.map((opt) => (
                    <option key={opt} value={opt}>
                      {labelDayOfWeek(opt)} ({opt})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Número de contactos en campaña (campaign)<br />
                <input
                  type="number"
                  min={1}
                  max={56}
                  value={draftClient.campaign}
                  onChange={handleChange('campaign')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <div>
              <label>
                Días desde contacto previo (pdays)<br />
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={draftClient.pdays}
                  onChange={handleChange('pdays')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <div>
              <label>
                Número de contactos previos (previous)<br />
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={draftClient.previous}
                  onChange={handleChange('previous')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <div>
              <label>
                Resultado campaña previa (poutcome)<br />
                <select
                  value={draftClient.poutcome}
                  onChange={handleChange('poutcome')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                >
                  {categoricalOptions.poutcome.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Tasa variación empleo (emp.var.rate)<br />
                <input
                  type="number"
                  step="0.1"
                  value={draftClient.emp_var_rate}
                  onChange={handleChange('emp_var_rate')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <div>
              <label>
                Índice precios consumo (cons.price.idx)<br />
                <input
                  type="number"
                  step="0.001"
                  value={draftClient.cons_price_idx}
                  onChange={handleChange('cons_price_idx')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <div>
              <label>
                Índice confianza consumidor (cons.conf.idx)<br />
                <input
                  type="number"
                  step="0.1"
                  value={draftClient.cons_conf_idx}
                  onChange={handleChange('cons_conf_idx')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <div>
              <label>
                Euribor 3 meses (euribor3m)<br />
                <input
                  type="number"
                  step="0.001"
                  value={draftClient.euribor3m}
                  onChange={handleChange('euribor3m')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <div>
              <label>
                Número de empleados (nr.employed)<br />
                <input
                  type="number"
                  step="0.1"
                  value={draftClient.nr_employed}
                  onChange={handleChange('nr_employed')}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>
          </div>

          <h4 style={{ marginTop: 18 }}>Segmentos del cliente</h4>
          <ul style={{ marginTop: 4, color: '#4b5563', fontSize: 14 }}>
            <li>
              Segmento por edad: <strong>{ageSegment}</strong>
            </li>
            <li>
              Perfil ocupacional: <strong>{jobProfile}</strong>
            </li>
            <li>
              Nivel de riesgo financiero: <strong>{riskLevel}</strong>
            </li>
          </ul>
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
        <button type="button" style={btnPrimary} onClick={goToWhatIf}>
          ¿Qué pasaría si?
        </button>
      </div>
    </>
  );
};

export default CaseAnalysisPage;
