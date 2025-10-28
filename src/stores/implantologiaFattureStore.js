import { defineStore } from 'pinia'
import {
  fetchFatture,
  createFattura,
  updateFattura,
  deleteFattura,
  generaPdf
} from 'src/api/implantologia/fatture.js'

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

export const useImplantologiaFattureStore = defineStore('implantologiaFatture', {
  state: () => ({
    fatture: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await fetchFatture(params)
        this.fatture = extractList(data)
        return this.fatture
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      this.error = null
      const result = await createFattura(payload)
      await this.fetchAll()
      return result
    },
    async update(id, payload) {
      this.error = null
      const result = await updateFattura(id, payload)
      await this.fetchAll()
      return result
    },
    async remove(id) {
      this.error = null
      await deleteFattura(id)
      await this.fetchAll()
    },
    async downloadPdf(id) {
      return generaPdf(id)
    }
  }
})
