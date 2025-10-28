import { defineStore } from 'pinia'
import {
  fetchListini,
  createListino,
  updateListino,
  deleteListino
} from 'src/api/implantologia/listini.js'

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

export const useImplantologiaListiniStore = defineStore('implantologiaListini', {
  state: () => ({
    listini: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await fetchListini(params)
        this.listini = extractList(data)
        return this.listini
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      this.error = null
      const result = await createListino(payload)
      await this.fetchAll()
      return result
    },
    async update(id, payload) {
      this.error = null
      const result = await updateListino(id, payload)
      await this.fetchAll()
      return result
    },
    async remove(id) {
      this.error = null
      await deleteListino(id)
      await this.fetchAll()
    }
  }
})
