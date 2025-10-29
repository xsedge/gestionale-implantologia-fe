<template>
    <q-page class="list-page q-pa-md">
        <q-card flat class="list-card">
            <div class="header-section-list q-mb-lg">
                <div class="text-h4 text-weight-bold text-pink-9 q-mb-sm">Gestione Prodotti</div>
                <p class="text-subtitle1 text-grey-8">Visualizza e gestisci i prodotti e le loro tipologie.</p>
            </div>

            <q-tabs v-model="tab" class="text-pink-8 q-mb-md" dense align="center" narrow-indicator>
                <q-tab name="prodotti" label="Prodotti" />
                <q-tab name="tipologie" label="Tipologie" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated>
                <!-- Tab: Prodotti -->
                <q-tab-panel name="prodotti">

                    <ResponsiveTable
                        :rows="store.prodotti"
                        :columns="columnsProdotti"
                        row-key="id"
                        flat
                        bordered
                        color="pink-8"
                        class="responsive-elegant-table q-table--horizontal-separator q-table--responsive"
                        :pagination="{ rowsPerPage: 10 }"
                        :loading="store.loading"
                        no-data-label="Nessun prodotto trovato."
                        rows-per-page-label="Prodotti per pagina:"
                    >
                        <template #top-right>
                            <q-btn color="pink-8" icon="add_circle" label="Aggiungi Prodotto"
                                class="q-px-md q-py-sm text-weight-bold" rounded @click="openDialog('prodotto')" />
                        </template>

                        <template #header="props">
                            <q-tr :props="props">
                                <q-th v-for="col in props.cols" :key="col.name" :props="props"
                                    class="text-uppercase text-weight-bold bg-pink-1 text-pink-9 custom-header-cell"
                                    :style="{ padding: '12px 16px', fontSize: '14px' }">
                                    {{ col.label }}
                                </q-th>
                            </q-tr>
                        </template>

                        <template #body="props">
                            <q-tr :props="props" class="custom-body-row responsive-row">
                                <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-label="col.label">
                                    <template v-if="col.name === 'azioni'">
                                        <q-btn dense round flat icon="more_vert" color="primary"
                                            @click="openMenu(props.row, $event)">
                                            <q-tooltip anchor="top middle" self="bottom middle">Azioni</q-tooltip>
                                        </q-btn>
                                    </template>
                                    <template v-else>
                                        <div class="text-wrap">
                                            {{ col.value }}
                                        </div>
                                    </template>
                                </q-td>
                            </q-tr>
                        </template>

                        <template #mobile-cell-azioni="{ row }">
                            <q-btn dense round flat icon="more_vert" color="primary"
                                @click="openMenu(row, $event)">
                                <q-tooltip anchor="top middle" self="bottom middle">Azioni</q-tooltip>
                            </q-btn>
                        </template>
                    </ResponsiveTable>
                </q-tab-panel>

                <q-tab-panel name="tipologie">
                    <!-- Tabella visibile solo desktop -->
                    <ResponsiveTable
                        :rows="store.tipologieProdotto"
                        :columns="columnsTipologie"
                        row-key="id"
                        flat
                        bordered
                        color="pink-8"
                        class="responsive-elegant-table q-table--horizontal-separator q-table--responsive"
                        :pagination="{ rowsPerPage: 10 }"
                        :loading="store.loading"
                        no-data-label="Nessuna tipologia trovata."
                        rows-per-page-label="Tipologie per pagina:"
                    >
                        <template #top-right>
                            <q-btn color="pink-8" icon="add_circle" label="Aggiungi Tipologia"
                                class="q-px-md q-py-sm text-weight-bold" rounded @click="openDialog('tipologia')" />
                        </template>

                        <template #header="props">
                            <q-tr :props="props">
                                <q-th v-for="col in props.cols" :key="col.name" :props="props"
                                    class="text-uppercase text-weight-bold bg-pink-1 text-pink-9 custom-header-cell"
                                    :style="{ padding: '12px 16px', fontSize: '14px' }">
                                    {{ col.label }}
                                </q-th>
                            </q-tr>
                        </template>

                        <template #body="props">
                            <q-tr :props="props" class="responsive-row">
                                <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-label="col.label">
                                    <template v-if="col.name === 'azioni'">
                                        <q-btn dense round flat icon="more_vert" color="primary"
                                            @click="openMenu(props.row, $event)">
                                            <q-tooltip anchor="top middle" self="bottom middle">Azioni</q-tooltip>
                                        </q-btn>
                                    </template>
                                    <template v-else>
                                        <div class="text-wrap">
                                            {{ col.value }}
                                        </div>
                                    </template>
                                </q-td>
                            </q-tr>
                        </template>

                        <template #mobile-cell-azioni="{ row }">
                            <q-btn dense round flat icon="more_vert" color="primary"
                                @click="openMenu(row, $event)">
                                <q-tooltip anchor="top middle" self="bottom middle">Azioni</q-tooltip>
                            </q-btn>
                        </template>
                    </ResponsiveTable>
                </q-tab-panel>

            </q-tab-panels>
        </q-card>

        <q-menu v-model="menuVisible" :target="menuAnchor" @hide="closeMenu">
            <q-list bordered separator>
                <q-item clickable v-close-popup @click="modificaElemento(selectedRowId)">
                    <q-item-section avatar><q-icon name="edit" color="blue-7" /></q-item-section>
                    <q-item-section>Modifica</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="eliminaElemento(selectedRowId)">
                    <q-item-section avatar><q-icon name="delete" color="red-7" /></q-item-section>
                    <q-item-section>Elimina</q-item-section>
                </q-item>
            </q-list>
        </q-menu>

        <!-- DIALOG UNICO -->
        <q-dialog v-model="dialog.visible" persistent>
            <q-card style="min-width: 400px">
                <q-card-section>
                    <div class="text-h6">
                        {{ dialog.mode === 'edit' ? 'Modifica' : 'Nuovo' }}
                        {{ dialog.type === 'prodotto' ? 'Prodotto' : 'Tipologia' }}
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-form @submit.prevent="handleSave">
                        <q-input v-if="dialog.type === 'tipologia'" v-model="form.codTipProdotto" label="Nome Tipologia"
                            class="q-mb-md" :rules="[val => !!val || 'Campo obbligatorio']"
                            style="text-transform: uppercase" />
                        <q-input v-if="dialog.type === 'tipologia'" v-model="form.descTipProdotto"
                            label="Descrizione Tipologia" class="q-mb-md" />
                        <q-select v-if="dialog.type === 'prodotto'" v-model="form.idTipProdotto"
                            :options="tipologieOptions" label="Tipologia" emit-value map-options class="q-mb-md"
                            :rules="[val => !!val || 'Campo obbligatorio']" />
                        <q-input v-if="dialog.type === 'prodotto'" v-model="form.nome" label="Nome" class="q-mb-md"
                            :rules="[val => !!val || 'Campo obbligatorio']" />
                        <q-input v-if="dialog.type === 'prodotto'" v-model="form.marca" label="Marca" class="q-mb-md" />
                        <q-input v-if="dialog.type === 'prodotto' && mostraCodiceColore" v-model="form.codiceColore"
                            label="Codice Colore" class="q-mb-md" :rules="[
                                val => {
                                    if (form.idTipProdotto === 2) {
                                        return !!val || 'Codice Colore obbligatorio per la tipologia COLORE'
                                    }
                                    return true
                                }
                            ]" />


                        <q-card-actions align="right">
                            <q-btn flat label="Annulla" v-close-popup @click="resetDialog" />
                            <q-btn color="primary" type="submit" :label="dialog.mode === 'edit' ? 'Salva' : 'Crea'" />
                        </q-card-actions>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useProdottiStore } from 'src/components/stores/index.js'
