const URL_BASE = process.env.URL_BASE || 'http://localhost:3001';

export async function fetchKPIs(G, C) {
    try {
        const filters = localStorage.getItem("filters");
        return {
            tasaConversion: await tasaConversion(filters),
            avgDuration: await avgDuration(filters),
            rentabilidad: await rentabilidad(G, C),
            contactosPorMes: await contactosPorMes(filters),
            tasaExitoPorCanal: await tasaExitoPorCanal(filters),
            conversionPorEdad: await conversionPorEdad(filters),
            impactoHistorialPrevio: await impactoHistorialPrevio(filters),
            indiceEficienciaPorCampaña: await indiceEficienciaPorCampaña(filters)
        }
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        throw error;
    }
}

async function tasaConversion(filters){
    return await fetch(`${URL_BASE}/kpis/conversion-rate?${filters}`).then(res => res.json());
}

async function avgDuration(filters){
    return await fetch(`${URL_BASE}/kpis/avg-duration?${filters}`).then(res => res.json());
}

export async function rentabilidad(G, C){
    return await fetch(`${URL_BASE}/kpis/rentabilidad?G=${G}&C=${C}&${localStorage.getItem("filters")}`).then(res => res.json());
}

async function contactosPorMes(filters){
    return await fetch(`${URL_BASE}/kpis/contacts-by-month?${filters}`).then(res => res.json());
}

async function tasaExitoPorCanal(filters){
    return await fetch(`${URL_BASE}/kpis/channel-success?${filters}`).then(res => res.json());
}

async function conversionPorEdad(filters){
    return await fetch(`${URL_BASE}/kpis/age-conversion?${filters}`).then(res => res.json());
}

async function impactoHistorialPrevio(filters){
    return await fetch(`${URL_BASE}/kpis/poutcome-stacked?${filters}`).then(res => res.json());
}

async function indiceEficienciaPorCampaña(filters){
    return await fetch(`${URL_BASE}/kpis/efficiency-lines?${filters}`).then(res => res.json());
}
