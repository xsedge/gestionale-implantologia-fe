import { defineStore } from 'pinia'
import {
  fetchAcquisti,
  createAcquisto,
  updateAcquisto,
  deleteAcquisto,
  completaAcquisto
} from 'src/api/implantologia/acquisti.js'

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

export const useImplantologiaAcquistiStore = defineStore('implantologiaAcquisti', {
  state: () => ({
    acquisti: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await fetchAcquisti(params)
        this.acquisti = extractList(data)
        return this.acquisti
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      this.error = null
      const result = await createAcquisto(payload)
      await this.fetchAll()
      return result
    },
    async update(id, payload) {
      this.error = null
      const result = await updateAcquisto(id, payload)
      await this.fetchAll()
      return result
    },
    async remove(id) {
      this.error = null
      await deleteAcquisto(id)
      await this.fetchAll()
    },
    async completa(id) {
      this.error = null
      const result = await completaAcquisto(id)
      await this.fetchAll()
      return result
    }
  }
})
