<template>
  <q-page class="list-page q-pa-md">
    <q-card flat class="list-card">
      <!-- Header -->
      <div class="header-section-list q-mb-lg">
        <div class="text-h4 text-weight-bold text-pink-9 q-mb-sm">Elenco Clienti</div>
        <p class="text-subtitle1 text-grey-8">Visualizza e gestisci i dettagli dei tuoi clienti.</p>
      </div>

      <!-- Filtri -->
      <div class="filters-section q-mb-lg q-pa-md">
        <div class="text-h6 text-pink-8 q-mb-md text-weight-bold">Opzioni di Filtro</div>
        <div class="q-gutter-md row items-center justify-center">
          <q-input v-model="filterNome" label="Cerca per Nome" outlined clearable dense
            class="col-12 col-md-4 filter-input-large" color="pink-7" bg-color="white">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
          <q-input v-model="filterCognome" label="Cerca per Cognome" outlined clearable dense
            class="col-12 col-md-4 filter-input-large" color="pink-7" bg-color="white">
            <template v-slot:prepend>
              <q-icon name="person_outline" />
            </template>
          </q-input>
          <q-input v-model="filterDataUltimoOrdine" label="Filtra per Data Ultimo Ordine" outlined clearable dense
            type="date" class="col-12 col-md-4 filter-input-large" color="pink-7" bg-color="white">
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>
        </div>
      </div>

      <ResponsiveTable
        :rows="clientiStore.clienti"
        :columns="columns"
        row-key="id"
        flat
        bordered
        separator="horizontal"
        class="responsive-elegant-table q-table--horizontal-separator q-table--responsive"
        color="pink-8"
        v-model:pagination="pagination"
        :rows-number="rowsNumber"
        :loading="clientiStore.loading"
        no-data-label="Nessun cliente trovato."
        rows-per-page-label="Clienti per pagina:"
        loading-label="Caricamento clienti..."
        @request="onRequest"
      >
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
                <div class="text-wrap">
                  {{ col.value }}
                </div>
              </template>
            </q-td>
          </q-tr>
        </template>

        <template #top-right>
          <q-btn color="pink-8" icon="add_circle" label="Aggiungi Cliente" class="q-px-md q-py-sm text-weight-bold"
            rounded @click="showAddClientModal = true" />
        </template>

        <template #mobile-cell-azioni="{ row }">
          <q-btn dense round flat icon="more_vert" color="primary" @click="openMenu(row, $event)">
            <q-tooltip anchor="top middle" self="bottom middle">Azioni</q-tooltip>
          </q-btn>
        </template>
      </ResponsiveTable>
    </q-card>

    <q-menu v-model="menuVisible" :target="menuAnchor" @hide="closeMenu" ref="dynamicMenuRef" class="rounded-menu">
      <q-list bordered separator class="text-body1">
        <q-item clickable v-close-popup @click="goToDetail(selectedRowId)" class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="visibility" color="grey-7" size="sm" />
          </q-item-section>
          <q-item-section>Apri Scheda Cliente</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="editClient(selectedRowId)" class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="edit" color="blue-7" size="sm" />
          </q-item-section>
          <q-item-section>Modifica Cliente</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="deleteClient(selectedRow)" class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="delete_forever" color="red-7" size="sm" />
          </q-item-section>
          <q-item-section>Elimina Cliente</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <q-dialog v-model="showAddClientModal" @before-show="initializeClientForm">
      <q-card class="add-client-modal-card" style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            {{ isEditMode ? 'Modifica Cliente' : 'Aggiungi Nuovo Cliente' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>

        <q-form ref="clientFormRef" @submit.prevent="saveClient">
          <q-card-section class="q-pt-lg">
            <q-input outlined v-model="clientForm.nome" label="Nome" class="q-mb-md"
              :rules="[val => !!val || 'Campo obbligatorio']" />
            <q-input outlined v-model="clientForm.cognome" label="Cognome" class="q-mb-md"
              :rules="[val => !!val || 'Campo obbligatorio']" />
            <q-input outlined v-model="clientForm.dataNascita" label="Data di Nascita" type="date" class="q-mb-md" />
            <q-input outlined v-model="clientForm.note" label="Note" type="textarea" autogrow />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Annulla" color="grey" flat @click="closeModal" />
            <!-- Pulsante submit per far partire la validazione -->
            <q-btn label="Salva Cliente" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>



  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClientiStore } from 'src/components/stores/index.js'
import { useQuasar } from 'quasar'
import ResponsiveTable from 'src/components/ResponsiveTable.vue'

const router = useRouter()
const clientiStore = useClientiStore()
const $q = useQuasar()

// Colonne della tabella
const columns = [
  { name: 'nome', label: 'Nome', field: row => row.nome || '-', align: 'left', sortable: true },
  { name: 'cognome', label: 'Cognome', field: row => row.cognome || '-', align: 'left', sortable: true },
  { name: 'dataNascita', label: 'Data di Nascita', field: row => row.dataNascita || '-', align: 'left', sortable: true },
  { name: 'note', label: 'Note', field: row => row.note || '-', align: 'left', style: 'max-width: 250px; white-space: normal;' },
  { name: 'dataUltimoOrdine', label: 'Ultimo Ordine', field: row => row.dataUltimoOrdine || '-', align: 'left', sortable: true },
  { name: 'azioni', label: 'Azioni', align: 'center' }
]

// Stati per menu contestuale
const menuVisible = ref(false)
const menuAnchor = ref(null)
const selectedRowId = ref(null)
const selectedRow = ref(null)
const dynamicMenuRef = ref(null)

// Filtri
const filterNome = ref('')
const filterCognome = ref('')
const filterDataUltimoOrdine = ref('')

// Paginazione tabella (Quasar server-side)
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'nome',
  descending: false
})
const rowsNumber = ref(0)

