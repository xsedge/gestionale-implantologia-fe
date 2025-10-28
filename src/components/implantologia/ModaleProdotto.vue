<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 520px; max-width: 720px;">
      <q-form ref="formRef" @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-medium">{{ titolo }}</div>
          <div class="text-subtitle2 text-white">Gestisci i prodotti di implantologia.</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.nome" label="Nome prodotto" dense outlined :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.codice" label="Codice" dense outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-select v-model="form.categoria" :options="categoriaOptions" label="Categoria" dense outlined emit-value
                map-options :rules="requiredRule" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.number="form.prezzoBase" label="Prezzo base" type="number" dense outlined prefix="€"
                :rules="requiredNumericRule" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.number="form.quantitaDisponibile" label="Quantità disponibile" type="number" dense outlined
                :rules="requiredNumericRule" />
            </div>
            <div class="col-12 col-md-6">
              <q-select v-model="form.fornitoreId" :options="fornitoriOptions" label="Fornitore" dense outlined emit-value
                map-options option-label="nome" option-value="id" :rules="requiredRule" />
            </div>
            <div class="col-12">
              <q-select v-model="form.listinoIds" :options="listiniOptions" label="Listini associati" dense outlined emit-value
                map-options option-label="nome" option-value="id" use-chips multiple />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle1 text-weight-medium">Scheda impianto</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="scheda.lotto" label="Lotto" dense outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="scheda.compatibilita" label="Compatibilità" dense outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="scheda.materiale" label="Materiale" dense outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="scheda.dataScadenza" label="Data scadenza" type="date" dense outlined />
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
  categoriaOptions: { type: Array, default: () => [] },
  fornitoriOptions: { type: Array, default: () => [] },
  listiniOptions: { type: Array, default: () => [] }
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
  listinoIds: []
})

const emptyScheda = () => ({
  id: null,
  lotto: '',
  compatibilita: '',
  materiale: '',
  dataScadenza: ''
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
    schedaImpianto: { ...scheda }
  }
  emit('salva', payload)
}
</script>
