<template>
  <q-page class="list-page q-pa-md">
    <q-card flat class="list-card">
      <div class="header-section-list q-mb-lg">
        <div class="text-h4 text-weight-bold text-pink-9 q-mb-sm">Gestione Magazzino</div>
        <p class="text-subtitle1 text-grey-8">
          Monitora i movimenti dei prodotti e registra nuove operazioni di magazzino.
        </p>
      </div>

      <div class="filters-section q-mb-lg q-pa-md">
        <div class="text-h6 text-pink-8 q-mb-md text-weight-bold">Opzioni di filtro</div>
        <div class="q-gutter-md row items-center justify-center">
          <q-select v-model="filters.prodottoId" :options="prodottiOptions" label="Prodotto" outlined dense clearable
            use-input fill-input emit-value map-options @filter="filterProdotti" class="col-12 col-md-4" color="pink-7"
            bg-color="white">
            <template #prepend>
              <q-icon name="inventory_2" />
            </template>
          </q-select>

          <q-select v-model="filters.tipo" :options="tipoFiltroOptions" label="Tipo movimento" outlined dense clearable
            emit-value map-options class="col-12 col-md-3" color="pink-7" bg-color="white">
            <template #prepend>
              <q-icon name="compare_arrows" />
            </template>
          </q-select>

          <q-input v-model="filters.dataDa" label="Da data" outlined dense type="date"
            class="col-12 col-md-2 filter-input-large" color="pink-7" bg-color="white">
            <template #prepend>
              <q-icon name="event" />
            </template>
          </q-input>

          <q-input v-model="filters.dataA" label="A data" outlined dense type="date"
            class="col-12 col-md-2 filter-input-large" color="pink-7" bg-color="white">
            <template #prepend>
              <q-icon name="event_available" />
            </template>
          </q-input>
        </div>

        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn flat label="Reset" icon="refresh" color="black" @click="resetFilters" />
          <q-btn color="pink-8" label="Applica filtri" icon="search" @click="applyFilters" />
        </div>
      </div>

      <q-banner v-if="giacenzaDisponibile" class="bg-grey-2 text-grey-9 q-mb-lg" rounded>
        <template #avatar>
          <q-icon name="inventory" color="pink-7" />
        </template>
        Giacenza attuale per <strong>{{ prodottoSelezionatoLabel }}</strong>:
        <strong>{{ formatQuantita(magazzinoStore.giacenzaCorrente) }}</strong>
      </q-banner>

      <ResponsiveTable
        :rows="magazzinoStore.movimenti"
        :columns="columns"
        row-key="id"
        flat
        bordered
        separator="horizontal"
        color="pink-8"
        class="responsive-elegant-table q-table--horizontal-separator q-table--responsive"
        :loading="loading"
        :rows-number="rowsNumber"
        v-model:pagination="pagination"
        no-data-label="Nessun movimento trovato."
        rows-per-page-label="Movimenti per pagina:"
        loading-label="Caricamento movimenti..."
        no-results-label="Nessun movimento trovato."
        @request="onRequest"
      >
        <template #top-right>
          <q-btn-dropdown color="pink-8" label="Registra movimento" icon="add_circle"
            class="q-px-md q-py-sm text-weight-bold" rounded>
            <q-list>
              <q-item clickable v-close-popup @click="openMovimentoDialog('ORDINATO')">
                <q-item-section avatar><q-icon name="local_shipping" color="green-6" /></q-item-section>
                <q-item-section>Ordinato</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="openMovimentoDialog('CONSEGNATO')">
                <q-item-section avatar><q-icon name="done_all" color="blue-6" /></q-item-section>
                <q-item-section>Consegnato</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="openMovimentoDialog('SCARICO')">
                <q-item-section avatar><q-icon name="inventory_2" color="deep-orange-6" /></q-item-section>
                <q-item-section>Scarico</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>

        <template #header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props"
              class="text-uppercase text-weight-bold bg-pink-1 text-pink-9 custom-header-cell"
              :style="{ padding: '12px 16px', fontSize: '14px' }">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="custom-body-row responsive-row">
            <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-label="col.label"
              class="custom-body-cell" :style="{ padding: '12px 16px', fontSize: '13px' }">
              <template v-if="col.name === 'tipo'">
                <q-chip dense :color="getTipoColor(props.row.tipo)" text-color="white" class="text-weight-bold">
                  {{ formatTipo(props.row.tipo) }}
                </q-chip>
              </template>
              <template v-else-if="col.name === 'azioni'">
                <q-btn v-if="isOrdinato(props.row)" dense round flat color="pink-8" icon="done_all" class="azioni-btn"
                  @click="openCambioStatoDialog(props.row)">
                  <q-tooltip anchor="top middle" self="bottom middle">Segna come consegnato</q-tooltip>
                </q-btn>
                <q-icon v-else name="block" color="grey-5" size="sm">
                  <q-tooltip anchor="top middle" self="bottom middle">Nessuna azione disponibile</q-tooltip>
                </q-icon>
              </template>
              <template v-else>
                <div class="text-wrap">
                  {{ col.value }}
                </div>
              </template>
            </q-td>
          </q-tr>
        </template>

        <template #mobile-cell-tipo="{ row }">
          <q-chip dense :color="getTipoColor(row.tipo)" text-color="white" class="text-weight-bold">
            {{ formatTipo(row.tipo) }}
          </q-chip>
        </template>
        <template #mobile-cell-azioni="{ row }">
          <div class="flex justify-end">
            <q-btn v-if="isOrdinato(row)" dense round flat color="pink-8" icon="done_all"
              @click="openCambioStatoDialog(row)">
              <q-tooltip anchor="top middle" self="bottom middle">Segna come consegnato</q-tooltip>
            </q-btn>
            <q-icon v-else name="block" color="grey-5" size="sm">
              <q-tooltip anchor="top middle" self="bottom middle">Nessuna azione disponibile</q-tooltip>
            </q-icon>
          </div>
        </template>
      </ResponsiveTable>
    </q-card>

    <magazzino-movimento-dialog v-model="movimentoDialogVisible" :tipo="movimentoDialogTipo"
      :prodotti-options="prodottiOptions" :default-prodotto-id="filters.prodottoId" @save="handleMovimentoSalvato" />

    <q-dialog v-model="cambioStatoDialogVisibile" persistent>
      <q-card class="q-pa-md" style="min-width: 360px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Conferma cambio stato</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="chiudiCambioStatoDialog" :disable="cambioStatoLoading" />
        </q-card-section>
        <q-card-section>
          <p class="q-mb-none">
            Lo stato del movimento per
            <strong>{{ movimentoSelezionatoNome }}</strong>
            passerà da <strong>Ordinato</strong> a <strong>Consegnato</strong>.
            Vuoi proseguire?
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="grey-7" label="Annulla" @click="chiudiCambioStatoDialog" :disable="cambioStatoLoading" />
          <q-btn color="pink-8" label="Conferma" @click="confermaCambioStato" :loading="cambioStatoLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useMagazzinoStore, useProdottiStore } from 'src/components/stores'
