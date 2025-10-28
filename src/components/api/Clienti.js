import http from 'src/components/api/http.js'

const controllerPath = '/api/cliente'

export default {
  createUpdate(data) {
    return http.post(`${controllerPath}/saving`, data)
  },

  getAllClienti() {
    return http.get(`${controllerPath}/get-all`)
  },

  // Ricerca con filtri dinamici e paginazione/sorting lato backend
  // filter: oggetto conforme a ClienteFilterDTO
  // params: { page, size, sort } secondo convenzione Spring Pageable
  search(filter = {}, params = {}) {
    return http.post(`${controllerPath}/search`, filter, { params })
  },

  getById(idCliente) {
    return http.get(`${controllerPath}/get-by-id/${idCliente}`)
  },

  deleteById(idCliente) {
    return http.delete(`${controllerPath}/delete/${idCliente}`)
  }
}
