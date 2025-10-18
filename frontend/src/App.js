import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CsvUpload from './uploads/CsvUpload';

import './App.css';
import Dashboard from './dashboard/dashboard';

export default function App() {
  // Simular sesión de usuario para fase 1
  const data = {id: 1, nombre: "Test", permisos: 'admin'};
  localStorage.setItem('session', JSON.stringify(data));
  localStorage.setItem('filtros', "job=admin.,technician,management&marital=single,married&education=high.school,university.degree&default=no&housing=yes,no&loan=no&contact=cellular&month=may,jun,jul&day_of_week=mon,tue,wed,thu,fri&poutcome=success&y=yes&ageMin=30&ageMax=55&durationMin=60&durationMax=1800&campaignMin=1&campaignMax=5&pdaysMin=0&pdaysMax=999&previousMin=0&previousMax=3&empVarRateMin=-1.0&empVarRateMax=1.4&consPriceIdxMin=92.5&consPriceIdxMax=94.7&consConfIdxMin=-45.0&consConfIdxMax=-27.0&euribor3mMin=1.0&euribor3mMax=5.0&nrEmployedMin=5000&nrEmployedMax=5228.1");

  
  return (
    <div>

      <Routes>
        <Route path="/" element={<CsvUpload onNext={() => {}} />} />
        <Route path="/dashboardKPIs" element={<Dashboard />} />
        <Route path="*" element={<Navigate to={'/'} replace />} />
      </Routes>
    </div>
  );
}