import MagazzinoMovimentoDialog from 'src/components/modals/MagazzinoMovimentoDialog.vue'
import ResponsiveTable from 'src/components/ResponsiveTable.vue'

const magazzinoStore = useMagazzinoStore()
const prodottiStore = useProdottiStore()

const pagination = ref({
  sortBy: 'dataMovimento',
  descending: true,
  page: 1,
  rowsPerPage: 10
})
const rowsNumber = ref(0)

const filters = ref({
  prodottoId: null,
  tipo: null,
  dataDa: null,
  dataA: null
})

const movimentoDialogVisible = ref(false)
const movimentoDialogTipo = ref('ORDINATO')
const cambioStatoDialogVisibile = ref(false)
const movimentoSelezionato = ref(null)
const cambioStatoLoading = ref(false)

const tipoFiltroOptions = [
  { label: 'Ordinato', value: 'ORDINATO' },
  { label: 'Consegnato', value: 'CONSEGNATO' },
  { label: 'Scarico', value: 'SCARICO' }
]

const prodottiOptionsAll = computed(() =>
  (prodottiStore.prodotti || []).map(prodotto => ({
    label: buildProdottoLabel(prodotto),
    value: prodotto.id ?? prodotto.idProdotto
  }))
)

const prodottiOptions = ref([])

