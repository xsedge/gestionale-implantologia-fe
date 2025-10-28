<template>
  <div class="nav-wrapper">
    <!-- Desktop -->
    <div class="desktop-nav">
      <q-btn v-if="canGoBack" flat color="white" icon="arrow_back" label="Indietro" class="q-mr-sm"
        @click="$emit('go-back')" />
      <q-btn flat color="white" icon="home" label="Home" @click="$emit('go-home')" />
      <img src="/logo.png" alt=" Logo" class="logo" />
    </div>

    <!-- Mobile logo centrato -->
    <div class="mobile-logo-container">
      <img src="/logo.png" alt=" Logo" class="logo-image" />
    </div>

    <!-- Mobile nav con bottoni -->
    <div class="mobile-nav">
      <q-btn v-if="canGoBack" round dense flat icon="arrow_back" color="white" @click="$emit('go-back')"
        label="INDIETRO" />
      <q-btn round dense flat icon="home" color="white" @click="$emit('go-home')" label="HOME" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  canGoBack: Boolean
})
</script>

<style scoped>
.nav-wrapper {
  width: 100%;
}

.desktop-nav {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.desktop-nav .logo {
  height: 50px;
  margin-left: auto;
}

.mobile-logo-container {
  display: none;
  /* nascosto di default */
}

.mobile-nav {
  display: none;
}

@media screen and (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0px 0;
    background: var(--q-primary);
  }

  .logo-image {
    max-width: 120px;
    max-height: 50px;
    object-fit: contain;
  }

  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 24px;
    background: var(--q-primary);
    padding: 8px 0;
    z-index: 9999;
    border-top: 1px solid #ccc;
  }
}
</style>
