<template>
  <q-card class="modal-ordine q-pa-none" style="width: 95vw; max-width: 1200px;">
    <q-form ref="ordineCorrenteRef" @submit.prevent="salvaOrdine">
      <q-card-section class="bg-primary text-white q-px-lg q-py-md">
        <div class="text-h6 text-weight-medium">
          {{ isEdit ? 'Modifica Ordine' : 'Nuovo Ordine' }}
        </div>
        <div class="text-subtitle2 text-white text-weight-regular q-mt-xs">
          Gestisci clienti, servizi e prodotti per il tuo ordine.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-px-lg q-pt-lg q-pb-md">
        <div class="text-subtitle1 text-weight-medium q-mb-md">Cliente</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select v-model="ordiniStore.ordineCorrente.idCliente" :options="clientiFiltrati" option-label="fullName"
              option-value="id" label="Cliente" outlined dense emit-value map-options use-input input-debounce="300"
              :loading="clientiLoading" @filter="cercaClienti" :rules="[val => !!val || 'Campo obbligatorio']"
              no-option-text="Nessun cliente trovato" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="ordiniStore.ordineCorrente.data" label="Data" type="date" outlined dense />
          </div>
        </div>

        <q-slide-transition>
          <div v-if="clienteSelezionato" class="q-mt-md">
            <q-card flat bordered class="bg-grey-1 q-pa-md rounded-borders">
              <div class="text-subtitle2 text-weight-medium">
                {{ clienteSelezionato.nome }} {{ clienteSelezionato.cognome }}
              </div>
              <div class="text-caption text-grey-7" v-if="clienteSelezionato.telefono">
                Tel: {{ clienteSelezionato.telefono }}
              </div>
              <div class="text-caption text-grey-7" v-if="clienteSelezionato.email">
                Email: {{ clienteSelezionato.email }}
              </div>
            </q-card>
          </div>
        </q-slide-transition>
      </q-card-section>

      <q-separator spaced />

      <q-card-section class="q-px-lg q-pt-none q-pb-md">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-medium">Servizi associati</div>
          <q-btn color="primary" icon="add_circle" label="Aggiungi Servizio" flat dense @click="aggiungiServizio" />
        </div>

        <transition-group name="fade" tag="div">
          <div v-for="(servizio, index) in ordiniStore.ordineCorrente.serviziOrdinati" :key="`servizio-${index}`"
            class="q-mb-md">
            <q-expansion-item expand-separator dense default-opened class="rounded-borders shadow-1 bg-grey-1">
              <template #header>
                <div class="row items-center q-col-gutter-sm full-width">
                  <div class="col">
                    <div class="text-subtitle2 text-weight-medium">
                      {{ getServizioNome(servizio, index) }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ servizio.durataMinuti ? servizio.durataMinuti + ' min' : 'Dettagli servizio' }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-btn dense round flat icon="delete" color="negative"
                      @click.stop="() => ordiniStore.rimuoviServizio(index)">
                      <q-tooltip>Rimuovi servizio</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </template>

              <div class="q-pa-md bg-white rounded-borders">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-select v-model="servizio.idServizio" :options="serviziFiltrati" option-label="nome"
                      option-value="id" label="Servizio" outlined dense emit-value map-options use-input
                      input-debounce="300" :loading="serviziLoading" no-option-text="Nessun servizio trovato"
                      @filter="cercaServizi"
                      @update:model-value="val => ordiniStore.aggiornaServizio(index, 'idServizio', val)"
                      :rules="[val => !!val || 'Campo obbligatorio']" />
                  </div>

                  <div class="col-12 col-md-3">
                    <q-input v-model.number="servizio.durataMinuti" label="Durata (minuti)" type="number" outlined dense
                      @input="val => ordiniStore.aggiornaServizio(index, 'durataMinuti', val)" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="servizio.eseguitoDa" label="Eseguito Da" outlined dense
                      @input="val => ordiniStore.aggiornaServizio(index, 'eseguitoDa', val)" />
                  </div>
                  <div class="col-12">
                    <q-input v-model="servizio.note" label="Note" outlined dense autogrow
                      @input="val => ordiniStore.aggiornaServizio(index, 'note', val)" />
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-subtitle2 text-weight-medium">Prodotti per servizio</div>
                  <q-btn dense flat icon="add_circle" color="primary" label="Aggiungi Prodotto"
                    @click="() => aggiungiProdotto(index)" />
                </div>

                <transition-group name="fade" tag="div">
                  <div v-for="(prodotto, pIndex) in servizio.prodottiUtilizzati" :key="`prodotto-${index}-${pIndex}`"
                    class="q-mb-sm">
                    <q-card flat bordered class="q-pa-md rounded-borders">
                      <div class="row items-start q-col-gutter-md">
                        <div class="col-12 col-md-5">
                          <q-select v-model="prodotto.idProdotto" :options="prodottiFiltrati" option-label="nome"
                            option-value="id" label="Prodotto" outlined dense emit-value map-options use-input
                            input-debounce="300" :loading="prodottiLoading" no-option-text="Nessun prodotto trovato"
                            @filter="cercaProdotti"
                            @update:model-value="val => aggiornaProdottoConDati(index, pIndex, val)"
                            :rules="[val => !!val || 'Campo obbligatorio oppure Rimuovi Prodotto']" />
                        </div>
                        <div class="col-12 col-md-5">
                          <QuantitaCounter v-model="prodotto.quantitaUtilizzata" :steps="quantitaSteps"
                            orientation="horizontal" :min="0" field-label="Quantità prodotto"
                            :unit-label="getProdottoUnita(prodotto)"
                            @update:model-value="val => ordiniStore.aggiornaProdotto(index, pIndex, 'quantitaUtilizzata', val)" />
                        </div>
                        <div class="col-12 col-md-2 flex items-start justify-end">
                          <q-btn dense flat icon="remove_circle" color="negative" label="Rimuovi"
                            @click="() => ordiniStore.rimuoviProdotto(index, pIndex)" />
                        </div>
                        <div class="col-12">
                          <q-input v-model="prodotto.noteUtilizzo" label="Note Utilizzo Prodotto" outlined dense
                            autogrow @input="val => ordiniStore.aggiornaProdotto(index, pIndex, 'noteUtilizzo', val)" />
                        </div>
                      </div>
                    </q-card>
                  </div>
                </transition-group>

                <q-slide-transition>
                  <div v-if="!servizio.prodottiUtilizzati.length"
                    class="bg-grey-2 q-pa-md text-caption text-grey-7 rounded-borders">
                    Nessun prodotto associato a questo servizio.
                  </div>
                </q-slide-transition>
              </div>
            </q-expansion-item>
          </div>
        </transition-group>
      </q-card-section>

      <q-separator spaced />

      <q-card-section class="q-px-lg q-pt-none q-pb-lg">
        <div class="text-subtitle1 text-weight-medium q-mb-md">Riepilogo e azioni</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input :model-value="prezzoTotaleCalcolato" label="Prezzo Totale" type="number" outlined dense readonly
              prefix="€ " />
          </div>
          <div class="col-12 col-md-8">
            <q-input outlined dense v-model="ordiniStore.ordineCorrente.note" label="Note" type="textarea" autogrow />
          </div>
        </div>

        <div class="row justify-end q-gutter-sm q-mt-lg">
          <q-btn flat label="Annulla" v-close-popup />
          <q-btn color="primary" label="Salva" type="submit" />
        </div>
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useOrdiniStore, useServiziStore, useProdottiStore } from 'src/components/stores/index.js'
import QuantitaCounter from './QuantitaCounter.vue'
import http from 'src/components/api/http.js'
import ClientiService from 'src/components/api/Clienti'

