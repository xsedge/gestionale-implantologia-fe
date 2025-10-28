import http from 'src/components/api/http.js'

const BASE_URL = '/api/v1/implantologia/fatture'

export function fetchFatture(params = {}) {
  return http.get(BASE_URL, { params })
}

export function fetchFattura(id) {
  return http.get(`${BASE_URL}/${id}`)
}

export function createFattura(payload) {
  return http.post(BASE_URL, payload)
}

export function updateFattura(id, payload) {
  return http.put(`${BASE_URL}/${id}`, payload)
}

export function deleteFattura(id) {
  return http.delete(`${BASE_URL}/${id}`)
}

export function generaPdf(id) {
  return http.get(`${BASE_URL}/${id}/pdf`, { responseType: 'blob' })
}
