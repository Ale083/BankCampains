import React, { useEffect, useState } from "react";

import "./styles.css";
import { fetchKPIs, rentabilidad } from "./fetchKPIs";
import { ChartBox, KPIBox } from "./componentesKPIs";

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
      console.log(data);
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

  return (
    <div className="page">
      <header className="header">
        <div className="user">A</div>
        <h1 className="brand">BankCampains</h1>
      </header>

      <div className="bar">
        <button className="back" aria-label="Volver">←</button>
        <h2>Dashboard General</h2>
      </div>

      <main className="wrap">
        {/* izquierda */}
        <aside className="sidebar">
          <h3>Filtros aplicados</h3>

          <div>
            <label className="note">Edad</label>
            <p className="muted">18 años</p>
          </div>

          <div>
            <label className="note">Educación</label>
            <p className="muted">• Primaria</p>
            <p className="muted">• Secundaria</p>
            <p className="muted">• Bachiller</p>
          </div>

          <div>
            <label className="note">Mes</label>
            <p className="muted">Abril</p>
          </div>

          <div>
            <label className="note">Día de la semana</label>
            <p className="muted">Lunes</p>
          </div>
        </aside>
        
        <section className="content">
          <div className="kpis">
            <KPIBox title="Tasa de Conversión" value={`${tasaConversion}%`} />
            <KPIBox title="Duración Promedio" value={`${duracionPromedio} min`} />
            <KPIBox title="Rentabilidad Proyectada" value={rentabilidadProy}>
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
            <button className="btn">Volver</button>
            <button className="btn">Exportar PDF</button>
            <button className="btn">Exportar Excel</button>
          </div>

          <div className="charts">
            <ChartBox
              title="Contactos por mes"
              data={contactosPorMes}
              xKey="index"
              bars={[{ key: "total" }]}
            />

            <ChartBox
              title="Tasa de éxito por canal"
              data={tasaExitoCanal}
              xKey="contact"
              bars={[{ key: "yes" }]}
            />

            <ChartBox
              title="Conversión por edad"
              data={conversionPorEdad}
              xKey="segment"
              bars={[{ key: "conversionRate" }]}
            />

            <ChartBox
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
