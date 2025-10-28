import http from 'src/components/api/http.js'

const controllerPath = '/api/ordine'

export default {
  createUpdate(data) {
    return http.post(`${controllerPath}/saving`, data)
  },

  async getAll(params = {}) {
    try {
      const response = await http.get(`${controllerPath}/get-all`, { params });
      // LOG ESATTAMENTE COSA RICEVI DA HTTP.JS
      //('1. Dati in OrdiniService.getAll() PRIMA DEL RETURN:', response);
      if (Array.isArray(response)) {
        //response.forEach((ordine, index) => {
        //console.log(`1.1 Ordine[${index}] servizi:`, ordine.servizi);
        //});
      }
      return response;
    } catch (error) {
      console.error('Errore nel service Ordini.getAll:', error);
      throw error;
    }
  },

  search(filter = {}, params = {}) {
    return http.post(`${controllerPath}/search`, filter, { params })
  },

  getById(ordineId) {
    return http.get(`${controllerPath}/get-by-id/${ordineId}`)
  },

  getByCliente(clienteId) {
    return http.get(`${controllerPath}/get-all-by-cliente/${clienteId}`)
  },

  getTimeline(clienteId) {
    return http.get(`${controllerPath}/timeline/${clienteId}`)
  },
  deleteById(ordineId) {
    return http.delete(`${controllerPath}/delete-by-id/${ordineId}`)
  }
}
