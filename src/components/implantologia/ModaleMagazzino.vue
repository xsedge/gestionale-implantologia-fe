<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 420px; max-width: 640px;">
      <q-form ref="formRef" @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-medium">{{ titolo }}</div>
          <div class="text-subtitle2 text-white">Registra un movimento di magazzino.</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select v-model="form.tipo" :options="tipiMovimento" label="Tipo movimento" dense outlined emit-value map-options
            :rules="requiredRule" />
          <q-select v-model="form.prodottoId" :options="prodottiOptions" option-label="nome" option-value="id"
            emit-value map-options label="Prodotto" dense outlined :rules="requiredRule" />
          <q-input v-model.number="form.quantita" type="number" label="Quantità" dense outlined :rules="requiredNumericRule" />
          <q-input v-model.number="form.prezzoUnitario" type="number" label="Prezzo unitario" dense outlined prefix="€" />
          <q-input v-model="form.dataMovimento" type="datetime-local" label="Data movimento" dense outlined />
          <q-input v-model="form.note" type="textarea" label="Note" dense outlined autogrow />
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
  prodottiOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'salva'])

const tipiMovimento = [
  { label: 'Entrata', value: 'ENTRATA' },
  { label: 'Uscita', value: 'USCITA' },
  { label: 'Reso', value: 'RESO' }
]

const emptyForm = () => ({
  id: null,
  tipo: 'ENTRATA',
  quantita: 1,
  dataMovimento: '',
  note: '',
  prezzoUnitario: null,
  prodottoId: null,
  acquistoId: null,
  venditaId: null
})

const form = reactive(emptyForm())
const formRef = ref(null)
const requiredRule = [val => !!val || 'Campo obbligatorio']
const requiredNumericRule = [val => val !== null && val !== '' || 'Campo obbligatorio']

const titolo = computed(() => (form.id ? 'Modifica Movimento' : 'Nuovo Movimento'))

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
    tipo: form.tipo,
    quantita: Number(form.quantita) || 0,
    dataMovimento: form.dataMovimento,
    note: form.note,
    prezzoUnitario: form.prezzoUnitario != null ? Number(form.prezzoUnitario) : null,
    prodottoId: form.prodottoId,
    acquistoId: form.acquistoId,
    venditaId: form.venditaId
  }
  emit('salva', payload)
}
</script>
