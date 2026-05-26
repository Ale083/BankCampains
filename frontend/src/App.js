import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CsvUpload from './uploads/CsvUpload';
import Historial from './downloads/Historial';
import './App.css';
import Dashboard from './dashboard/dashboard';
import ReporteCalidad from './uploads/ReporteCalidad';
import FilterBuilder from './filters/FilterBuilder';
import Explorer from './explorer/Explorer';
import Login from './auth/login';
import Register from './auth/register';
import AssociatedData from './cases/AssociatedData';
import CaseAnalysisPage from './cases/CaseAnalysisPage';
import WhatIfPage from './cases/WhatIfPage';

export default function App() {

  useEffect(() => {
    localStorage.removeItem('filters'); 
  }, []);
    
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to={'/login'} replace />} />
        <Route path="/uploads" element={<CsvUpload />} />
        <Route path="/dashboardKPIs" element={<Dashboard />} />
        <Route path="/reporte" element={<ReporteCalidad />} />
        <Route path="/filtros" element={<FilterBuilder />} />
        <Route path="/explorador" element={<Explorer />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/datos-asociados" element={<AssociatedData />} />
        <Route path="*" element={<Navigate to={'/'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/analisis-casos" element={<CaseAnalysisPage />} />
        <Route path="/que-pasaria-si" element={<WhatIfPage />} />
      </Routes>
    </div>
  );
}
