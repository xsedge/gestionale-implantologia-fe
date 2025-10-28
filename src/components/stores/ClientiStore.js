// src/stores/clienti.js
import { defineStore } from 'pinia'
import ClientiService from 'src/components/api/Clienti'
import { showNotification } from '../api/ShowNotification'


export const useClientiStore = defineStore('clienti', {
  state: () => ({
    clienti: [],
    cliente: null,
    loading: false,
    error: null,
    // paginazione lato server
    totalElements: 0
  }),

  actions: {
    async fetchClienti() {
      this.loading = true
      this.error = null
      try {
        const response = await ClientiService.getAllClienti()
        this.clienti = response.content
      } catch (err) {
        this.error = err
        showNotification('negative', err)
      } finally {
        this.loading = false
      }
    },

    // Ricerca lato server con filtri e pageable
    // opts: { filter, page, size, sortBy, descending }
    async searchClienti(opts = {}) {
      const { filter = {}, page = 0, size = 10, sortBy, descending } = opts
      this.loading = true
      this.error = null
      try {
        const params = { page, size }
        if (sortBy) {
          params.sort = `${sortBy},${descending ? 'desc' : 'asc'}`
        }
        const response = await ClientiService.search(filter, params)
        // risposta Page<ClienteResponseDTO>
        this.clienti = Array.isArray(response?.content) ? response.content : []
        this.totalElements = typeof response?.totalElements === 'number' ? response.totalElements : this.clienti.length
        return response
      } catch (err) {
        this.error = err
        showNotification('negative', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchClienteById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await ClientiService.getById(id)
        console.log(response)
        this.cliente = response
      } catch (err) {
        this.error = err
        showNotification('negative', err)
      } finally {
        this.loading = false
      }
    },

    async createUpdateCliente(clienteData) {
      try {
        await ClientiService.createUpdate(clienteData)
        showNotification('positive', 'Cliente salvato con successo')
      } catch (err) {
        this.error = err
        showNotification('negative', err)
      }
    },

    async deleteCliente(id) {
      try {
        await ClientiService.deleteById(id)
        this.clienti = this.clienti.filter(c => c.id !== id)
        showNotification('positive', 'Cliente eliminato con successo')
      } catch (err) {
        this.error = err
        showNotification('negative', err)
      }
    }
  }
})
