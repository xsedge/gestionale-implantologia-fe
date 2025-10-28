import { defineStore } from 'pinia'
import prodottoService from 'src/components/api/Prodotti.js'
import { showNotification } from '../api/ShowNotification'

export const useProdottiStore = defineStore('prodottiStore', {
  state: () => ({
    prodotti: [],
    prodotto: null,
    tipologieProdotto: [],
    tipologia: null,
    loading: false
  }),

  actions: {
    // PRODOTTi
    async fetchAllProdotti(page = 0, size = 100) {
      try {
        const response = await prodottoService.getAll({ page, size })
        this.prodotti = response.content
        return response.content
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    async createOrUpdateProdotto(data) {
      try {
        const response = await prodottoService.createUpdate(data)
        showNotification('positive', 'Prodotto salvato con successo')
        return response.data
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    async deleteProdotto(id) {
      try {
        const response = await prodottoService.deleteById(id)
        showNotification('positive', 'Prodotto eliminato con successo')
        return response.data
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    async fetchProdottoById(idProdotto) {
      try {
        const response = await prodottoService.getById(idProdotto)
        this.prodotto = response.data
        return response.data
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    // TIPOLOGIE
    async fetchAllTipologie() {
      this.loading = true
      try {
        const res = await prodottoService.getAllTipologia()
        this.tipologieProdotto = res.content
        return res.content
      } finally {
        this.loading = false
      }
    },

    async fetchTipologiaById(idTipologia) {
      this.loading = true
      try {
        const res = await prodottoService.getByIdTipologia(idTipologia)
        this.tipologia = res.data
        return res.data
      } finally {
        this.loading = false
      }
    },

    async createOrUpdateTipologia(data) {
      try {
        const response = await prodottoService.createUpdateTipologia(data)
        showNotification('positive', 'Tipologia prodotto salvata con successo')
        return response.data
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    },

    async deleteTipologia(id) {
      try {
        const response = await prodottoService.deleteByIdTipologia(id)
        showNotification('positive', 'Tipologia prodotto eliminata con successo')
        return response.data
      } catch (error) {
        showNotification('negative', error)
        throw error
      }
    }
  }
})
