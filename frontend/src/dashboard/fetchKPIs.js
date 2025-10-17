const URL_BASE = process.env.URL_BASE || 'http://localhost:4000';

export async function fetchKPIs(G, C) {
    try {
        return {
            tasaConversion: await tasaConversion(),
            avgDuration: await avgDuration(),
            rentabilidad: await rentabilidad(G, C),
            contactosPorMes: await contactosPorMes(),
            tasaExitoPorCanal: await tasaExitoPorCanal(),
            conversionPorEdad: await conversionPorEdad(),
            impactoHistorialPrevio: await impactoHistorialPrevio(),
            indiceEficienciaPorCampaña: await indiceEficienciaPorCampaña()
        }
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        throw error;
    }
}

async function tasaConversion(){
    return await fetch(`${URL_BASE}/kpis/conversion-rate?${localStorage.getItem("filters")}`).then(res => res.json());
}

async function avgDuration(){
    return await fetch(`${URL_BASE}/kpis/avg-duration?${localStorage.getItem("filters")}`).then(res => res.json());
}

export async function rentabilidad(G, C){
    return await fetch(`${URL_BASE}/kpis/rentabilidad?G=${G}&C=${C}&${localStorage.getItem("filters")}`).then(res => res.json());
}

async function contactosPorMes(){
    return await fetch(`${URL_BASE}/kpis/contacts-by-month?${localStorage.getItem("filters")}`).then(res => res.json());
}

async function tasaExitoPorCanal(){
    return await fetch(`${URL_BASE}/kpis/channel-success?${localStorage.getItem("filters")}`).then(res => res.json());
}

async function conversionPorEdad(){
    return await fetch(`${URL_BASE}/kpis/age-conversion?${localStorage.getItem("filters")}`).then(res => res.json());
}

async function impactoHistorialPrevio(){
    return await fetch(`${URL_BASE}/kpis/poutcome-stacked?${localStorage.getItem("filters")}`).then(res => res.json());
}

async function indiceEficienciaPorCampaña(){
    return await fetch(`${URL_BASE}/kpis/efficiency-lines?${localStorage.getItem("filters")}`).then(res => res.json());
}
