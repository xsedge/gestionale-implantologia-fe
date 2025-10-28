<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 460px; max-width: 720px;">
      <q-form ref="formRef" @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-medium">{{ titolo }}</div>
          <div class="text-subtitle2 text-white">Gestisci i clienti dentali e i loro riferimenti.</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.nome" label="Nome" dense outlined :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.cognome" label="Cognome" dense outlined :rules="requiredRule" />
            </div>
          </div>

          <q-input v-model="form.studioDentale" label="Studio dentale" dense outlined />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.codiceFiscale" label="Codice fiscale" dense outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.email" label="Email" type="email" dense outlined />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.telefono" label="Telefono" dense outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.indirizzo" label="Indirizzo" dense outlined />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.citta" label="Città" dense outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.cap" label="CAP" dense outlined />
            </div>
          </div>

          <q-input v-model="form.note" label="Note" type="textarea" dense outlined autogrow />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" @click="close" :disable="loading" />
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
  item: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'salva'])

const emptyForm = () => ({
  id: null,
  nome: '',
  cognome: '',
  studioDentale: '',
  codiceFiscale: '',
  email: '',
  telefono: '',
  indirizzo: '',
  citta: '',
  cap: '',
  note: ''
})

const form = reactive(emptyForm())
const formRef = ref(null)

const titolo = computed(() => (form.id ? 'Modifica Cliente' : 'Nuovo Cliente'))
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
  emit('salva', { ...form })
}
</script>
