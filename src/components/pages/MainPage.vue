<template>
  <q-page class="home-page-elegant flex flex-center q-pa-md">
    <div class="header-elegant text-center">
      <!-- Contenitore per il logo -->
      <div class="logo-container">
        <img src="/logo.png" alt="Logo" class="logo-image" />
      </div>

      <h1 class="text-h4 text-weight-bold text-primary">Modulo Implantologia</h1>
      <p class="text-subtitle1 text-grey-7">
        Accedi rapidamente a tutte le aree del flusso implantare
      </p>
    </div>

    <div class="cards__grid__content">
      <q-card
        v-for="card in cards"
        :key="card.title"
        clickable
        flat
        bordered
        class="card"
        @click="goTo(card.route)"
      >
        <q-card-section>
          <div class="card__content">
            <div>
              <q-icon :name="card.icon" color="primary" size="45px" class="card__icon" />
            </div>

            <h4 class="card__title text-weight-medium text-center q-ma-none">
              <b>{{ card.title }}</b>
            </h4>
          </div>

          <div class="card__description text-subtitle2 text-grey-7 text-center q-mt-xs">
            {{ card.description }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function goTo(route) {
  router.push(route)
}

const cards = [
  {
    title: 'Dashboard Implantologia',
    route: '/implantologia',
    icon: 'space_dashboard',
    description: 'Panoramica sintetica del modulo con scorciatoie utili',
  },
  {
    title: 'Prodotti',
    route: '/implantologia/prodotti',
    icon: 'inventory',
    description: 'Gestisci catalogo, giacenze e schede impianto',
  },
  {
    title: 'Fornitori',
    route: '/implantologia/fornitori',
    icon: 'medical_information',
    description: 'Configura anagrafiche e relazioni con i fornitori',
  },
  {
    title: 'Acquisti',
    route: '/implantologia/acquisti',
    icon: 'shopping_cart',
    description: 'Registra ordini ai fornitori e monitora gli arrivi',
  },
  {
    title: 'Vendite',
    route: '/implantologia/vendite',
    icon: 'point_of_sale',
    description: 'Gestisci trattamenti implantari e stato dei pagamenti',
  },
  {
    title: 'Magazzino',
    route: '/implantologia/magazzino',
    icon: 'warehouse',
    description: 'Consulta i movimenti e verifica la disponibilità',
  },
  {
    title: 'Listini',
    route: '/implantologia/listini',
    icon: 'price_change',
    description: 'Applica scontistiche e listini dedicati ai prodotti',
  },
  {
    title: 'Fatture',
    route: '/implantologia/fatture',
    icon: 'receipt_long',
    description: 'Monitora lo stato delle fatture e genera i documenti',
  },
]
</script>

<style scoped lang="scss">
.home-page-elegant {
  background: linear-gradient(135deg, #e8fffb, #b2f5ea);
  min-height: 100vh;
  padding-top: 40px;
  flex-direction: column;
  align-items: center;
}

.header-elegant {
  background: transparent;
  padding-top: 20px;
  flex-direction: column;
  align-items: center;
}

.card:hover .card__icon {
  transform: scale(1.1);
}

.card {
  border-radius: 16px;
  background: white;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  transition: transform 0.35s ease, box-shadow 0.35s ease,
    background-color 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 190px;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
    background-color: #e0fbf7;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  &__description {
    margin-top: 20px;
  }

  &_icon {
    transition: transform 0.3s ease;
  }
}

.cards__grid__content {
  gap: 20px;
  justify-content: center;
  padding-bottom: 80px;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  max-width: 800px;
  width: 100%;
  margin-top: 40px;
  padding-bottom: 80px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.logo-container {
  width: 400px;
  /* container un po' più largo */
  height: 180px;
  /* container più alto */
  display: inline-block;

}

.logo-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* mantieni proporzioni e non tagliare */
}
</style>