// Stato per la modale "Aggiungi Cliente"
const showAddClientModal = ref(false)
// Variabili d'esempio per il form nella modale
const clientForm = ref('')

const isEditMode = computed(() => !!clientiStore.cliente?.id)

function initializeClientForm() {
  if (clientiStore.cliente) {
    const c = clientiStore.cliente
    clientForm.value = {
      id: c.id || null,
      nome: c.nome || '',
      cognome: c.cognome || '',
      dataNascita: c.dataNascita || '',
      note: c.note || ''
    }
  } else {
    clientForm.value = {
      id: null,
      nome: '',
      cognome: '',
      dataNascita: '',
      note: ''
    }
  }
}

async function saveClient() {
  await clientiStore.createUpdateCliente({ ...clientForm.value })
  closeModal()
}

function closeModal() {
  showAddClientModal.value = false
  clientiStore.$reset()
  // ricarica la pagina corrente con i filtri correnti
  requestNow()
}

// Richiesta lato server in base a paginazione e filtri
async function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination || pagination.value
  const filter = {
    nome: filterNome.value || null,
    cognome: filterCognome.value || null,
    dataUltimoOrdine: filterDataUltimoOrdine.value || null
  }
  try {
    const resp = await clientiStore.searchClienti({
      filter,
      page: Math.max(0, (page || 1) - 1),
      size: rowsPerPage || 10,
      sortBy,
      descending
    })
    rowsNumber.value = typeof resp?.totalElements === 'number' ? resp.totalElements : clientiStore.clienti.length
  } catch {
    rowsNumber.value = 0
  }
}

// helper per chiamare @request manualmente con la paginazione corrente
function requestNow() {
  onRequest({ pagination: pagination.value })
}

// Quando cambiano i filtri, riparti dalla prima pagina e ricarica
watch([filterNome, filterCognome, filterDataUltimoOrdine], () => {
  pagination.value.page = 1
  requestNow()
})




// Funzioni menu contestuale
function openMenu(row, event) {
  console.log('Apri menu per row:', row)
  console.log('Apri menu per row noe:', row.nome)
  selectedRowId.value = row.id
  selectedRow.value = row
  menuAnchor.value = event.currentTarget
  menuVisible.value = true
}

function closeMenu() {
  menuVisible.value = false
  menuAnchor.value = null
  selectedRowId.value = null
  selectedRow.value = null
}

function goToDetail(id) {
  router.push(`/clienti/${id}`)
}

function editClient(id) {
  showAddClientModal.value = true
  clientiStore.cliente = clientiStore.clienti.find(c => c.id === id)
  initializeClientForm()
}

function deleteClient(row) {
  console.log('Elimina ID:', row)
  $q.dialog({
    title: 'Conferma Eliminazione',
    message: `Sei sicuro di voler eliminare il cliente: ${row.nome}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    clientiStore.deleteCliente(row.id)
  });
}

onMounted(async () => {
  try {
    requestNow()
  } catch (err) {
    console.error('Errore nel caricamento dei clienti:', err)
    $q.notify({
      message: 'Impossibile caricare i clienti. Riprova più tardi.',
      color: 'negative',
      icon: 'warning'
    });
  }
})
</script>

<style lang="scss" scoped>
@import 'src/css/_list-page.scss';
</style>
