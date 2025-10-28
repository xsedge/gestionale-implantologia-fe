// src/stores/ordini.js
import { defineStore } from 'pinia'
import OrdiniService from 'src/components/api/Ordini'
import { showNotification } from 'src/components/api/ShowNotification'

export const useOrdiniStore = defineStore('ordini', {
  state: () => ({
    ordineCorrente: {
      id: null,
      idCliente: null,
      data: '',
      prezzoTotale: 0,
      serviziOrdinati: []
    },
    ordini: [],
    ordine: null,
    loading: false,
    error: null,
    totalElements: 0,
    lastSearchOptions: null
  }),

  actions: {
    setOrdineCorrente(ordine) {
      this.ordineCorrente = { ...ordine }
    },

    aggiornaCliente(cliente) {
      this.ordineCorrente.idCliente = cliente
    },

    aggiornaData(data) {
      this.ordineCorrente.data = data
    },

    aggiornaPrezzo(prezzo) {
      this.ordineCorrente.prezzoTotale = prezzo
    },

    aggiungiServizio(servizio) {
      this.ordineCorrente.serviziOrdinati.push(servizio)
    },

    rimuoviServizio(index) {
      this.ordineCorrente.serviziOrdinati.splice(index, 1)
    },

    aggiornaServizio(index, campo, valore) {
      this.ordineCorrente.serviziOrdinati[index][campo] = valore
    },

    // Idem per prodotti utilizzati dentro ogni servizio
    aggiungiProdotto(servizioIndex, prodotto) {
      this.ordineCorrente.serviziOrdinati[servizioIndex].prodottiUtilizzati.push(prodotto)
    },

    rimuoviProdotto(servizioIndex, prodottoIndex) {
      this.ordineCorrente.serviziOrdinati[servizioIndex].prodottiUtilizzati.splice(prodottoIndex, 1)
    },

    aggiornaProdotto(servizioIndex, prodottoIndex, campo, valore) {
      this.ordineCorrente.serviziOrdinati[servizioIndex].prodottiUtilizzati[prodottoIndex][campo] = valore
    },

    async salvaOrdine() {
      try {
        this.ordineCorrente.serviziOrdinati.forEach(e => {
          if (typeof e.idServizio === 'object' && e.idServizio?.id) {
            e.idServizio = e.idServizio.id
          }
        });


        await OrdiniService.createUpdate(this.ordineCorrente)
        showNotification('positive', 'Ordine salvato con successo')
      } catch (err) {
        this.error = err
        showNotification('negative', err.message)
      }
      await this.refreshOrdiniList()
    },

    async searchOrdini(opts = {}) {
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
        const response = await OrdiniService.search(filter, params)
        this.ordini = Array.isArray(response?.content) ? response.content : []
        this.totalElements = typeof response?.totalElements === 'number' ? response.totalElements : this.ordini.length
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
      } catch (err) {
        this.error = err
        showNotification('negative', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOrdiniByCliente(clienteId) {
      this.loading = true
      this.error = null
      try {
        const response = await OrdiniService.getByCliente(clienteId)
        this.ordini = response
      } catch (err) {
        this.error = err
        showNotification('negative', err)
      } finally {
        this.loading = false
      }
    },

    async fetchOrdineById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await OrdiniService.getById(id)
        this.ordine = response
      } catch (err) {
        this.error = err
        showNotification('negative', err)
      } finally {
        this.loading = false
      }
    },

    async addOrdine(ordineData) {
      try {
        const response = await OrdiniService.createUpdate(ordineData)
        const existingIndex = this.ordini.findIndex(o => o.id === response.id)
        if (existingIndex !== -1) {
          this.ordini[existingIndex] = response
        } else {
          this.ordini.push(response)
        }
      } catch (err) {
        this.error = err
      }
    },
    async deleteOrdine(id) {
      try {
        await OrdiniService.deleteById(id)
        this.ordini = this.ordini.filter(o => o.id !== id)
        if (this.ordine?.id === id) {
          this.ordine = null
        }
        showNotification('positive', 'Ordine eliminato con successo')
        await this.refreshOrdiniList()
      } catch (err) {
        this.error = err
        showNotification('negative', err)
      }
    },
    async refreshOrdiniList() {
      try {
        const options = this.lastSearchOptions || {}
        await this.searchOrdini({ ...options, storeLast: false })
      } catch (err) {
        this.error = err
      }
    },
    async caricaOrdineDettaglio(ordineId) {
      const ordineDettaglio = await OrdiniService.getById(ordineId)
      // Cloniamo i servizi per evitare mutazioni accidentali
      const serviziOrdinati = ordineDettaglio.servizi.map(servizio => ({
        ...servizio,
        prodottiUtilizzati: servizio.prodottiUtilizzati || []
      }))
      this.ordineCorrente = {
        id: ordineDettaglio.id,
        data: ordineDettaglio.data,
        prezzoTotale: ordineDettaglio.prezzoTotale,
        fotoPaths: ordineDettaglio.fotoPaths || [],
        serviziOrdinati,
        idCliente: ordineDettaglio.cliente ? ordineDettaglio.cliente.id : null
      }
    },


    resetOrdini() {
      this.ordini = []
      this.ordine = null
      this.loading = false
      this.error = null
      this.totalElements = 0
      this.lastSearchOptions = null
    }
  }
})
