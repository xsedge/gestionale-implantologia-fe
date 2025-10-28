import http from 'src/components/api/http.js'

const BASE_URL = '/api/v1/implantologia/clienti'

export function fetchClienti(params = {}) {
  return http.get(BASE_URL, { params })
}

export function fetchCliente(id) {
  return http.get(`${BASE_URL}/${id}`)
}

export function createCliente(payload) {
  return http.post(BASE_URL, payload)
}

export function updateCliente(id, payload) {
  return http.put(`${BASE_URL}/${id}`, payload)
}

export function deleteCliente(id) {
  return http.delete(`${BASE_URL}/${id}`)
}
