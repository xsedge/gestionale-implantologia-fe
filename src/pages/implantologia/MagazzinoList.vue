<template>
  <q-page class="q-pa-md implantologia-page">
    <div class="column q-gutter-lg">
      <q-card flat bordered class="list-card">
        <q-card-section class="bg-primary text-white">
          <div class="text-h5 text-weight-medium">Implantologia · Magazzino</div>
          <div class="text-subtitle2 text-white">Consulta movimenti e giacenze dei prodotti implantari.</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md items-end">
            <div class="col-12 col-md-4">
              <q-select v-model="filters.tipo" :options="tipiMovimento" label="Tipo movimento" dense outlined clearable
                emit-value />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="filters.categoria" :options="categoriaOptions" label="Categoria prodotto" dense outlined
                clearable emit-value />
            </div>
            <div class="col-12 col-md-4 text-right">
              <q-btn color="primary" icon="add_circle" label="Nuovo movimento" rounded unelevated @click="openCreate" />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-table :rows="filteredMovimenti" :columns="columns" row-key="id" flat bordered :loading="store.loading"
            no-data-label="Nessun movimento registrato" rows-per-page-label="Movimenti per pagina" :pagination="pagination">
            <template #body-cell-prezzoUnitario="props">
              <q-td :props="props">{{ formatCurrency(props.row.prezzoUnitario) }}</q-td>
            </template>
            <template #body-cell-dataMovimento="props">
              <q-td :props="props">{{ formatDateTime(props.row.dataMovimento) }}</q-td>
            </template>
            <template #body-cell-azioni="props">
              <q-td :props="props">
                <q-btn dense flat round icon="delete" color="negative" @click="handleDelete(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="list-card">
        <q-card-section class="bg-grey-2">
          <div class="text-subtitle1 text-weight-medium">Giacenze attuali</div>
        </q-card-section>
        <q-card-section>
          <q-table :rows="store.giacenze" :columns="columnsGiacenze" row-key="prodottoId" flat bordered :loading="store.loading"
            no-data-label="Nessuna giacenza disponibile" rows-per-page-label="Prodotti per pagina"
            :pagination="paginationGiacenze" />
        </q-card-section>
      </q-card>
    </div>

    <ModaleMagazzino v-model="modal.visible" :loading="modal.loading" :item="modal.item" :prodotti-options="prodottiOptions"
      @salva="handleSave" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useImplantologiaMagazzinoStore } from 'src/stores/implantologiaMagazzinoStore.js'
import { useImplantologiaProdottiStore } from 'src/stores/implantologiaProdottiStore.js'
import ModaleMagazzino from 'src/components/implantologia/ModaleMagazzino.vue'

const $q = useQuasar()
const store = useImplantologiaMagazzinoStore()
const prodottiStore = useImplantologiaProdottiStore()

const filters = reactive({
  tipo: null,
  categoria: null
})

const tipiMovimento = [
  { label: 'Entrata', value: 'ENTRATA' },
  { label: 'Uscita', value: 'USCITA' },
  { label: 'Reso', value: 'RESO' }
]

const modal = reactive({
  visible: false,
  loading: false,
  item: null
})

const columns = [
  { name: 'dataMovimento', label: 'Data', align: 'left', field: 'dataMovimento', sortable: true },
  { name: 'tipo', label: 'Tipo', align: 'left', field: 'tipo' },
  { name: 'prodotto', label: 'Prodotto', align: 'left', field: 'prodottoNome' },
  { name: 'categoria', label: 'Categoria', align: 'left', field: row => getCategoria(row.prodottoId) },
  { name: 'quantita', label: 'Quantità', align: 'right', field: 'quantita' },
  { name: 'prezzoUnitario', label: 'Prezzo unitario', align: 'right', field: 'prezzoUnitario' },
  { name: 'note', label: 'Note', align: 'left', field: 'note' },
  { name: 'azioni', label: 'Azioni', align: 'center', field: 'id' }
]

const columnsGiacenze = [
  { name: 'nome', label: 'Prodotto', align: 'left', field: 'nome', sortable: true },
  { name: 'categoria', label: 'Categoria', align: 'left', field: 'categoria' },
  { name: 'quantitaDisponibile', label: 'Quantità disponibile', align: 'right', field: 'quantitaDisponibile' }
]

const pagination = ref({ rowsPerPage: 10 })
const paginationGiacenze = ref({ rowsPerPage: 10 })

const prodottiOptions = computed(() => prodottiStore.prodotti)
const categoriaOptions = computed(() => {
  const categories = new Map()
  prodottiStore.prodotti.forEach(prodotto => {
    if (prodotto.categoria) {
      categories.set(prodotto.categoria, {
        label: prodotto.categoria,
        value: prodotto.categoria
      })
    }
  })
  return Array.from(categories.values())
})

const filteredMovimenti = computed(() => {
  return store.movimenti.filter(movimento => {
    const matchesTipo = !filters.tipo || movimento.tipo === filters.tipo
    const categoria = getCategoria(movimento.prodottoId)
    const matchesCategoria = !filters.categoria || categoria === filters.categoria
    return matchesTipo && matchesCategoria
  })
})

onMounted(async () => {
  await prodottiStore.fetchAll()
  await Promise.all([store.fetchMovimenti(), store.fetchGiacenze()])
})

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function getCategoria(prodottoId) {
  return prodottiStore.prodotti.find(prod => prod.id === prodottoId)?.categoria || '-'
}

function openCreate() {
  modal.item = null
  modal.visible = true
}

async function handleSave(payload) {
  modal.loading = true
  try {
    await store.createMovimento(payload)
    $q.notify({ type: 'positive', message: 'Movimento registrato' })
    modal.visible = false
  } catch (error) {
    console.error(error)
  } finally {
    modal.loading = false
  }
}

function handleDelete() {
  $q.dialog({
    title: 'Elimina movimento',
    message: "Confermi l'eliminazione di questo movimento?",
    cancel: true,
    persistent: true
  }).onOk(async () => {
    // Gestione eliminazione non disponibile lato BE: notifico utente
    $q.notify({ type: 'warning', message: "Eliminazione non supportata dall'API" })
  })
}
</script>

<style scoped>
.implantologia-page .list-card {
  border-radius: 18px;
}
</style>
