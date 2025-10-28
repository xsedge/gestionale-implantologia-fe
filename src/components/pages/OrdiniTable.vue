<template>
  <div class="q-pa-md">
    <q-card class="q-pa-md shadow-1 rounded-borders">
      <div class="header flex flex-wrap items-center justify-between q-mb-md">
        <div class="text-h6 text-primary q-mb-xs q-mb-md-none">
          Ordini del Cliente
        </div>
        <q-btn color="pink-8" icon="add_circle" label="Aggiungi Ordine" class="q-px-md q-py-sm text-weight-bold" rounded
          @click="$emit('aggiungi')" />
      </div>

      <q-separator class="q-mb-md" />

      <!-- Desktop: tabella -->
      <div class="table-responsive q-table-desktop">
        <q-table :rows="ordiniStore.ordini" :columns="columns" row-key="id" flat bordered hide-bottom
          :rows-per-page-options="[0]" class="my-sticky-header-table">
          <template v-slot:body="props">
            <q-tr :props="props" @click="props.expand = !props.expand" class="cursor-pointer">
              <q-td key="data" :props="props">
                {{ props.row.data }}
              </q-td>
              <q-td key="prezzoTotale" :props="props" class="text-right">
                € {{ props.row.prezzoTotale.toFixed(2) }}
              </q-td>
              <q-td key="serviziSummary" :props="props">
                <div class="text-grey-7">
                  {{ props.row.servizi.length }} servizio/i
                  <q-icon :name="props.expand ? 'expand_less' : 'expand_more'" />
                </div>
              </q-td>
              <q-td key="azioni" :props="props" class="text-center">
                <q-btn color="primary" icon="visibility" dense round @click.stop="$emit('visualizza', props.row)"
                  size="sm" title="Visualizza Dettagli Ordine" />
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%">
                <div class="q-pa-sm bg-grey-1 rounded-borders q-my-sm">
                  <div class="text-subtitle2 q-mb-sm">Dettagli Servizi:</div>
                  <div v-for="(s, index) in props.row?.servizi" :key="index" class="q-mb-md service-item">
                    <q-card flat bordered class="q-pa-sm">
                      <div class="text-body2 text-weight-bold q-mb-xs flex items-center">
                        <q-icon name="assignment" class="q-mr-xs" color="primary" />
                        {{ s.nome ?? 'Servizio #' + s.id }}
                      </div>

                      <div v-if="s.descrizione" class="text-body2 text-grey-8">
                        <q-icon name="info" class="q-mr-xs" size="xs" />
                        Descrizione: {{ s.descrizione }}
                      </div>
                      <div v-if="s.prezzoBase" class="text-body2 text-grey-8">
                        <q-icon name="euro" class="q-mr-xs" size="xs" />
                        Prezzo Base: € {{ s.prezzoBase.toFixed(2) }}
                      </div>
                      <div v-if="s.eseguitoDa" class="text-body2 text-grey-8">
                        <q-icon name="person" class="q-mr-xs" size="xs" />
                        Eseguito da: {{ s.eseguitoDa }}
                      </div>

                      <div v-if="s.prodottiUtilizzati && s.prodottiUtilizzati.length > 0" class="q-mt-sm">
                        <div class="text-subtitle2 text-primary q-mt-sm q-mb-xs">
                          <q-icon name="spa" class="q-mr-xs" size="xs" />
                          Prodotti Utilizzati
                        </div>

                        <div v-for="(p, i) in s.prodottiUtilizzati" :key="i" class="q-ml-md q-mb-sm">
                          <div class="text-body2 text-grey-8">
                            <q-icon name="label" class="q-mr-xs" size="xs" />
                            {{ p.nome }} ( {{ p.marca }} - {{ p.codTipProdotto }} )
                          </div>
                          <div v-if="p.codiceColore" class="text-body2 text-grey-8">
                            <q-icon name="palette" class="q-mr-xs" size="xs" />
                            Codice Colore Usato: {{ p.codiceColore }}
                          </div>
                          <div v-if="p.quantitaUtilizzata" class="text-body2 text-grey-8">
                            <q-icon name="numbers" class="q-mr-xs" size="xs" />
                            Quantità Utilizzata: {{ p.quantitaUtilizzata }} ml
                          </div>
                          <div v-if="p.noteUtilizzo" class="text-body2 text-grey-8">
                            <q-icon name="notes" class="q-mr-xs" size="xs" />
                            Note: {{ p.noteUtilizzo }}
                          </div>
                        </div>
                      </div>
                    </q-card>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <!-- Mobile: elenco card senza colonna servizi -->
      <div class="orders-cards q-table-mobile">
        <q-card v-for="ordine in ordiniStore.ordini" :key="ordine.id" class="q-mb-md" flat bordered
          @click="$emit('visualizza', ordine)" tabindex="0">
          <q-card-section class="q-pa-sm">
            <div class="row items-center justify-between no-wrap">
              <div class="col-6">
                <div><strong>Data:</strong> {{ formattaDataItaliano(ordine.data) }}</div>
              </div>
              <div class="col-6 text-right">
                <div><strong>Prezzo Totale:</strong> € {{ ordine.prezzoTotale.toFixed(2) }}</div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn dense flat color="primary" icon="visibility" label="Dettaglio ordine"
              @click.stop="$emit('visualizza', ordine)" />
          </q-card-actions>
        </q-card>
      </div>
    </q-card>
  </div>
</template>

<style scoped>
/* Nascondi tabella mobile, mostra card desktop */
.q-table-desktop {
  display: block;
}

.q-table-mobile {
  display: none;
}

/* A 600px o meno: nascondi tabella, mostra card */
@media (max-width: 600px) {
  .q-table-desktop {
    display: none;
  }

  .q-table-mobile {
    display: block;
  }
}

/* Rimuovi colonna servizi dalla tabella */
.my-sticky-header-table th:nth-child(3),
.my-sticky-header-table td:nth-child(3) {
  /* solo desktop */
  display: table-cell;
}

@media (max-width: 600px) {

  .my-sticky-header-table th:nth-child(3),
  .my-sticky-header-table td:nth-child(3) {
    display: none !important;
  }
}

/* Stile generali */
.shadow-1 {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.my-sticky-header-table .q-table__top,
.my-sticky-header-table .q-table__bottom,
.my-sticky-header-table thead tr:first-child th {
  background-color: #f5f5f5;
}

.my-sticky-header-table thead tr th {
  position: sticky;
  top: 0;
  z-index: 1;
}

.my-sticky-header-table .q-table__middle {
  overflow: auto;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.service-item {
  margin-bottom: 12px;
}

.service-item:last-child {
  margin-bottom: 0;
}
</style>

<script setup>
import { useOrdiniStore } from "src/components/stores/index.js";
import { formattaDataItaliano } from "src/utils/MethodUtils";

const ordiniStore = useOrdiniStore();

const columns = [
  {
    name: "data",
    label: "Data",
    field: (row) => formattaDataItaliano(row.data),
    align: "left",
    sortable: true,
  },
  {
    name: "prezzoTotale",
    label: "Prezzo Totale",
    field: "prezzoTotale",
    align: "right",
    sortable: true,
  },
  {
    name: "serviziSummary",
    label: "Servizi",
    field: "servizi",
    align: "left",
  },
  {
    name: "azioni",
    label: "Azioni",
    field: "",
    align: "center",
  },
];
</script>
