import http from 'src/components/api/http.js'

const controllerPath = '/api/statistiche';

export async function fetchOrdiniPerCliente() {
    const res = await http.get(`${controllerPath}/ordini-per-cliente`);
    return res;
}

export async function fetchServiziPiuRichiesti() {
    const res = await http.get(`${controllerPath}/servizi-piu-richiesti`);
    return res;
}

export async function fetchProdottiPiuUtilizzati() {
    const res = await http.get(`${controllerPath}/prodotti-piu-utilizzati`);
    return res;
}

export async function fetchFatturatoMensile() {
    const res = await http.get(`${controllerPath}/fatturato-mensile`);
    return res;
}

export async function fetchDurataMediaServizi() {
    const res = await http.get(`${controllerPath}/durata-media-servizi`);
    return res;
}

export async function fetchProduttivitaOperatore() {
    const res = await http.get(`${controllerPath}/produttivita-operatore`);
    return res;
}
