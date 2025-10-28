import http from 'src/components/api/http.js'

const BASE_URL = '/api/v1/implantologia/listini'

export function fetchListini(params = {}) {
  return http.get(BASE_URL, { params })
}

export function fetchListino(id) {
  return http.get(`${BASE_URL}/${id}`)
}

export function createListino(payload) {
  return http.post(BASE_URL, payload)
}

export function updateListino(id, payload) {
  return http.put(`${BASE_URL}/${id}`, payload)
}

export function deleteListino(id) {
  return http.delete(`${BASE_URL}/${id}`)
}