const ordineCorrenteRef = ref(null)

const ordiniStore = useOrdiniStore()
const serviziStore = useServiziStore()
const prodottiStore = useProdottiStore()
const emitClose = defineEmits(['close'])

const props = defineProps({
  isEdit: Boolean,
  ordine: Number
})

const quantitaSteps = [1, 2, 5, 10]

const clientiFiltrati = ref([])
const clientiDettagli = ref({})
const clientiLoading = ref(false)
let ultimaQueryRichiesta = ''
let richiestaClientiCounter = 0

const serviziFiltrati = ref([])
const serviziDettagli = ref({})
const serviziLoading = ref(false)
let ultimaQueryServizi = ''
let richiestaServiziCounter = 0

const prodottiFiltrati = ref([])
const prodottiDettagli = ref({})
const prodottiLoading = ref(false)
let ultimaQueryProdotti = ''
let richiestaProdottiCounter = 0

function getServizioId(servizio) {
  if (!servizio || typeof servizio !== 'object') {
    return null
  }
  return servizio.idServizio ?? servizio.id ?? null
}

function normalizzaServizio(servizio) {
  if (!servizio || typeof servizio !== 'object') {
    return null
  }
  const id = getServizioId(servizio)
  if (id == null) {
    return null
  }
  const prezzo = Number(servizio.prezzoBase)
  return {
    ...servizio,
    id,
    idServizio: servizio.idServizio ?? id,
    prezzoBase: Number.isFinite(prezzo) ? prezzo : 0,
    nome: servizio.nome ?? servizio.descrizione ?? `Servizio #${id}`
  }
}

