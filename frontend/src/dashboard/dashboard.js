import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import Header from "../components/Header";
import { downloadPdf } from "./exportToPDF";
import { exportToExcel } from "./exportToExcel";
import { Link } from "react-router-dom";
import { ChartBox, KPIBox } from "./componentesKPIs";
import { FilterSummary } from "./sidebarFiltros";

import { fetchKPIs } from "./fetchKPIs";
import { listPresets, mergeFiltersAND } from "../filters/utils";
import { listSavedFilters } from "../api/savedFilters";
import { mongoFilterToQuery } from "../filters/qsFromMongo";
import { useNavigate } from "react-router-dom";
import AccessFacade from "../auth/AccessFacade";

export default function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    if(!AccessFacade.puedeVerDashboard()){
      alert("Usuario sin permisos para ver el dashboard");
      navigate(-1);
    }
  }, []);
  
  const [presets, setPresets] = useState(() => listPresets());
  const [active, setActive] = useState({});
  const [dbFilters, setDbFilters] = useState([]);
  const [activeDb, setActiveDb] = useState({});
  const [loadingDb, setLoadingDb] = useState(false);

  const [tasaConversion, setTasaConversion] = useState(0);
  const [duracionPromedio, setDuracionPromedio] = useState(0);
  const [contactosPorMes, setContactosPorMes] = useState([]);
  const [tasaExitoCanal, setTasaExitoCanal] = useState([]);
  const [conversionPorEdad, setConversionPorEdad] = useState([]);
  const [impactoHistorial, setImpactoHistorial] = useState([]);
  const [indiceEficiencia, setIndiceEficiencia] = useState([]);

  const chartRef = useRef(null);
  const RefTasaConversion = useRef(null);
  const RefDuracionPromedio = useRef(null);
  const RefContactosPorMes = useRef(null);
  const RefTasaExitoCanal = useRef(null);
  const RefConversionPorEdad = useRef(null);
  const RefImpactoHistorial = useRef(null);
  const RefIndiceEficiencia = useRef(null);
  const RefFiltros = useRef(null);



  useEffect(() => {
    setPresets(listPresets());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingDb(true);
        const r = await listSavedFilters();
        if (r?.ok) setDbFilters(r.data || []);
        else if (Array.isArray(r)) setDbFilters(r);
        else setDbFilters([]);
      } catch (e) {
        console.error("Error listSavedFilters:", e);
        setDbFilters([]);
      } finally {
        setLoadingDb(false);
      }
    })();
  }, []);

  const selectedFilters = useMemo(
    () => presets.filter(p => active[p.id]).map(p => p.filter),
    [presets, active]
  );
  const selectedDb = useMemo(
    () => dbFilters.filter(f => activeDb[f._id]).map(f => f.filter),
    [dbFilters, activeDb]
  );

  const mergedFilterObj = useMemo(
    () => mergeFiltersAND([...selectedFilters, ...selectedDb]),
    [selectedFilters, selectedDb]
  );
  const filtersQS = useMemo(
    () => mongoFilterToQuery(mergedFilterObj),
    [mergedFilterObj]
  );

  useEffect(() => {
    fetchKPIs(filtersQS).then((data) => {
      setTasaConversion(data.tasaConversion.conversionRate);
      setDuracionPromedio(data.avgDuration.avgDuration);
      setContactosPorMes(data.contactosPorMes);
      setTasaExitoCanal(data.tasaExitoPorCanal);
      setConversionPorEdad(data.conversionPorEdad);
      console.log(tasaConversion);
      const historial = (data.impactoHistorialPrevio || []).map(d => ({
        poutcome: d.poutcome,
        yes: (d.yes / d.total) * 100,
        no:  (d.no  / d.total) * 100,
      }));
      setImpactoHistorial(historial);
      setIndiceEficiencia(data.indiceEficienciaPorCampaña);
    }).catch(err => console.error("fetchKPIs error:", err));
  }, [filtersQS]);

  const toggle = (id) => setActive(s => ({ ...s, [id]: !s[id] }));
  const toggleDb = (id) => setActiveDb(s => ({ ...s, [id]: !s[id] }));

  const queryObjForSummary = useMemo(
    () => Object.fromEntries(new URLSearchParams(filtersQS)),
    [filtersQS]
  );

  return (
    <div className="page">
      <Header title="Dashboard General" />

      <main className="wrap" ref={chartRef}>
        {/* izquierda */}
        <aside className="sidebar">
          
          <div className="muted" style={{ marginBottom: 8 }}>
            {loadingDb ? "Cargando filtros de BD…" : null}
          </div>
            <Link
            className="btn"
            to="/filtros"
            state={{ returnTo: "/dashboardKPIs" }}
          >
            Crear/Cargar presets
          </Link>
          <FilterSummary
            ref={RefFiltros}
            query={queryObjForSummary}
            presets={presets}
            active={active}
            onToggle={toggle}
            dbFilters={dbFilters}
            activeDb={activeDb}
            onToggleDb={toggleDb}
          />
          
        </aside>

        <section className="content">
          <div className="kpis">
            <KPIBox ref={RefTasaConversion} title="Tasa de Conversión" value={`${tasaConversion}%`} />
            <KPIBox ref={RefDuracionPromedio} title="Duración Promedio" value={`${duracionPromedio} min`} />
          </div>

          <div className="actions">
            <button className="btn" onClick={() => downloadPdf(chartRef)}>Exportar PDF</button>
            <button className="btn" onClick={() => 
              exportToExcel({contactosPorMes, tasaExitoCanal, conversionPorEdad, impactoHistorial, indiceEficiencia, tasaConversion: {conversionRate: tasaConversion}, avgDuration: {avgDuration: duracionPromedio} })
            }>Exportar Excel</button>
          </div>

          <div className="charts">
            <ChartBox
              ref={RefContactosPorMes}
              title="Contactos por mes"
              data={contactosPorMes}
              xKey="index"
              bars={[{ key: "total" }]}
            />

            <ChartBox
              ref={RefTasaExitoCanal}
              title="Tasa de éxito por canal"
              data={tasaExitoCanal}
              xKey="contact"
              bars={[{ key: "yes" }]}
            />

            <ChartBox
              ref={RefConversionPorEdad}
              title="Conversión por edad"
              data={conversionPorEdad}
              xKey="segment"
              bars={[{ key: "conversionRate" }]}
            />

            <ChartBox
              ref={RefImpactoHistorial}
              title="Impacto del historial previo"
              data={impactoHistorial}
              xKey="poutcome"
              yAxis={{ tickFormatter: v => `${v}%`, domain: [0, 100] }}
              bars={[
                { key: "yes", name: "Aceptó (yes)", color: "#16a34a", stackId: "a" },
                { key: "no",  name: "No aceptó (no)", color: "#ef4444", stackId: "a" },
              ]}
            />

            <ChartBox
              ref={RefIndiceEficiencia}
              title="Índice de eficiencia por campaña"
              data={indiceEficiencia}
              xKey="campaignCount"
              bars={[{ key: "efficiency" }]}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