import ResponsiveTable from '../ResponsiveTable.vue'

const $q = useQuasar()
const store = useProdottiStore()
const tab = ref('prodotti')
const menuVisible = ref(false)
const menuAnchor = ref(null)
const selectedRowId = ref(null)


// Tipologie che richiedono la visualizzazione del codice colore
const tipologieConCodiceColore = ['COLORE']

// Determina se mostrare il campo codiceColore
const mostraCodiceColore = computed(() => {
    const tipologia = store.tipologieProdotto.find(t => t.id === form.value.idTipProdotto)
    return tipologia && tipologieConCodiceColore.includes(tipologia.codTipProdotto)
})

const dialog = ref({ visible: false, type: '', mode: 'create', editingId: null })
const form = ref({ id: null, nome: '', marca: '', codiceColore: '', idTipProdotto: null, descTipProdotto: '', codTipProdotto: '' })

const tipologieOptions = ref([])

const columnsProdotti = [
    { name: 'id', label: 'ID', field: row => row.id ?? '-', align: 'left' },
    { name: 'nome', label: 'Nome', field: row => row.nome || '-', align: 'left' },
    { name: 'marca', label: 'Marca', field: row => row.marca || '-', align: 'left' },
    { name: 'codiceColore', label: 'Codice Colore', field: row => row.codiceColore || '-', align: 'left' },
    { name: 'codTipProdotto', label: 'Nome Tipologia', field: row => row.codTipProdotto || '-', align: 'left' },
    { name: 'azioni', label: 'Azioni', align: 'center' }
]

