<template>
  <q-page class="list-page q-pa-md">
    <q-card flat class="list-card">
      <div class="header-section-list q-mb-lg">
        <div class="text-h4 text-weight-bold text-pink-9 q-mb-sm">Gestione Servizi</div>
        <p class="text-subtitle1 text-grey-8">Visualizza e gestisci i servizi e le loro tipologie.</p>
      </div>

      <div class="filters-section q-mb-lg q-pa-md">
        <div class="text-h6 text-pink-8 q-mb-md text-weight-bold">Opzioni di Filtro</div>
        <div class="q-gutter-md row items-center justify-center">
          <q-input v-model="filterNome" label="Cerca per Nome" outlined clearable dense color="pink-7" bg-color="white"
            class="col-12 col-md-4">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-input v-model="filterDescrizione" label="Cerca per Descrizione" outlined clearable dense color="pink-7"
            bg-color="white" class="col-12 col-md-4">
            <template v-slot:prepend>
              <q-icon name="article" />
            </template>
          </q-input>
        </div>
      </div>

      <q-separator />
      <ResponsiveTable
        :rows="serviziStore.servizi"
        :columns="columns"
        row-key="idServizio"
        flat
        bordered
        color="pink-8"
        class="responsive-elegant-table q-table--horizontal-separator q-table--responsive"
        v-model:pagination="pagination"
        :rows-number="rowsNumber"
        :loading="serviziStore.loading"
        no-data-label="Nessun servizio trovato."
        rows-per-page-label="Servizi per pagina:"
        @request="onRequest"
      >
        <template #top-right>
          <q-btn color="pink-8" icon="add_circle" label="Aggiungi Servizio" class="q-px-md q-py-sm text-weight-bold"
            rounded @click="openModal()" />
        </template>
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

        <template #mobile-cell-azioni="{ row }">
          <q-btn dense round flat icon="more_vert" color="primary" @click="openMenu(row, $event)">
            <q-tooltip anchor="top middle" self="bottom middle">Azioni</q-tooltip>
          </q-btn>
        </template>
      </ResponsiveTable>
    </q-card>

    <!-- MENU AZIONI -->
    <q-menu v-model="menuVisible" :target="menuAnchor" @hide="closeMenu" ref="dynamicMenuRef" class="rounded-menu">
      <q-list bordered separator class="text-body1">
        <q-item clickable v-close-popup @click="openModal(selectedRowId)" class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="edit" color="blue-7" size="sm" />
          </q-item-section>
          <q-item-section>Modifica</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="deleteServizio(selectedRowId)" class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="delete_forever" color="red-7" size="sm" />
          </q-item-section>
          <q-item-section>Elimina</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <!-- DIALOG UNICO -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            {{ isEditMode ? 'Modifica Servizio' : 'Aggiungi Nuovo Servizio' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form ref="servizioFormRef" @submit.prevent="salvaServizio">
            <q-input v-model="servizioCorrente.nome" label="Nome" class="q-mb-md"
              :rules="[val => !!val || 'Campo obbligatorio']" />
            <q-input v-model="servizioCorrente.descrizione" label="Descrizione" class="q-mb-md" />
            <q-input v-model.number="servizioCorrente.prezzoBase" label="Prezzo" type="number" class="q-mb-md" :min="0"
              :step="0.01" prefix="€ " :rules="[val => val !== null && val >= 0 || 'Prezzo non valido']" />

            <q-card-actions align="right">
              <q-btn flat label="Annulla" v-close-popup @click="resetDialog" />
              <q-btn color="primary" type="submit" :label="isEditMode ? 'Salva' : 'Crea'" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useServiziStore } from 'src/components/stores/index.js'
import { useQuasar } from 'quasar'
import ResponsiveTable from 'src/components/ResponsiveTable.vue'

const serviziStore = useServiziStore()
const { servizioCorrente } = storeToRefs(serviziStore)

const showDialog = ref(false)
const menuVisible = ref(false)
const menuAnchor = ref(null)
const selectedRowId = ref(null)
const $q = useQuasar()

const filterNome = ref('')
const filterDescrizione = ref('')

const isEditMode = computed(() => servizioCorrente.value?.idServizio !== null && servizioCorrente.value?.idServizio !== undefined)

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'nome',
  descending: false
})
const rowsNumber = ref(0)

