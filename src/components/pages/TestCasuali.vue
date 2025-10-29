<template>
  <q-page class="list-page flex justify-center q-pa-md">
    <div class="list-card" style="max-width: 1200px; width: 100%;">
      <div class="header-section-list q-mb-lg">
        <div class="text-h4 text-weight-bold text-pink-9 q-mb-sm">Dashboard Statistiche</div>
        <p class="text-subtitle1 text-grey-8">Visualizza le statistiche utili al miglioramento del tuo negozio.</p>
      </div>

      <q-tabs v-model="tab" dense align="justify" active-color="primary" indicator-color="primary" narrow-indicator
        class="text-primary q-mb-md">
        <q-tab name="ordini" label="Ordini per Cliente" icon="people" />
        <q-tab name="servizi" label="Servizi Più Richiesti" icon="content_cut" />
        <q-tab name="prodotti" label="Prodotti Più Utilizzati" icon="shopping_bag" />
        <q-tab name="fatturato" label="Fatturato Mensile" icon="show_chart" />
        <q-tab name="durata" label="Durata Media Servizi" icon="timer" />
        <q-tab name="produttivita" label="Produttività Operatore" icon="work" />
      </q-tabs>

      <q-separator spaced />

      <q-tab-panels v-model="tab" animated>

        <!-- ORDINI PER CLIENTE -->
        <q-tab-panel name="ordini">
          <q-card flat bordered class="q-pa-md bg-grey-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6 text-primary">Ordini e Spesa per Cliente</div>
              <q-btn dense flat round icon="refresh" color="primary" label="Aggiorna" @click="loadOrdini" />
            </div>
            <ResponsiveTable :rows="ordini" :columns="columnsOrdini" row-key="idCliente" :loading="loadingOrdini"
              class="q-mt-sm">
              <!-- top-right slot (se vuoi sovrascrivere) -->
              <template #top-right>
                <q-btn dense flat round icon="refresh" color="primary" label="Aggiorna" @click="loadOrdini" />
              </template>
            </ResponsiveTable>

          </q-card>
        </q-tab-panel>

        <!-- SERVIZI PIÙ RICHIESTI -->
        <q-tab-panel name="servizi">
          <q-card flat bordered class="q-pa-md bg-grey-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6 text-primary">Servizi Più Richiesti</div>
              <q-btn dense flat round icon="refresh" color="primary" label="Aggiorna" @click="loadServizi" />
            </div>
            <ResponsiveTable
              :rows="servizi"
              :columns="columnsServizi"
              row-key="idServizio"
              :loading="loadingServizi"
              flat
              dense
              no-data-label="Nessun dato disponibile"
              loading-label="Caricamento servizi..."
            >
              <template #loading>
                <div class="row justify-center q-pa-md">
                  <q-spinner-dots color="primary" size="40px" />
                </div>
              </template>
            </ResponsiveTable>
          </q-card>
        </q-tab-panel>

        <!-- PRODOTTI PIÙ UTILIZZATI -->
        <q-tab-panel name="prodotti">
          <q-card flat bordered class="q-pa-md bg-grey-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6 text-primary">Prodotti Più Utilizzati</div>
              <q-btn dense flat round icon="refresh" color="primary" label="Aggiorna" @click="loadProdotti" />
            </div>
            <ResponsiveTable :rows="prodotti" :columns="columnsProdotti" row-key="idProdotto" :loading="loadingProdotti"
              class="q-mt-sm">
              <template v-slot:loading>
                <div class="row justify-center q-pa-md">
                  <q-spinner-dots color="primary" size="40px" />
                </div>
              </template>
            </ResponsiveTable>
          </q-card>
        </q-tab-panel>

        <!-- FATTURATO MENSILE -->
        <q-tab-panel name="fatturato">
          <q-card flat bordered class="q-pa-md bg-grey-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6 text-primary">Fatturato Mensile</div>
              <q-btn dense flat round icon="refresh" color="primary" label="Aggiorna" @click="loadFatturato" />
            </div>
            <div v-if="loadingFatturato" class="row justify-center q-pa-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
            <apexchart v-else type="line" :options="chartOptionsFatturato" :series="seriesFatturato" height="350" />
          </q-card>
        </q-tab-panel>

        <!-- DURATA MEDIA SERVIZI -->
        <q-tab-panel name="durata">
          <q-card flat bordered class="q-pa-md bg-grey-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6 text-primary">Durata Media Servizi (minuti)</div>
              <q-btn dense flat round icon="refresh" color="primary" label="Aggiorna" @click="loadDurata" />
            </div>
            <ResponsiveTable
              :rows="durata"
              :columns="columnsDurata"
              row-key="idServizio"
              :loading="loadingDurata"
              flat
              dense
              no-data-label="Nessun dato disponibile"
              loading-label="Caricamento durata..."
            >
              <template #loading>
                <div class="row justify-center q-pa-md">
                  <q-spinner-dots color="primary" size="40px" />
                </div>
              </template>
            </ResponsiveTable>
          </q-card>
        </q-tab-panel>

        <!-- PRODUTTIVITÀ OPERATORE -->
        <q-tab-panel name="produttivita">
          <q-card flat bordered class="q-pa-md bg-grey-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6 text-primary">Produttività Operatore</div>
              <q-btn dense flat round icon="refresh" color="primary" label="Aggiorna" @click="loadProduttivita" />
            </div>
            <ResponsiveTable
              :rows="produttivita"
              :columns="columnsProduttivita"
              row-key="eseguitoDa"
              :loading="loadingProduttivita"
              flat
              dense
              no-data-label="Nessun dato disponibile"
              loading-label="Caricamento produttività..."
            >
              <template #loading>
                <div class="row justify-center q-pa-md">
                  <q-spinner-dots color="primary" size="40px" />
                </div>
              </template>
            </ResponsiveTable>
          </q-card>
        </q-tab-panel>

      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import {
  fetchOrdiniPerCliente,
  fetchServiziPiuRichiesti,
  fetchProdottiPiuUtilizzati,
  fetchFatturatoMensile,
  fetchDurataMediaServizi,
  fetchProduttivitaOperatore
} from 'src/components/api/Statistiche.js';
import ResponsiveTable from '../ResponsiveTable.vue';

