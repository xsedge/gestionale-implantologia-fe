<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card class="implantologia-modal implantologia-modal--large">
      <q-form ref="formRef" @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white implantologia-modal__header">
          <div class="text-h6 text-weight-medium">{{ titolo }}</div>
          <div class="text-subtitle2 text-white">Registra i movimenti di acquisto dai fornitori.</div>
        </q-card-section>

        <q-card-section class="implantologia-modal__body">
          <div class="implantologia-form-grid implantologia-form-grid--loose">
            <q-input v-model="form.numero" label="Numero" dense outlined :rules="requiredRule" />
            <q-input v-model="form.dataAcquisto" type="date" label="Data acquisto" dense outlined :rules="requiredRule" />
            <q-select v-model="form.fornitoreId" :options="fornitoriOptions" label="Fornitore" dense outlined emit-value
              map-options option-label="nome" option-value="id" :rules="requiredRule" />
            <q-select v-model="form.stato" :options="statiAcquisto" label="Stato" dense outlined emit-value map-options
              :rules="requiredRule" />
            <q-input v-model="form.note" label="Note" type="textarea" outlined dense autogrow class="implantologia-form-grid__full" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="implantologia-modal__body">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">Prodotti acquistati</div>
            <q-btn color="primary" icon="add" label="Aggiungi prodotto" flat dense @click="aggiungiRiga" />
          </div>

          <div v-if="!form.prodotti.length" class="text-grey-6 bg-grey-2 q-pa-md rounded-borders text-center">
            Nessun prodotto aggiunto. Premi "Aggiungi prodotto" per iniziare.
          </div>

          <div v-else class="column q-gutter-md">
            <q-card v-for="(riga, index) in form.prodotti" :key="`acquisto-${index}`" flat bordered class="q-pa-md">
              <div class="implantologia-form-grid implantologia-form-grid--line">
                <q-select v-model="riga.prodottoId" :options="prodottiOptions" option-label="nome"
                  option-value="id" emit-value map-options label="Prodotto" dense outlined use-input input-debounce="200"
                  @filter="(val, update) => filtraProdotti(val, update)" :rules="requiredRule" />
                <q-input v-model.number="riga.quantita" type="number" label="Quantità" dense outlined :rules="requiredNumericRule" />
                <q-select
                  v-model="riga.listinoId"
                  :options="riga.listiniDisponibili"
                  option-label="label"
                  option-value="id"
                  emit-value
                  map-options
                  label="Listino"
                  dense
                  outlined
                  clearable
                  :disable="!riga.listiniDisponibili.length"
                >
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.nome }}</q-item-label>
                        <q-item-label caption>
                          Prezzo: {{ formatCurrency(scope.opt.prezzoApplicato) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template #selected-item="scope">
                    <q-item v-bind="scope.itemProps" class="q-pa-none">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.nome }}</q-item-label>
                        <q-item-label caption>
                          Prezzo: {{ formatCurrency(scope.opt.prezzoApplicato) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-input :model-value="formatCurrency(prezzoUnitario(riga))" label="Prezzo unitario" dense outlined readonly />
                <div class="implantologia-form-grid__actions">
                  <q-btn flat dense color="negative" icon="delete" @click="rimuoviRiga(index)" />
                </div>
              </div>
              <div class="text-right text-weight-medium text-primary q-mt-sm">
                Totale riga: {{ formatCurrency(rigaTotale(riga)) }}
              </div>
            </q-card>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="implantologia-modal__body row justify-end items-center q-gutter-sm">
          <div class="text-subtitle1 text-weight-medium">Totale ordine:</div>
          <div class="text-h6 text-primary">{{ formatCurrency(totale) }}</div>
        </q-card-section>

        <q-card-actions class="implantologia-modal__actions">
          <q-btn flat label="Annulla" :disable="loading" @click="close" />
          <q-btn color="primary" label="Salva" type="submit" :loading="loading" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
  item: { type: Object, default: null },
  fornitoriOptions: { type: Array, default: () => [] },
  prodottiOptions: { type: Array, default: () => [] },
  listiniOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'salva'])

const statiAcquisto = [
  { label: 'In corso', value: 'IN_CORSO' },
  { label: 'Completato', value: 'COMPLETATO' }
]

const emptyForm = () => ({
  id: null,
  numero: '',
  dataAcquisto: '',
  stato: 'IN_CORSO',
  fornitoreId: null,
  note: '',
  prodotti: []
})

const form = reactive(emptyForm())
const formRef = ref(null)
const requiredRule = [val => !!val || 'Campo obbligatorio']
const requiredNumericRule = [val => val !== null && val !== '' || 'Campo obbligatorio']

watch(
  () => props.item,
  valore => {
    Object.assign(form, emptyForm(), valore || {})
    form.prodotti = []
    if (Array.isArray(valore?.dettagli)) {
      form.prodotti = valore.dettagli.map(det => normalizzaRigaDettaglio(det))
    } else if (Array.isArray(valore?.prodotti)) {
      form.prodotti = valore.prodotti.map(det => normalizzaRigaDettaglio(det))
    }
    form.prodotti.forEach(riga => aggiornaPrezzo(riga, {
      force: riga.prezzoBase == null,
      synchronizeListini: !riga.listiniDisponibili?.length
    }))
  },
  { immediate: true }
)

watch(
  () => props.prodottiOptions,
  () => {
    form.prodotti.forEach(riga => aggiornaPrezzo(riga, { synchronizeListini: true }))
  },
  { deep: true }
)

const totale = computed(() => form.prodotti.reduce((sum, riga) => sum + rigaTotale(riga), 0))

