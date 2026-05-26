import { apiFetch } from '../api/client';

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
  return apiFetch(withQS('/kpis/conversion-rate', filtersQS)).then(r => r.json());
}

async function avgDuration(filtersQS) {
  return apiFetch(withQS('/kpis/avg-duration', filtersQS)).then(r => r.json());
}

async function contactosPorMes(filtersQS) {
  return apiFetch(withQS('/kpis/contacts-by-month', filtersQS)).then(r => r.json());
}

async function tasaExitoPorCanal(filtersQS) {
  return apiFetch(withQS('/kpis/channel-success', filtersQS)).then(r => r.json());
}

async function conversionPorEdad(filtersQS) {
  return apiFetch(withQS('/kpis/age-conversion', filtersQS)).then(r => r.json());
}

async function impactoHistorialPrevio(filtersQS) {
  return apiFetch(withQS('/kpis/poutcome-stacked', filtersQS)).then(r => r.json());
}

async function indiceEficienciaPorCampaña(filtersQS) {
  return apiFetch(withQS('/kpis/efficiency-lines', filtersQS)).then(r => r.json());
}