const columnsTipologie = [
    { name: 'id', label: 'ID', field: row => row.id ?? '-', align: 'left' },
    { name: 'codTipProdotto', label: 'Nome Tipologia', field: row => row.codTipProdotto || '-', align: 'left' },
    { name: 'descTipProdotto', label: 'Descrizione', field: row => row.descTipProdotto || '-', align: 'left' },
    { name: 'azioni', label: 'Azioni', align: 'center' }
]

function openMenu(row, event) {
    selectedRowId.value = row.id
    menuAnchor.value = event.currentTarget
    menuVisible.value = true
}

function closeMenu() {
    menuVisible.value = false
    selectedRowId.value = null
    menuAnchor.value = null
}

async function openDialog(type, row = null) {
    dialog.value.visible = true
    dialog.value.type = type
    dialog.value.mode = row ? 'edit' : 'create'
    dialog.value.editingId = row?.id ?? null
    if (type === 'prodotto') {
        await store.fetchAllTipologie()
        tipologieOptions.value = store.tipologieProdotto.map(t => ({ label: t.codTipProdotto, value: t.id }))
    }
    if (row) Object.assign(form.value, row)
    else resetForm()
}

function resetDialog() {
    dialog.value.visible = false
    dialog.value.editingId = null
    resetForm()
}

function resetForm() {
    form.value = { id: null, nome: '', marca: '', codiceColore: '', idTipProdotto: null, descTipProdotto: '' }
}

async function handleSave() {
    if (dialog.value.type === 'prodotto') {
        if (dialog.value.mode === 'edit') await store.createOrUpdateProdotto(form.value)
        else await store.createOrUpdateProdotto(form.value)
        await store.fetchAllProdotti()
    } else {
        if (dialog.value.mode === 'edit') await store.createOrUpdateTipologia(form.value)
        else await store.createOrUpdateTipologia(form.value)
        await store.fetchAllTipologie()
    }
    resetDialog()
}

function modificaElemento(id) {
    const record = tab.value === 'prodotti' ? store.prodotti.find(p => p.id === id) : store.tipologieProdotto.find(t => t.id === id)
    openDialog(tab.value === 'prodotti' ? 'prodotto' : 'tipologia', record)
}

function eliminaElemento(id) {
    $q.dialog({
        title: 'Conferma Eliminazione',
        message: `Vuoi davvero eliminare l'elemento con ID: ${id}?`,
        cancel: true,
        persistent: true
    }).onOk(async () => {
        if (tab.value === 'prodotti') {
            await store.deleteProdotto(id)
            await store.fetchAllProdotti()
        } else {
            await store.deleteTipologia(id)
            await store.fetchAllTipologie()
        }
    })
}

onMounted(async () => {
    await store.fetchAllProdotti()
    await store.fetchAllTipologie()
    tipologieOptions.value = store.tipologieProdotto.map(t => ({ label: t.codTipProdotto, value: t.id }))
})
</script>

<style lang="scss" scoped>
@import 'src/css/_list-page.scss';
</style>
