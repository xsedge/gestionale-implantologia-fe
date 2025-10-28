import { defineStore } from 'pinia'
import servizioService from 'src/components/api/Servizi'
import { showNotification } from '../api/ShowNotification'

const servizioVuoto = () => ({
  idServizio: null,
  nome: '',
  descrizione: '',
  note: '',
  prezzoBase: 0
})

export const useServiziStore = defineStore('servizioStore', {
  state: () => ({
    servizi: [],
    servizio: null,
    servizioCorrente: servizioVuoto(),
    loading: false,
    error: null,
    totalElements: 0,
    lastSearchOptions: null
  }),

  actions: {
    async fetchAll(page = 0, size = 100) {
      const response = await this.searchServizi({ page, size, filter: {}, storeLast: false })
      return Array.isArray(response?.content) ? response.content : this.servizi
    },

    async searchServizi(opts = {}) {
      const {
        filter = {},
        page = 0,
        size = 10,
        sortBy,
        descending,
        storeLast = true
      } = opts
      this.loading = true
      this.error = null
      try {
        const params = { page, size }
        if (sortBy) {
          params.sort = `${sortBy},${descending ? 'desc' : 'asc'}`
        }
        const response = await servizioService.search(filter, params)
        const contenuto = Array.isArray(response?.content)
          ? response.content
          : Array.isArray(response)
            ? response
            : []
        this.servizi = contenuto
        this.totalElements = typeof response?.totalElements === 'number' ? response.totalElements : this.servizi.length
        if (storeLast) {
          this.lastSearchOptions = {
            filter: { ...filter },
            page,
            size,
            sortBy,
            descending
          }
        }
        return response
      } catch (error) {
        this.error = error
        showNotification('negative', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createOrUpdate(data) {
      try {
        const response = await servizioService.createUpdate(data)
        showNotification('positive', 'Servizio salvato con successo')
        await this.refreshServiziList()
        this.resetServizioCorrente()
        return response.data
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    async delete(id) {
      try {
        const response = await servizioService.deleteById(id)
        showNotification('positive', 'Servizio eliminato con successo')
        await this.refreshServiziList()
        return response.data
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    async fetchById(idCliente) {
      try {
        const response = await servizioService.getById(idCliente)
        const servizioData = response?.data ?? response
        this.servizio = servizioData
        this.setServizioCorrente(servizioData)
        return servizioData
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    setServizioCorrente(servizio = {}) {
      const idServizio = servizio?.idServizio ?? servizio?.id ?? null
      this.servizioCorrente = {
        ...servizioVuoto(),
        ...servizio,
        idServizio
      }
    },

    resetServizioCorrente() {
      this.servizioCorrente = servizioVuoto()
    },

    reset() {
      this.servizi = []
      this.servizio = null
      this.resetServizioCorrente()
      this.loading = false
      this.error = null
      this.totalElements = 0
      this.lastSearchOptions = null
    },

    async refreshServiziList() {
      try {
        const options = this.lastSearchOptions || {}
        await this.searchServizi({ ...options, storeLast: false })
      } catch (error) {
        this.error = error
      }
    }
  }
})
