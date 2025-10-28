import { defineStore } from 'pinia'
import {
  fetchFornitori,
  createFornitore,
  updateFornitore,
  deleteFornitore
} from 'src/api/implantologia/fornitori.js'

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

export const useImplantologiaFornitoriStore = defineStore('implantologiaFornitori', {
  state: () => ({
    fornitori: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await fetchFornitori(params)
        this.fornitori = extractList(data)
        return this.fornitori
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      this.error = null
      const result = await createFornitore(payload)
      await this.fetchAll()
      return result
    },
    async update(id, payload) {
      this.error = null
      const result = await updateFornitore(id, payload)
      await this.fetchAll()
      return result
    },
    async remove(id) {
      this.error = null
      await deleteFornitore(id)
      await this.fetchAll()
    }
  }
})
