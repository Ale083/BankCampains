import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HelloWorld from './estoEsUnTest/estoEsUnTest';
import CsvUpload from './uploads/CsvUpload';
import Historial from './downloads/Historial';

import './App.css';
import Dashboard from './dashboard/dashboard';
import ReporteCalidad from './uploads/ReporteCalidad';

export default function App() {
  // Simular sesión de usuario para fase 1
  const data = {id: 1, nombre: "Test", permisos: 'admin'};
  localStorage.setItem('session', JSON.stringify(data));
  
  return (
    <div>

      <Routes>
        <Route path="/" element={<CsvUpload onNext={() => {}} />} />
        <Route path="/test" element={<HelloWorld />} />
        <Route path="/dashboardKPIs" element={<Dashboard />} />
        <Route path="/reporte" element={<ReporteCalidad />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="*" element={<Navigate to={'/'} replace />} />
      </Routes>
    </div>
  );
}