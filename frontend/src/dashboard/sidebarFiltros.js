import React, { forwardRef } from "react";

const LABEL = {
  job:"Trabajo", marital:"Estado civil", education:"Educación", default:"Mora de crédito",
  housing:"Hipoteca", loan:"Préstamo personal", contact:"Contacto",
  month:"Mes", day_of_week:"Día de la semana", poutcome:"Resultado previo", y:"¿Aceptó?",
  age:"Edad", duration:"Duración (s)", campaign:"Contactos campaña", pdays:"Días desde último contacto",
  previous:"Contactos previos", emp_var_rate:"Var. empleo", cons_price_idx:"Índice de precios",
  cons_conf_idx:"Índice de confianza", euribor3m:"Euribor 3m", nr_employed:"Empleados",
};

const MAP = {
  yes:"Sí", no:"No", unknown:"Desconocido",
  cellular:"Celular", telephone:"Teléfono",
  jan:"Enero", feb:"Febrero", mar:"Marzo", apr:"Abril", may:"Mayo", jun:"Junio",
  jul:"Julio", aug:"Agosto", sep:"Septiembre", oct:"Octubre", nov:"Noviembre", dec:"Diciembre",
  mon:"Lunes", tue:"Martes", wed:"Miércoles", thu:"Jueves", fri:"Viernes",
  "basic.4y":"Primaria (4 años)", "basic.6y":"Primaria (6 años)", "basic.9y":"Primaria (9 años)",
  "high.school":"Secundaria", illiterate:"Analfabeta", "professional.course":"Técnico", "university.degree":"Universidad",
  divorced:"Divorciado", married:"Casado", single:"Soltero",
  "admin.":"Administrativo","blue-collar":"Obrero", entrepreneur:"Emprendedor", housemaid:"Empleada doméstica",
  management:"Gerencia", retired:"Jubilado","self-employed":"Autónomo", services:"Servicios",
  student:"Estudiante", technician:"Técnico", unemployed:"Desempleado",
  failure:"Fallo", nonexistent:"No existía", success:"Éxito",
};

const has = v => v!==undefined && v!==null && String(v)!=="";
const label = k => LABEL[k] ?? k.replaceAll("_"," ");
const pretty = v =>
  (String(v).includes(",") ? String(v).split(",") : [String(v)])
    .map(s => MAP[s.trim()] ?? s.trim())
    .filter(Boolean);

function toQueryObj(input) {
  if (!input) return {};
  if (typeof input === "string") return Object.fromEntries(new URLSearchParams(input));
  if (input instanceof URLSearchParams) return Object.fromEntries(input);
  if (typeof input === "object") return input;
  return {};
}

const Chip = ({ label, active, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="chip"
    aria-pressed={!!active}
    title={label}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 10,
      border: `1px solid ${active ? "#2563eb" : "#e5e7eb"}`,
      background: active ? "#dbeafe" : "#fff",
      color: active ? "#1d4ed8" : "#111",
      cursor: "pointer",
      width: "100%",           
      textAlign: "left",       
      userSelect: "none",
    }}
  >
    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {label}
    </span>
  </button>
);

export const FilterSummary = forwardRef(function FilterSummary(
  {
    query,               
    presets = [],         
    active = {},          
    onToggle = () => {},  
    dbFilters = [],       
    activeDb = {},        
    onToggleDb = () => {} 
  },
  ref
) {
  const q = toQueryObj(query);

  const ranges = Object.entries(q).reduce((a,[k,v])=>{
    const m = k.match(/^(.*)(Min|Max)$/); if(!m) return a;
    (a[m[1]] ??= {})[m[2]==="Min"?"min":"max"] = v; return a;
  },{});
  const cats = Object.fromEntries(Object.entries(q).filter(([k])=>!/(Min|Max)$/.test(k)));

  const Row = ({title, children}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:12,color:"#555"}}>{title}</div>
      {children}
    </div>
  );

  return (
    <div ref={ref}>
      <h3>Filtros aplicados</h3>

      {Object.entries(ranges).map(([base,{min,max}])=>{
        if(!has(min)&&!has(max)) return null;
        const txt = has(min)&&has(max) ? `${Number(min)} - ${Number(max)}`
                 : has(min) ? `≥ ${Number(min)}`
                 : `≤ ${Number(max)}`;
        return <Row key={base} title={label(base)}>
          <div className="note" style={{fontWeight:600}}>{txt}</div>
        </Row>;
      })}

      {Object.entries(cats).map(([k,v])=>{
        if(!has(v)) return null;
        const items = pretty(v);
        return <Row key={k} title={label(k)}>
          {items.length > 1
            ? <ul style={{margin:0,paddingLeft:"1.2rem"}}>
                {items.map(x => <li key={x} className="note">{x}</li>)}
              </ul>
            : <div className="note" style={{fontWeight:200}}>{items[0]}</div>}
        </Row>;
      })}

      <div style={{ marginTop:16 }}>
        <h4 style={{ margin:"12px 0 6px" }}>Presets</h4>
        {presets.length === 0 ? (
          <div className="muted">No hay presets locales.</div>
        ) : (
          <div style={{
            display:"flex",
            flexDirection:"column",  
            gap: 8
          }}>
            {presets.map(p => (
              <Chip key={p.id} label={p.name} active={!!active[p.id]} onToggle={() => onToggle(p.id)} />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop:12 }}>
        <h4 style={{ margin:"12px 0 6px" }}>Mis filtros (BD)</h4>
        {dbFilters.length === 0 ? (
          <div className="muted">No hay filtros en BD.</div>
        ) : (
          <div style={{
            display:"flex",
            flexDirection:"column",   
            gap: 8
          }}>
            {dbFilters.map(f => (
              <Chip key={f._id} label={f.name} active={!!activeDb[f._id]} onToggle={() => onToggleDb(f._id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
