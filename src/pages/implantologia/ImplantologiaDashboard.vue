<template>
  <q-page class="q-pa-md implantologia-page">
    <q-card flat bordered class="list-card q-pa-lg">
      <div class="text-h4 text-primary text-weight-medium q-mb-sm">Implantologia</div>
      <div class="text-subtitle1 text-grey-7 q-mb-lg">Accedi rapidamente alle sezioni dedicate alla gestione dell'implantologia dentale.</div>

      <q-list bordered class="rounded-borders">
        <q-item v-for="section in sections" :key="section.route" clickable @click="goTo(section.route)">
          <q-item-section avatar>
            <q-icon :name="section.icon" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-subtitle1 text-weight-medium">{{ section.label }}</q-item-label>
            <q-item-label caption>{{ section.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense icon="chevron_right" color="primary" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const sections = [
  { label: 'Prodotti', route: '/implantologia/prodotti', icon: 'inventory_2', description: 'Catalogo prodotti con quantità e scheda impianto.' },
  { label: 'Fornitori', route: '/implantologia/fornitori', icon: 'local_shipping', description: 'Anagrafica dei fornitori e contatti principali.' },
  { label: 'Clienti dentali', route: '/implantologia/clienti', icon: 'groups', description: 'Schede pazienti e riferimenti clinici.' },
  { label: 'Acquisti', route: '/implantologia/acquisti', icon: 'shopping_cart', description: 'Ordini di acquisto con stato e totale.' },
  { label: 'Vendite', route: '/implantologia/vendite', icon: 'point_of_sale', description: 'Vendite implantari e stato pagamento.' },
  { label: 'Magazzino', route: '/implantologia/magazzino', icon: 'warehouse', description: 'Movimenti di magazzino e giacenze aggiornate.' },
  { label: 'Listini', route: '/implantologia/listini', icon: 'request_quote', description: 'Listini con scontistiche dedicate.' },
  { label: 'Fatture', route: '/implantologia/fatture', icon: 'receipt_long', description: 'Gestione fatture collegate a vendite e acquisti.' }
]

function goTo(route) {
  router.push(route)
}
</script>

<style scoped>
.implantologia-page .list-card {
  border-radius: 18px;
}
</style>
