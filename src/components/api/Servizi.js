import http from 'src/components/api/http.js'

const controllerPath = '/api/servizio'

export default {
  createUpdate(data) {
    return http.post(`${controllerPath}/saving`, data)
  },

  getAll(params = {}) {
    return http.get(`${controllerPath}/get-all`, { params })
  },

  search(filter = {}, params = {}) {
    const queryParams = { ...params }
    const sorgente = filter || {}
    Object.entries(sorgente).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return
      }
      if (key === 'query' && typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed) {
          queryParams[key] = trimmed
        }
        return
      }
      queryParams[key] = value
    })
    return http.get(`${controllerPath}/search`, { params: queryParams })
  },

  getById(idServizio) {
    return http.get(`${controllerPath}/get-by-id/${idServizio}`)
  },

  deleteById(idServizio) {
    return http.delete(`${controllerPath}/delete/${idServizio}`)
  }
}
