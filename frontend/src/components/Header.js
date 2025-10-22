import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ title = "Carga de datos", showNavbar = true }) => {
  const [hasValidData, setHasValidData] = useState(false);
  const [hasHistoryData, setHasHistoryData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [disabledByClear, setDisabledByClear] = useState(() => !!localStorage.getItem('dataCleared'));
  const location = useLocation();
  const navigate = useNavigate();

  // Ocultar navbar en reporte
  const showNav = Boolean(showNavbar) && location.pathname !== '/reporte';

  useEffect(() => {
    const checkDataAvailability = async () => {
      try {
        const contactsResponse = await fetch('/api/contacts/exists');
        const contactsData = await contactsResponse.json();
        const exists = !!contactsData.exists;

        if (exists) {
          // Ya hay datos: quitar cualquier bloqueo temporal
          if (localStorage.getItem('dataCleared')) {
            localStorage.removeItem('dataCleared');
            localStorage.removeItem('dataClearedAt');
          }
          setDisabledByClear(false);
        } else {
          // No hay datos: mantener bloqueo solo si se inició limpieza
          const cleared = !!localStorage.getItem('dataCleared');
          setDisabledByClear(cleared);
        }

        setHasValidData(exists);

        // (Opcional) historial
        const historyResponse = await fetch('/api/history');
        const historyData = await historyResponse.json();
        setHasHistoryData(!!(historyData.items && historyData.items.length > 0));
      } catch (error) {
        console.error('Error checking data availability:', error);
        setHasValidData(false);
        setHasHistoryData(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDataAvailability();
  }, [location.pathname]);

  // Al detectar subida exitosa, quitar bandera y re-habilitar
  useEffect(() => {
    const id = setInterval(async () => {
      const uploaded = localStorage.getItem('dataUploaded');
      if (uploaded) {
        localStorage.removeItem('dataUploaded');
        localStorage.removeItem('dataCleared');
        localStorage.removeItem('dataClearedAt');
        setDisabledByClear(false);
        try {
          const res = await fetch('/api/contacts/exists');
          const json = await res.json();
          setHasValidData(!!json.exists);
        } catch {
          setHasValidData(true);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Mientras dataCleared esté activa, hacer polling para desbloquear cuando termine el borrado
  useEffect(() => {
    if (!disabledByClear) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/contacts/exists');
        const json = await res.json();
        const exists = !!json.exists;
        const startedAt = parseInt(localStorage.getItem('dataClearedAt') || '0', 10);
        const ageMs = Date.now() - startedAt;
        // Desbloquear si ya no hay datos (borrado completado) o si pasó un TTL de seguridad
        if (!exists || ageMs > 8000) {
          localStorage.removeItem('dataCleared');
          localStorage.removeItem('dataClearedAt');
          if (!cancelled) {
            setDisabledByClear(false);
            setHasValidData(exists);
          }
          return; // terminar polling
        }
        if (!cancelled) setHasValidData(exists);
        setTimeout(poll, 1000);
      } catch (e) {
        // reintentar suave
        if (!cancelled) setTimeout(poll, 1500);
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [disabledByClear]);

  // Helper para iniciales seguras
  const initials = (() => {
    try {
      const s = JSON.parse(localStorage.getItem('session'));
      const n = (s?.nombre || 'Invitado').trim();
      return n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    } catch {
      return 'IN';
    }
  })();

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
          {initials}
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
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h2>
      </div>

      {showNav && (
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
            { to: '/dashboardKPIs', label: 'Dashboard', enabled: hasValidData && !disabledByClear, requirement: 'CSV válido' },
            { to: '/explorador', label: 'Explorador', enabled: hasValidData && !disabledByClear, requirement: 'CSV válido' },
            { to: '/historial', label: 'Historial', enabled: true, requirement: '' },
          ].map(link => (
            <NavLink
              key={link.to}
              to={link.enabled ? link.to : '#'}
              style={({ isActive }) => ({
                color: link.enabled ? (isActive ? '#1f2937' : '#374151') : '#9ca3af',
                textDecoration: isActive && link.enabled ? 'underline' : 'none',
                fontWeight: isActive && link.enabled ? 700 : 500,
                padding: '6px 8px',
                borderRadius: 6,
                cursor: link.enabled ? 'pointer' : 'not-allowed',
                opacity: link.enabled ? 1 : 0.5,
                position: 'relative'
              })}
              onClick={(e) => {
                if (!link.enabled) {
                  e.preventDefault();
                  if (!isLoading) {
                    let message = `No se puede acceder a ${link.label}.`;
                    if (link.requirement) message += `\n\nSe requiere: ${link.requirement}`;
                    if (link.to === '/dashboardKPIs' || link.to === '/explorador') {
                      message += '\n\nVaya a "Carga de Datos" para subir un archivo CSV con datos válidos.';
                    }
                    alert(message);
                  }
                } else if (link.clearData) {
                  // Limpiar inmediatamente: bloquear y navegar, y limpiar en background
                  e.preventDefault();
                  if (hasValidData && !disabledByClear) {
                    const confirmed = window.confirm('Si cargas otro archivo se perderán los datos actuales. ¿Deseas continuar?');
                    if (!confirmed) return;
                  }
                  localStorage.setItem('dataCleared', '1');
                  localStorage.setItem('dataClearedAt', String(Date.now()));
                  setDisabledByClear(true);
                  setHasValidData(false);
                  navigate('/');
                  fetch('/api/contacts/clear', { method: 'DELETE' }).catch(() => {});
                }
              }}
              title={link.enabled ? '' : `Requiere ${link.requirement || 'datos'}`}
            >
              {link.label}
              {!link.enabled && !isLoading && (
                <span style={{ marginLeft: 4, fontSize: 10, verticalAlign: 'super', color: '#ef4444' }}>🔒</span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
};

export default Header;

