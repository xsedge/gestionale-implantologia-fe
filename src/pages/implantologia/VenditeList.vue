<template>
  <q-page class="q-pa-md implantologia-page">
    <q-card flat bordered class="list-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-medium">Implantologia · Vendite</div>
        <div class="text-subtitle2 text-white">Gestisci le vendite ai clienti dentali con stato di pagamento.</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-input v-model="filters.search" label="Cerca per cliente" dense outlined clearable debounce="200"
              prepend-inner-icon="search" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.dataInizio" type="date" label="Da data" dense outlined />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.dataFine" type="date" label="A data" dense outlined />
          </div>
          <div class="col-12 col-md-2">
            <q-select v-model="filters.statoPagamento" :options="statiPagamento" label="Stato pagamento" dense outlined
              clearable emit-value />
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col-12 text-right">
            <q-btn color="primary" icon="add_circle" label="Nuova vendita" rounded unelevated @click="openCreate" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table :rows="filteredVendite" :columns="columns" row-key="id" flat bordered :loading="store.loading"
          no-data-label="Nessuna vendita registrata" rows-per-page-label="Vendite per pagina" :pagination="pagination">
          <template #body-cell-dettagli="props">
            <q-td :props="props">
              <div v-for="det in props.row.dettagli" :key="`${props.row.id}-${det.prodottoId}`" class="text-caption">
                {{ det.quantita }}× {{ det.prodottoNome }} · {{ formatCurrency(det.prezzoUnitario) }}
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
        </q-table>
      </q-card-section>
    </q-card>

    <ModaleVendita v-model="modal.visible" :loading="modal.loading" :item="modal.item" :prodotti-options="prodottiOptions"
      :clienti-options="clientiOptions" :listini-options="listiniOptions" @salva="handleSave" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useImplantologiaVenditeStore } from 'src/stores/implantologiaVenditeStore.js'
import { useImplantologiaClientiStore } from 'src/stores/implantologiaClientiStore.js'
import { useImplantologiaProdottiStore } from 'src/stores/implantologiaProdottiStore.js'
import { useImplantologiaListiniStore } from 'src/stores/implantologiaListiniStore.js'
import ModaleVendita from 'src/components/implantologia/ModaleVendita.vue'

const $q = useQuasar()
const store = useImplantologiaVenditeStore()
const clientiStore = useImplantologiaClientiStore()
const prodottiStore = useImplantologiaProdottiStore()
const listiniStore = useImplantologiaListiniStore()

const filters = reactive({
  search: '',
  dataInizio: '',
  dataFine: '',
  statoPagamento: null
})

const statiPagamento = [
  { label: 'In attesa', value: 'IN_ATTESA' },
  { label: 'Pagato', value: 'PAGATO' },
  { label: 'Parziale', value: 'PARZIALE' }
]

const modal = reactive({
  visible: false,
  loading: false,
  item: null
})

const columns = [
  { name: 'data', label: 'Data', align: 'left', field: row => formatDate(row.data), sortable: true },
  { name: 'cliente', label: 'Cliente', align: 'left', field: row => row.clienteDentaleNome || row.cliente || '-' },
  { name: 'statoPagamento', label: 'Stato pagamento', align: 'left', field: 'statoPagamento' },
  { name: 'totale', label: 'Totale', align: 'right', field: row => formatCurrency(row.totale || calcolaTotale(row)) },
  { name: 'dettagli', label: 'Dettagli', align: 'left', field: 'dettagli' },
  { name: 'azioni', label: 'Azioni', align: 'center', field: 'id' }
]

const pagination = ref({ rowsPerPage: 10 })

const prodottiOptions = computed(() => prodottiStore.prodotti)
const listiniOptions = computed(() => listiniStore.listini)
const clientiOptions = computed(() => clientiStore.clienti.map(cliente => ({
  id: cliente.id,
  label: `${cliente.nome} ${cliente.cognome} · ${cliente.studioDentale || ''}`.trim()
})))

const filteredVendite = computed(() => {
  return store.vendite.filter(vendita => {
    const search = filters.search?.toLowerCase()
    const clienteNome = (vendita.clienteDentaleNome || vendita.cliente || '').toLowerCase()
    const matchesSearch = !search || clienteNome.includes(search)
    const matchesStato = !filters.statoPagamento || vendita.statoPagamento === filters.statoPagamento
    const matchesData = (!filters.dataInizio || new Date(vendita.data) >= new Date(filters.dataInizio))
      && (!filters.dataFine || new Date(vendita.data) <= new Date(filters.dataFine))
    return matchesSearch && matchesStato && matchesData
  })
})

onMounted(async () => {
  await Promise.all([
    store.fetchAll(),
    clientiStore.fetchAll(),
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

function calcolaTotale(vendita) {
  if (!Array.isArray(vendita?.dettagli)) {
    return 0
  }
  return vendita.dettagli.reduce((sum, det) => sum + (Number(det.totaleRiga) || (Number(det.prezzoUnitario) || 0) * det.quantita), 0)
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
      $q.notify({ type: 'positive', message: 'Vendita aggiornata' })
    } else {
      await store.create(payload)
      $q.notify({ type: 'positive', message: 'Vendita registrata' })
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
    title: 'Elimina vendita',
    message: `Confermi l'eliminazione della vendita del ${formatDate(item.data)}?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await store.remove(item.id)
    $q.notify({ type: 'positive', message: 'Vendita eliminata' })
  })
}
</script>

<style scoped>
.implantologia-page .list-card {
  border-radius: 18px;
}
</style>
