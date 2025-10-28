import http from 'src/components/api/http.js'

const BASE_URL = '/api/v1/implantologia/prodotti'

export function fetchProdotti(params = {}) {
  return http.get(BASE_URL, { params })
}

export function fetchProdotto(id) {
  return http.get(`${BASE_URL}/${id}`)
}

export function createProdotto(payload) {
  return http.post(BASE_URL, payload)
}

export function updateProdotto(id, payload) {
  return http.put(`${BASE_URL}/${id}`, payload)
}

export function deleteProdotto(id) {
  return http.delete(`${BASE_URL}/${id}`)
}

export function fetchCategorieProdotto() {
  return http.get(`${BASE_URL}/categorie`)
}
