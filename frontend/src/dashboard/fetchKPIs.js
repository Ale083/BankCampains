const URL_BASE = process.env.URL_BASE || "http://localhost:3001";

const withQS = (path, qs) => (qs && qs.length ? `${path}?${qs}` : path);

export async function fetchKPIs(filtersQS = "") {
  try {
    const qsBase = filtersQS || "";
    return {
      tasaConversion: await tasaConversion(qsBase),
      avgDuration: await avgDuration(qsBase),
      contactosPorMes: await contactosPorMes(qsBase),
      tasaExitoPorCanal: await tasaExitoPorCanal(qsBase),
      conversionPorEdad: await conversionPorEdad(qsBase),
      impactoHistorialPrevio: await impactoHistorialPrevio(qsBase),
      indiceEficienciaPorCampaña: await indiceEficienciaPorCampaña(qsBase),
    };
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    throw error;
  }
}

async function tasaConversion(filtersQS) {
  return fetch(withQS(`${URL_BASE}/kpis/conversion-rate`, filtersQS)).then(r => r.json());
}

async function avgDuration(filtersQS) {
  return fetch(withQS(`${URL_BASE}/kpis/avg-duration`, filtersQS)).then(r => r.json());
}

async function contactosPorMes(filtersQS) {
  return fetch(withQS(`${URL_BASE}/kpis/contacts-by-month`, filtersQS)).then(r => r.json());
}

async function tasaExitoPorCanal(filtersQS) {
  return fetch(withQS(`${URL_BASE}/kpis/channel-success`, filtersQS)).then(r => r.json());
}

async function conversionPorEdad(filtersQS) {
  return fetch(withQS(`${URL_BASE}/kpis/age-conversion`, filtersQS)).then(r => r.json());
}

async function impactoHistorialPrevio(filtersQS) {
  return fetch(withQS(`${URL_BASE}/kpis/poutcome-stacked`, filtersQS)).then(r => r.json());
}

async function indiceEficienciaPorCampaña(filtersQS) {
  return fetch(withQS(`${URL_BASE}/kpis/efficiency-lines`, filtersQS)).then(r => r.json());
}
