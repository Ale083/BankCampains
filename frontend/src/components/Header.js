import React from 'react';

const Header = ({ title = "Carga de datos" }) => {
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
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#dbeafe',
          color: '#1f2937',
          fontWeight: 700
        }}>
          {JSON.parse(localStorage.getItem('session')).nombre.trim().split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase()} 
        </div> {/* Primeras letras */}

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
        <h2 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600
        }}>
          {title}
        </h2>
      </div>
    </>
  );
};

export default Header;
