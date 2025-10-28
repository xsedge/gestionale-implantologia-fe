<template>
  <q-page class="q-pa-md implantologia-page">
    <q-card flat bordered class="list-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-medium">Implantologia · Prodotti</div>
        <div class="text-subtitle2 text-white">Gestisci prodotti, categorie e disponibilità di magazzino.</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-input v-model="filters.search" label="Cerca per nome o codice" dense outlined clearable debounce="200"
              prepend-inner-icon="search" />
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filters.categoria" :options="categoriaOptions" label="Categoria" dense outlined clearable
              emit-value map-options />
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filters.fornitoreId" :options="fornitoriOptions" label="Fornitore" dense outlined clearable
              emit-value map-options option-label="nome" option-value="id" />
          </div>
          <div class="col-12 col-md-2 text-right">
            <q-btn color="primary" icon="add_circle" label="Nuovo prodotto" rounded unelevated @click="openCreate" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table :rows="filteredProdotti" :columns="columns" row-key="id" flat bordered :loading="store.loading"
          no-data-label="Nessun prodotto trovato" rows-per-page-label="Prodotti per pagina" :pagination="pagination">
          <template #body-cell-listini="props">
            <q-td :props="props">
              <q-chip v-for="listino in props.row.listinoIds" :key="`${props.row.id}-${listino}`" dense color="primary"
                text-color="white" class="q-mr-xs q-mb-xs">
                {{ getListinoNome(listino) }}
              </q-chip>
              <span v-if="!props.row.listinoIds?.length" class="text-grey-6">-</span>
            </q-td>
          </template>

          <template #body-cell-scheda="props">
            <q-td :props="props">
              <div v-if="props.row.schedaImpianto" class="text-caption">
                <div><strong>Lotto:</strong> {{ props.row.schedaImpianto.lotto || '-' }}</div>
                <div><strong>Materiale:</strong> {{ props.row.schedaImpianto.materiale || '-' }}</div>
                <div><strong>Scadenza:</strong> {{ formatDate(props.row.schedaImpianto.dataScadenza) }}</div>
              </div>
              <span v-else class="text-grey-6">-</span>
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

    <ModaleProdotto v-model="modal.visible" :loading="modal.loading" :item="modal.item"
      :categoria-options="categoriaOptions" :fornitori-options="fornitoriOptions" :listini-options="listiniOptions"
      @salva="handleSave" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useImplantologiaProdottiStore } from 'src/stores/implantologiaProdottiStore.js'
import { useImplantologiaFornitoriStore } from 'src/stores/implantologiaFornitoriStore.js'
import { useImplantologiaListiniStore } from 'src/stores/implantologiaListiniStore.js'
import ModaleProdotto from 'src/components/implantologia/ModaleProdotto.vue'

const $q = useQuasar()
const store = useImplantologiaProdottiStore()
const fornitoriStore = useImplantologiaFornitoriStore()
const listiniStore = useImplantologiaListiniStore()

const filters = reactive({
  search: '',
  categoria: null,
  fornitoreId: null
})

const modal = reactive({
  visible: false,
  loading: false,
  item: null
})

const columns = [
  { name: 'nome', label: 'Nome', align: 'left', field: 'nome', sortable: true },
  { name: 'codice', label: 'Codice', align: 'left', field: 'codice', sortable: true },
  { name: 'categoria', label: 'Categoria', align: 'left', field: 'categoria', sortable: true },
  { name: 'fornitore', label: 'Fornitore', align: 'left', field: row => getFornitoreNome(row.fornitoreId) },
  { name: 'quantitaDisponibile', label: 'Disponibilità', align: 'right', field: 'quantitaDisponibile', sortable: true },
  { name: 'prezzoBase', label: 'Prezzo base', align: 'right', field: row => formatCurrency(row.prezzoBase) },
  { name: 'listini', label: 'Listini', align: 'left', field: 'listinoIds' },
  { name: 'scheda', label: 'Scheda impianto', align: 'left', field: 'schedaImpianto' },
  { name: 'azioni', label: 'Azioni', align: 'center', field: 'id' }
]

const pagination = ref({ rowsPerPage: 10 })

const categoriaOptions = computed(() => store.categorie.map(cat => ({ label: cat.descrizione || cat, value: cat.codice || cat })))
const fornitoriOptions = computed(() => fornitoriStore.fornitori)
const listiniOptions = computed(() => listiniStore.listini)

const filteredProdotti = computed(() => {
  return store.prodotti.filter(prodotto => {
    const matchesSearch = !filters.search
      || [prodotto.nome, prodotto.codice].some(val => val?.toLowerCase().includes(filters.search.toLowerCase()))
    const matchesCategoria = !filters.categoria || prodotto.categoria === filters.categoria
    const matchesFornitore = !filters.fornitoreId || prodotto.fornitoreId === filters.fornitoreId
    return matchesSearch && matchesCategoria && matchesFornitore
  })
})

onMounted(async () => {
  await Promise.all([
    store.fetchAll(),
    store.fetchCategorie(),
    fornitoriStore.fetchAll(),
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

function getFornitoreNome(id) {
  return fornitoriStore.fornitori.find(f => f.id === id)?.nome || '-'
}

function getListinoNome(id) {
  return listiniStore.listini.find(l => l.id === id)?.nome || `ID ${id}`
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
      $q.notify({ type: 'positive', message: 'Prodotto aggiornato con successo' })
    } else {
      await store.create(payload)
      $q.notify({ type: 'positive', message: 'Prodotto creato con successo' })
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
    title: 'Elimina prodotto',
    message: `Confermi l'eliminazione di <strong>${item.nome}</strong>?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await store.remove(item.id)
    $q.notify({ type: 'positive', message: 'Prodotto eliminato' })
  })
}
</script>

<style scoped>
.implantologia-page .list-card {
  border-radius: 18px;
}
</style>