watch(prodottiOptionsAll, value => {
  prodottiOptions.value = value
}, { immediate: true })

const loading = computed(() => magazzinoStore.loading)

const giacenzaDisponibile = computed(() =>
  magazzinoStore.giacenzaCorrente !== null &&
  magazzinoStore.giacenzaProdottoId === filters.value.prodottoId
)

const prodottoSelezionatoLabel = computed(() => {
  const selected = prodottiOptionsAll.value.find(option => option.value === filters.value.prodottoId)
  return selected ? selected.label : 'prodotto selezionato'
})

const columns = [
  {
    name: 'dataMovimento',
    label: 'Data',
    field: 'dataMovimento',
    align: 'left',
    sortable: true,
    format: value => formatDateTime(value)
  },
  {
    name: 'nomeProdotto',
    label: 'Prodotto',
    field: row => row.nomeProdotto || '-',
    align: 'left',
    sortable: true
  },
  {
    name: 'marcaProdotto',
    label: 'Marca',
    field: row => row.marcaProdotto || '-',
    align: 'left'
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: row => formatTipo(row.tipo),
    align: 'left',
    sortable: true
  },
  {
    name: 'quantita',
    label: 'Quantità',
    field: row => formatQuantita(row.quantita),
    align: 'right'
  },
  {
    name: 'descrizione',
    label: 'Descrizione',
    field: row => row.descrizione || '-',
    align: 'left'
  },
  {
    name: 'azioni',
    label: 'Azioni',
    field: () => null,
    align: 'center'
  }
]

const movimentoSelezionatoNome = computed(() => {
  if (!movimentoSelezionato.value) {
    return 'questo movimento'
  }
  return movimentoSelezionato.value.nomeProdotto || 'questo movimento'
})

watch(
  () => filters.value.prodottoId,
  async nuovoValore => {
    try {
      await magazzinoStore.fetchGiacenza(nuovoValore)
    } catch {
      // la notifica di errore è gestita dallo store
    }
  }
)

onMounted(async () => {
  if (!prodottiStore.prodotti.length) {
    await prodottiStore.fetchAllProdotti()
  }
  await requestMovimenti()
})

async function onRequest(props) {
  const requestPagination = props.pagination || pagination.value
  const { page, rowsPerPage, sortBy, descending } = requestPagination
  const filterPayload = buildFilterPayload()
  const size = rowsPerPage === 0 ? magazzinoStore.totalElements || 1 : rowsPerPage
  try {
    const response = await magazzinoStore.fetchMovimenti({
      filter: filterPayload,
      page: Math.max(page - 1, 0),
      size,
      sortBy,
      descending
    })
    rowsNumber.value = typeof response?.totalElements === 'number'
      ? response.totalElements
      : magazzinoStore.totalElements
    pagination.value = { ...requestPagination }
  } catch {
    rowsNumber.value = 0
  }
}

function buildFilterPayload() {
  const payload = {}
  if (filters.value.prodottoId) {
    payload.prodottoId = filters.value.prodottoId
  }
  if (filters.value.tipo) {
    payload.tipo = filters.value.tipo
  }
  if (filters.value.dataDa) {
    payload.dataDa = new Date(`${filters.value.dataDa}T00:00:00`).toISOString()
  }
  if (filters.value.dataA) {
    payload.dataA = new Date(`${filters.value.dataA}T23:59:59`).toISOString()
  }
  return payload
}

