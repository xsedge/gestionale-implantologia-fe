import http from 'src/components/api/http.js'

const BASE_URL = '/api/v1/implantologia/vendite'

export function fetchVendite(params = {}) {
  return http.get(BASE_URL, { params })
}

export function fetchVendita(id) {
  return http.get(`${BASE_URL}/${id}`)
}

export function createVendita(payload) {
  return http.post(BASE_URL, payload)
}

export function updateVendita(id, payload) {
  return http.put(`${BASE_URL}/${id}`, payload)
}

export function deleteVendita(id) {
  return http.delete(`${BASE_URL}/${id}`)
}

export function aggiornaStatoPagamento(id, stato) {
  return http.patch(`${BASE_URL}/${id}/stato-pagamento`, { statoPagamento: stato })
}
