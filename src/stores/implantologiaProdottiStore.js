import { defineStore } from 'pinia'
import {
  fetchProdotti,
  fetchCategorieProdotto,
  createProdotto,
  updateProdotto,
  deleteProdotto
} from 'src/api/implantologia/prodotti.js'

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

export const useImplantologiaProdottiStore = defineStore('implantologiaProdotti', {
  state: () => ({
    prodotti: [],
    categorie: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await fetchProdotti(params)
        this.prodotti = extractList(data)
        return this.prodotti
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchCategorie() {
      try {
        const data = await fetchCategorieProdotto()
        this.categorie = extractList(data)
      } catch (error) {
        this.error = error
        throw error
      }
    },
    async create(payload) {
      this.error = null
      const result = await createProdotto(payload)
      await this.fetchAll()
      return result
    },
    async update(id, payload) {
      this.error = null
      const result = await updateProdotto(id, payload)
      await this.fetchAll()
      return result
    },
    async remove(id) {
      this.error = null
      await deleteProdotto(id)
      await this.fetchAll()
    }
  }
})
