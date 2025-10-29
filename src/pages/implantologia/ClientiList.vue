<template>
  <q-page class="q-pa-md implantologia-page">
    <q-card flat bordered class="list-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-medium">Implantologia · Clienti dentali</div>
        <div class="text-subtitle2 text-white">Gestisci l'anagrafica dei pazienti e i riferimenti agli studi.</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-6">
            <q-input v-model="filters.search" label="Cerca per nome, cognome, email o codice fiscale" dense outlined clearable
              prepend-inner-icon="search" debounce="200" />
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filters.hasNote" :options="noteOptions" label="Note" dense outlined clearable emit-value />
          </div>
          <div class="col-12 col-md-3 text-right">
            <q-btn color="primary" icon="add_circle" label="Nuovo cliente" rounded unelevated @click="openCreate" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <ResponsiveTable
          :rows="filteredClienti"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="store.loading"
          no-data-label="Nessun cliente trovato"
          rows-per-page-label="Clienti per pagina"
          :pagination="pagination"
        >
          <template #body-cell-cliente="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ formatFullName(props.row) }}</div>
              <div class="text-caption text-grey-7" v-if="props.row.studioDentale">{{ props.row.studioDentale }}</div>
            </q-td>
          </template>
          <template #body-cell-indirizzo="props">
            <q-td :props="props">{{ formatAddress(props.row) }}</q-td>
          </template>
          <template #body-cell-azioni="props">
            <q-td :props="props">
              <q-btn dense flat round icon="edit" color="primary" @click="openEdit(props.row)" />
              <q-btn dense flat round icon="delete" color="negative" @click="handleDelete(props.row)" />
            </q-td>
          </template>
          <template #mobile-cell-cliente="{ row }">
            <div class="column items-end">
              <div class="text-weight-medium">{{ formatFullName(row) }}</div>
              <div class="text-caption text-grey-7" v-if="row.studioDentale">{{ row.studioDentale }}</div>
            </div>
          </template>
          <template #mobile-cell-indirizzo="{ row }">
            {{ formatAddress(row) }}
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

    <ModaleCliente v-model="modal.visible" :loading="modal.loading" :item="modal.item" @salva="handleSave" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useImplantologiaClientiStore } from 'src/stores/implantologiaClientiStore.js'
import ModaleCliente from 'src/components/implantologia/ModaleCliente.vue'
import ResponsiveTable from 'src/components/ResponsiveTable.vue'

const $q = useQuasar()
const store = useImplantologiaClientiStore()

const filters = reactive({
  search: '',
  hasNote: null
})

const noteOptions = [
  { label: 'Con note', value: 'with' },
  { label: 'Senza note', value: 'without' }
]

const modal = reactive({
  visible: false,
  loading: false,
  item: null
})

const columns = [
  { name: 'cliente', label: 'Cliente', align: 'left', field: row => formatFullName(row), sortable: true },
  { name: 'codiceFiscale', label: 'Codice fiscale', align: 'left', field: 'codiceFiscale' },
  { name: 'email', label: 'Email', align: 'left', field: 'email' },
  { name: 'telefono', label: 'Telefono', align: 'left', field: 'telefono' },
  { name: 'indirizzo', label: 'Indirizzo', align: 'left', field: row => formatAddress(row) },
  { name: 'note', label: 'Note', align: 'left', field: 'note' },
  { name: 'azioni', label: 'Azioni', align: 'center', field: 'id' }
]

const pagination = ref({ rowsPerPage: 10 })

const filteredClienti = computed(() => {
  return store.clienti.filter(cliente => {
    const search = filters.search?.toLowerCase().trim()
    const matchesSearch = !search || [
      cliente.nome,
      cliente.cognome,
      cliente.email,
      cliente.codiceFiscale,
      cliente.studioDentale
    ].some(val => val?.toLowerCase().includes(search))

    const matchesNote = !filters.hasNote
      || (filters.hasNote === 'with' && !!cliente.note)
      || (filters.hasNote === 'without' && !cliente.note)

    return matchesSearch && matchesNote
  })
})

onMounted(() => {
  store.fetchAll()
})

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
      $q.notify({ type: 'positive', message: 'Cliente aggiornato' })
    } else {
      await store.create(payload)
      $q.notify({ type: 'positive', message: 'Cliente creato' })
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
    title: 'Elimina cliente',
    message: `Confermi l'eliminazione di <strong>${formatFullName(item)}</strong>?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await store.remove(item.id)
    $q.notify({ type: 'positive', message: 'Cliente eliminato' })
  })
}

function formatFullName(cliente) {
  return [cliente.nome, cliente.cognome].filter(Boolean).join(' ') || '-'
}

function formatAddress(cliente) {
  const parts = [cliente.indirizzo, cliente.citta, cliente.cap].filter(Boolean)
  return parts.length ? parts.join(' · ') : '-'
}
</script>

<style scoped>
.implantologia-page .list-card {
  border-radius: 18px;
}
</style>
