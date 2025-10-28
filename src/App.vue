<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Barra superiore -->
    <q-header elevated class="bg-primary text-white">
      <NavigationButtons :canGoBack="canGoBack" @go-home="goHome" @go-back="goBack" />
    </q-header>

    <!-- Drawer se presente (opzionale) -->
    <!-- <q-drawer show-if-above v-model="drawer" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple>
          <q-item-section>
            Voce di esempio
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer> -->

    <!-- Corpo dell'app -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import NavigationButtons from 'src/components/NavigationButtons.vue' // Percorso corretto


const router = useRouter()
const canGoBack = ref(false)

function checkHistory() {
  canGoBack.value = window.history.length > 1
}

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}

onMounted(() => {
  checkHistory()
  window.addEventListener('popstate', checkHistory)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', checkHistory)
})
</script>

<style src="src/css/app.scss"></style>
