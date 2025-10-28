import http from 'src/components/api/http.js'

const BASE_URL = '/api/v1/implantologia/acquisti'

export function fetchAcquisti(params = {}) {
  return http.get(BASE_URL, { params })
}

export function fetchAcquisto(id) {
  return http.get(`${BASE_URL}/${id}`)
}

export function createAcquisto(payload) {
  return http.post(BASE_URL, payload)
}

export function updateAcquisto(id, payload) {
  return http.put(`${BASE_URL}/${id}`, payload)
}

export function deleteAcquisto(id) {
  return http.delete(`${BASE_URL}/${id}`)
}
