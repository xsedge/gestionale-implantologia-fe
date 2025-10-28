<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 520px; max-width: 780px;">
      <q-form ref="formRef" @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-medium">{{ titolo }}</div>
          <div class="text-subtitle2 text-white">Gestisci le fatture collegate ad acquisti e vendite.</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="form.numero" label="Numero fattura" dense outlined :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.data" type="date" label="Data" dense outlined :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.tipo" :options="tipiFattura" label="Tipo" dense outlined emit-value map-options
                :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.stato" :options="statiFattura" label="Stato" dense outlined emit-value map-options
                :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model.number="form.importoTotale" type="number" label="Importo totale" dense outlined prefix="€" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.clienteDentaleId" :options="clientiOptions" option-label="label" option-value="id"
                emit-value map-options label="Cliente dentale" dense outlined clearable />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.fornitoreId" :options="fornitoriOptions" option-label="nome" option-value="id"
                emit-value map-options label="Fornitore" dense outlined clearable />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.venditaId" :options="venditeOptions" option-label="label" option-value="id" emit-value
                map-options label="Vendita associata" dense outlined clearable />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.acquistoId" :options="acquistiOptions" option-label="label" option-value="id"
                emit-value map-options label="Acquisto associato" dense outlined clearable />
            </div>
            <div class="col-12">
              <q-input v-model="form.pdfPlaceholder" label="Placeholder PDF" type="textarea" dense outlined autogrow />
            </div>
          </div>
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
  clientiOptions: { type: Array, default: () => [] },
  fornitoriOptions: { type: Array, default: () => [] },
  venditeOptions: { type: Array, default: () => [] },
  acquistiOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'salva'])

const tipiFattura = [
  { label: 'Vendita', value: 'VENDITA' },
  { label: 'Acquisto', value: 'ACQUISTO' }
]

const statiFattura = [
  { label: 'Pagata', value: 'PAGATA' },
  { label: 'In attesa', value: 'IN_ATTESA' },
  { label: 'Annullata', value: 'ANNULLATA' }
]

const emptyForm = () => ({
  id: null,
  numero: '',
  data: '',
  tipo: 'VENDITA',
  stato: 'IN_ATTESA',
  importoTotale: null,
  clienteDentaleId: null,
  fornitoreId: null,
  venditaId: null,
  acquistoId: null,
  pdfPlaceholder: ''
})

const form = reactive(emptyForm())
const formRef = ref(null)
const titolo = computed(() => (form.id ? 'Modifica Fattura' : 'Nuova Fattura'))
const requiredRule = [val => !!val || 'Campo obbligatorio']

watch(
  () => props.item,
  valore => {
    Object.assign(form, emptyForm(), valore || {})
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
    id: form.id,
    numero: form.numero,
    data: form.data,
    tipo: form.tipo,
    stato: form.stato,
    importoTotale: form.importoTotale != null ? Number(form.importoTotale) : null,
    clienteDentaleId: form.clienteDentaleId,
    fornitoreId: form.fornitoreId,
    venditaId: form.venditaId,
    acquistoId: form.acquistoId,
    pdfPlaceholder: form.pdfPlaceholder
  }
  emit('salva', payload)
}
</script>
