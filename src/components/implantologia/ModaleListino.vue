<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 460px; max-width: 680px;">
      <q-form ref="formRef" @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-medium">{{ titolo }}</div>
          <div class="text-subtitle2 text-white">Configura listini e condizioni personalizzate.</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.nome" label="Nome listino" dense outlined :rules="requiredRule" />
          <q-input v-model.number="form.scontoPercentuale" type="number" label="Sconto (%)" dense outlined step="0.5"
            :rules="requiredNumericRule" />
          <q-select v-model="form.fornitoreId" :options="fornitoriOptions" option-label="nome" option-value="id"
            emit-value map-options label="Fornitore" dense outlined :rules="requiredRule" />
          <q-select v-model="form.prodottoIds" :options="prodottiOptions" option-label="nome" option-value="id"
            emit-value map-options label="Prodotti associati" dense outlined multiple use-chips />
          <q-input v-model="form.descrizione" label="Descrizione" type="textarea" dense outlined autogrow />
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
  prodottiOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'salva'])

const emptyForm = () => ({
  id: null,
  nome: '',
  scontoPercentuale: 0,
  descrizione: '',
  fornitoreId: null,
  prodottoIds: []
})

const form = reactive(emptyForm())
const formRef = ref(null)
const requiredRule = [val => !!val || 'Campo obbligatorio']
const requiredNumericRule = [val => val !== null && val !== '' || 'Campo obbligatorio']

const titolo = computed(() => (form.id ? 'Modifica Listino' : 'Nuovo Listino'))

watch(
  () => props.item,
  valore => {
    Object.assign(form, emptyForm(), valore || {})
    if (Array.isArray(valore?.prodotti)) {
      form.prodottoIds = valore.prodotti.map(prod => prod.prodottoId || prod.id)
    }
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
    nome: form.nome,
    scontoPercentuale: form.scontoPercentuale != null ? Number(form.scontoPercentuale) : 0,
    descrizione: form.descrizione,
    fornitoreId: form.fornitoreId,
    prodottoIds: form.prodottoIds
  }
  emit('salva', payload)
}
</script>
