import http from 'src/components/api/http.js'

const BASE_URL = '/api/v1/implantologia/magazzino'

export function fetchMovimenti(params = {}) {
  return http.get(`${BASE_URL}/movimenti`, { params })
}

export function fetchGiacenze() {
  return http.get(`${BASE_URL}/giacenze`)
}
