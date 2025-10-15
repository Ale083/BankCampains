import React from "react";
import {
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import "./styles.css";

/* piezas reusables, nombres sencillos */
function KPIBox({ title, value }) {
  return (
    <div className="kpi">
      <div className="note">{title}</div>
      <div className="strong">{value}</div>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <section className="card">
      <h4 className="title">{title}</h4>
      <div className="body">{children}</div>
    </section>
  );
}

/* datos demo */
const conversionData = [
  { name: "Ene", value: 80 },
  { name: "Feb", value: 75 },
  { name: "Mar", value: 70 },
  { name: "Abr", value: 50 },
];

const channelData = [
  { name: "Ene", value: 65 },
  { name: "Feb", value: 70 },
  { name: "Mar", value: 85 },
  { name: "Abr", value: 80 },
];

const educationData = [
  { name: "Test1", value: 85 },
  { name: "Test2", value: 75 },
  { name: "Test3", value: 70 },
];

const durationData = [
  { name: "Test1", value: 60 },
  { name: "Test2", value: 50 },
  { name: "Test3", value: 65 },
];

const weekdayData = [
  { name: "Lun", value: 55 },
  { name: "Mar", value: 65 },
  { name: "Mie", value: 75 },
  { name: "Jue", value: 70 },
];

export default function Dashboard() {
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

        {/* derecha */}
        <section className="content">
          <div className="kpis">
            <KPIBox title="Tasa de Conversión" value="12,8%" />
            <KPIBox title="Contactos Totales" value="41.237" />
            <KPIBox title="Duración media de llamadas" value="4m 52s" />
          </div>

          <div className="actions">
            <button className="btn">Volver</button>
            <button className="btn">Exportar PDF</button>
            <button className="btn">Exportar Excel</button>
          </div>

          <div className="charts">
            <ChartBox title="Conversión por mes">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="var(--chart-line)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Conversión por canal">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="var(--chart-line)" fill="var(--chart-fill)" fillOpacity="0.25" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Distribución por educación">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={educationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="var(--chart-line)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Duración de llamadas">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={durationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="var(--chart-line)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Día de semana vs. conversión">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="var(--chart-line)" fill="var(--chart-fill)" fillOpacity="0.25" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        </section>
      </main>
    </div>
  );
}
