import React, { useMemo, useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { createSavedFilter } from '../api/savedFilters';

const LABEL = {
  demografia: 'Demografía',
  credito: 'Crédito y riesgo',
  campania: 'Campaña actual',
  historial: 'Historial de campañas',
  macro: 'Contexto macroeconómico',
  objetivo: 'Objetivo',

  age: 'Edad',
  job: 'Ocupación',
  marital: 'Estado civil',
  education: 'Nivel educativo',
  balance: 'Saldo de cuenta (EUR)',
  default: '¿En mora/impago?',
  housing: '¿Hipoteca?',
  loan: '¿Préstamo personal?',
  contact: 'Tipo de contacto',
  day: 'Día del mes',
  month: 'Mes',
  duration: 'Duración de la llamada (seg)',
  campaign: 'Contactos en esta campaña',
  pdays: 'Días desde último contacto',
  previous: 'Contactos previos',
  poutcome: 'Resultado de la campaña previa',
  y: '¿Aceptó depósito a plazo?',
  emp_var_rate: 'Variación del empleo (%)',
  cons_price_idx: 'Índice de precios (IPC)',
  cons_conf_idx: 'Índice de confianza del consumidor',
  euribor3m: 'Euribor 3m (%)',
  nr_employed: 'Empleados (miles)',
};

const JOBS = [
  ['admin.', 'administrativo'],
  ['blue-collar', 'obrero (blue-collar)'],
  ['entrepreneur', 'emprendedor'],
  ['housemaid', 'servicio doméstico'],
  ['management', 'dirección/gerencia'],
  ['retired', 'jubilado'],
  ['self-employed', 'autónomo'],
  ['services', 'servicios'],
  ['student', 'estudiante'],
  ['technician', 'técnico'],
  ['unemployed', 'desempleado'],
  ['unknown', 'desconocido'],
  ['admin', 'administrador'],
];

const MARITAL = [
  ['single', 'soltero/a'],
  ['married', 'casado/a'],
  ['divorced', 'divorciado/a'],
  ['unknown', 'desconocido'],
];

const EDUCATION = [
  ['illiterate', 'analfabeto'],
  ['basic.4y', 'básica 4 años'],
  ['basic.6y', 'básica 6 años'],
  ['basic.9y', 'básica 9 años'],
  ['primary', 'primaria'],
  ['secondary', 'secundaria'],
  ['tertiary', 'terciaria'],
  ['high.school', 'bachillerato'],
  ['professional.course', 'curso profesional'],
  ['university.degree', 'universitaria'],
  ['unknown', 'desconocido'],
];

const YESNOUNK = [
  ['yes', 'sí'],
  ['no', 'no'],
  ['unknown', 'desconocido'],
];

const CONTACT = [
  ['cellular', 'celular'],
  ['telephone', 'teléfono fijo'],
];

const MONTHS = [
  ['jan', 'ene'], ['feb', 'feb'], ['mar', 'mar'], ['apr', 'abr'], ['may', 'may'], ['jun', 'jun'],
  ['jul', 'jul'], ['aug', 'ago'], ['sep', 'sep'], ['oct', 'oct'], ['nov', 'nov'], ['dec', 'dic'],
];

const POUTCOME = [
  ['success', 'éxito'],
  ['failure', 'fracaso'],
  ['other', 'otro'],
  ['unknown', 'desconocido'],
];

const TARGET = [['yes', 'sí'], ['no', 'no']];

function Section({ title, children, hint }) {
  return (
    <section className="section">
      <div className="section__head">
        <h3 className="section__title">{title}</h3>
        {hint && <small className="section__hint">{hint}</small>}
      </div>
      {children}
    </section>
  );
}

function CheckGroup({ label, options, valueSet, onToggle, tooltip }) {
  return (
    <div className="checkgroup">
      <div className="checkgroup__label" title={tooltip}>{label}</div>
      <div className="checkgroup__options">
        {options.map(([val, es]) => {
          const checked = valueSet.has(val);
          return (
            <label key={val} className="checkgroup__item">
              <input type="checkbox" checked={checked} onChange={() => onToggle(val)} />
              <span className="checkgroup__text">{es}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function RangeField({ label, value, onChange, placeholder, tooltip }) {
  const [min, max] = value;
  return (
    <div className="range">
      <div className="range__label" title={tooltip}>{label}</div>
      <div className="range__grid">
        <input
          type="number"
          value={min ?? ''}
          placeholder={placeholder?.[0] ?? 'mín'}
          onChange={(e)=> onChange([numOrNull(e.target.value), max])}
        />
        <span className="range__sep">—</span>
        <input
          type="number"
          value={max ?? ''}
          placeholder={placeholder?.[1] ?? 'máx'}
          onChange={(e)=> onChange([min, numOrNull(e.target.value)])}
        />
      </div>
    </div>
  );
}

const numOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

function Toast({ kind = 'warning', message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), 2400);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  const palette = {
    warning: { bg: '#fffbeb', bd: '#f59e0b', fg: '#92400e', dot: '#f59e0b' },
    success: { bg: '#ecfdf5', bd: '#10b981', fg: '#065f46', dot: '#10b981' },
    danger:  { bg: '#fef2f2', bd: '#ef4444', fg: '#7f1d1d', dot: '#ef4444' },
    info:    { bg: '#eff6ff', bd: '#3b82f6', fg: '#1e3a8a', dot: '#3b82f6' },
  }[kind];

  return (
    <div
      role="status"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 14px',
        background: palette.bg,
        border: `1px solid ${palette.bd}`,
        color: palette.fg,
        borderRadius: 10,
        boxShadow: '0 6px 18px rgba(0,0,0,.08)',
        zIndex: 9999,
        maxWidth: '90vw',
      }}
      onClick={onClose}
    >
      <div
        aria-hidden="true"
        style={{
          width: 10, height: 10, borderRadius: 9999, marginTop: 6,
          background: palette.dot
        }}
      />
      <div style={{ fontSize: 14 }}>{message}</div>
    </div>
  );
}

function EmptyFilterNotice({ criteriaCount }) {
  return (
    <div
      id="empty-filter-notice"
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        border: '1px solid #f59e0b',
        background: '#fffbeb',
        color: '#92400e',
        borderRadius: 10,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          minWidth: 20, minHeight: 20, borderRadius: 999,
          background: '#f59e0b', color: 'white', display: 'grid', placeItems: 'center',
          fontWeight: 700, fontSize: 12, lineHeight: '20px'
        }}
      >!</div>
      <div>
        <strong>Tu filtro está vacío.</strong>{' '}
        Agrega al menos un criterio (checkbox o rango) para habilitar <em>Guardar</em> y <em>Aplicar</em>.
        <div style={{ marginTop: 6, fontSize: 13, color: '#92400e' }}>
          Sugerencias: selecciona <code>Mes</code> (p. ej. <code>may</code>), marca <code>Hipoteca = sí</code>,
          o define <code>Edad</code> entre <code>25—40</code>. Actualmente: {criteriaCount} criterios.
        </div>
      </div>
    </div>
  );
}

export default function FilterBuilder() {
  const navigate = useNavigate();

  const [job, setJob] = useState(new Set());
  const [marital, setMarital] = useState(new Set());
  const [education, setEducation] = useState(new Set());
  const [def, setDef] = useState(new Set());
  const [housing, setHousing] = useState(new Set());
  const [loan, setLoan] = useState(new Set());
  const [contact, setContact] = useState(new Set());
  const [month, setMonth] = useState(new Set());
  const [poutcome, setPoutcome] = useState(new Set());
  const [target, setTarget] = useState(new Set());

  const [age, setAge] = useState([null, null]);
  const [balance, setBalance] = useState([null, null]);
  const [day, setDay] = useState([null, null]);
  const [duration, setDuration] = useState([null, null]);
  const [campaign, setCampaign] = useState([null, null]);
  const [pdays, setPdays] = useState([null, null]);
  const [previous, setPrevious] = useState([null, null]);
  const [empVar, setEmpVar] = useState([null, null]);
  const [cpi, setCpi] = useState([null, null]);
  const [cci, setCci] = useState([null, null]);
  const [euribor, setEuribor] = useState([null, null]);
  const [nrEmp, setNrEmp] = useState([null, null]);

  const [presetName, setPresetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState({ message: '', kind: 'warning' });
  const notify = (message, kind = 'warning') => setToast({ message, kind });

  const toggle = (setter) => (val) => setter(prev => {
    const s = new Set(prev);
    s.has(val) ? s.delete(val) : s.add(val);
    return s;
  });

  const filter = useMemo(() => {
    const out = {};
    const addIn = (k, set) => { if (set.size) out[k] = { $in: Array.from(set) }; };
    const addRange = (k, [min, max]) => {
      const cond = {};
      if (min !== null && min !== undefined) cond.$gte = min;
      if (max !== null && max !== undefined) cond.$lte = max;
      if (Object.keys(cond).length) out[k] = cond;
    };

    addIn('job', job); addIn('marital', marital); addIn('education', education);
    addIn('default', def); addIn('housing', housing); addIn('loan', loan);
    addIn('contact', contact); addIn('month', month); addIn('poutcome', poutcome);
    addIn('y', target);

    addRange('age', age);
    addRange('balance', balance);
    addRange('day', day);
    addRange('duration', duration);
    addRange('campaign', campaign);
    addRange('pdays', pdays);
    addRange('previous', previous);
    addRange('emp_var_rate', empVar);
    addRange('cons_price_idx', cpi);
    addRange('cons_conf_idx', cci);
    addRange('euribor3m', euribor);
    addRange('nr_employed', nrEmp);

    return out;
  }, [
    job, marital, education, def, housing, loan, contact, month, poutcome, target,
    age, balance, day, duration, campaign, pdays, previous, empVar, cpi, cci, euribor, nrEmp
  ]);

  const criteriaCount = useMemo(() => Object.keys(filter).length, [filter]);
  const isFilterEmpty = criteriaCount === 0;

  function resetAll() {
    setJob(new Set()); setMarital(new Set()); setEducation(new Set());
    setDef(new Set()); setHousing(new Set()); setLoan(new Set());
    setContact(new Set()); setMonth(new Set()); setPoutcome(new Set()); setTarget(new Set());
    setAge([null,null]); setBalance([null,null]); setDay([null,null]); setDuration([null,null]);
    setCampaign([null,null]); setPdays([null,null]); setPrevious([null,null]);
    setEmpVar([null,null]); setCpi([null,null]); setCci([null,null]); setEuribor([null,null]); setNrEmp([null,null]);
    setPresetName('');
  }

  async function handleSavePreset() {
    if (isFilterEmpty) {
      notify('Agrega al menos un criterio antes de guardar el preset.', 'warning');
      return;
    }
    const name = (presetName || '').trim() || `Preset ${new Date().toLocaleString()}`;
    try {
      setIsSaving(true);
      const saved = await createSavedFilter({ name, filter });
      console.log('Preset guardado:', saved);
      setPresetName('');
      notify('Preset guardado correctamente.', 'success');
    } catch (err) {
      console.error('Error al guardar preset:', err);
      notify('No se pudo guardar el preset. Verifica tu sesión o la conexión.', 'danger');
    } finally {
      setIsSaving(false);
    }
  }

  async function applyAndBack() {
    if (isFilterEmpty) {
      notify('Agrega al menos un criterio antes de aplicar.', 'warning');
      return;
    }
    const name = (presetName || '').trim() || `Preset ${new Date().toLocaleString()}`;
    try {
      setIsSaving(true);
      await createSavedFilter({ name, filter });
      notify('Preset aplicado.', 'success');
      navigate('/explorador');
    } catch (err) {
      console.error('Error al guardar y volver:', err);
      notify('Error al aplicar el preset.', 'danger');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page">
      <Header title="Constructor de Filtros" />

      <main className="wrap">
        <div className="builder">

          {isFilterEmpty && (
            <div style={{ marginBottom: 16 }}>
              <EmptyFilterNotice criteriaCount={criteriaCount} />
            </div>
          )}

          <div className="filters-stack">
            <Section title={LABEL.demografia}>
              <CheckGroup label={LABEL.job} options={JOBS} valueSet={job} onToggle={toggle(setJob)} />
              <CheckGroup label={LABEL.marital} options={MARITAL} valueSet={marital} onToggle={toggle(setMarital)} />
              <CheckGroup label={LABEL.education} options={EDUCATION} valueSet={education} onToggle={toggle(setEducation)} />
              <RangeField label={LABEL.age} value={age} onChange={setAge} tooltip="Años cumplidos" placeholder={[18,95]} />
            </Section>

            <Section title={LABEL.credito}>
              <CheckGroup label={LABEL.default} options={YESNOUNK} valueSet={def} onToggle={toggle(setDef)} />
              <CheckGroup label={LABEL.housing} options={YESNOUNK} valueSet={housing} onToggle={toggle(setHousing)} />
              <CheckGroup label={LABEL.loan} options={YESNOUNK} valueSet={loan} onToggle={toggle(setLoan)} />
              <RangeField
                label={LABEL.balance}
                value={balance}
                onChange={setBalance}
                tooltip="Saldo medio de cuenta en EUR (puede ser negativo)."
                placeholder={[-2000,10000]}
              />
            </Section>

            <Section title={LABEL.campania}>
              <CheckGroup label={LABEL.contact} options={CONTACT} valueSet={contact} onToggle={toggle(setContact)} />
              <CheckGroup label={LABEL.month} options={MONTHS} valueSet={month} onToggle={toggle(setMonth)} />
              <RangeField label={LABEL.day} value={day} onChange={setDay} placeholder={[1,31]} tooltip="Día del mes (1..31)" />
              <RangeField label={LABEL.duration} value={duration} onChange={setDuration} placeholder={[0,871]} tooltip="Segundos de la llamada actual." />
              <RangeField label={LABEL.campaign} value={campaign} onChange={setCampaign} placeholder={[1,63]} tooltip="Nº de contactos durante esta campaña." />
            </Section>

            <Section title={LABEL.historial}>
              <RangeField
                label={LABEL.pdays}
                value={pdays}
                onChange={setPdays}
                placeholder={[-1,999]}
                tooltip="Días desde el último contacto (-1 = sin contacto previo)."
              />
              <RangeField label={LABEL.previous} value={previous} onChange={setPrevious} placeholder={[0,7]} tooltip="Nº de contactos previos a esta campaña." />
              <CheckGroup label={LABEL.poutcome} options={POUTCOME} valueSet={poutcome} onToggle={toggle(setPoutcome)} />
              <CheckGroup label={LABEL.y} options={TARGET} valueSet={target} onToggle={toggle(setTarget)} />
            </Section>

            <Section title={LABEL.macro}>
              <RangeField label={LABEL.emp_var_rate} value={empVar} onChange={setEmpVar} placeholder={[-3.4,1.4]} tooltip="Cambio del empleo trimestral (%). Puede ser negativo." />
              <RangeField label={LABEL.cons_price_idx} value={cpi} onChange={setCpi} placeholder={[92.2,94.8]} tooltip="Nivel del índice de precios al consumidor." />
              <RangeField label={LABEL.cons_conf_idx} value={cci} onChange={setCci} placeholder={[-50,-26]} tooltip="Índice de confianza del consumidor (negativo = menor confianza)." />
              <RangeField label={LABEL.euribor3m} value={euribor} onChange={setEuribor} placeholder={[0.6,5.05]} tooltip="Tipo de interés interbancario a 3 meses (%)." />
              <RangeField label={LABEL.nr_employed} value={nrEmp} onChange={setNrEmp} placeholder={[4965,5228.1]} tooltip="Número de empleados (escala original del dataset)." />
            </Section>
          </div>

          <div className="toolbar toolbar--bottom" aria-describedby={isFilterEmpty ? 'empty-filter-notice' : undefined}>
            <input
              type="text"
              placeholder="Nombre del preset"
              value={presetName}
              onChange={(e)=> setPresetName(e.target.value)}
              className="preset-input"
              disabled={isSaving}
            />
            <div className="toolbar__buttons">
              <button
                className="btn"
                onClick={handleSavePreset}
                aria-disabled={isSaving || isFilterEmpty}
                tabIndex={isSaving || isFilterEmpty ? -1 : 0}
                title={isFilterEmpty ? 'Agrega al menos un criterio' : undefined}
                style={{
                  opacity: isSaving || isFilterEmpty ? 0.5 : 1,
                  cursor: isSaving || isFilterEmpty ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Guardando…' : 'Guardar preset'}
              </button>

              <button
                className="btn"
                onClick={applyAndBack}
                aria-disabled={isSaving || isFilterEmpty}
                tabIndex={isSaving || isFilterEmpty ? -1 : 0}
                title={isFilterEmpty ? 'Agrega al menos un criterio' : undefined}
                style={{
                  opacity: isSaving || isFilterEmpty ? 0.5 : 1,
                  cursor: isSaving || isFilterEmpty ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Aplicando…' : 'Aplicar y volver'}
              </button>

              <button className="btn btn--secondary" onClick={resetAll} disabled={isSaving}>Restablecer</button>
              <button className="btn btn--ghost" onClick={() => navigate('/explorador')} disabled={isSaving}>Volver al Explorador</button>
            </div>
          </div>
        </div>
      </main>

      <Toast
        kind={toast.kind}
        message={toast.message}
        onClose={() => setToast({ message: '', kind: 'warning' })}
      />
    </div>
  );
}
