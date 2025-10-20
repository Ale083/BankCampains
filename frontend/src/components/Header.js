import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ title = "Carga de datos", showNavbar = true }) => {
  const [hasValidData, setHasValidData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [forceCheck, setForceCheck] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkDataAvailability = async () => {
      try {
        // Verificar si hay contactos en la base de datos
        const contactsResponse = await fetch('/api/contacts/exists');
        const contactsData = await contactsResponse.json();
        setHasValidData(contactsData.exists);
      } catch (error) {
        console.error('Error checking data availability:', error);
        setHasValidData(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDataAvailability();
  }, [location.pathname, forceCheck]); // Re-check when route changes OR forceCheck changes

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
      {/* Nav bar */}
      {showNavbar && (
        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '8px 12px'
        }}>
          {isLoading && (
            <div style={{ color: '#6b7280', fontSize: 14, marginRight: 8 }}>
              Verificando datos...
            </div>
          )}
         
          {[
            { to: '/', label: 'Carga de Datos', enabled: true, requirement: '', clearData: true },
            { to: '/dashboardKPIs', label: 'Dashboard', enabled: hasValidData, requirement: 'datos válidos' },
            { to: '/historial', label: 'Historial', enabled: true, requirement: '' },
            { to: '/descargas', label: 'Descargas', enabled: true, requirement: '' },
          ].map(link => (
            <NavLink
              key={link.to}
              to={link.enabled ? link.to : '#'}
              style={({ isActive }) => ({
                color: link.enabled 
                  ? (isActive ? '#1f2937' : '#374151')
                  : '#9ca3af',
                textDecoration: isActive && link.enabled ? 'underline' : 'none',
                fontWeight: isActive && link.enabled ? 700 : 500,
                padding: '6px 8px',
                borderRadius: 6,
                cursor: link.enabled ? 'pointer' : 'not-allowed',
                opacity: link.enabled ? 1 : 0.5,
                position: 'relative'
              })}
              onClick={async (e) => {
                if (!link.enabled) {
                  e.preventDefault();
                  if (!isLoading) {
                    let message = `No se puede acceder a ${link.label}.`;
                    if (link.requirement) {
                      message += `\n\nSe requiere: ${link.requirement}`;
                    }
                    if (link.to === '/dashboardKPIs') {
                      message += '\n\nVaya a "Carga de Datos" para subir un archivo CSV con datos válidos.';
                    }
                    alert(message);
                  }
                } else if (link.clearData && hasValidData) {
                  // Limpiar datos cuando va a "Carga de Datos"
                  e.preventDefault(); // Prevenir navegación automática
                  try {
                    setIsLoading(true); // Mostrar "Verificando datos..."
                    await fetch('/api/contacts/clear', { method: 'DELETE' });
                    setHasValidData(false);
                    setIsLoading(false);
                    setForceCheck(prev => prev + 1); // Forzar nueva verificación
                    navigate('/'); // Navegar a carga de datos
                  } catch (error) {
                    console.error('Error clearing data:', error);
                    setIsLoading(false);
                  }
                }
              }}
              title={link.enabled ? '' : `Requiere ${link.requirement || 'datos'}`}
            >
              {link.label}
              {!link.enabled && !isLoading && (
                <span style={{ 
                  marginLeft: 4, 
                  fontSize: 10, 
                  verticalAlign: 'super',
                  color: '#ef4444'
                }}>🔒</span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
};

export default Header;
