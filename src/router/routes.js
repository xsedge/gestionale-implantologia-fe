import MainPage from 'src/components/pages/MainPage.vue'
import ImplantologiaDashboard from 'src/pages/implantologia/ImplantologiaDashboard.vue'
import ImplantologiaProdottiList from 'src/pages/implantologia/ProdottiList.vue'
import ImplantologiaFornitoriList from 'src/pages/implantologia/FornitoriList.vue'
import ImplantologiaAcquistiList from 'src/pages/implantologia/AcquistiList.vue'
import ImplantologiaVenditeList from 'src/pages/implantologia/VenditeList.vue'
import ImplantologiaMagazzinoList from 'src/pages/implantologia/MagazzinoList.vue'
import ImplantologiaListiniList from 'src/pages/implantologia/ListiniList.vue'
import ImplantologiaFattureList from 'src/pages/implantologia/FattureList.vue'

const routes = [
  {
    path: '/',
    component: MainPage,
  },
  {
    path: '/implantologia',
    component: ImplantologiaDashboard,
  },
  {
    path: '/implantologia/prodotti',
    component: ImplantologiaProdottiList,
  },
  {
    path: '/implantologia/fornitori',
    component: ImplantologiaFornitoriList,
  },
  {
    path: '/implantologia/acquisti',
    component: ImplantologiaAcquistiList,
  },
  {
    path: '/implantologia/vendite',
    component: ImplantologiaVenditeList,
  },
  {
    path: '/implantologia/magazzino',
    component: ImplantologiaMagazzinoList,
  },
  {
    path: '/implantologia/listini',
    component: ImplantologiaListiniList,
  },
  {
    path: '/implantologia/fatture',
    component: ImplantologiaFattureList,
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

