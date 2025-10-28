<template>
  <q-dialog v-model="internalVisible" persistent @hide="emit('update:modelValue', false)">
    <q-card class="dialog-card">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6 text-weight-bold">Registra Movimento Magazzino</div>
        <q-btn icon="close" flat round dense v-close-popup @click="handleClose" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="onSubmit">
          <div class="q-gutter-md">
            <q-select
              v-model="form.tipo"
              :options="tipoOptions"
              label="Tipologia Movimento"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'Seleziona una tipologia']"
            />

            <q-select
              v-model="form.prodottoId"
              :options="selectOptions"
              label="Prodotto"
              outlined
              dense
              use-input
              fill-input
              input-debounce="0"
              emit-value
              map-options
              @filter="filterProdotti"
              :rules="[val => !!val || 'Seleziona un prodotto']"
            />

            <q-input
              v-model.number="form.quantita"
              type="number"
              label="Quantità"
              outlined
              dense
              :rules="[val => val > 0 || 'Inserisci una quantità positiva']"
              min="0"
              step="0.01"
            />

            <q-input
              v-model="form.dataMovimento"
              type="datetime-local"
              label="Data movimento"
              outlined
              dense
              :rules="[val => !!val || 'Inserisci una data']"
            />

            <q-input
              v-model="form.descrizione"
              type="textarea"
              label="Descrizione"
              outlined
              autogrow
              dense
              :maxlength="250"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Annulla" color="primary" v-close-popup @click="handleClose" />
        <q-btn color="pink-8" label="Registra" icon="save" @click="submitForm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  tipo: {
    type: String,
    default: 'ORDINATO'
  },
  prodottiOptions: {
    type: Array,
    default: () => []
  },
  defaultProdottoId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const tipoOptions = [
  { label: 'Prodotto ordinato', value: 'ORDINATO' },
  { label: 'Prodotto consegnato', value: 'CONSEGNATO' },
  { label: 'Scarico', value: 'SCARICO' }
]

const internalVisible = ref(props.modelValue)
const filteredOptions = ref(props.prodottiOptions)
const formRef = ref(null)

const form = ref(createDefaultForm())

const selectOptions = computed(() => filteredOptions.value)

watch(
  () => props.modelValue,
  value => {
    internalVisible.value = value
    if (value) {
      resetForm()
    }
  }
)

watch(
  () => props.prodottiOptions,
  value => {
    filteredOptions.value = value
  },
  { immediate: true }
)

watch(
  () => props.tipo,
  value => {
    form.value.tipo = value?.toUpperCase() || 'ORDINATO'
  }
)

watch(
  () => props.defaultProdottoId,
  value => {
    form.value.prodottoId = value ?? null
  }
)

function createDefaultForm() {
  return {
    tipo: props.tipo?.toUpperCase() || 'ORDINATO',
    prodottoId: props.defaultProdottoId ?? null,
    quantita: null,
    dataMovimento: toDateTimeLocal(new Date()),
    descrizione: ''
  }
}

function resetForm() {
  form.value = createDefaultForm()
}

function toDateTimeLocal(date) {
  if (!(date instanceof Date)) {
    return ''
  }
  const pad = value => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function submitForm() {
  if (!formRef.value) {
    return
  }
  formRef.value.validate().then(success => {
    if (success) {
      onSubmit()
    }
  })
}

function onSubmit() {
  const payload = {
    tipo: form.value.tipo,
    prodottoId: form.value.prodottoId,
    quantita: Number(form.value.quantita),
    dataMovimento: new Date(form.value.dataMovimento).toISOString(),
    descrizione: form.value.descrizione?.trim() || null
  }
  emit('save', payload)
}

function handleClose() {
  emit('update:modelValue', false)
}

function filterProdotti(val, update) {
  if (val === '') {
    update(() => {
      filteredOptions.value = props.prodottiOptions
    })
    return
  }
  const needle = val.toLowerCase()
  update(() => {
    filteredOptions.value = props.prodottiOptions.filter(option =>
      option.label.toLowerCase().includes(needle)
    )
  })
}

watch(internalVisible, value => {
  emit('update:modelValue', value)
})
</script>

<style scoped>
.dialog-card {
  min-width: 360px;
  max-width: 520px;
}
</style>