function trovaServizioDettaglio(idServizio) {
  if (!idServizio) {
    return null
  }
  if (serviziDettagli.value[idServizio]) {
    return serviziDettagli.value[idServizio]
  }
  const servizioDaStore = serviziStore.servizi.find(s => getServizioId(s) === idServizio)
  if (servizioDaStore) {
    const normalizzato = normalizzaServizio(servizioDaStore)
    if (normalizzato) {
      aggiornaDettagliServizi([normalizzato])
      return normalizzato
    }
  }
  return null
}

const clienteSelezionato = computed(() => {
  const idCliente = ordiniStore.ordineCorrente.idCliente
  if (!idCliente) {
    return null
  }
  return clientiDettagli.value[idCliente] || null
})

const prezzoTotaleCalcolato = computed(() => {
  const serviziOrdinati = Array.isArray(ordiniStore.ordineCorrente.serviziOrdinati)
    ? ordiniStore.ordineCorrente.serviziOrdinati
    : []
  return serviziOrdinati.reduce((total, servizio) => {
    const idServizio = getServizioId(servizio)
    const infoServizio = trovaServizioDettaglio(idServizio)
    const prezzo = Number(
      infoServizio?.prezzoBase ?? servizio?.prezzoBase ?? servizio?.prezzo
    )
    return total + (Number.isFinite(prezzo) ? prezzo : 0)
  }, 0)
})

watch(
  prezzoTotaleCalcolato,
  val => {
    ordiniStore.ordineCorrente.prezzoTotale = val
  },
  { immediate: true }
)

watch(
  () => ordiniStore.ordineCorrente.idCliente,
  async idCliente => {
    if (idCliente) {
      await garantisciClienteInCache(idCliente)
    }
  },
  { immediate: true }
)

