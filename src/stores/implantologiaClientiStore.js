import { defineStore } from 'pinia'
import {
  fetchClienti,
  createCliente,
  updateCliente,
  deleteCliente
} from 'src/api/implantologia/clienti.js'

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

export const useImplantologiaClientiStore = defineStore('implantologiaClienti', {
  state: () => ({
    clienti: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await fetchClienti(params)
        this.clienti = extractList(data)
        return this.clienti
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      this.error = null
      const result = await createCliente(payload)
      await this.fetchAll()
      return result
    },
    async update(id, payload) {
      this.error = null
      const result = await updateCliente(id, payload)
      await this.fetchAll()
      return result
    },
    async remove(id) {
      this.error = null
      await deleteCliente(id)
      await this.fetchAll()
    }
  }
})
