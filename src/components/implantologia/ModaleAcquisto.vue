<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card style="width: 95vw; max-width: 900px;">
      <q-form ref="formRef" @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-medium">{{ titolo }}</div>
          <div class="text-subtitle2 text-white">Registra i movimenti di acquisto dai fornitori.</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="form.data" type="date" label="Data" dense outlined :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.fornitoreId" :options="fornitoriOptions" label="Fornitore" dense outlined emit-value
                map-options option-label="nome" option-value="id" :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.stato" :options="statiAcquisto" label="Stato" dense outlined emit-value map-options
                :rules="requiredRule" />
            </div>
            <div class="col-12">
              <q-input v-model="form.note" label="Note" type="textarea" outlined dense autogrow />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">Prodotti acquistati</div>
            <q-btn color="primary" icon="add" label="Aggiungi prodotto" flat dense @click="aggiungiRiga" />
          </div>

          <div v-if="!form.prodotti.length" class="text-grey-6 bg-grey-2 q-pa-md rounded-borders text-center">
            Nessun prodotto aggiunto. Premi "Aggiungi prodotto" per iniziare.
          </div>

          <div v-else class="column q-gutter-md">
            <q-card v-for="(riga, index) in form.prodotti" :key="`acquisto-${index}`" flat bordered class="q-pa-md">
              <div class="row q-col-gutter-md items-start">
                <div class="col-12 col-md-4">
                  <q-select v-model="riga.prodottoId" :options="prodottiOptions" option-label="nome"
                    option-value="id" emit-value map-options label="Prodotto" dense outlined use-input input-debounce="200"
                    @filter="(val, update) => filtraProdotti(val, update)" :rules="requiredRule" />
                </div>
                <div class="col-12 col-md-2">
                  <q-input v-model.number="riga.quantita" type="number" label="Quantità" dense outlined :rules="requiredNumericRule" />
                </div>
                <div class="col-12 col-md-3">
                  <q-select v-model="riga.listinoId" :options="listiniOptions" option-label="nome" option-value="id"
                    emit-value map-options label="Listino" dense outlined clearable />
                </div>
                <div class="col-12 col-md-2">
                  <q-input :model-value="formatCurrency(riga.prezzoUnitario)" label="Prezzo unitario" dense outlined readonly />
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
          <div class="text-subtitle1 text-weight-medium">Totale ordine:</div>
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
  data: '',
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
      form.prodotti = valore.dettagli.map(det => ({
        prodottoId: det.prodottoId,
        quantita: det.quantita,
        listinoId: det.listinoId || null,
        prezzoUnitario: det.prezzoUnitario
      }))
    } else if (Array.isArray(valore?.prodotti)) {
      form.prodotti = valore.prodotti.map(det => ({
        prodottoId: det.prodottoId,
        quantita: det.quantita,
        listinoId: det.listinoId || null,
        prezzoUnitario: calcolaPrezzo(det.prodottoId)
      }))
    }
  },
  { immediate: true }
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

function calcolaPrezzo(prodottoId) {
  const prodotto = prodottiMap().get(prodottoId)
  return prodotto?.prezzoBase || 0
}

function aggiungiRiga() {
  form.prodotti.push({ prodottoId: null, quantita: 1, listinoId: null, prezzoUnitario: 0 })
}

function rimuoviRiga(index) {
  form.prodotti.splice(index, 1)
}

function aggiornaPrezzo(riga) {
  if (!riga) return
  riga.prezzoUnitario = calcolaPrezzo(riga.prodottoId)
}

function rigaTotale(riga) {
  return (Number(riga.prezzoUnitario) || 0) * (Number(riga.quantita) || 0)
}

function formatCurrency(value) {
  const number = Number(value || 0)
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(number)
}

function filtraProdotti(val, update) {
  update()
}

watch(
  () => form.prodotti.map(r => r.prodottoId),
  () => {
    form.prodotti.forEach(riga => aggiornaPrezzo(riga))
  }
)

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  const payload = {
    id: form.id,
    data: form.data,
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
</script>
