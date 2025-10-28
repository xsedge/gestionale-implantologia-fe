<template>
  <q-page class="list-page q-pa-md">
    <q-card flat class="list-card">
      <div class="header-section-list q-mb-lg">
        <div class="text-h4 text-weight-bold text-pink-9 q-mb-sm">Elenco Ordini</div>
        <p class="text-subtitle1 text-grey-8">Visualizza, filtra e gestisci i tuoi ordini.</p>
      </div>

      <div class="filters-section q-mb-lg q-pa-md">
        <div class="text-h6 text-pink-8 q-mb-md text-weight-bold">Filtra per Data</div>
        <div class="q-gutter-md row items-center justify-center">
          <q-input v-model="filtroDataDa" label="Data Da" outlined dense type="date" color="pink-7" bg-color="white"
            class="col-12 col-sm-6 col-md-4">
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>

          <q-input v-model="filtroDataA" label="Data A" outlined dense type="date" color="pink-7" bg-color="white"
            class="col-12 col-sm-6 col-md-4">
            <template v-slot:prepend>
              <q-icon name="event_available" />
            </template>
          </q-input>
        </div>
      </div>


      <!-- Tabella visibile solo su desktop -->
      <q-table v-if="!$q.screen.lt.sm" :rows="ordiniStore.ordini" :columns="columns" row-key="id" flat bordered
        color="pink-8" v-model:pagination="pagination" :rows-number="rowsNumber" no-data-label="Nessun ordine trovato."
        rows-per-page-label="Ordini per pagina:" :loading="ordiniStore.loading" loading-label="Caricamento ordini..."
        no-results-label="Nessun ordine trovato." @request="onRequest"
        class="responsive-elegant-table q-table--horizontal-separator q-table--responsive">
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
            <q-td v-for="col in props.cols" :key="col.name" :props="props" class="custom-body-cell"
              :data-label="col.label" :style="{ padding: '12px 16px', fontSize: '13px' }">
              <template v-if="col.name === 'azioni'">
                <q-btn dense round flat icon="more_vert" size="lg" @click="openMenu(props.row, $event)" color="primary"
                  class="azioni-btn">
                  <q-tooltip anchor="top middle" self="bottom middle">Azioni</q-tooltip>
                </q-btn>
              </template>
              <template v-else>
                <div class="text-wrap">{{ col.value }}</div>
              </template>
            </q-td>
          </q-tr>
        </template>

        <template #top-right>
          <q-btn color="pink-8" icon="add_circle" label="Aggiungi Ordine" class="q-px-md q-py-sm text-weight-bold"
            rounded @click="apriNuovoOrdine" />
        </template>
      </q-table>

      <!-- Cards visibili solo su mobile -->
      <div v-else class="q-gutter-md">
        <div class="row q-py-md justify-center ">
          <q-btn color="pink-8" icon="add_circle" label="Aggiungi Ordine" class="q-px-md q-py-sm text-weight-bold"
            rounded @click="apriNuovoOrdine" />
        </div>
        <q-card v-for="ordine in ordiniStore.ordini" :key="ordine.id" class="q-pa-sm">
          <q-card-section>
            <div><strong># Ordine:</strong> {{ ordine.id || '-' }}</div>
            <div><strong>Data ordine:</strong> {{ formattaDataItaliano(ordine.data) || '-' }}</div>
          </q-card-section>
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">{{ ordine.cliente.nome }} {{ ordine.cliente.cognome }}</div>
            <q-btn dense round flat icon="more_vert" color="primary" @click="openMenu(ordine, $event)">
              <q-tooltip anchor="top middle" self="bottom middle">Azioni</q-tooltip>
            </q-btn>
          </q-card-section>
          <q-card-section>
            <div><strong>Numero servizi associato/i:</strong> {{ ordine.nserviziAssociati || '-' }}</div>
            <div><strong>Prezzo totale:</strong> {{ ordine.prezzoTotale ? `€ ${ordine.prezzoTotale.toFixed(2)}` : '-' }}
            </div>
            <div><strong>Note:</strong> {{ ordine.note || '-' }}</div>
          </q-card-section>
        </q-card>
      </div>

    </q-card>

    <q-menu v-model="menuVisible" :target="menuAnchor" @hide="closeMenu" ref="dynamicMenuRef" class="rounded-menu">
      <q-list bordered separator class="text-body1">
        <q-item clickable v-close-popup @click="apriDettaglioOrdine(selectedRowId)" class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="visibility" color="blue-7" size="sm" />
          </q-item-section>
          <q-item-section>Dettaglio Ordine</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="modificaOrdine(selectedRowId)" class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="edit" color="blue-7" size="sm" />
          </q-item-section>
          <q-item-section>Modifica Ordine</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="eliminaOrdine(selectedRowId)" class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="delete_forever" color="red-7" size="sm" />
          </q-item-section>
          <q-item-section>Elimina Ordine</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <!-- Dialog per dettaglio ordine -->
    <q-dialog v-model="modaleDettaglioOrdineVisible" persistent maximized>
      <OrdineDetail :ordine="ordineIdSelezionato" @close="modaleDettaglioOrdineVisible = false" />
    </q-dialog>

    <!-- Dialog per nuovo ordine -->
    <q-dialog v-model="modaleNuovoOrdineVisible" persistent :maximized="false" :max-width="800">
      <ModaleNuovoOrdine :ordine="ordineIdSelezionato" :isEdit="isOrdineEdit"
        @close="modaleNuovoOrdineVisible = false" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useOrdiniStore } from 'src/components/stores/index.js'
