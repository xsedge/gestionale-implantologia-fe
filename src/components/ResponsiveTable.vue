<template>
    <div>
        <q-table v-if="!isMobile" :rows="props.rows" :columns="props.columns" row-key="id" flat bordered class="q-pa-sm"
            :loading="props.loading" no-data-label="Nessun dato disponibile">
            <template #body="props">
                <q-tr :props="props">
                    <q-td v-for="col in columns" :key="col.name" :props="props">
                        {{ resolveField(props.row, col.field) }}
                    </q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- Mobile layout -->
        <div v-else class="q-pa-sm">
            <q-card v-for="row in rows" :key="row.id" class="q-mb-md" bordered flat>
                <q-card-section v-for="col in columns" :key="col.name" class="row q-col-gutter-sm">
                    <div class="col-5 text-weight-bold">{{ col.label }}</div>
                    <div class="col-7" align="right">{{ resolveField(row, col.field) }}</div>
                </q-card-section>
            </q-card>

            <div v-if="!rows.length && !loading" class="text-center text-grey q-mt-md">
                Nessun dato disponibile
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    columns: { type: Array, required: true },
    rows: { type: Array, required: true },
    loading: { type: Boolean, default: false }
})

const isMobile = ref(false)

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})

/**
 * Gestisce sia field come stringa che come funzione
 */
function resolveField(row, field) {
    if (typeof field === 'function') {
        return field(row)
    }
    if (typeof field === 'string') {
        return row[field]
    }
    return ''
}
</script>

<style scoped>
.q-table {
    background-color: white;
}

.q-card-section {
    border-bottom: 1px solid #eee;
}

.q-card-section:last-child {
    border-bottom: none;
}
</style>
