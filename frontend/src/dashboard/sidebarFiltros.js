import React from "react";

const LABEL = {
  job:"Trabajo", marital:"Estado civil", education:"Educación", default:"Mora de crédito",
  housing:"Hipoteca", loan:"Préstamo personal", contact:"Contacto",
  month:"Mes", day_of_week:"Día de la semana", poutcome:"Resultado previo", y:"¿Aceptó?",
  age:"Edad", duration:"Duración (s)", campaign:"Contactos campaña", pdays:"Días desde último contacto",
  previous:"Contactos previos", emp_var_rate:"Var. empleo", cons_price_idx:"Índice de precios",
  cons_conf_idx:"Índice de confianza", euribor3m:"Euribor 3m", nr_employed:"Empleados",
};

const MAP = {
  // yes/no/unknown
  yes:"Sí", no:"No", unknown:"Desconocido",
  // contact
  cellular:"Celular", telephone:"Teléfono",
  // months
  jan:"Enero", feb:"Febrero", mar:"Marzo", apr:"Abril", may:"Mayo", jun:"Junio",
  jul:"Julio", aug:"Agosto", sep:"Septiembre", oct:"Octubre", nov:"Noviembre", dec:"Diciembre",
  // day_of_week
  mon:"Lunes", tue:"Martes", wed:"Miércoles", thu:"Jueves", fri:"Viernes",
  // education
  "basic.4y":"Primaria (4 años)",
  "basic.6y":"Primaria (6 años)",
  "basic.9y":"Primaria (9 años)",
  "high.school":"Secundaria",
  illiterate:"Analfabeta",
  "professional.course":"Técnico",
  "university.degree":"Universidad",
  //marital
  divorced:"Divorciado",
  married:"Casado",
  single:"Soltero",
  // job
  "admin.":"Administrativo",
  "blue-collar":"Obrero",
  entrepreneur:"Emprendedor",
  housemaid:"Empleada doméstica",
  management:"Gerencia",
  retired:"Jubilado",
  "self-employed":"Autónomo",
  services:"Servicios",
  student:"Estudiante",
  technician:"Técnico",
  unemployed:"Desempleado",

  // poutcome
  failure:"Fallo",
  nonexistent:"No existía",
  success:"Éxito",
};

const has = v => v!==undefined && v!==null && String(v)!=="";
const label = k => LABEL[k] ?? k.replaceAll("_"," ");
const pretty = v =>
  (String(v).includes(",") ? String(v).split(",") : [String(v)]) //los separa en una lista mapeando a los pretty names
    .map(s => MAP[s.trim()] ?? s.trim())
    .filter(Boolean);

export default function FilterSummary({ query }) {
  const ranges = Object.entries(query).reduce((a,[k,v])=>{
    const m = k.match(/^(.*)(Min|Max)$/); if(!m) return a;
    (a[m[1]] ??= {})[m[2]==="Min"?"min":"max"] = v; return a;
  },{}); 

  const cats = Object.fromEntries(Object.entries(query).filter(([k])=>!/(Min|Max)$/.test(k))); 

  const Row = ({title, children}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:12,color:"#555"}}>{title}</div>
      {children}
    </div>
  );

  return (
    <div>
      <h3>Filtros aplicados</h3>

      {Object.entries(ranges).map(([base,{min,max}])=>{
        if(!has(min)&&!has(max))  //si no min ni max, skip.
            return null;
            
        const txt = has(min)&&has(max) ? `${Number(min)} - ${Number(max)}` //si tiene ambos
                 : has(min) ? `≥ ${Number(min)}` //si solo tiene min
                 : `≤ ${Number(max)}`; //si solo tiene max
        return <Row key={base} title={label(base)}>
          <div className="note" style={{fontWeight:600}}>{txt}</div>
        </Row>;
      })}

      {Object.entries(cats).map(([k,v])=>{
        if(!has(v)) return null; //si algo no tiene valor retorna nulll

        return <Row key={k} title={label(k)}>
        {(items => items.length > 1 //que hacer depende de si es solo una cosa o varias como valor.
            ? <ul style={{margin:0,paddingLeft:"1.2rem"}}>
                {items.map(x => <li key={x} className="note">{x}</li>)}
            </ul>
            : <div className="note" style={{fontWeight:200}}>{items[0]}</div>
        )(pretty(v))}
        </Row>;
      })}
    </div>
  );
}
