import http from 'src/components/api/http.js'

const BASE_URL = '/api/v1/implantologia/fornitori'

export function fetchFornitori(params = {}) {
  return http.get(BASE_URL, { params })
}

export function fetchFornitore(id) {
  return http.get(`${BASE_URL}/${id}`)
}

export function createFornitore(payload) {
  return http.post(BASE_URL, payload)
}

export function updateFornitore(id, payload) {
  return http.put(`${BASE_URL}/${id}`, payload)
}

export function deleteFornitore(id) {
  return http.delete(`${BASE_URL}/${id}`)
}
