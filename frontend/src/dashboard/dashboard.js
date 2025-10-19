import React, { useEffect, useState, useRef} from "react";
import "./styles.css";
import { fetchKPIs, rentabilidad } from "./fetchKPIs";
import { ChartBox, KPIBox } from "./componentesKPIs";
import Header from "../components/Header";
import { downloadPdf } from "./exportToPDF";
import { exportToExcel } from "./exportToExcel";
import { FilterSummary } from "./sidebarFiltros";

export default function Dashboard() {
  const [G, setG] = useState(200); //ganancia por conversion
  const [C, setC] = useState(0.5); //costo por contacto
  const [rentabilidadProy, setRentabilidadProy] = useState(0);
  const [tasaConversion, setTasaConversion] = useState(0);
  const [duracionPromedio, setDuracionPromedio] = useState(0);
  const [contactosPorMes, setContactosPorMes] = useState([]);
  const [tasaExitoCanal, setTasaExitoCanal] = useState([]);
  const [conversionPorEdad, setConversionPorEdad] = useState([]);
  const [impactoHistorial, setImpactoHistorial] = useState([]);
  const [indiceEficiencia, setIndiceEficiencia] = useState([]);

  useEffect(() => {
    fetchKPIs(G, C).then((data) => {
      setRentabilidadProy(data.rentabilidad.profit);
      setTasaConversion(data.tasaConversion.conversionRate);
      setDuracionPromedio(data.avgDuration.avgDuration);
      setContactosPorMes(data.contactosPorMes);
      setTasaExitoCanal(data.tasaExitoPorCanal);
      setConversionPorEdad(data.conversionPorEdad);
      const historial = data.impactoHistorialPrevio.map( d => ({
        poutcome: d.poutcome,
        yes: (d.yes / d.total) * 100,
        no: (d.no / d.total) * 100,
      }))
      setImpactoHistorial(historial);
      setIndiceEficiencia(data.indiceEficienciaPorCampaña);
    });
  }, []);

  const chartRef = useRef(null);
  const RefTasaConversion = useRef(null);
  const RefDuracionPromedio = useRef(null);
  const RefRentabilidadProy = useRef(null);
  const RefContactosPorMes = useRef(null);
  const RefTasaExitoCanal = useRef(null);
  const RefConversionPorEdad = useRef(null);
  const RefImpactoHistorial = useRef(null);
  const RefIndiceEficiencia = useRef(null);
  const RefFiltros = useRef(null);
  return (
    <div className="page">
      <Header title="Dashboard General" />

      <main className="wrap" ref={chartRef}>
        {/* izquierda */}
        <aside className="sidebar">
           <FilterSummary query={(Object.fromEntries(new URLSearchParams(localStorage.getItem("filtros"))))} ref={RefFiltros} />
        </aside>
        
        <section className="content">
          <div className="kpis">
            <KPIBox ref={RefTasaConversion} title="Tasa de Conversión" value={`${tasaConversion}%`} />
            <KPIBox ref={RefDuracionPromedio} title="Duración Promedio" value={`${duracionPromedio} min`} />
            <KPIBox ref={RefRentabilidadProy} title="Rentabilidad Proyectada" value={rentabilidadProy}>
              <div className="note">Parámetros (G y C)</div>
                <div>
                  <input type="number" min="20" max="1000" step="10" value={G} required onChange={
                      (e) => setG(Number(e.target.value))
                    }
                  />
                  <input type="number" min="0.1" max="3.0" step="0.05" value={C} required onChange={
                      (e) => setC(Number(e.target.value))
                    }
                  />
                </div>
                <button onClick={async () => {
                  await rentabilidad(G, C).then(data => setRentabilidadProy(data.profit))
                }}>Actualizar</button>
            </KPIBox>
          </div>

          <div className="actions">
            <button className="btn" onClick={console.log("TODO")}>Volver</button>
            <button className="btn" onClick={() => downloadPdf(chartRef)}>Exportar PDF</button>
            <button className="btn" onClick={() => 
              exportToExcel({
                charts: [RefTasaConversion, RefDuracionPromedio, RefRentabilidadProy, RefContactosPorMes, RefTasaExitoCanal, RefConversionPorEdad, RefImpactoHistorial, RefIndiceEficiencia, RefFiltros],
                filename: "Dashboard.xlsx",
              })
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
