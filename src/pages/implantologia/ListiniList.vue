<template>
  <q-page class="q-pa-md implantologia-page">
    <q-card flat bordered class="list-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-medium">Implantologia · Listini</div>
        <div class="text-subtitle2 text-white">Definisci sconti personalizzati per fornitori e prodotti.</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-input v-model="filters.search" label="Cerca per nome" dense outlined clearable debounce="200"
              prepend-inner-icon="search" />
          </div>
          <div class="col-12 col-md-4">
            <q-select v-model="filters.fornitoreId" :options="fornitoriOptions" option-label="nome" option-value="id"
              emit-value map-options label="Fornitore" dense outlined clearable />
          </div>
          <div class="col-12 col-md-4 text-right">
            <q-btn color="primary" icon="add_circle" label="Nuovo listino" rounded unelevated @click="openCreate" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <ResponsiveTable
          :rows="filteredListini"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="store.loading"
          no-data-label="Nessun listino configurato"
          rows-per-page-label="Listini per pagina"
          :pagination="pagination"
        >
          <template #body-cell-prodotti="props">
            <q-td :props="props">
              <div class="text-caption" v-for="prod in props.row.prodotti" :key="`${props.row.id}-${prod.prodottoId}`">
                {{ getProdottoNome(prod.prodottoId) }} · {{ formatCurrency(prod.prezzoScontato || prod.prezzoBase) }}
              </div>
              <span v-if="!props.row.prodotti?.length" class="text-grey-6">-</span>
            </q-td>
          </template>
          <template #body-cell-azioni="props">
            <q-td :props="props">
              <q-btn dense flat round icon="edit" color="primary" @click="openEdit(props.row)" />
              <q-btn dense flat round icon="delete" color="negative" @click="handleDelete(props.row)" />
            </q-td>
          </template>
          <template #mobile-cell-prodotti="{ row }">
            <div class="column items-end">
              <div class="text-caption" v-for="prod in row.prodotti" :key="`${row.id}-${prod.prodottoId}`">
                {{ getProdottoNome(prod.prodottoId) }} · {{ formatCurrency(prod.prezzoScontato || prod.prezzoBase) }}
              </div>
              <span v-if="!row.prodotti?.length" class="text-grey-6">-</span>
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

    <ModaleListino v-model="modal.visible" :loading="modal.loading" :item="modal.item"
      :fornitori-options="fornitoriOptions" :prodotti-options="prodottiOptions" @salva="handleSave" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useImplantologiaListiniStore } from 'src/stores/implantologiaListiniStore.js'
import { useImplantologiaFornitoriStore } from 'src/stores/implantologiaFornitoriStore.js'
import { useImplantologiaProdottiStore } from 'src/stores/implantologiaProdottiStore.js'
import ModaleListino from 'src/components/implantologia/ModaleListino.vue'
import ResponsiveTable from 'src/components/ResponsiveTable.vue'

const $q = useQuasar()
const store = useImplantologiaListiniStore()
const fornitoriStore = useImplantologiaFornitoriStore()
const prodottiStore = useImplantologiaProdottiStore()

const filters = reactive({
  search: '',
  fornitoreId: null
})

const modal = reactive({
  visible: false,
  loading: false,
  item: null
})

const columns = [
  { name: 'nome', label: 'Nome', align: 'left', field: 'nome', sortable: true },
  { name: 'validoDal', label: 'Valido dal', align: 'left', field: row => formatDate(row.validoDal), sortable: true },
  { name: 'validoAl', label: 'Valido al', align: 'left', field: row => formatDate(row.validoAl), sortable: true },
  { name: 'sconto', label: 'Sconto (%)', align: 'right', field: row => row.scontoPercentuale ?? 0 },
  { name: 'fornitore', label: 'Fornitore', align: 'left', field: row => getFornitoreNome(row.fornitoreId) },
  { name: 'prodotti', label: 'Prodotti', align: 'left', field: 'prodotti' },
  { name: 'note', label: 'Note', align: 'left', field: 'note' },
  { name: 'azioni', label: 'Azioni', align: 'center', field: 'id' }
]

const pagination = ref({ rowsPerPage: 10 })

const fornitoriOptions = computed(() => fornitoriStore.fornitori)
const prodottiOptions = computed(() => prodottiStore.prodotti)

const filteredListini = computed(() => {
  return store.listini.filter(listino => {
    const search = filters.search?.toLowerCase()
    const matchesSearch = !search
      || listino.nome?.toLowerCase().includes(search)
      || listino.note?.toLowerCase().includes(search)
    const matchesFornitore = !filters.fornitoreId || listino.fornitoreId === filters.fornitoreId
    return matchesSearch && matchesFornitore
  })
})

onMounted(async () => {
  await Promise.all([store.fetchAll(), fornitoriStore.fetchAll(), prodottiStore.fetchAll()])
})

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('it-IT').format(new Date(value))
}

function getFornitoreNome(id) {
  return fornitoriStore.fornitori.find(f => f.id === id)?.nome || '-'
}

function getProdottoNome(id) {
  return prodottiStore.prodotti.find(p => p.id === id)?.nome || `ID ${id}`
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
      $q.notify({ type: 'positive', message: 'Listino aggiornato' })
    } else {
      await store.create(payload)
      $q.notify({ type: 'positive', message: 'Listino creato' })
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
    title: 'Elimina listino',
    message: `Confermi l'eliminazione di <strong>${item.nome}</strong>?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await store.remove(item.id)
    $q.notify({ type: 'positive', message: 'Listino eliminato' })
  })
}
</script>

<style scoped>
.implantologia-page .list-card {
  border-radius: 18px;
}
</style>