const columns = [
  { name: 'nome', label: 'Nome', field: row => row.nome || '-', align: 'left' },
  { name: 'descrizione', label: 'Descrizione', field: row => row.descrizione || '-', align: 'left' },
  {
    name: 'prezzoBase',
    label: 'Prezzo Base',
    field: row => row.prezzoBase,
    align: 'left',
    format: val => (val != null ? `€ ${Number(val).toFixed(2)}` : '-')
  },
  { name: 'azioni', label: 'Azioni', align: 'center', field: 'id', sortable: false }
]

async function openModal(selectedRow) {
  const resolvedId = typeof selectedRow === 'object'
    ? selectedRow?.idServizio ?? selectedRow?.id ?? null
    : selectedRow ?? null

  if (resolvedId !== null && resolvedId !== undefined) {
    try {
      const servizio = await serviziStore.fetchById(resolvedId)
      const servizioData = servizio?.data ?? servizio
      const idServizio = servizioData?.idServizio ?? servizioData?.id ?? resolvedId
      serviziStore.setServizioCorrente({
        ...servizioData,
        idServizio
      })
    } catch (error) {
      console.error('Errore nel caricamento del servizio:', error)
      return
    }
  } else {
    serviziStore.resetServizioCorrente()
  }
  showDialog.value = true
}



async function salvaServizio() {
  await serviziStore.createOrUpdate({ ...servizioCorrente.value })
  showDialog.value = false
  serviziStore.resetServizioCorrente()
  serviziStore.servizio = null
  requestNow()
}

async function deleteServizio(id) {
  $q.dialog({
    title: 'Conferma Eliminazione',
    message: `Vuoi davvero eliminare l'elemento con ID: ${id}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await serviziStore.delete(id)
    serviziStore.resetServizioCorrente()
    serviziStore.servizio = null
    requestNow()

  })

}

function openMenu(row, event) {
  selectedRowId.value = row.idServizio
  menuAnchor.value = event.currentTarget
  menuVisible.value = true
}


function closeMenu() {
  menuVisible.value = false
  menuAnchor.value = null
  selectedRowId.value = null
  serviziStore.servizio = null
  serviziStore.resetServizioCorrente()
}

function resetDialog() {
  showDialog.value = false
  serviziStore.resetServizioCorrente()
  serviziStore.servizio = null
}

async function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination || pagination.value
  const queryParts = [filterNome.value, filterDescrizione.value]
    .filter(Boolean)
    .map(part => part.trim())
    .filter(Boolean)
  const filter = {
    query: queryParts.join(' ').trim() || null,
    nome: filterNome.value || null,
    descrizione: filterDescrizione.value || null
  }
  try {
    const response = await serviziStore.searchServizi({
      filter,
      page: Math.max(0, (page || 1) - 1),
      size: rowsPerPage || 10,
      sortBy,
      descending
    })
    rowsNumber.value = typeof response?.totalElements === 'number' ? response.totalElements : serviziStore.totalElements
  } catch {
    rowsNumber.value = 0
  }
}

function requestNow() {
  onRequest({ pagination: pagination.value })
}

let filterTimeout
watch([filterNome, filterDescrizione], () => {
  pagination.value.page = 1
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    requestNow()
  }, 300)
})

onUnmounted(() => {
  clearTimeout(filterTimeout)
})

onMounted(() => {
  requestNow()
})
</script>

<style scoped lang="scss">
@import 'src/css/_list-page.scss';
</style>
