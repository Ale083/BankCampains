import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CsvUpload from './uploads/CsvUpload';
import Dashboard from './dashboard/dashboard';
import ReporteCalidad from './uploads/ReporteCalidad';
import FilterBuilder from './filters/FilterBuilder';
import Explorer from './explorer/Explorer';
import './App.css';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    localStorage.removeItem('filters'); 

    (async () => {
      try {
        const res = await fetch('/api/dev/session');
        const json = await res.json();
        if (json?.ok && json.user?.userId) {
          localStorage.setItem('session', JSON.stringify({
            userId: json.user.userId,
            nombre: json.user.nombre,
            permisos: json.user.permisos,
          }));
        } else {
          console.warn('Respuesta de /api/dev/session inesperada:', json);
          localStorage.setItem('session', JSON.stringify({
            userId: '',
            nombre: 'Invitado',
            permisos: 'lector',
          }));
        }
      } catch (e) {
        console.error('Error inicializando sesión dev:', e);
        localStorage.setItem('session', JSON.stringify({
          userId: '',
          nombre: 'Invitado',
          permisos: 'lector',
        }));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return <div style={{ padding: 24 }}>Inicializando…</div>;
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<CsvUpload onNext={() => {}} />} />
        <Route path="/dashboardKPIs" element={<Dashboard />} />
        <Route path="/reporte" element={<ReporteCalidad />} />
        <Route path="/filtros" element={<FilterBuilder />} />
        <Route path="/explorador" element={<Explorer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
