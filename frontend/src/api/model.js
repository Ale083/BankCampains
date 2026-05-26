const API_BASE_URL = 'https://bankcampains.onrender.com:3001'; 
const PREDICT_URL = `${API_BASE_URL}/api/model/predict`;

export async function predictProbability(clientData) {
  const res = await fetch(PREDICT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error al predecir: ${res.status} ${text}`);
  }

  const raw = await res.json();


  const probability =
    typeof raw.probabilidad === 'number'
      ? raw.probabilidad
      : raw.probability;

  if (typeof probability !== 'number' || Number.isNaN(probability)) {
    console.error('Respuesta de backend:', raw);
    throw new Error('Respuesta de predicción sin campo de probabilidad numérico');
  }

  return {
    probability,
    classLabel: raw.clase ?? raw.predicted_class ?? null,
    level: raw.nivel ?? null,
    thresholdUsed: raw.threshold_usado ?? raw.threshold ?? null,
    factoresInfluyentes: raw.factores_influyentes ?? null,
    raw, 
  };
}
