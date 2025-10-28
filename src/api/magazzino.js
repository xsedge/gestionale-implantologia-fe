import http from 'src/components/api/http.js'

export function getGiacenze() {
  return http.get('/magazzino/giacenze')
}

export function getMovimenti(params = {}) {
  return http.get('/magazzino/movimenti', { params })
}

export function createMovimento(payload) {
  return http.post('/magazzino/movimenti', payload)
}

export function updateStatoMovimento(id, payload) {
  return http.put(`/magazzino/movimenti/${id}/stato`, payload)
}

export function deleteStatoMovimento(id) {
  return http.delete(`/magazzino/movimenti/${id}/delete`)
}
