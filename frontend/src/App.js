import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import HelloWorld from './estoEsUnTest/estoEsUnTest';

import './App.css';
import Dashboard from './dashboard/dashboard';

export default function App() {

  return (
    <div>

      <Routes>
        {/* Ruta de ejemplo */}
        <Route path="/test" element={< HelloWorld />} />

        <Route path="/dashboardKPIs" element={< Dashboard />} />

        {/* Redirigir "/" a "/test" */}
        <Route path="/" element={<Navigate to={"/test"} replace />} />

        {/* Cualquier otra ruta, de nuevo a /test */}
        <Route path="*" element={<Navigate to={"/test"} replace />} />
        
      </Routes>
    </div>
  );
}