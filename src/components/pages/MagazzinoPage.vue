<template>
  <q-page class="list-page q-pa-md">
    <q-card flat class="list-card">
      <div class="header-section-list q-mb-lg">
        <div class="text-h4 text-weight-bold text-pink-9 q-mb-sm">Gestione Magazzino</div>
        <p class="text-subtitle1 text-grey-8">
          Controlla le giacenze correnti e monitora tutti i movimenti dei prodotti.
        </p>
      </div>

      <q-tabs v-model="tab" class="text-pink-8 q-mb-md" dense align="center" narrow-indicator>
        <q-tab name="giacenze" label="Giacenze correnti" />
        <q-tab name="storico" label="Storico movimenti" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="giacenze">
          <q-table v-if="!isMobile" :rows="giacenzeRows" :columns="columnsGiacenze" row-key="id" flat bordered
            color="pink-8" class="responsive-elegant-table q-table--horizontal-separator q-table--responsive"
            :pagination="{ rowsPerPage: 10 }" :loading="loadingGiacenze" no-data-label="Nessuna giacenza trovata."
            rows-per-page-label="Giacenze per pagina:">
            <template #top-right>
              <div class="row items-center q-gutter-sm">
                <q-btn flat round dense icon="refresh" @click="refreshGiacenze" :loading="loadingGiacenze">
                  <q-tooltip>Ricarica giacenze</q-tooltip>
                </q-btn>
                <q-btn color="pink-8" icon="add_circle" label="Aggiungi movimento"
                  class="q-px-md q-py-sm text-weight-bold" rounded @click="openMovimentoDialog" />
              </div>
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
                <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-label="col.label"
                  class="custom-body-cell" :style="{ padding: '12px 16px', fontSize: '13px' }">
                  <div class="text-wrap">
                    {{ col.value }}
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>

          <q-slide-transition>
            <div v-if="isMobile">
              <div class="row q-py-md justify-center q-gutter-sm">
                <q-btn flat round dense icon="refresh" @click="refreshGiacenze" :loading="loadingGiacenze">
                  <q-tooltip>Ricarica giacenze</q-tooltip>
                </q-btn>
                <q-btn color="pink-8" icon="add_circle" label="Aggiungi movimento"
                  class="q-px-md q-py-sm text-weight-bold" rounded @click="openMovimentoDialog" />
              </div>
              <transition-group name="fade" tag="div" class="q-gutter-md">
                <q-card v-for="row in giacenzeRows" :key="row.id" class="q-pa-sm fade-item">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold">{{ row.prodotto }}</div>
                    <div class="text-caption text-grey-7">Quantità attuale</div>
                    <div class="text-body1 q-mt-xs">{{ row.quantitaLabel }}</div>
                  </q-card-section>
                </q-card>
              </transition-group>
            </div>
          </q-slide-transition>
        </q-tab-panel>

        <q-tab-panel name="storico">
          <q-slide-transition>
            <div v-show="tab === 'storico'" class="filters-section q-mb-lg q-pa-md">
              <div class="text-h6 text-pink-8 q-mb-md text-weight-bold">Opzioni di Filtro</div>
              <div class="q-gutter-md row items-center justify-center">
                <q-select v-model="movimentiFilters.prodottoId" :options="filteredProdottiOptions" label="Prodotto"
                  outlined dense clearable emit-value map-options use-input fill-input input-debounce="0"
                  @filter="filterProdotti" color="pink-7" bg-color="white" class="col-12 col-md-4">
                  <template #prepend>
                    <q-icon name="inventory_2" />
                  </template>
                </q-select>

                <q-select v-model="movimentiFilters.tipoMovimento" :options="tipoMovimentoOptions"
                  label="Tipo movimento" outlined dense clearable emit-value map-options color="pink-7" bg-color="white"
                  class="col-12 col-md-3">
                  <template #prepend>
                    <q-icon name="compare_arrows" />
                  </template>
                </q-select>

                <q-input v-model="movimentiDateRangeLabel" label="Intervallo date" outlined dense readonly
                  color="pink-7" bg-color="white" class="col-12 col-md-3">
                  <template #prepend>
                    <q-icon name="event" />
                  </template>
                  <template #append>
                    <q-icon name="calendar_month" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date v-model="movimentiFilters.dateRange" range mask="YYYY-MM-DD" color="pink-8" flat>
                          <div class="row items-center justify-end q-gutter-sm q-pa-sm">
                            <q-btn flat label="Annulla" v-close-popup />
                            <q-btn color="pink-8" label="Applica" v-close-popup />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

                <div class="col-12 col-md-2 text-center text-md-right">
                  <q-btn flat label="Reset filtri" icon="refresh" color="black" @click="resetMovimentiFilters" />
                </div>
              </div>
            </div>
          </q-slide-transition>

          <q-separator class="q-mb-md" />

          <q-table v-if="!isMobile" :rows="movimentiRows" :columns="columnsMovimenti" row-key="id" flat bordered
            color="pink-8" class="responsive-elegant-table q-table--horizontal-separator q-table--responsive"
            :pagination="{ rowsPerPage: 10 }" :loading="loadingMovimenti" no-data-label="Nessun movimento trovato."
            rows-per-page-label="Movimenti per pagina:">
            <template #top-right>
              <q-btn color="pink-8" icon="add_circle" label="Aggiungi movimento"
                class="q-px-md q-py-sm text-weight-bold" rounded @click="openMovimentoDialog" />
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
              <q-tr :props="props" class="responsive-row">
                <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-label="col.label"
                  class="custom-body-cell" :style="{ padding: '12px 16px', fontSize: '13px' }">
                  <template v-if="col.name === 'tipo'">
                    <q-badge :color="getTipoMovimentoColor(props.row.tipoMovimento)" text-color="white" rounded>
                      {{ props.row.tipoLabel }}
                    </q-badge>
                  </template>
                  <template v-else-if="col.name === 'quantita'">
                    <div class="text-wrap">{{ props.row.quantitaLabel }}</div>
                  </template>
                  <template v-else-if="col.name === 'azioni'">
                    <q-btn-dropdown v-if="props.row.actions?.length" color="pink-8" flat dense rounded
                      icon="more_vert" label="Azioni"
                      :disable="movimentoActionLoadingId === props.row.id"
                      :loading="movimentoActionLoadingId === props.row.id">
                      <q-list>
                        <q-item v-for="action in props.row.actions" :key="`${props.row.id}-${action.type}`"
                          clickable v-close-popup @click="handleMovimentoAction(props.row, action)">
                          <q-item-section avatar>
                            <q-icon :name="action.icon" :color="action.color" size="sm" />
                          </q-item-section>
                          <q-item-section :class="action.color === 'negative' ? 'text-negative' : ''">
                            {{ action.label }}
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                    <span v-else class="text-caption text-grey-6">Nessuna azione</span>
                  </template>
                  <template v-else>
                    <div class="text-wrap">{{ col.value }}</div>
                  </template>
                </q-td>
              </q-tr>
            </template>
          </q-table>

          <q-slide-transition>
            <transition-group v-if="isMobile" name="fade" tag="div" class="q-gutter-md">
              <q-card v-for="movimento in movimentiRows" :key="movimento.id" class="q-pa-sm fade-item">
                <q-card-section class="row items-center justify-between">
                  <div>
                    <div class="text-subtitle1 text-weight-bold">{{ movimento.prodotto }}</div>
                    <div class="text-caption text-grey-7">{{ movimento.dataLabel }}</div>
                  </div>
                  <q-badge :color="getTipoMovimentoColor(movimento.tipoMovimento)" text-color="white" rounded>
                    {{ movimento.tipoLabel }}
                  </q-badge>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div><strong>Quantità:</strong> {{ movimento.quantitaLabel }}</div>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn-dropdown v-if="movimento.actions?.length" color="pink-8" flat dense rounded icon="more_vert"
                    label="Azioni" :disable="movimentoActionLoadingId === movimento.id"
                    :loading="movimentoActionLoadingId === movimento.id">
                    <q-list>
                      <q-item v-for="action in movimento.actions" :key="`${movimento.id}-${action.type}`"
                        clickable v-close-popup @click="handleMovimentoAction(movimento, action)">
                        <q-item-section avatar>
                          <q-icon :name="action.icon" :color="action.color" size="sm" />
                        </q-item-section>
                        <q-item-section :class="action.color === 'negative' ? 'text-negative' : ''">
                          {{ action.label }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </q-card-actions>
              </q-card>
            </transition-group>
          </q-slide-transition>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="movimentoDialog.visible" persistent>
      <q-card style="min-width: 380px">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Aggiungi movimento</div>
        </q-card-section>

        <q-card-section>
          <q-form ref="movimentoFormRef" @submit.prevent="submitMovimento" class="q-gutter-md">
            <q-select v-model="movimentoDialog.form.prodottoId" :options="filteredProdottiOptions" label="Prodotto"
              outlined dense emit-value map-options use-input fill-input input-debounce="0" @filter="filterProdotti"
              color="pink-7" bg-color="white" :rules="[val => !!val || 'Seleziona un prodotto']" />

            <q-select v-model="movimentoDialog.form.tipoMovimento" :options="tipoMovimentoOptions"
              label="Tipo movimento" outlined dense emit-value map-options color="pink-7" bg-color="white"
              :rules="[val => !!val || 'Seleziona un tipo movimento']" />

            <q-input v-model.number="movimentoDialog.form.quantita" label="Quantità" type="number" outlined dense
              min="1" color="pink-7" bg-color="white" :rules="[val => val > 0 || 'Inserisci una quantità valida']" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup @click="closeMovimentoDialog" :disable="movimentoDialog.loading" />
          <q-btn color="pink-8" label="Salva" :loading="movimentoDialog.loading" @click="submitMovimento" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="statoDialog.visible" persistent>
      <q-card style="min-width: 380px">
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-xs">Conferma cambio stato</div>
          <div class="text-body2 text-grey-8">
            Confermi di voler aggiornare il movimento selezionato a
            <strong>{{ statoDialog.targetLabel }}</strong>?
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-sm">
          <div class="text-subtitle2 text-weight-bold">Dettagli movimento</div>
          <div><strong>Prodotto:</strong> {{ statoDialog.movimento?.prodotto || '-' }}</div>
          <div><strong>Tipo attuale:</strong> {{ statoDialog.movimento?.tipoLabel || '-' }}</div>
          <div><strong>Quantità:</strong> {{ statoDialog.movimento?.quantitaLabel || '-' }}</div>
          <div><strong>Data movimento:</strong> {{ statoDialog.movimento?.dataLabel || '-' }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup :disable="statoDialog.loading" @click="closeConfermaDialog" />
          <q-btn color="pink-8" label="Conferma" :loading="statoDialog.loading" @click="confirmAdvance" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { createMovimento, deleteStatoMovimento, getGiacenze, getMovimenti, updateStatoMovimento } from 'src/api/magazzino.js'
import { useProdottiStore } from 'src/components/stores'

const $q = useQuasar()
const prodottiStore = useProdottiStore()

const tab = ref('giacenze')
const loadingGiacenze = ref(false)
const loadingMovimenti = ref(false)
const giacenzeRaw = ref([])
const movimentiRaw = ref([])
const movimentoActionLoadingId = ref(null)

const allProdottiOptions = ref([])
const filteredProdottiOptions = ref([])

const movimentiFilters = reactive({
  prodottoId: null,
  tipoMovimento: null,
  dateRange: null
})

const movimentoDialog = reactive({
  visible: false,
  loading: false,
  form: {
    prodottoId: null,
    tipoMovimento: null,
    quantita: null
  }
})

const movimentoFormRef = ref(null)
const isMobile = computed(() => $q.screen.lt.sm)

const statoDialog = reactive({
  visible: false,
  loading: false,
  movimento: null,
  nextState: null,
  targetLabel: ''
})

const tipoMovimentoOptions = [
  { label: 'Ordinato', value: 'ORDINATO' },
  { label: 'Consegnato', value: 'CONSEGNATO' },
  { label: 'Prenotato', value: 'PRENOTATO' },
  { label: 'Venduto', value: 'VENDUTO' },
  { label: 'Scarico', value: 'SCARICO' }
]

const movimentoLabels = {
  ORDINATO: 'Ordinato',
  CONSEGNATO: 'Consegnato',
  PRENOTATO: 'Prenotato',
  VENDUTO: 'Venduto',
  SCARICO: 'Scarico'
}

const tipoColorMap = {
  ORDINATO: 'blue-6',
  CONSEGNATO: 'green-6',
  PRENOTATO: 'orange-6',
  VENDUTO: 'teal-6',
  SCARICO: 'purple-5'
}

const columnsGiacenze = [
  { name: 'prodotto', label: 'Prodotto', field: 'prodotto', align: 'left' },
  { name: 'quantita', label: 'Quantità attuale', field: 'quantitaLabel', align: 'left' }
]

const columnsMovimenti = [
  { name: 'data', label: 'Data movimento', field: 'dataLabel', align: 'left' },
  { name: 'prodotto', label: 'Prodotto', field: 'prodotto', align: 'left' },
  { name: 'tipo', label: 'Tipo movimento', field: 'tipoLabel', align: 'left' },
  { name: 'quantita', label: 'Quantità', field: 'quantitaLabel', align: 'left' },
  { name: 'azioni', label: 'Azioni', field: 'id', align: 'center', sortable: false }
]

const prodottiMap = computed(() => {
  const map = {}
  allProdottiOptions.value.forEach(option => {
    map[option.value] = option.label
  })
  return map
})

const giacenzeRows = computed(() =>
  giacenzeRaw.value.map(item => {
    const prodottoId = item.prodottoId ?? item.id
    return {
      ...item,
      id: prodottoId,
      prodotto: prodottiMap.value[prodottoId] || item.prodotto || `Prodotto #${prodottoId ?? '-'}`,
      quantitaLabel: formatQuantita(item.quantitaAttuale)
    }
  })
)

const movimentiRows = computed(() =>
  movimentiRaw.value.map(item => {
    const tipo = item.tipoMovimento || item.tipo
    const nextState = getNextState(tipo)
    const prodottoId = item.prodottoId ?? item.idProdotto
    const actions = []
    if (nextState) {
      actions.push({
        type: 'advance',
        label: getActionLabel(nextState),
        icon: 'check_circle',
        color: 'primary',
        nextState
      })
    }
    if (tipo === 'ORDINATO' || tipo === 'PRENOTATO') {
      actions.push({
        type: 'cancel',
        label: 'Annulla movimento',
        icon: 'cancel',
        color: 'negative'
      })
    }
    return {
      ...item,
      id: item.id,
      prodotto: prodottiMap.value[prodottoId] || item.prodotto || `Prodotto #${prodottoId ?? '-'}`,
      tipoMovimento: tipo,
      tipoLabel: movimentoLabels[tipo] || tipo || '-',
      quantitaLabel: formatQuantita(item.quantita),
      dataLabel: formatDateTime(item.dataMovimento),
      nextState,
      actions
    }
  })
)

const movimentiDateRangeLabel = computed({
  get() {
    const range = movimentiFilters.dateRange
    if (!range || (!range.from && !range.to)) {
      return ''
    }
    if (range.from && range.to) {
      return `${formatDate(range.from)} - ${formatDate(range.to)}`
    }
    return formatDate(range.from || range.to)
  },
  set(value) {
    if (!value) {
      movimentiFilters.dateRange = null
    }
  }
})

watch(
  movimentiFilters,
  () => {
    fetchMovimenti()
  },
  { deep: true }
)

watch(allProdottiOptions, () => {
  filteredProdottiOptions.value = [...allProdottiOptions.value]
})

onMounted(async () => {
  await loadProdottiOptions()
  await Promise.all([fetchGiacenze(), fetchMovimenti()])
})

async function loadProdottiOptions() {
  try {
    const prodotti = await prodottiStore.fetchAllProdotti(0, 500)
    const mapped = Array.isArray(prodotti)
      ? prodotti.map(prodotto => ({
        label: prodotto.nome || `Prodotto #${prodotto.id}`,
        value: prodotto.id
      }))
      : []
    allProdottiOptions.value = mapped
  } catch (error) {
    notifyError('Errore durante il caricamento dei prodotti', error)
    allProdottiOptions.value = []
  }
}

async function fetchGiacenze() {
  loadingGiacenze.value = true
  try {
    const response = await getGiacenze()
    giacenzeRaw.value = Array.isArray(response) ? response : []
  } catch (error) {
    notifyError('Errore durante il caricamento delle giacenze', error)
    giacenzeRaw.value = []
  } finally {
    loadingGiacenze.value = false
  }
}

async function fetchMovimenti() {
  loadingMovimenti.value = true
  try {
    const params = buildMovimentiParams()
    const response = await getMovimenti(params)
    movimentiRaw.value = Array.isArray(response) ? response : []
  } catch (error) {
    notifyError('Errore durante il caricamento dei movimenti', error)
    movimentiRaw.value = []
  } finally {
    loadingMovimenti.value = false
  }
}

function buildMovimentiParams() {
  const params = {}
  const { prodottoId, tipoMovimento, dateRange } = movimentiFilters
  if (prodottoId) {
    params.prodottoId = prodottoId
  }
  if (tipoMovimento) {
    params.tipoMovimento = tipoMovimento
  }
  if (dateRange?.from) {
    params.dataDa = dateRange.from
  }
  if (dateRange?.to) {
    params.dataA = dateRange.to
  }
  return params
}

function resetMovimentiFilters() {
  Object.assign(movimentiFilters, {
    prodottoId: null,
    tipoMovimento: null,
    dateRange: null
  })
}

function refreshGiacenze() {
  fetchGiacenze()
}

function filterProdotti(val, update) {
  update(() => {
    if (!val) {
      filteredProdottiOptions.value = [...allProdottiOptions.value]
      return
    }
    const needle = val.toString().toLowerCase()
    filteredProdottiOptions.value = allProdottiOptions.value.filter(option =>
      option.label.toLowerCase().includes(needle)
    )
  })
}

function openMovimentoDialog() {
  movimentoDialog.visible = true
  movimentoDialog.form = {
    prodottoId: movimentiFilters.prodottoId,
    tipoMovimento: null,
    quantita: null
  }
  movimentoFormRef.value?.resetValidation?.()
}

function closeMovimentoDialog() {
  movimentoDialog.visible = false
  movimentoDialog.form = {
    prodottoId: null,
    tipoMovimento: null,
    quantita: null
  }
  movimentoFormRef.value?.resetValidation?.()
}

async function submitMovimento() {
  const formEl = movimentoFormRef.value
  if (formEl) {
    const valid = await formEl.validate()
    if (!valid) {
      return
    }
  }

  movimentoDialog.loading = true
  try {
    const payload = {
      prodottoId: movimentoDialog.form.prodottoId,
      tipoMovimento: movimentoDialog.form.tipoMovimento,
      quantita: Number(movimentoDialog.form.quantita)
    }
    await createMovimento(payload)
    $q.notify({ type: 'positive', message: 'Movimento registrato con successo' })
    movimentoDialog.visible = false
    await Promise.all([fetchMovimenti(), fetchGiacenze()])
  } catch (error) {
    notifyError('Errore durante la creazione del movimento', error)
  } finally {
    movimentoDialog.loading = false
  }
}

async function advanceMovimento(movimento, nextState) {
  if (!nextState) {
    return
  }
  movimentoActionLoadingId.value = movimento.id
  statoDialog.loading = true
  let success = false
  try {
    await updateStatoMovimento(movimento.id, { nuovoStato: nextState })
    $q.notify({
      type: 'positive',
      message: `Movimento aggiornato a ${movimentoLabels[nextState] || nextState}`
    })
    statoDialog.visible = false
    await Promise.all([fetchMovimenti(), fetchGiacenze()])
    success = true
  } catch (error) {
    notifyError("Errore durante l'aggiornamento dello stato", error)
  } finally {
    movimentoActionLoadingId.value = null
    statoDialog.loading = false
    if (success || !statoDialog.visible) {
      statoDialog.movimento = null
      statoDialog.nextState = null
      statoDialog.targetLabel = ''
    }
  }
}

function handleMovimentoAction(movimento, action) {
  if (!movimento || !action) {
    return
  }
  if (movimentoActionLoadingId.value === movimento.id) {
    return
  }
  if (action.type === 'advance') {
    openConfermaDialog(movimento, action.nextState ?? movimento.nextState)
    return
  }
  if (action.type === 'cancel') {
    confirmCancelMovimento(movimento)
  }
}

function openConfermaDialog(movimento, targetState = movimento?.nextState) {
  if (!movimento || !targetState) {
    return
  }
  statoDialog.movimento = movimento
  statoDialog.nextState = targetState
  statoDialog.targetLabel = movimentoLabels[targetState] || targetState
  statoDialog.visible = true
}

function closeConfermaDialog() {
  if (statoDialog.loading) {
    return
  }
  statoDialog.visible = false
  statoDialog.movimento = null
  statoDialog.nextState = null
  statoDialog.targetLabel = ''
}

function confirmAdvance() {
  if (!statoDialog.movimento || !statoDialog.nextState) {
    statoDialog.visible = false
    return
  }
  advanceMovimento(statoDialog.movimento, statoDialog.nextState)
}

function confirmCancelMovimento(movimento) {
  if (!movimento?.id) {
    return
  }
  $q.dialog({
    title: 'Annulla movimento',
    message: 'Confermi di voler annullare il movimento selezionato?',
    cancel: true,
    persistent: true
  }).onOk(() => cancelMovimento(movimento))
}

async function cancelMovimento(movimento) {
  if (!movimento?.id) {
    return
  }
  movimentoActionLoadingId.value = movimento.id
  try {
    await deleteStatoMovimento(movimento.id)
    $q.notify({ type: 'positive', message: 'Movimento annullato con successo' })
    await Promise.all([fetchMovimenti(), fetchGiacenze()])
  } catch (error) {
    notifyError("Errore durante l'annullamento del movimento", error)
  } finally {
    movimentoActionLoadingId.value = null
  }
}

function getNextState(tipo) {
  if (tipo === 'ORDINATO') {
    return 'CONSEGNATO'
  }
  if (tipo === 'PRENOTATO') {
    return 'VENDUTO'
  }
  return null
}

function getActionLabel(nextState) {
  return `Segna come ${movimentoLabels[nextState] || nextState}`
}

function getTipoMovimentoColor(tipo) {
  return tipoColorMap[tipo] || 'grey-6'
}

function formatQuantita(value) {
  if (value === null || value === undefined) {
    return '-'
  }
  const number = Number(value)
  if (Number.isNaN(number)) {
    return value
  }
  return number.toLocaleString('it-IT')
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatDate(value) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

function notifyError(defaultMessage, error) {
  const message = error?.response?.data?.message || error?.message || defaultMessage
  $q.notify({ type: 'negative', message })
}
</script>

<style scoped lang="scss">
@import 'src/css/_list-page.scss';

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.fade-item {
  transition: transform 0.25s ease;
}
</style>
