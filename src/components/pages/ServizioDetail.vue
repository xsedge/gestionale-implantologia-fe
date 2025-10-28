<template>
    <div>
      <q-card v-if="servizio" class="q-pa-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Dettaglio Servizio</div>
  
          <q-form @submit.prevent="saveServizio" class="q-gutter-md">
  
            <q-input
              v-model="servizio.nome"
              label="Nome"
              required
              outlined
            />
  
            <q-input
              v-model="servizio.descrizione"
              label="Descrizione"
              type="textarea"
              autogrow
              outlined
            />
  
            <q-input
              v-model.number="servizio.prezzoBase"
              label="Prezzo Base"
              type="number"
              outlined
            />
  
            <div class="row q-gutter-sm q-mt-md">
              <q-btn label="Salva" type="submit" color="primary" />
              <q-btn label="Chiudi" color="secondary" flat @click="$emit('close')" />
            </div>
  
          </q-form>
        </q-card-section>
      </q-card>
  
      <q-banner v-else class="bg-grey-2 text-grey-9 q-pa-md">
        Seleziona un servizio dall'elenco o creane uno nuovo.
      </q-banner>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue'
  import api from '../../api/axios.js'
  
  const props = defineProps({
    servizioId: Number
  })
  const emit = defineEmits(['close', 'saved'])
  
  const servizio = ref(null)
  
  async function loadServizio() {
    if (!props.servizioId) {
      servizio.value = {
        nome: '',
        descrizione: '',
        prezzoBase: 0
      }
      return
    }
    try {
      const res = await api.get('/servizio/get-all', { params: { page: 0, size: 10 } })
      servizio.value = res.data.content.find(s => s.id === props.servizioId) || null
    } catch (e) {
      console.error('Errore caricamento servizio', e)
    }
  }
  
  async function saveServizio() {
    try {
      const res = await api.post('/servizio/saving', servizio.value)
      if (res.data === true) {
        alert('Servizio salvato con successo')
        emit('saved')
      } else {
        alert('Errore nel salvataggio')
      }
    } catch (e) {
      alert('Errore nel salvataggio: ' + e.message)
    }
  }
  
  watch(() => props.servizioId, loadServizio)
  onMounted(loadServizio)
  </script>
  