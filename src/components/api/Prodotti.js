import http from 'src/components/api/http.js'

const controllerPath = '/api/prodotto'
const controllerPathTipologia = '/api/prodotto/tipologia'

export default {
  createUpdate(data) {
    return http.post(`${controllerPath}/saving`, data)
  },

  getAll(params = {}) {
    return http.get(`${controllerPath}/get-all`, { params })
  },

  getById(idCliente) {
    return http.get(`${controllerPath}/get-by-id/${idCliente}`)
  },

  deleteById(idProdotto) {
    return http.delete(`${controllerPath}/delete/${idProdotto}`)
  },

  createUpdateTipologia(data) {
    return http.post(`${controllerPathTipologia}/saving`, data)
  },

  getAllTipologia(params = {}) {
    return http.get(`${controllerPathTipologia}/get-all`, { params })
  },

  getByIdTipologia(idTipologia) {
    return http.get(`${controllerPathTipologia}/get-by-id/${idTipologia}`)
  },

  deleteByIdTipologia(idTipologia) {
    return http.delete(`${controllerPathTipologia}/delete/${idTipologia}`)
  }
}
