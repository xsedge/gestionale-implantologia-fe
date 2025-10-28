<template>
  <q-page padding>
    {{ clienteStore?.clienti }}

    <ClienteCard :cliente="cliente" @modifica="modificaCliente" />

    <q-card class="q-mt-md">
      <q-tabs v-model="tab" dense class="text-primary q-pa-sm" active-color="primary" indicator-color="primary"
        align="justify">
        <q-tab name="ordini" label="Ordini" />
        <q-tab name="timeline" label="Timeline" />
      </q-tabs>

      <q-separator />

      <q-card-section>
        <div v-if="tab === 'ordini'">
          <OrdiniTable @aggiungi="apriNuovoOrdine" @visualizza="apriDettaglioOrdine" @close="chiudiDettaglioOrdine" />
        </div>

        <div v-if="tab === 'timeline'" class="q-pa-md">
          <p>Qui verranno mostrate le foto legate agli ordini (timeline)</p>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog per nuovo ordine -->
    <q-dialog v-model="modaleNuovoOrdineVisible" persistent :maximized="false" :max-width="800">
      <ModaleNuovoOrdine :ordine="ordineSelezionato" @close="chiudiModaleNuovoOrdineVisible = false"
        @onOrdineCreato="onOrdineCreato()" />
    </q-dialog>

    <!-- Dialog per dettaglio ordine -->
    <q-dialog v-model="modaleDettaglioOrdineVisible" persistent maximized>
      <OrdineDetail :ordine="ordineSelezionato" @close="modaleDettaglioOrdineVisible = false" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import ClienteCard from './ClienteCard.vue'
import OrdiniTable from './OrdiniTable.vue'
import ModaleNuovoOrdine from 'src/components/ModaleNuovoOrdine.vue'
import OrdineDetail from './OrdineDetail.vue' // importa il dettaglio ordine
import { useClientiStore, useOrdiniStore } from "src/components/stores/index.js";

const route = useRoute()
const clientiStore = useClientiStore();
const ordiniStore = useOrdiniStore();
const cliente = ref({})
const tab = ref('ordini')

const modaleNuovoOrdineVisible = ref(false)
const modaleDettaglioOrdineVisible = ref(false)
const ordineSelezionato = ref(null)
const ordineIdSelezionato = ref(null)

async function caricaCliente() {
  try {
    const idCliente = route.params.id
    const response = await clientiStore.fetchClienteById(idCliente)
    cliente.value = response
  } catch (error) {
    console.error('Errore caricamento cliente', error)
  }
}

async function caricaOrdini() {
  ordiniStore.fetchOrdiniByCliente(clientiStore?.cliente?.id)
}

function modificaCliente() {
  alert('Funzionalità modifica cliente non implementata')
}

function apriNuovoOrdine() {
  ordineIdSelezionato.value = null
  ordiniStore.ordineCorrente.idCliente = clientiStore.cliente.id
  modaleNuovoOrdineVisible.value = true
}

/**
 * Chiude la modale per creare un nuovo ordine. Se aperto,
 * cancella l'ordine selezionato e nasconde la modale.
 */
function chiudiModaleNuovoOrdineVisible() {
  ordineIdSelezionato.value = null
  ordiniStore.ordineCorrente.idCliente = null
  modaleNuovoOrdineVisible.value = false
}

async function onOrdineCreato() {
  modaleNuovoOrdineVisible.value = false
  await caricaOrdini()
}

function apriDettaglioOrdine(ordine) {
  ordiniStore.ordine = ordine
  modaleDettaglioOrdineVisible.value = true
}

function chiudiDettaglioOrdine() {
  ordiniStore.ordine.$reset()
  modaleDettaglioOrdineVisible.value = false
}

onMounted(async () => {
  await caricaCliente()
  await caricaOrdini()
})

onUnmounted(() => clientiStore.$reset())
</script>
