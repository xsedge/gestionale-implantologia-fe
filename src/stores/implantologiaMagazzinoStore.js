import { defineStore } from 'pinia'
import { fetchMovimenti, fetchGiacenze } from 'src/api/implantologia/magazzino.js'

function extractList(response) {
  if (!response) {
    return []
  }
  if (Array.isArray(response)) {
    return response
  }
  if (Array.isArray(response?.content)) {
    return response.content
  }
  if (Array.isArray(response?.data)) {
    return response.data
  }
  return []
}

export const useImplantologiaMagazzinoStore = defineStore('implantologiaMagazzino', {
  state: () => ({
    movimenti: [],
    giacenze: [],
    loading: false,
    error: null
  }),
  getters: {
    categorieDisponibili(state) {
      const categorie = new Set()
      state.giacenze.forEach(item => {
        if (item.categoria) {
          categorie.add(item.categoria)
        }
      })
      return Array.from(categorie)
    }
  },
  actions: {
    async fetchMovimenti(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await fetchMovimenti(params)
        this.movimenti = extractList(data)
        return this.movimenti
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchGiacenze() {
      try {
        const data = await fetchGiacenze()
        this.giacenze = extractList(data)
        return this.giacenze
      } catch (error) {
        this.error = error
        throw error
      }
    }
  }
})
