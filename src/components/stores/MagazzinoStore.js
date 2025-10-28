import { defineStore } from 'pinia'
import magazzinoService from 'src/components/api/Magazzino.js'
import { showNotification } from 'src/components/api/ShowNotification.js'

const ACTION_LABELS = {
  ORDINATO: 'Ordinato',
  CONSEGNATO: 'Consegnato',
  SCARICO: 'Scarico'
}

function buildParams({ filter = {}, page = 0, size = 10, sortBy, descending }) {
  const params = {
    page,
    size
  }

  if (sortBy) {
    params.sort = `${sortBy},${descending ? 'desc' : 'asc'}`
  }

  Object.entries(filter)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .forEach(([key, value]) => {
      params[`filtro.${key}`] = value
    })

  return params
}

export const useMagazzinoStore = defineStore('magazzinoStore', {
  state: () => ({
    movimenti: [],
    loading: false,
    totalElements: 0,
    lastQuery: null,
    giacenzaCorrente: null,
    giacenzaProdottoId: null
  }),

  actions: {
    async fetchMovimenti(options = {}) {
      const { filter = {}, page = 0, size = 10, sortBy, descending } = options
      this.loading = true
      try {
        const params = buildParams({ filter, page, size, sortBy, descending })
        const response = await magazzinoService.getMovimenti(params)
        this.movimenti = Array.isArray(response?.content) ? response.content : []
        this.totalElements = typeof response?.totalElements === 'number' ? response.totalElements : this.movimenti.length
        this.lastQuery = { filter: { ...filter }, page, size, sortBy, descending }
        return response
      } catch (error) {
        showNotification('negative', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMovimentiByProdotto(idProdotto, options = {}) {
      this.loading = true
      try {
        const { page = 0, size = 10, sortBy, descending } = options
        const params = buildParams({ filter: {}, page, size, sortBy, descending })
        const response = await magazzinoService.getMovimentiByProdotto(idProdotto, params)
        this.movimenti = Array.isArray(response?.content) ? response.content : []
        this.totalElements = typeof response?.totalElements === 'number' ? response.totalElements : this.movimenti.length
        this.lastQuery = { ...options, filter: { prodottoId: idProdotto } }
        return response
      } catch (error) {
        showNotification('negative', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async registraMovimento(tipo, payload) {
      const normalisedType = (tipo || '').toUpperCase()
      const actionLabel = ACTION_LABELS[normalisedType] || 'Movimento'
      try {
        let response
        switch (normalisedType) {
          case 'ORDINATO':
            response = await magazzinoService.registraOrdinato(payload)
            break
          case 'CONSEGNATO':
            response = await magazzinoService.registraConsegnato(payload)
            break
          case 'SCARICO':
            response = await magazzinoService.registraScarico(payload)
            break
          default:
            throw new Error('Tipo movimento non supportato')
        }
        showNotification('positive', `${actionLabel} registrato con successo`)
        await this.refreshMovimenti()
        if (payload?.prodottoId) {
          await this.fetchGiacenza(payload.prodottoId)
        }
        return response
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    async aggiornaStatoMovimento(idMovimento, nuovoStato) {
      try {
        const response = await magazzinoService.aggiornaStatoMovimento(idMovimento, nuovoStato)
        showNotification('positive', 'Stato del movimento aggiornato con successo')
        await this.refreshMovimenti()
        if (this.giacenzaProdottoId) {
          await this.fetchGiacenza(this.giacenzaProdottoId)
        }
        return response
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    async fetchGiacenza(idProdotto) {
      if (!idProdotto) {
        this.giacenzaCorrente = null
        this.giacenzaProdottoId = null
        return null
      }
      try {
        const response = await magazzinoService.getGiacenza(idProdotto)
        this.giacenzaCorrente = typeof response === 'number' ? response : Number(response ?? 0)
        this.giacenzaProdottoId = idProdotto
        return this.giacenzaCorrente
      } catch (error) {
        this.giacenzaCorrente = null
        this.giacenzaProdottoId = null
        showNotification('negative', error)
        throw error
      }
    },

    async refreshMovimenti() {
      if (!this.lastQuery) {
        return
      }
      const { filter, page, size, sortBy, descending } = this.lastQuery
      await this.fetchMovimenti({ filter, page, size, sortBy, descending })
    },

    resetStore() {
      this.movimenti = []
      this.loading = false
      this.totalElements = 0
      this.lastQuery = null
      this.giacenzaCorrente = null
      this.giacenzaProdottoId = null
    }
  }
})