const tab = ref('ordini');

const ordini = ref([]);
const servizi = ref([]);
const prodotti = ref([]);
const durata = ref([]);
const produttivita = ref([]);

const loadingOrdini = ref(false);
const loadingServizi = ref(false);
const loadingProdotti = ref(false);
const loadingFatturato = ref(false);
const loadingDurata = ref(false);
const loadingProduttivita = ref(false);

const columnsOrdini = [
  { name: 'cliente', label: 'Cliente', field: row => row.nome && row.cognome ? row.nome + " " + row.cognome : '-', sortable: true },
  { name: 'numeroOrdini', label: 'Numero Ordini', field: 'numeroOrdini', sortable: true, align: 'right' },
  { name: 'totaleSpeso', label: 'Totale Speso (€)', field: 'totaleSpeso', sortable: true, align: 'right', format: val => val ? Number(val).toFixed(2) : '0.00' },
];

const columnsServizi = [
  { name: 'nomeServizio', label: 'Servizio', field: 'nomeServizio', sortable: true },
  { name: 'numeroEsecuzioni', label: 'Numero Esecuzioni', field: 'numeroEsecuzioni', sortable: true, align: 'right' },
];

const columnsProdotti = [
  { name: 'nomeProdotto', label: 'Prodotto', field: 'nomeProdotto', sortable: true },
  { name: 'quantitaTotaleUtilizzata', label: 'Quantità Totale Utilizzata', field: 'quantitaTotaleUtilizzata', sortable: true, align: 'right', format: val => val ? Number(val).toFixed(2) : '0.00' },
];

const columnsDurata = [
  { name: 'nomeServizio', label: 'Servizio', field: 'nomeServizio', sortable: true },
  { name: 'durataMediaMinuti', label: 'Durata Media (min)', field: 'durataMediaMinuti', sortable: true, align: 'right', format: val => val ? Number(val).toFixed(1) : '-' },
];

const columnsProduttivita = [
  { name: 'eseguitoDa', label: 'Operatore', field: 'eseguitoDa', sortable: true },
  { name: 'numeroServiziEseguiti', label: 'Servizi Eseguiti', field: 'numeroServiziEseguiti', sortable: true, align: 'right' },
  { name: 'durataTotaleMinuti', label: 'Durata Totale (min)', field: 'durataTotaleMinuti', sortable: true, align: 'right' },
];

const seriesFatturato = ref([]);
const chartOptionsFatturato = ref({
  chart: { id: 'fatturato-mensile' },
  xaxis: { categories: [] },
  yaxis: { title: { text: 'Euro (€)' } },
  title: { text: 'Fatturato Mensile', align: 'center' },
  stroke: { curve: 'smooth' },
  theme: { mode: 'light' }
});

async function loadOrdini() {
  loadingOrdini.value = true;
  try {
    ordini.value = await fetchOrdiniPerCliente();
  } catch (e) {
    console.error(e);
  } finally {
    loadingOrdini.value = false;
  }
}

async function loadServizi() {
  loadingServizi.value = true;
  try {
    servizi.value = await fetchServiziPiuRichiesti();
  } catch (e) {
    console.error(e);
  } finally {
    loadingServizi.value = false;
  }
}

async function loadProdotti() {
  loadingProdotti.value = true;
  try {
    prodotti.value = await fetchProdottiPiuUtilizzati();
  } catch (e) {
    console.error(e);
  } finally {
    loadingProdotti.value = false;
  }
}

async function loadFatturato() {
  loadingFatturato.value = true;
  try {
    const dati = await fetchFatturatoMensile();
    chartOptionsFatturato.value.xaxis.categories = dati.map(d => d.mese);
    seriesFatturato.value = [{
      name: 'Fatturato',
      data: dati.map(d => Number(d.fatturatoTotale))
    }];
  } catch (e) {
    console.error(e);
  } finally {
    loadingFatturato.value = false;
  }
}

async function loadDurata() {
  loadingDurata.value = true;
  try {
    durata.value = await fetchDurataMediaServizi();
  } catch (e) {
    console.error(e);
  } finally {
    loadingDurata.value = false;
  }
}

async function loadProduttivita() {
  loadingProduttivita.value = true;
  try {
    produttivita.value = await fetchProduttivitaOperatore();
  } catch (e) {
    console.error(e);
  } finally {
    loadingProduttivita.value = false;
  }
}

onMounted(() => {
  loadOrdini();
});

watch(tab, (val) => {
  switch (val) {
    case 'ordini': loadOrdini(); break;
    case 'servizi': loadServizi(); break;
    case 'prodotti': loadProdotti(); break;
    case 'fatturato': loadFatturato(); break;
    case 'durata': loadDurata(); break;
    case 'produttivita': loadProduttivita(); break;
  }
});
</script>

<script>
export default {
  components: {
    apexchart: ApexCharts
  }
}
</script>

<style scoped lang="scss">
@import 'src/css/_list-page.scss';
</style>