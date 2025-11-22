import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';
import { register } from './authService';
import AccessFacade from './AccessFacade';

function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('EJECUTIVO');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  useEffect(() => {
    if(!AccessFacade.puedeRegistrarUsuarios()){
      alert("Usuario sin permisos para registrar usuarios");
      navigate(-1);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      console.log('Registering user:', { nombre, email, password, rol });
      const response = await register(nombre, email, password, rol);
      
      if (response.ok) {
        //TODO: no se que pasaría después del registro por ahora
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      setErrorMessage('Ocurrió un error durante el registro.');
    }
  };

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
        position: 'relative'
      }}>
        <div style={{
          height: 36,
          width: 36,
        }}>
        </div>

        <h1 style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: 0,
          color: '#ef4444',
          fontSize: 22,
          fontWeight: 700
        }}>
          BankCampains
        </h1>
        <div style={{ width: 36 }}></div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 16px',
        background: '#4f75e2',
        color: '#fff',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Registrar Usuario</h2>
      </div>
      <main className="login-contenedor">
        <form className="login-form-login" onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            type="text"
            id="nombre"
            placeholder="Nombre completo"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            placeholder="ejemplo@gmail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="********"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

        <label>Rol: </label>
        <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
        >
        {[
        { value: 'EJECUTIVO', label: 'Ejecutivo de cuentas' },
        { value: 'GERENCIA', label: 'Gerente' },
        ].map((rol) => (
            <option key={rol.value} value={rol.value}>
                {rol.label}
            </option>
        ))}
        </select>
          {errorMessage && <p className="login-error-message">{errorMessage}</p>}
          <button type="submit" className="login-btn">Registrar</button>
        </form>
      </main>
    </>
  );
}

export default Register;