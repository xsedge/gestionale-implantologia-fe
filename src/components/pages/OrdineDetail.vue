<template>
  <div>
    <q-card v-if="ordineStore.ordine" class="q-pa-md" style="max-width: 800px; margin: auto; position: relative;">

      <!-- Pulsante X in alto a destra -->
      <q-btn icon="close" round dense flat class="absolute-top-right q-ma-sm z-top" @click="$emit('close')" />

      <q-card-section>
        <div class="text-h6 q-mb-md">Dettaglio Ordine</div>
        <q-card-section class="bg-grey-1 rounded q-pa-md q-mb-lg">
          <div class="row q-col-gutter-x-md q-col-gutter-y-sm">
            <div class="col-6 col-md-4">
              <q-input v-model="ordineStore.ordine.data" label="Data" type="text" filled readonly class="rounded" />
            </div>
            <div class="col-6 col-md-4">
              <q-input v-model="ordineStore.ordine.prezzoTotale" label="Prezzo Totale" type="number" filled readonly
                suffix=" €" class="rounded" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="ordineStore.ordine.note" label="Note" type="textarea" filled readonly class="rounded"
                autogrow />
            </div>
          </div>
        </q-card-section>


        <!-- Sezione Servizi Ordinati -->
        <div class="q-mt-lg">
          <div class="text-subtitle1 q-mb-sm">Servizi Ordinati</div>

          <div v-for="(servizio, index) in ordineStore.ordine?.servizi" :key="index"
            class="q-mb-lg q-pa-md bg-grey-2 rounded-borders shadow-1">
            <!-- Intestazione del servizio -->
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle2 text-primary col">
                <q-icon name="build" size="xs" class="q-mr-xs" />
                {{ servizio.nome || 'Servizio' }}
              </div>
              <div class="col-auto text-right text-grey-7">
                € {{ servizio.prezzoBase?.toFixed(2) || '0.00' }}
              </div>
            </div>

            <!-- Descrizione / Note -->
            <div class="text-body2 text-grey-8 q-mb-sm">
              <strong>Eseguito da:</strong> {{ servizio.eseguitoDa || '—' }}
            </div>
            <div class="text-body2 text-grey-8 q-mb-sm">
              <strong>Note:</strong> {{ servizio.note || '—' }}
            </div>

            <!-- Lista Prodotti Utilizzati -->
            <div v-if="servizio.prodottiUtilizzati?.length">
              <div class="text-caption text-primary q-mb-xs">
                <q-icon name="science" size="xs" class="q-mr-xs" />
                Prodotti Utilizzati
              </div>
              <q-list bordered class="bg-grey-1 q-pl-md q-pr-md">
                <q-item v-for="(p, i) in servizio.prodottiUtilizzati" :key="i" class="q-py-sm">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      {{ p.nome }} ({{ p.descTipProdotto }} - {{ p.marca }})
                    </q-item-label>
                    <q-item-label caption>
                      Quantità: {{ p.quantitaUtilizzata }}ml |
                      Codice: {{ p.codiceColore || '—' }} |
                      Note: {{ p.noteUtilizzo || '—' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>

        <!-- Pulsante Chiudi in basso -->
        <div class="row justify-end q-mt-md">
          <q-btn label="Chiudi" color="primary" flat @click="$emit('close')" />
        </div>
      </q-card-section>
    </q-card>

    <q-banner v-else class="bg-grey-2 text-grey-9 q-pa-md">
      Seleziona un ordine dall'elenco o crea un nuovo ordine.
    </q-banner>
  </div>
</template>


<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useOrdiniStore } from 'src/components/stores/OrdineStore.js'

const ordineStore = useOrdiniStore()

/*const serviziColumns = [
  { name: 'nome', label: 'Nome', field: row => row.nome, align: 'left' },
  { name: 'descrizione', label: 'Note', field: row => row.descrizione, align: 'left' },
  { name: 'prezzoBase', label: 'Prezzo Base', field: row => row.prezzoBase, align: 'right' },
]*/

async function loadOrdine() {
  if (!ordineStore.ordine?.id) {
    ordineStore.ordine = {
      dataOra: new Date().toISOString().substring(0, 16),
      prezzoTotale: 0,
      servizi: [],
      fotoPaths: []
    }
    return
  }
  await ordineStore.fetchOrdineById(ordineStore.ordine?.id)
}

onMounted(loadOrdine)
onUnmounted(() => {
  ordineStore.ordine = null
})
</script>
