<template>
  <div class="q-pa-md">
    <q-card class="q-pa-md q-gutter-md row items-center bg-white shadow-2" style="border-radius: 16px;">
      <q-avatar size="100px" rounded class="q-mr-lg">
        <img :src="immagineProfilo" alt="Profilo" />
      </q-avatar>

      <div class="col-grow">
        <div class="text-h6 text-primary">
          {{ cliente?.nome }} {{ cliente?.cognome }}
        </div>
        <div class="text-body2 text-grey-7">
          <strong>Data di Nascita:</strong> {{ cliente?.dataNascita }}
        </div>
        <div class="text-body2 text-grey-7">
          <strong>Note:</strong> {{ cliente?.note }}
        </div>
      </div>

      <q-btn
        color="primary"
        icon="edit"
        label="Modifica"
        outline
        class="q-ml-auto"
        @click="$emit('modifica')"
      />
    </q-card>
  </div>
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { useClientiStore } from "src/components/stores/index.js";

const clientiStore = useClientiStore();

const cliente = computed(() => clientiStore?.cliente || {})

const immagineProfilo = computed(() =>
  cliente.value?.immagineUrl || 'https://cdn.quasar.dev/img/avatar.png'
)

onUnmounted(() => clientiStore.$reset())
</script>
