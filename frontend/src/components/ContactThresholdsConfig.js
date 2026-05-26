

import React, { useState, useEffect } from 'react';
import Header from './Header';

const STORAGE_KEY = 'bankCampains_contact_thresholds';

const DEFAULT_THRESHOLDS = {
  contactoInmediato: 75,   
  segundoIntento: 50,       
  noPriorizar: 50          
};

const ContactThresholdsConfig = () => {
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);


  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThresholds({
          contactoInmediato: parsed.contactoInmediato || DEFAULT_THRESHOLDS.contactoInmediato,
          segundoIntento: parsed.segundoIntento || DEFAULT_THRESHOLDS.segundoIntento,
          noPriorizar: parsed.noPriorizar || DEFAULT_THRESHOLDS.noPriorizar
        });
      } catch (error) {
        console.error('Error loading thresholds config:', error);
      }
    }
  }, []);

 
  const updateThreshold = (key, value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return;
    
    setThresholds(prev => ({
      ...prev,
      [key]: numValue
    }));
    setHasChanges(true);
  };

 
  const validateThresholds = () => {
    if (thresholds.contactoInmediato <= thresholds.segundoIntento) {
      alert('El umbral de "Contacto Inmediato" debe ser mayor que "Segundo Intento"');
      return false;
    }
    return true;
  };

  
  const saveConfiguration = () => {
    if (!validateThresholds()) return;

    try {
      
      const configForBackend = {
        contactoInmediato: thresholds.contactoInmediato / 100,
        segundoIntento: thresholds.segundoIntento / 100,
        noPriorizar: thresholds.noPriorizar / 100
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(configForBackend));
      setHasChanges(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      
      window.dispatchEvent(new CustomEvent('contactThresholdsUpdated', {
        detail: configForBackend
      }));
    } catch (error) {
      console.error('Error saving thresholds config:', error);
      alert('Error al guardar la configuración');
    }
  };

  
  const resetToDefaults = () => {
    if (window.confirm('¿Estás seguro de restaurar los valores por defecto? Se perderán los cambios actuales.')) {
      setThresholds(DEFAULT_THRESHOLDS);
      setHasChanges(true);
    }
  };


  const getActionColor = (action) => {
    switch (action) {
      case 'inmediato': return '#ef4444'; 
      case 'segundo': return '#f59e0b';   
      case 'no': return '#6b7280';        
      default: return '#6b7280';
    }
  };

  return (
    <>
      <Header title="Configuración de Umbrales de Contacto" showNavbar={true} />
      
      <div style={{ 
        padding: '24px 32px', 
        maxWidth: '1000px', 
        margin: '0 auto',
        background: '#f9fafb',
        minHeight: '100vh'
      }}>
        
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{ margin: 0, color: '#1f2937' }}>
              Configurar Umbrales de Probabilidad
            </h2>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={resetToDefaults}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #9ca3af',
                  background: '#f9fafb',
                  color: '#374151',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Restaurar por defecto
              </button>
              
              <button
                onClick={saveConfiguration}
                disabled={!hasChanges}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: hasChanges ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: hasChanges ? 'pointer' : 'not-allowed'
                }}
              >
                Guardar cambios
              </button>
            </div>
          </div>

          {showSuccess && (
            <div style={{
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              color: '#065f46'
            }}>
               Configuración guardada exitosamente
            </div>
          )}

          <p style={{ color: '#6b7280', marginBottom: '32px', lineHeight: 1.6 }}>
            Define los umbrales de probabilidad que determinarán qué acción tomar con cada cliente.
            Los valores se expresan como porcentajes (0-100%).
          </p>

          {/* Configuración de umbrales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Contacto Inmediato */}
            <div style={{
              border: `3px solid ${getActionColor('inmediato')}`,
              borderRadius: '12px',
              padding: '20px',
              background: '#fef2f2'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: getActionColor('inmediato')
                }}></div>
                <h3 style={{ margin: 0, color: getActionColor('inmediato') }}>
                   Contacto Inmediato
                </h3>
              </div>
              
              <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                Contactar de inmediato
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#374151', fontSize: '14px' }}>≥</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={thresholds.contactoInmediato}
                  onChange={(e) => updateThreshold('contactoInmediato', e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #ef4444',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                    width: '80px'
                  }}
                />
                <span style={{ color: '#374151', fontSize: '14px' }}>%</span>
              </div>
            </div>

            {/* Segundo Intento */}
            <div style={{
              border: `3px solid ${getActionColor('segundo')}`,
              borderRadius: '12px',
              padding: '20px',
              background: '#fffbeb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: getActionColor('segundo')
                }}></div>
                <h3 style={{ margin: 0, color: getActionColor('segundo') }}>
                   Segundo Intento
                </h3>
              </div>
              
              <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                Segundo intento 
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#374151', fontSize: '14px' }}>≥</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={thresholds.segundoIntento}
                  onChange={(e) => updateThreshold('segundoIntento', e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #f59e0b',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                    width: '80px'
                  }}
                />
                <span style={{ color: '#374151', fontSize: '14px' }}>%</span>
              </div>
            </div>

            {/* No Priorizar */}
            <div style={{
              border: `3px solid ${getActionColor('no')}`,
              borderRadius: '12px',
              padding: '20px',
              background: '#f9fafb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: getActionColor('no')
                }}></div>
                <h3 style={{ margin: 0, color: getActionColor('no') }}>
                   No Priorizar
                </h3>
              </div>
              
              <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                No priorizar seguimiento
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#374151', fontSize: '14px' }}>&lt;</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={thresholds.segundoIntento}
                  disabled
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                    width: '80px',
                    background: '#f3f4f6',
                    color: '#6b7280'
                  }}
                />
                <span style={{ color: '#374151', fontSize: '14px' }}>%</span>
              </div>
            </div>
          </div>

          {hasChanges && (
            <div style={{
              padding: '12px',
              background: '#fffbeb',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              color: '#92400e',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              Tienes cambios sin guardar. Haz clic en "Guardar cambios" para aplicar la configuración.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactThresholdsConfig;