import OrdineDetail from './OrdineDetail.vue'
import ModaleNuovoOrdine from 'src/components/ModaleNuovoOrdine.vue'
import { formattaDataItaliano } from 'src/utils/MethodUtils'

const $q = useQuasar()
const ordiniStore = useOrdiniStore()

const filtroDataDa = ref('')
const filtroDataA = ref('')

const modaleDettaglioOrdineVisible = ref(false)
const modaleNuovoOrdineVisible = ref(false)
const isOrdineEdit = ref(false)
const ordineIdSelezionato = ref(null)

// Menu contestuale
const menuVisible = ref(false)
const menuAnchor = ref(null)
const selectedRowId = ref(null)
const dynamicMenuRef = ref(null)

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'data',
  descending: true
})
const rowsNumber = ref(0)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'data', label: 'Data', field: row => formattaDataItaliano(row.data), align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: row => (row.cliente?.nome ?? '') + ' ' + (row.cliente?.cognome ?? ''), align: 'left', sortable: true },
  { name: 'prezzoTotale', label: 'Prezzo', field: row => row.prezzoTotale ? `€ ${row.prezzoTotale.toFixed(2)}` : '-', align: 'left', sortable: true },
  { name: 'azioni', label: 'Azioni', align: 'center' }
]

function openMenu(row, event) {
  selectedRowId.value = row.id
  menuAnchor.value = event.currentTarget
  menuVisible.value = true
}

function closeMenu() {
  menuVisible.value = false
  menuAnchor.value = null
  selectedRowId.value = null
}

function apriNuovoOrdine() {
  ordineIdSelezionato.value = null
  modaleNuovoOrdineVisible.value = true
  isOrdineEdit.value = false
}

function modificaOrdine(id) {
  ordineIdSelezionato.value = id
  modaleNuovoOrdineVisible.value = true
  isOrdineEdit.value = true
}

async function eliminaOrdine(id) {
  $q.dialog({
    title: 'Conferma Eliminazione',
    message: `Vuoi davvero eliminare l'ordine con ID: ${id}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await ordiniStore.deleteOrdine(id)
    requestNow()
    $q.notify({ message: 'Ordine eliminato con successo.', color: 'positive' })
  })
}

function apriDettaglioOrdine(idOrdine) {
  ordiniStore.ordine = ordiniStore.fetchOrdineById(idOrdine)
  modaleDettaglioOrdineVisible.value = true
}

/*function chiudiDettaglioOrdine() {
  ordiniStore.ordine.$reset()
  modaleDettaglioOrdineVisible.value = false
}*/

async function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination || pagination.value
  const filter = {
    dataDa: filtroDataDa.value || null,
    dataA: filtroDataA.value || null
  }
  try {
    const response = await ordiniStore.searchOrdini({
      filter,
      page: Math.max(0, (page || 1) - 1),
      size: rowsPerPage || 10,
      sortBy,
      descending
    })
    rowsNumber.value = typeof response?.totalElements === 'number' ? response.totalElements : ordiniStore.totalElements
  } catch {
    rowsNumber.value = 0
  }
}

function requestNow() {
  onRequest({ pagination: pagination.value })
}

watch([filtroDataDa, filtroDataA], () => {
  pagination.value.page = 1
  requestNow()
})

onMounted(() => {
  requestNow()
})
</script>

<style lang="scss" scoped>
@import 'src/css/_list-page.scss';
</style>
