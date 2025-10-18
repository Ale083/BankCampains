import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HelloWorld from './estoEsUnTest/estoEsUnTest';
import CsvUpload from './uploads/CsvUpload';

import './App.css';
import Dashboard from './dashboard/dashboard';
import ReporteCalidad from './uploads/ReporteCalidad';

export default function App() {

  return (
    <div>

      <Routes>
        <Route path="/" element={<CsvUpload onNext={() => {}} />} />
        <Route path="/test" element={<HelloWorld />} />
        <Route path="/dashboardKPIs" element={<Dashboard />} />
        <Route path="/reporte" element={<ReporteCalidad />} />
        <Route path="*" element={<Navigate to={'/'} replace />} />
      </Routes>
    </div>
  );
}