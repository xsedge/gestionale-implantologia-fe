<template>
  <q-page class="q-pa-md implantologia-page">
    <q-card flat bordered class="list-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-medium">Implantologia · Acquisti</div>
        <div class="text-subtitle2 text-white">Monitora gli ordini ai fornitori con stato e totale calcolato.</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-3">
            <q-input v-model="filters.search" label="Cerca per fornitore" dense outlined clearable debounce="200"
              prepend-inner-icon="search" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.dataInizio" type="date" label="Da data" dense outlined />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.dataFine" type="date" label="A data" dense outlined />
          </div>
          <div class="col-12 col-md-2">
            <q-select v-model="filters.stato" :options="statiAcquisto" label="Stato" dense outlined clearable emit-value />
          </div>
          <div class="col-12 col-md-1 text-right">
            <q-btn color="primary" icon="add_circle" label="Nuovo" rounded unelevated @click="openCreate" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <ResponsiveTable
          :rows="filteredAcquisti"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="store.loading"
          no-data-label="Nessun acquisto registrato"
          rows-per-page-label="Acquisti per pagina"
          :pagination="pagination"
        >
          <template #body-cell-dettagli="props">
            <q-td :props="props">
              <div
                v-for="det in props.row.dettagli"
                :key="`${props.row.id}-${det.prodottoId}-${det.listinoId ?? 'base'}`"
                class="text-caption q-mb-xs"
              >
                <div>
                  {{ det.quantita }}× {{ det.prodottoNome }} · Prezzo: {{ formatCurrency(det.prezzoUnitario ?? det.prezzoBase) }}
                </div>
                <div class="text-grey-7">
                  Totale: {{ formatCurrency(calcolaTotaleRiga(det)) }}
                  <span v-if="det.listinoId">
                    · Listino: {{ det.listinoNome || `#${det.listinoId}` }}
                  </span>
                </div>
              </div>
              <span v-if="!props.row.dettagli?.length" class="text-grey-6">-</span>
            </q-td>
          </template>
          <template #body-cell-azioni="props">
            <q-td :props="props">
              <q-btn dense flat round icon="edit" color="primary" @click="openEdit(props.row)" />
              <q-btn dense flat round icon="delete" color="negative" @click="handleDelete(props.row)" />
            </q-td>
          </template>
          <template #mobile-cell-dettagli="{ row }">
            <div class="column items-end">
              <div
                v-for="det in row.dettagli"
                :key="`${row.id}-${det.prodottoId}-${det.listinoId ?? 'base'}`"
                class="text-caption text-right"
              >
                <div>
                  {{ det.quantita }}× {{ det.prodottoNome }} · Prezzo: {{ formatCurrency(det.prezzoUnitario ?? det.prezzoBase) }}
                </div>
                <div class="text-grey-7">
                  Totale: {{ formatCurrency(calcolaTotaleRiga(det)) }}
                  <span v-if="det.listinoId">
                    · Listino: {{ det.listinoNome || `#${det.listinoId}` }}
                  </span>
                </div>
              </div>
              <span v-if="!row.dettagli?.length" class="text-grey-6">-</span>
            </div>
          </template>
          <template #mobile-cell-azioni="{ row }">
            <div class="q-gutter-xs">
              <q-btn dense flat round icon="edit" color="primary" @click="openEdit(row)" />
              <q-btn dense flat round icon="delete" color="negative" @click="handleDelete(row)" />
            </div>
          </template>
        </ResponsiveTable>
      </q-card-section>
    </q-card>

    <ModaleAcquisto v-model="modal.visible" :loading="modal.loading" :item="modal.item"
      :fornitori-options="fornitoriOptions" :prodotti-options="prodottiOptions" :listini-options="listiniOptions"
      @salva="handleSave" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useImplantologiaAcquistiStore } from 'src/stores/implantologiaAcquistiStore.js'
import { useImplantologiaFornitoriStore } from 'src/stores/implantologiaFornitoriStore.js'
import { useImplantologiaProdottiStore } from 'src/stores/implantologiaProdottiStore.js'
import { useImplantologiaListiniStore } from 'src/stores/implantologiaListiniStore.js'
import ModaleAcquisto from 'src/components/implantologia/ModaleAcquisto.vue'
import ResponsiveTable from 'src/components/ResponsiveTable.vue'

const $q = useQuasar()
const store = useImplantologiaAcquistiStore()
const fornitoriStore = useImplantologiaFornitoriStore()
const prodottiStore = useImplantologiaProdottiStore()
const listiniStore = useImplantologiaListiniStore()

