import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';
import { login } from './authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      const response = await login(email, password);
      
      if (response.ok) {
        console.log('Login successful:', response);
        localStorage.setItem('session', JSON.stringify({
        userId: response.user.userId,
        nombre: response.user.nombre,
        permisos: response.user.permisos,
      }));
      navigate('/uploads');
      } else {
        console.log('Login failed:', response);
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Credenciales incorrectas.');
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setErrorMessage('Ocurrió un error durante el inicio de sesión.');
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
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Iniciar Sesión</h2>
      </div>
      <main className="login-contenedor">
        <form className="login-form-login" onSubmit={handleSubmit}>
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
          {errorMessage && <p className="login-error-message">{errorMessage}</p>}
          <button type="submit" className="login-btn">Iniciar Sesión</button>
        </form>
      </main>
    </>
  );
}

export default Login;