watch(
  () => serviziStore.servizi,
  lista => {
    if (Array.isArray(lista) && lista.length) {
      aggiornaDettagliServizi(lista)
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => prodottiStore.prodotti,
  lista => {
    if (Array.isArray(lista) && lista.length) {
      aggiornaDettagliProdotti(lista)
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => ordiniStore.ordineCorrente.serviziOrdinati,
  servizi => {
    if (!Array.isArray(servizi)) {
      return
    }
    servizi.forEach(servizio => {
      garantisciServizioInOptions(getServizioId(servizio))
      if (Array.isArray(servizio?.prodottiUtilizzati)) {
        servizio.prodottiUtilizzati.forEach(prodotto => {
          garantisciProdottoInOptions(prodotto?.idProdotto)
        })
      }
    })
  },
  { immediate: true, deep: true }
)

function normalizzaCliente(cliente) {
  const fullNameParts = [cliente?.nome, cliente?.cognome].filter(Boolean)
  const fullName = fullNameParts.join(' ').trim() || cliente?.ragioneSociale || 'Cliente'
  return {
    ...cliente,
    fullName
  }
}

function aggiornaDettagliClienti(lista) {
  if (!Array.isArray(lista) || !lista.length) {
    return
  }
  const cacheAggiornata = { ...clientiDettagli.value }
  lista.forEach(cliente => {
    if (cliente?.id != null) {
      cacheAggiornata[cliente.id] = cliente
    }
  })
  clientiDettagli.value = cacheAggiornata
}

function inserisciClienteInOptions(cliente) {
  if (!cliente || cliente.id == null) {
    return
  }
  const esistenteIndex = clientiFiltrati.value.findIndex(c => c.id === cliente.id)
  if (esistenteIndex === -1) {
    clientiFiltrati.value = [cliente, ...clientiFiltrati.value]
  } else {
    const nuovaLista = [...clientiFiltrati.value]
    nuovaLista.splice(esistenteIndex, 1, cliente)
    clientiFiltrati.value = nuovaLista
  }
}

async function fetchClientiDaApi(query = '') {
  const tokenRichiesta = ++richiestaClientiCounter
  clientiLoading.value = true
  try {
    const response = await http.get('/api/cliente/search', {
      params: { query }
    })
    const lista = Array.isArray(response)
      ? response
      : Array.isArray(response?.content)
        ? response.content
        : []
    const normalizzati = lista
      .filter(item => item && typeof item === 'object')
      .map(normalizzaCliente)
    aggiornaDettagliClienti(normalizzati)
    return normalizzati
  } catch (error) {
    console.error('Errore nella ricerca clienti', error)
    return []
  } finally {
    if (tokenRichiesta === richiestaClientiCounter) {
      clientiLoading.value = false
    }
  }
}

async function cercaClienti(query, update) {
  const testo = (query || '').trim()
  ultimaQueryRichiesta = testo
  const risultati = await fetchClientiDaApi(testo)
  if (ultimaQueryRichiesta !== testo) {
    return
  }
  update(() => {
    clientiFiltrati.value = risultati
  })
}

async function garantisciClienteInCache(idCliente) {
  if (!idCliente || clientiDettagli.value[idCliente]) {
    if (idCliente && clientiDettagli.value[idCliente]) {
      inserisciClienteInOptions(clientiDettagli.value[idCliente])
    }
    return
  }
  try {
    const cliente = await ClientiService.getById(idCliente)
    if (cliente) {
      const normalizzato = normalizzaCliente(cliente)
      aggiornaDettagliClienti([normalizzato])
      inserisciClienteInOptions(normalizzato)
    }
  } catch (error) {
    console.error('Errore nel recupero del cliente selezionato', error)
  }
}

async function caricaClientiBase() {
  ultimaQueryRichiesta = ''
  const base = await fetchClientiDaApi('')
  clientiFiltrati.value = base
}

function aggiornaDettagliServizi(lista) {
  if (!Array.isArray(lista) || !lista.length) {
    return
  }
  const cacheAggiornata = { ...serviziDettagli.value }
  lista.forEach(servizio => {
    const normalizzato =
      servizio && typeof servizio === 'object' && servizio.id != null && servizio.nome
        ? { ...servizio }
        : normalizzaServizio(servizio)
    if (normalizzato?.id != null) {
      cacheAggiornata[normalizzato.id] = normalizzato
    }
  })
  serviziDettagli.value = cacheAggiornata
}

function inserisciServizioInOptions(servizio) {
  const normalizzato = normalizzaServizio(servizio)
  if (!normalizzato) {
    return
  }
  const esistenteIndex = serviziFiltrati.value.findIndex(
    s => getServizioId(s) === normalizzato.id
  )
  if (esistenteIndex === -1) {
    serviziFiltrati.value = [normalizzato, ...serviziFiltrati.value]
  } else {
    const nuovaLista = [...serviziFiltrati.value]
    nuovaLista.splice(esistenteIndex, 1, normalizzato)
    serviziFiltrati.value = nuovaLista
  }
}

async function fetchServiziDaApi(query = '') {
  const tokenRichiesta = ++richiestaServiziCounter
  serviziLoading.value = true
  try {
    const response = await http.get('/api/servizio/search', {
      params: { query }
    })
    const lista = Array.isArray(response)
      ? response
      : Array.isArray(response?.content)
        ? response.content
        : []
    const normalizzati = lista
      .map(normalizzaServizio)
      .filter(item => item && item.id != null)
    aggiornaDettagliServizi(normalizzati)
    return normalizzati
  } catch (error) {
    console.error('Errore nella ricerca servizi', error)
    return []
  } finally {
    if (tokenRichiesta === richiestaServiziCounter) {
      serviziLoading.value = false
    }
  }
}

async function cercaServizi(query, update) {
  const testo = (query || '').trim()
  ultimaQueryServizi = testo
  const risultati = await fetchServiziDaApi(testo)
  if (ultimaQueryServizi !== testo) {
    return
  }
  update(() => {
    serviziFiltrati.value = risultati
  })
}

function garantisciServizioInOptions(idServizio) {
  if (!idServizio) {
    return
  }
  const servizio = trovaServizioDettaglio(idServizio)
  if (servizio) {
    inserisciServizioInOptions(servizio)
  }
}

async function caricaServiziBase() {
  ultimaQueryServizi = ''
  const base = await fetchServiziDaApi('')
  serviziFiltrati.value = base
}

function aggiornaDettagliProdotti(lista) {
  if (!Array.isArray(lista) || !lista.length) {
    return
  }
  const cacheAggiornata = { ...prodottiDettagli.value }
  lista.forEach(prodotto => {
    if (prodotto?.id != null) {
      cacheAggiornata[prodotto.id] = prodotto
    }
  })
  prodottiDettagli.value = cacheAggiornata
}

function inserisciProdottoInOptions(prodotto) {
  if (!prodotto || prodotto.id == null) {
    return
  }
  const esistenteIndex = prodottiFiltrati.value.findIndex(p => p.id === prodotto.id)
  if (esistenteIndex === -1) {
    prodottiFiltrati.value = [prodotto, ...prodottiFiltrati.value]
  } else {
    const nuovaLista = [...prodottiFiltrati.value]
    nuovaLista.splice(esistenteIndex, 1, prodotto)
    prodottiFiltrati.value = nuovaLista
  }
}

async function fetchProdottiDaApi(query = '') {
  const tokenRichiesta = ++richiestaProdottiCounter
  prodottiLoading.value = true
  try {
    const response = await http.get('/api/prodotto/search', {
      params: { query }
    })
    const lista = Array.isArray(response)
      ? response
      : Array.isArray(response?.content)
        ? response.content
        : []
    aggiornaDettagliProdotti(lista)
    return lista
  } catch (error) {
    console.error('Errore nella ricerca prodotti', error)
    return []
  } finally {
    if (tokenRichiesta === richiestaProdottiCounter) {
      prodottiLoading.value = false
    }
  }
}

async function cercaProdotti(query, update) {
  const testo = (query || '').trim()
  ultimaQueryProdotti = testo
  const risultati = await fetchProdottiDaApi(testo)
  if (ultimaQueryProdotti !== testo) {
    return
  }
  update(() => {
    prodottiFiltrati.value = risultati
  })
}

function garantisciProdottoInOptions(idProdotto) {
  if (!idProdotto) {
    return
  }
  const prodotto =
    prodottiDettagli.value[idProdotto] ||
    prodottiStore.prodotti.find(p => p.id === idProdotto)
  if (prodotto) {
    aggiornaDettagliProdotti([prodotto])
    inserisciProdottoInOptions(prodotto)
  }
}

async function caricaProdottiBase() {
  ultimaQueryProdotti = ''
  const base = await fetchProdottiDaApi('')
  prodottiFiltrati.value = base
}

function aggiungiServizio() {
  ordiniStore.aggiungiServizio({
    idServizio: null,
    note: '',
    durataMinuti: 0,
    prodottiUtilizzati: []
  })
}

function aggiungiProdotto(servizioIndex) {
  ordiniStore.aggiungiProdotto(servizioIndex, {
    idProdotto: null,
    idTipProdotto: null,
    quantitaUtilizzata: 0,
    codiceColore: '',
    noteUtilizzo: ''
  })
}

function getServizioNome(servizio, index) {
  const idServizio = getServizioId(servizio)
  const infoServizio = trovaServizioDettaglio(idServizio)
  return infoServizio?.nome || `Servizio ${index + 1}`
}

function getProdottoUnita(prodotto) {
  const infoProdotto =
    prodottiDettagli.value[prodotto.idProdotto] ||
    prodottiStore.prodotti.find(p => p.id === prodotto.idProdotto)
  return infoProdotto?.unitaMisura || prodotto.unitaMisura || 'unità'
}

function aggiornaProdottoConDati(index, pIndex, idProdotto) {
  const prodotto =
    prodottiDettagli.value[idProdotto] ||
    prodottiStore.prodotti.find(p => p.id === idProdotto)
  if (prodotto) {
    ordiniStore.aggiornaProdotto(index, pIndex, 'idProdotto', prodotto.id)
    ordiniStore.aggiornaProdotto(index, pIndex, 'idTipProdotto', prodotto.idTipProdotto)
    if (prodotto.codiceColore) {
      ordiniStore.aggiornaProdotto(index, pIndex, 'codiceColore', prodotto.codiceColore)
    }
    if (prodotto.unitaMisura) {
      ordiniStore.aggiornaProdotto(index, pIndex, 'unitaMisura', prodotto.unitaMisura)
    }
  } else {
    ordiniStore.aggiornaProdotto(index, pIndex, 'idProdotto', idProdotto)
  }
}

async function salvaOrdine() {
  //const valid = await ordineCorrenteRef.value.validate()
  console.log('salvaOrdine', ordiniStore.ordineCorrente)
  //if (valid) {
  try {
    await ordiniStore.salvaOrdine()
    emitClose('close')
  } catch (error) {
    console.error(error)
  }
  //}
}

onMounted(async () => {
  if (!props.isEdit) {
    ordiniStore.ordineCorrente.data = new Date().toISOString().split('T')[0]
  } else {
    await ordiniStore.caricaOrdineDettaglio(props.ordine)
    if (ordiniStore.ordineCorrente.idCliente) {
      await garantisciClienteInCache(ordiniStore.ordineCorrente.idCliente)
    }
  }

  await Promise.all([
    caricaClientiBase(),
    caricaServiziBase(),
    caricaProdottiBase()
  ])
  //serviziStore.fetchAll()
  //prodottiStore.fetchAllProdotti()
})

onUnmounted(() => {
  ordiniStore.ordineCorrente = {
    id: null,
    idCliente: null,
    data: '',
    prezzoTotale: 0,
    serviziOrdinati: []
  }
})
</script>

<style scoped>
.modal-ordine {
  max-height: 90vh;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