const titolo = computed(() => (form.id ? 'Modifica Acquisto' : 'Nuovo Acquisto'))

function close() {
  emit('update:modelValue', false)
}

function prodottiMap() {
  const map = new Map()
  props.prodottiOptions.forEach(prod => {
    map.set(prod.id, prod)
  })
  return map
}

function aggiungiRiga() {
  form.prodotti.push({
    prodottoId: null,
    quantita: 1,
    listinoId: null,
    prezzoUnitario: 0,
    prezzoBase: 0,
    listiniDisponibili: [],
    __lastProdottoId: null,
    __lastListinoId: null
  })
}

function rimuoviRiga(index) {
  form.prodotti.splice(index, 1)
}

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  const payload = {
    id: form.id,
    numero: form.numero,
    dataAcquisto: form.dataAcquisto,
    stato: form.stato,
    fornitoreId: form.fornitoreId,
    note: form.note,
    prodotti: form.prodotti
      .filter(riga => riga.prodottoId)
      .map(riga => ({
        prodottoId: riga.prodottoId,
        quantita: Number(riga.quantita) || 0,
        listinoId: riga.listinoId || null
      }))
  }
  emit('salva', payload)
}

function filtraProdotti(val, update) {
  update()
}

function normalizzaListini(listini = []) {
  if (!Array.isArray(listini)) {
    return []
  }
  return listini
    .map(listino => {
      const id = listino.id ?? listino.listinoId ?? listino.value ?? null
      const nome = listino.nome ?? listino.label ?? `Listino ${id ?? ''}`.trim()
      const prezzoApplicato = Number(listino.prezzoApplicato ?? listino.prezzo ?? listino.prezzoUnitario ?? 0) || 0
      return {
        ...listino,
        id,
        nome,
        prezzoApplicato,
        label: `${nome}${nome ? ' · ' : ''}${formatCurrency(prezzoApplicato)}`
      }
    })
    .filter(listino => listino.id != null)
}

function normalizzaRigaDettaglio(det) {
  const quantita = Number(det?.quantita) || 0
  const listiniDisponibili = normalizzaListini(det?.listiniDisponibili)
  const listinoId = det?.listinoId ?? null
  const prezzoBase = det?.prezzoBase != null ? Number(det.prezzoBase) : null
  const prezzoUnitarioDet = det?.prezzoUnitario != null
    ? Number(det.prezzoUnitario)
    : det?.totaleRiga != null && quantita
      ? Number(det.totaleRiga) / quantita
      : null
  return {
    prodottoId: det?.prodottoId ?? null,
    quantita: quantita || 1,
    listinoId,
    prezzoBase,
    prezzoUnitario: prezzoUnitarioDet ?? 0,
    listiniDisponibili,
    __lastProdottoId: det?.prodottoId ?? null,
    __lastListinoId: listinoId ?? null
  }
}

function aggiornaPrezzo(riga, { force = false, synchronizeListini = false } = {}) {
  if (!riga) {
    return
  }
  if (!riga.prodottoId) {
    riga.prezzoUnitario = 0
    riga.prezzoBase = 0
    riga.listiniDisponibili = []
    riga.__lastProdottoId = null
    riga.__lastListinoId = null
    return
  }

  const prodotto = prodottiMap().get(riga.prodottoId)
  if (prodotto) {
    const listiniDaProdotto = normalizzaListini(prodotto.listiniDisponibili)
    if (synchronizeListini || !riga.listiniDisponibili?.length) {
      riga.listiniDisponibili = listiniDaProdotto
    }
    if (riga.prezzoBase == null || force) {
      riga.prezzoBase = Number(prodotto.prezzoBase) || 0
    }
  }

  if (!Array.isArray(riga.listiniDisponibili)) {
    riga.listiniDisponibili = []
  }

  const prodottoChanged = riga.__lastProdottoId !== riga.prodottoId
  if (prodottoChanged) {
    if (prodotto) {
      riga.listiniDisponibili = normalizzaListini(prodotto.listiniDisponibili)
      riga.prezzoBase = Number(prodotto.prezzoBase) || 0
    } else {
      riga.listiniDisponibili = []
      riga.prezzoBase = 0
    }
    riga.listinoId = null
  }

  if (riga.listinoId != null && !riga.listiniDisponibili.some(listino => listino.id === riga.listinoId)) {
    riga.listinoId = null
  }

  const selectedListino = riga.listiniDisponibili.find(listino => listino.id === riga.listinoId)
  const prezzoBaseDisponibile = riga.prezzoBase != null
    ? Number(riga.prezzoBase)
    : prodotto
      ? Number(prodotto.prezzoBase)
      : null
  const fallbackPrezzo = prezzoBaseDisponibile != null ? prezzoBaseDisponibile : Number(riga.prezzoUnitario) || 0
  const nuovoPrezzo = selectedListino ? Number(selectedListino.prezzoApplicato) || 0 : fallbackPrezzo
  riga.prezzoUnitario = nuovoPrezzo
  if (prezzoBaseDisponibile != null) {
    riga.prezzoBase = prezzoBaseDisponibile
  }
  riga.__lastProdottoId = riga.prodottoId
  riga.__lastListinoId = riga.listinoId ?? null
}

function rigaTotale(riga) {
  return prezzoUnitario(riga) * (Number(riga.quantita) || 0)
}

function prezzoUnitario(riga) {
  return Number(riga?.prezzoUnitario) || 0
}

function formatCurrency(value) {
  const number = Number(value || 0)
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(number)
}

watch(
  () => form.prodotti.map(r => [r.prodottoId, r.listinoId]),
  () => {
    form.prodotti.forEach(riga => aggiornaPrezzo(riga))
  }
)
</script>
