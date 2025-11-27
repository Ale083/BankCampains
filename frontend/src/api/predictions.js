import { authFetch } from './client';

/**
 * Realiza una predicción de probabilidad de aceptación del producto bancario
 * @param {Object} prospectData - Datos del prospecto (edad, ocupación, nivel educativo, etc.)
 * @returns {Promise<Object>} - { probabilidad, clase, nivel, threshold_usado }
 */
export async function predictProbability(prospectData) {
  try {
    const response = await authFetch('/api/model/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prospectData),
    });

    if (!response.ok) {
      throw new Error(`Error en predicción: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en predictProbability:', error);
    throw error;
  }
}

/**
 * Obtiene la interpretación cualitativa de una probabilidad
 * @param {number} probabilidad - Valor entre 0 y 1
 * @returns {string} - 'Baja', 'Media' o 'Alta'
 */
export function getProbabilityLevel(probabilidad) {
  if (probabilidad < 0.5) return 'Baja';
  if (probabilidad < 0.75) return 'Media';
  return 'Alta';
}
