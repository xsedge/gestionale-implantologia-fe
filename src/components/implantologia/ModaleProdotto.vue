<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card class="implantologia-modal implantologia-modal--large">
      <q-form ref="formRef" @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white implantologia-modal__header">
          <div class="text-h6 text-weight-medium">{{ titolo }}</div>
          <div class="text-subtitle2 text-white">Gestisci i prodotti di implantologia.</div>
        </q-card-section>

        <q-card-section class="implantologia-modal__body">
          <div class="implantologia-form-grid implantologia-form-grid--loose">
            <q-input v-model="form.nome" label="Nome prodotto" dense outlined :rules="requiredRule" />
            <q-input v-model="form.codice" label="Codice" dense outlined />
            <q-select v-model="form.categoria" :options="categoriaOptions" label="Categoria" dense outlined emit-value
              map-options :rules="requiredRule" />
            <q-input v-model.number="form.prezzoBase" label="Prezzo base" type="number" dense outlined prefix="€"
              :rules="requiredNumericRule" />
            <q-input v-model.number="form.quantitaDisponibile" label="Quantità disponibile" type="number" dense outlined
              :rules="requiredNumericRule" />
            <q-select v-model="form.fornitoreId" :options="fornitoriOptions" label="Fornitore" dense outlined emit-value
              map-options option-label="nome" option-value="id" :rules="requiredRule" />
            <q-input v-model.number="form.diametroMillimetri" label="Diametro (mm)" type="number" dense outlined />
            <q-input v-model.number="form.lunghezzaMillimetri" label="Lunghezza (mm)" type="number" dense outlined />
            <q-input v-model="form.connessione" label="Connessione" dense outlined />
            <q-input v-model="form.superficie" label="Superficie" dense outlined />
            <q-input v-model="form.materiale" label="Materiale" dense outlined />
            <q-select v-model="form.listinoIds" :options="listiniOptions" label="Listini associati" dense outlined emit-value
              map-options option-label="nome" option-value="id" use-chips multiple class="implantologia-form-grid__full" />
            <q-input v-model="form.note" label="Note" type="textarea" dense outlined autogrow class="implantologia-form-grid__full" />
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle1 text-weight-medium q-mb-md">Scheda impianto</div>
          <div class="implantologia-form-grid implantologia-form-grid--loose">
            <q-input v-model="scheda.lotto" label="Lotto" dense outlined />
            <q-input v-model="scheda.compatibilita" label="Compatibilità" dense outlined />
            <q-input v-model="scheda.materiale" label="Materiale" dense outlined />
            <q-input v-model="scheda.dataScadenza" label="Data scadenza" type="date" dense outlined />
            <q-input v-model="scheda.dataPosizionamento" label="Data posizionamento" type="date" dense outlined />
            <q-input v-model="scheda.arcata" label="Arcata" dense outlined />
            <q-input v-model="scheda.posizione" label="Posizione" dense outlined />
            <q-select v-model="scheda.clienteDentaleId" :options="props.clientiOptions" option-label="label" option-value="id"
              emit-value map-options label="Cliente dentale" dense outlined clearable />
            <q-input v-model="scheda.note" label="Note scheda" type="textarea" dense outlined autogrow class="implantologia-form-grid__full" />
          </div>
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
  categoriaOptions: { type: Array, default: () => [] },
  fornitoriOptions: { type: Array, default: () => [] },
  listiniOptions: { type: Array, default: () => [] },
  clientiOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'salva'])

const emptyForm = () => ({
  id: null,
  nome: '',
  codice: '',
  categoria: null,
  prezzoBase: null,
  quantitaDisponibile: null,
  fornitoreId: null,
  listinoIds: [],
  diametroMillimetri: null,
  lunghezzaMillimetri: null,
  connessione: '',
  superficie: '',
  materiale: '',
  note: ''
})

const emptyScheda = () => ({
  id: null,
  lotto: '',
  compatibilita: '',
  materiale: '',
  dataScadenza: '',
  dataPosizionamento: '',
  arcata: '',
  posizione: '',
  note: '',
  clienteDentaleId: null
})

const form = reactive(emptyForm())
const scheda = reactive(emptyScheda())
const formRef = ref(null)

const titolo = computed(() => (form.id ? 'Modifica Prodotto' : 'Nuovo Prodotto'))
const requiredRule = [val => !!val || 'Campo obbligatorio']
const requiredNumericRule = [val => val !== null && val !== '' || 'Campo obbligatorio']

watch(
  () => props.item,
  valore => {
    Object.assign(form, emptyForm(), valore || {})
    Object.assign(scheda, emptyScheda(), valore?.schedaImpianto || {})
  },
  { immediate: true }
)

function close() {
  emit('update:modelValue', false)
}

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  const payload = {
    ...form,
    prezzoBase: form.prezzoBase != null ? Number(form.prezzoBase) : null,
    quantitaDisponibile: form.quantitaDisponibile != null ? Number(form.quantitaDisponibile) : null,
    diametroMillimetri: form.diametroMillimetri != null ? Number(form.diametroMillimetri) : null,
    lunghezzaMillimetri: form.lunghezzaMillimetri != null ? Number(form.lunghezzaMillimetri) : null,
    schedaImpianto: serializeScheda()
  }
  emit('salva', payload)
}

function serializeScheda() {
  const schedaPayload = { ...scheda }
  const hasValue = Object.entries(schedaPayload).some(([key, value]) => {
    if (key === 'id') {
      return value != null
    }
    return value != null && value !== ''
  })
  if (!hasValue) {
    return null
  }
  schedaPayload.clienteDentaleId = schedaPayload.clienteDentaleId || null
  return schedaPayload
}
</script>
