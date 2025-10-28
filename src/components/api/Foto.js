import http from 'http.js'

const controllerPath = '/api/foto'

export default {
  create(data) {
    return http.post(`${controllerPath}/saving`, data)
  },

  getAll(params = {}) {
    return http.get(`${controllerPath}/get-all`, { params })
  }
}
