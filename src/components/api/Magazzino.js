import http from 'src/components/api/http.js'

const controllerPath = '/api/magazzino'

export default {
  getMovimenti(params = {}) {
    return http.get(`${controllerPath}/movimenti`, { params })
  },

  getMovimentiByProdotto(idProdotto, params = {}) {
    return http.get(`${controllerPath}/movimenti/prodotto/${idProdotto}`, { params })
  },

  getGiacenza(idProdotto) {
    return http.get(`${controllerPath}/giacenza/${idProdotto}`)
  },

  registraOrdinato(data) {
    return http.post(`${controllerPath}/ordinato`, data)
  },

  registraConsegnato(data) {
    return http.post(`${controllerPath}/consegnato`, data)
  },

  registraScarico(data) {
    return http.post(`${controllerPath}/scarico`, data)
  },

  aggiornaStatoMovimento(idMovimento, nuovoStato) {
    return http.patch(`${controllerPath}/movimenti/${idMovimento}/stato`, {
      nuovoStato: nuovoStato
    })
  }
}