const filters = reactive({
  search: '',
  dataInizio: '',
  dataFine: '',
  stato: null
})

const statiAcquisto = [
  { label: 'In corso', value: 'IN_CORSO' },
  { label: 'Completato', value: 'COMPLETATO' },
  { label: 'Annullato', value: 'ANNULLATO' }
]

const modal = reactive({
  visible: false,
  loading: false,
  item: null
})

const columns = [
  { name: 'numero', label: 'Numero', align: 'left', field: 'numero', sortable: true },
  { name: 'dataAcquisto', label: 'Data', align: 'left', field: row => formatDate(row.dataAcquisto), sortable: true },
  { name: 'fornitore', label: 'Fornitore', align: 'left', field: row => getFornitoreNome(row) },
  { name: 'stato', label: 'Stato', align: 'left', field: 'stato' },
  { name: 'totale', label: 'Totale', align: 'right', field: row => formatCurrency(row.totale ?? calcolaTotale(row)) },
  { name: 'dettagli', label: 'Dettagli', align: 'left', field: 'dettagli' },
  { name: 'azioni', label: 'Azioni', align: 'center', field: 'id' }
]

const pagination = ref({ rowsPerPage: 10 })

const fornitoriOptions = computed(() => fornitoriStore.fornitori)
const prodottiOptions = computed(() => prodottiStore.prodotti)
const listiniOptions = computed(() => listiniStore.listini)

const filteredAcquisti = computed(() => {
  return store.acquisti.filter(acquisto => {
    const search = filters.search?.toLowerCase()
    const matchesSearch = !search
      || getFornitoreNome(acquisto).toLowerCase().includes(search)
      || acquisto.numero?.toLowerCase().includes(search)
    const matchesStato = !filters.stato || acquisto.stato === filters.stato
    const data = acquisto.dataAcquisto ? new Date(acquisto.dataAcquisto) : null
    const matchesData = (!filters.dataInizio || (data && data >= new Date(filters.dataInizio)))
      && (!filters.dataFine || (data && data <= new Date(filters.dataFine)))
    return matchesSearch && matchesStato && matchesData
  })
})

onMounted(async () => {
  await Promise.all([
    store.fetchAll(),
    fornitoriStore.fetchAll(),
    prodottiStore.fetchAll(),
    listiniStore.fetchAll()
  ])
})

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('it-IT').format(new Date(value))
}

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)
}

function getFornitoreNome(acquisto) {
  if (!acquisto) return '-'
  if (acquisto.fornitoreNome) {
    return acquisto.fornitoreNome
  }
  const id = typeof acquisto === 'object' ? acquisto.fornitoreId : acquisto
  return fornitoriStore.fornitori.find(f => f.id === id)?.nome || '-'
}

function calcolaTotale(acquisto) {
  if (!Array.isArray(acquisto?.dettagli)) {
    return 0
  }
  return acquisto.dettagli.reduce((sum, det) => sum + calcolaTotaleRiga(det), 0)
}

function calcolaTotaleRiga(det) {
  if (!det) {
    return 0
  }
  if (det.totaleRiga != null) {
    return Number(det.totaleRiga) || 0
  }
  const quantita = Number(det.quantita) || 0
  const prezzo = det.prezzoUnitario != null
    ? Number(det.prezzoUnitario)
    : det.prezzoBase != null
      ? Number(det.prezzoBase)
      : 0
  return prezzo * quantita
}

function openCreate() {
  modal.item = null
  modal.visible = true
}

function openEdit(item) {
  modal.item = { ...item }
  modal.visible = true
}

async function handleSave(payload) {
  modal.loading = true
  try {
    if (payload.id) {
      await store.update(payload.id, payload)
      $q.notify({ type: 'positive', message: 'Acquisto aggiornato' })
    } else {
      await store.create(payload)
      $q.notify({ type: 'positive', message: 'Acquisto registrato' })
    }
    modal.visible = false
  } catch (error) {
    console.error(error)
  } finally {
    modal.loading = false
  }
}

function handleDelete(item) {
  $q.dialog({
    title: 'Elimina acquisto',
    message: `Confermi l'eliminazione dell'acquisto <strong>${item.numero || formatDate(item.dataAcquisto)}</strong>?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await store.remove(item.id)
    $q.notify({ type: 'positive', message: 'Acquisto eliminato' })
  })
}
</script>

<style scoped>
.implantologia-page .list-card {
  border-radius: 18px;
}
</style>
