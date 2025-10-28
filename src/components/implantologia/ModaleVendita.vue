<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card style="width: 95vw; max-width: 900px;">
      <q-form ref="formRef" @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-medium">{{ titolo }}</div>
          <div class="text-subtitle2 text-white">Gestisci le vendite ai clienti dentali.</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="form.numero" label="Numero" dense outlined :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.dataIntervento" type="date" label="Data intervento" dense outlined :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.clienteDentaleId" :options="clientiOptions" option-label="label"
                option-value="id" emit-value map-options label="Cliente" dense outlined use-input input-debounce="200"
                :rules="requiredRule" @filter="(val, update) => filtraClienti(val, update)" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.statoPagamento" :options="statiPagamento" label="Stato pagamento" dense outlined
                emit-value map-options :rules="requiredRule" />
            </div>
            <div class="col-12">
              <q-input v-model="form.cliente" label="Descrizione cliente" dense outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.medico" label="Medico" dense outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.note" label="Note" dense outlined type="textarea" autogrow />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">Prodotti venduti</div>
            <q-btn color="primary" icon="add" label="Aggiungi prodotto" flat dense @click="aggiungiRiga" />
          </div>

          <div v-if="!form.prodotti.length" class="text-grey-6 bg-grey-2 q-pa-md rounded-borders text-center">
            Nessun prodotto aggiunto. Premi "Aggiungi prodotto" per iniziare.
          </div>

          <div v-else class="column q-gutter-md">
            <q-card v-for="(riga, index) in form.prodotti" :key="`vendita-${index}`" flat bordered class="q-pa-md">
              <div class="row q-col-gutter-md items-start">
                <div class="col-12 col-md-4">
                  <q-select v-model="riga.prodottoId" :options="prodottiOptions" option-label="nome" option-value="id"
                    emit-value map-options label="Prodotto" dense outlined use-input input-debounce="200"
                    :rules="requiredRule" @filter="(val, update) => filtraProdotti(val, update)" />
                </div>
                <div class="col-12 col-md-2">
                  <q-input v-model.number="riga.quantita" type="number" label="Quantità" dense outlined :rules="requiredNumericRule" />
                </div>
                <div class="col-12 col-md-3">
                  <q-select v-model="riga.listinoId" :options="listiniOptions" option-label="nome" option-value="id"
                    emit-value map-options label="Listino" dense outlined clearable />
                </div>
                <div class="col-12 col-md-2">
                  <q-input :model-value="formatCurrency(prezzoUnitario(riga))" label="Prezzo unitario" dense outlined
                    readonly />
                </div>
                <div class="col-12 col-md-1 flex items-start justify-end">
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

        <q-card-section class="row justify-end items-center q-gutter-sm">
          <div class="text-subtitle1 text-weight-medium">Totale vendita:</div>
          <div class="text-h6 text-primary">{{ formatCurrency(totale) }}</div>
        </q-card-section>

        <q-card-actions align="right">
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
  prodottiOptions: { type: Array, default: () => [] },
  clientiOptions: { type: Array, default: () => [] },
  listiniOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'salva'])

const statiPagamento = [
  { label: 'Pagato', value: 'PAGATO' },
  { label: 'Da pagare', value: 'DA_PAGARE' }
]

const emptyForm = () => ({
  id: null,
  numero: '',
  dataIntervento: '',
  cliente: '',
  clienteDentaleId: null,
  statoPagamento: 'DA_PAGARE',
  medico: '',
  note: '',
  prodotti: []
})

const form = reactive(emptyForm())
const formRef = ref(null)
const requiredRule = [val => !!val || 'Campo obbligatorio']
const requiredNumericRule = [val => val !== null && val !== '' || 'Campo obbligatorio']

const titolo = computed(() => (form.id ? 'Modifica Vendita' : 'Nuova Vendita'))

watch(
  () => props.item,
  valore => {
    Object.assign(form, emptyForm(), valore || {})
    form.prodotti = []
    if (Array.isArray(valore?.dettagli)) {
      form.prodotti = valore.dettagli.map(det => ({
        prodottoId: det.prodottoId,
        quantita: det.quantita,
        listinoId: det.listinoId || null,
        prezzoUnitario: det.prezzoUnitario,
        __initialized: true,
        __lastProdottoId: det.prodottoId,
        __lastListinoId: det.listinoId || null
      }))
    } else if (Array.isArray(valore?.prodotti)) {
      form.prodotti = valore.prodotti.map(det => ({
        prodottoId: det.prodottoId,
        quantita: det.quantita,
        listinoId: det.listinoId || null,
        prezzoUnitario: det.prezzoUnitario || calcolaPrezzo(det.prodottoId),
        __initialized: false,
        __lastProdottoId: det.prodottoId,
        __lastListinoId: det.listinoId || null
      }))
    }
  },
  { immediate: true }
)

const totale = computed(() => form.prodotti.reduce((sum, riga) => sum + rigaTotale(riga), 0))

function close() {
  emit('update:modelValue', false)
}

function filtraProdotti(val, update) {
  update()
}

function filtraClienti(val, update) {
  update()
}

function prodottiMap() {
  const map = new Map()
  props.prodottiOptions.forEach(prod => {
    map.set(prod.id, prod)
  })
  return map
}

function calcolaPrezzo(prodottoId) {
  const prodotto = prodottiMap().get(prodottoId)
  if (!prodotto) {
    return 0
  }
  if (prodotto.prezzoListinoApplicato != null) {
    return Number(prodotto.prezzoListinoApplicato) || 0
  }
  return Number(prodotto.prezzoBase) || 0
}

function rigaTotale(riga) {
  return prezzoUnitario(riga) * (Number(riga.quantita) || 0)
}

function aggiungiRiga() {
  form.prodotti.push({ prodottoId: null, quantita: 1, listinoId: null, prezzoUnitario: 0, __initialized: false })
}

function rimuoviRiga(index) {
  form.prodotti.splice(index, 1)
}

watch(
  () => form.prodotti.map(r => [r.prodottoId, r.listinoId]),
  () => {
    form.prodotti.forEach(riga => aggiornaPrezzo(riga))
  }
)

function aggiornaPrezzo(riga) {
  if (!riga || !riga.prodottoId) {
    riga.prezzoUnitario = 0
    riga.__lastProdottoId = null
    return
  }
  const hasChanged = riga.__lastProdottoId !== riga.prodottoId || riga.__lastListinoId !== riga.listinoId
  if (!hasChanged && riga.__initialized) {
    return
  }
  riga.prezzoUnitario = calcolaPrezzo(riga.prodottoId)
  riga.__lastProdottoId = riga.prodottoId
  riga.__lastListinoId = riga.listinoId || null
  riga.__initialized = true
}

function prezzoUnitario(riga) {
  return Number(riga?.prezzoUnitario) || 0
}

function formatCurrency(value) {
  const number = Number(value || 0)
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(number)
}

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  const payload = {
    id: form.id,
    numero: form.numero,
    dataIntervento: form.dataIntervento,
    cliente: form.cliente,
    statoPagamento: form.statoPagamento,
    clienteDentaleId: form.clienteDentaleId,
    medico: form.medico,
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
</script>
