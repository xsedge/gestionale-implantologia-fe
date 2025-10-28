<template>
  <q-page class="q-pa-md implantologia-page">
    <q-card flat bordered class="list-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-medium">Implantologia · Fatture</div>
        <div class="text-subtitle2 text-white">Traccia le fatture emesse e ricevute con collegamenti a vendite e acquisti.</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-input v-model="filters.search" label="Cerca per numero o cliente" dense outlined clearable debounce="200"
              prepend-inner-icon="search" />
          </div>
          <div class="col-12 col-md-4">
            <q-select v-model="filters.stato" :options="statiFattura" label="Stato" dense outlined clearable emit-value />
          </div>
          <div class="col-12 col-md-4 text-right">
            <q-btn color="primary" icon="add_circle" label="Nuova fattura" rounded unelevated @click="openCreate" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table :rows="filteredFatture" :columns="columns" row-key="id" flat bordered :loading="store.loading"
          no-data-label="Nessuna fattura presente" rows-per-page-label="Fatture per pagina" :pagination="pagination">
          <template #body-cell-importoTotale="props">
            <q-td :props="props">{{ formatCurrency(props.row.importoTotale) }}</q-td>
          </template>
          <template #body-cell-collegamenti="props">
            <q-td :props="props">
              <div class="column">
                <span v-if="props.row.venditaId">Vendita #{{ props.row.venditaId }}</span>
                <span v-if="props.row.acquistoId">Acquisto #{{ props.row.acquistoId }}</span>
                <span v-if="!props.row.venditaId && !props.row.acquistoId" class="text-grey-6">-</span>
              </div>
            </q-td>
          </template>
          <template #body-cell-azioni="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn dense flat round icon="picture_as_pdf" color="secondary" @click="generaPdf(props.row)" />
              <q-btn dense flat round icon="edit" color="primary" @click="openEdit(props.row)" />
              <q-btn dense flat round icon="delete" color="negative" @click="handleDelete(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <ModaleFattura v-model="modal.visible" :loading="modal.loading" :item="modal.item" :clienti-options="clientiOptions"
      :fornitori-options="fornitoriOptions" :vendite-options="venditeOptions" :acquisti-options="acquistiOptions"
      @salva="handleSave" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useImplantologiaFattureStore } from 'src/stores/implantologiaFattureStore.js'
import { useImplantologiaClientiStore } from 'src/stores/implantologiaClientiStore.js'
import { useImplantologiaFornitoriStore } from 'src/stores/implantologiaFornitoriStore.js'
import { useImplantologiaVenditeStore } from 'src/stores/implantologiaVenditeStore.js'
import { useImplantologiaAcquistiStore } from 'src/stores/implantologiaAcquistiStore.js'
import ModaleFattura from 'src/components/implantologia/ModaleFattura.vue'

const $q = useQuasar()
const store = useImplantologiaFattureStore()
const clientiStore = useImplantologiaClientiStore()
const fornitoriStore = useImplantologiaFornitoriStore()
const venditeStore = useImplantologiaVenditeStore()
const acquistiStore = useImplantologiaAcquistiStore()

const filters = reactive({
  search: '',
  stato: null
})

const statiFattura = [
  { label: 'Pagata', value: 'PAGATA' },
  { label: 'In attesa', value: 'IN_ATTESA' },
  { label: 'Annullata', value: 'ANNULLATA' }
]

const modal = reactive({
  visible: false,
  loading: false,
  item: null
})

const columns = [
  { name: 'numero', label: 'Numero', align: 'left', field: 'numero', sortable: true },
  { name: 'data', label: 'Data', align: 'left', field: row => formatDate(row.data), sortable: true },
  { name: 'stato', label: 'Stato', align: 'left', field: 'stato' },
  { name: 'tipo', label: 'Tipo', align: 'left', field: 'tipo' },
  { name: 'cliente', label: 'Cliente', align: 'left', field: row => getClienteNome(row.clienteDentaleId) },
  { name: 'fornitore', label: 'Fornitore', align: 'left', field: row => getFornitoreNome(row.fornitoreId) },
  { name: 'importoTotale', label: 'Importo', align: 'right', field: 'importoTotale' },
  { name: 'collegamenti', label: 'Collegamenti', align: 'left', field: row => row.venditaId || row.acquistoId },
  { name: 'azioni', label: 'Azioni', align: 'center', field: 'id' }
]

const pagination = ref({ rowsPerPage: 10 })

const clientiOptions = computed(() => clientiStore.clienti.map(cliente => ({
  id: cliente.id,
  label: `${cliente.nome} ${cliente.cognome}`.trim()
})))
const fornitoriOptions = computed(() => fornitoriStore.fornitori)
const venditeOptions = computed(() => venditeStore.vendite.map(vendita => ({ id: vendita.id, label: `Vendita #${vendita.id}` })))
const acquistiOptions = computed(() => acquistiStore.acquisti.map(acquisto => ({ id: acquisto.id, label: `Acquisto #${acquisto.id}` })))

const filteredFatture = computed(() => {
  return store.fatture.filter(fattura => {
    const search = filters.search?.toLowerCase()
    const matchesSearch = !search
      || fattura.numero?.toLowerCase().includes(search)
      || getClienteNome(fattura.clienteDentaleId).toLowerCase().includes(search)
    const matchesStato = !filters.stato || fattura.stato === filters.stato
    return matchesSearch && matchesStato
  })
})

onMounted(async () => {
  await Promise.all([
    store.fetchAll(),
    clientiStore.fetchAll(),
    fornitoriStore.fetchAll(),
    venditeStore.fetchAll(),
    acquistiStore.fetchAll()
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

function getClienteNome(id) {
  if (!id) return '-'
  return clientiOptions.value.find(cliente => cliente.id === id)?.label || '-'
}

function getFornitoreNome(id) {
  if (!id) return '-'
  return fornitoriStore.fornitori.find(f => f.id === id)?.nome || '-'
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
      $q.notify({ type: 'positive', message: 'Fattura aggiornata' })
    } else {
      await store.create(payload)
      $q.notify({ type: 'positive', message: 'Fattura creata' })
    }
    modal.visible = false
  } catch (error) {
    console.error(error)
  } finally {
    modal.loading = false
  }
}

async function generaPdf(item) {
  try {
    await store.downloadPdf(item.id)
    $q.notify({ type: 'info', message: 'Placeholder PDF generato' })
  } catch (error) {
    console.error(error)
  }
}

function handleDelete(item) {
  $q.dialog({
    title: 'Elimina fattura',
    message: `Confermi l'eliminazione della fattura <strong>${item.numero}</strong>?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await store.remove(item.id)
    $q.notify({ type: 'positive', message: 'Fattura eliminata' })
  })
}
</script>

<style scoped>
.implantologia-page .list-card {
  border-radius: 18px;
}
</style>
