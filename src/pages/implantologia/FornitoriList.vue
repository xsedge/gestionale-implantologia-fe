<template>
  <q-page class="q-pa-md implantologia-page">
    <q-card flat bordered class="list-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-medium">Implantologia · Fornitori</div>
        <div class="text-subtitle2 text-white">Gestisci i partner per forniture e materiali dentali.</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-6">
            <q-input v-model="filters.search" label="Cerca per nome, email o partita IVA" dense outlined clearable
              prepend-inner-icon="search" debounce="200" />
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filters.hasNote" :options="noteOptions" label="Note" dense outlined clearable emit-value />
          </div>
          <div class="col-12 col-md-3 text-right">
            <q-btn color="primary" icon="add_circle" label="Nuovo fornitore" rounded unelevated @click="openCreate" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <ResponsiveTable
          :rows="filteredFornitori"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="store.loading"
          no-data-label="Nessun fornitore trovato"
          rows-per-page-label="Fornitori per pagina"
          :pagination="pagination"
        >
          <template #body-cell-azioni="props">
            <q-td :props="props">
              <q-btn dense flat round icon="edit" color="primary" @click="openEdit(props.row)" />
              <q-btn dense flat round icon="delete" color="negative" @click="handleDelete(props.row)" />
            </q-td>
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

    <ModaleFornitore v-model="modal.visible" :loading="modal.loading" :item="modal.item" @salva="handleSave" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useImplantologiaFornitoriStore } from 'src/stores/implantologiaFornitoriStore.js'
import ModaleFornitore from 'src/components/implantologia/ModaleFornitore.vue'
import ResponsiveTable from 'src/components/ResponsiveTable.vue'

const $q = useQuasar()
const store = useImplantologiaFornitoriStore()

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
  { name: 'nome', label: 'Nome', align: 'left', field: 'nome', sortable: true },
  { name: 'partitaIva', label: 'Partita IVA', align: 'left', field: 'partitaIva' },
  { name: 'email', label: 'Email', align: 'left', field: 'email' },
  { name: 'telefono', label: 'Telefono', align: 'left', field: 'telefono' },
  { name: 'indirizzo', label: 'Indirizzo', align: 'left', field: 'indirizzo' },
  { name: 'note', label: 'Note', align: 'left', field: 'note' },
  { name: 'azioni', label: 'Azioni', align: 'center', field: 'id' }
]

const pagination = ref({ rowsPerPage: 10 })

const filteredFornitori = computed(() => {
  return store.fornitori.filter(fornitore => {
    const search = filters.search?.toLowerCase()
    const matchesSearch = !search
      || [fornitore.nome, fornitore.email, fornitore.partitaIva].some(val => val?.toLowerCase().includes(search))
    const matchesNote = !filters.hasNote
      || (filters.hasNote === 'with' && !!fornitore.note)
      || (filters.hasNote === 'without' && !fornitore.note)
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
      $q.notify({ type: 'positive', message: 'Fornitore aggiornato' })
    } else {
      await store.create(payload)
      $q.notify({ type: 'positive', message: 'Fornitore creato' })
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
    title: 'Elimina fornitore',
    message: `Confermi l'eliminazione di <strong>${item.nome}</strong>?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await store.remove(item.id)
    $q.notify({ type: 'positive', message: 'Fornitore eliminato' })
  })
}
</script>

<style scoped>
.implantologia-page .list-card {
  border-radius: 18px;
}
</style>
