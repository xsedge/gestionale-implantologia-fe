import { defineStore } from 'pinia'
import {
  fetchVendite,
  createVendita,
  updateVendita,
  deleteVendita
} from 'src/api/implantologia/vendite.js'

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

export const useImplantologiaVenditeStore = defineStore('implantologiaVendite', {
  state: () => ({
    vendite: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await fetchVendite(params)
        this.vendite = extractList(data)
        return this.vendite
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      this.error = null
      const result = await createVendita(payload)
      await this.fetchAll()
      return result
    },
    async update(id, payload) {
      this.error = null
      const result = await updateVendita(id, payload)
      await this.fetchAll()
      return result
    },
    async remove(id) {
      this.error = null
      await deleteVendita(id)
      await this.fetchAll()
    }
  }
})