async function requestMovimenti() {
  await onRequest({ pagination: pagination.value })
}

async function applyFilters() {
  pagination.value = { ...pagination.value, page: 1 }
  await requestMovimenti()
}

async function resetFilters() {
  filters.value = {
    prodottoId: null,
    tipo: null,
    dataDa: null,
    dataA: null
  }
  await magazzinoStore.fetchGiacenza(null)
  pagination.value = { ...pagination.value, page: 1 }
  await requestMovimenti()
}

function openMovimentoDialog(tipo) {
  movimentoDialogTipo.value = tipo
  movimentoDialogVisible.value = true
}

function openCambioStatoDialog(movimento) {
  movimentoSelezionato.value = movimento
  cambioStatoDialogVisibile.value = true
}

function chiudiCambioStatoDialog() {
  if (cambioStatoLoading.value) {
    return
  }
  cambioStatoDialogVisibile.value = false
  movimentoSelezionato.value = null
}

async function handleMovimentoSalvato(payload) {
  try {
    await magazzinoStore.registraMovimento(payload.tipo, {
      prodottoId: payload.prodottoId,
      quantita: payload.quantita,
      dataMovimento: payload.dataMovimento,
      descrizione: payload.descrizione
    })
    movimentoDialogVisible.value = false
    await requestMovimenti()
  } catch {
    // le notifiche vengono gestite dallo store
  }
}

async function confermaCambioStato() {
  if (!movimentoSelezionato.value) {
    return
  }
  cambioStatoLoading.value = true
  try {
    await magazzinoStore.aggiornaStatoMovimento(movimentoSelezionato.value.id, 'CONSEGNATO')
    cambioStatoDialogVisibile.value = false
    movimentoSelezionato.value = null
  } catch (error) {
    console.error('Errore durante il cambio di stato del movimento', error)
  } finally {
    cambioStatoLoading.value = false
  }
}

function filterProdotti(val, update) {
  if (val === '') {
    update(() => {
      prodottiOptions.value = prodottiOptionsAll.value
    })
    return
  }
  const needle = val.toLowerCase()
  update(() => {
    prodottiOptions.value = prodottiOptionsAll.value.filter(option =>
      option.label.toLowerCase().includes(needle)
    )
  })
}

function buildProdottoLabel(prodotto) {
  const parts = [prodotto.nome]
  if (prodotto.marca) {
    parts.push(prodotto.marca)
  }
  if (prodotto.codiceColore) {
    parts.push(`#${prodotto.codiceColore}`)
  }
  return parts.filter(Boolean).join(' • ')
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function formatTipo(tipo) {
  switch ((tipo || '').toUpperCase()) {
    case 'ORDINATO':
      return 'Ordinato'
    case 'CONSEGNATO':
      return 'Consegnato'
    case 'SCARICO':
      return 'Scarico'
    default:
      return tipo || '-'
  }
}

function getTipoColor(tipo) {
  switch ((tipo || '').toUpperCase()) {
    case 'ORDINATO':
      return 'green-6'
    case 'CONSEGNATO':
      return 'blue-6'
    case 'SCARICO':
      return 'deep-orange-6'
    default:
      return 'grey-6'
  }
}

function isOrdinato(movimento) {
  return (movimento?.tipo || '').toUpperCase() === 'ORDINATO'
}

function formatQuantita(valore) {
  if (valore === null || valore === undefined) {
    return '-'
  }
  const numero = Number(valore)
  if (Number.isNaN(numero)) {
    return valore
  }
  return numero.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
</script>

<style lang="scss" scoped>
@import 'src/css/_list-page.scss';

.filter-input-large input {
  cursor: pointer;
}
</style>
