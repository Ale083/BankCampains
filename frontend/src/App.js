import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
//import EmployeeList from './listaEmpleados/listaEmpleados';

import './App.css';

export default function App() {
  const navigate = useNavigate();

  return (
    <div>

      {/* Definición de rutas */}
      <Routes>
        {/* Ruta de ejemplo */}
        {/* <Route path="/empleados" element={<EmployeeList />}*/}

        {/* Redirigir "/" a "/otro" */}
        {/*<Route path="/" element={<Navigate to={"/otro"} replace />} />*/}

        {/* Cualquier otra ruta, de nuevo a /otro */}
        {/*<Route path="*" element={<Navigate to={"/otro"} replace />} />*/}
      </Routes>
    </div>
  );
}