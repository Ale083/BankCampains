import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";

export function KPIBox({ title, value, children}) {
  return (
    <div className="kpi">
      <div className="note">{title}</div>
      <div className="strong">{value}</div>
      <div>{children}</div>
    </div>
  );
}

export function ChartBox({title, data, xKey, bars, yAxis}) {
  return (
    <section className="card">
      <h4 className="title">{title}</h4>
      <div className="body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey}/>
            <YAxis {...(yAxis || {})} />
            <Tooltip />
            {bars.map(b => (
              <Bar
                key={b.key}
                dataKey={b.key}
                name={b.name}
                stackId={b.stackId}
                fill={b.color || "var(--chart-fill)"}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}