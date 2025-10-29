<template>
  <div class="responsive-table">
    <q-table
      :grid="isMobile"
      :hide-header="isMobile"
      :rows="rows"
      :columns="normalizedColumns"
      :row-key="rowKey"
      :loading="loading"
      flat
      bordered
      class="q-pa-sm responsive-table__table"
      v-bind="tableAttrs"
    >
      <template v-for="slotName in forwardedSlots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>

      <template v-if="isMobile" #item="props">
        <div class="col-12 q-pa-sm responsive-table__item">
          <q-card flat bordered class="responsive-table__card q-pa-md">
            <q-card-section
              v-for="col in props.cols"
              :key="`${props.key}-${col.name}`"
              v-show="!isActionColumn(col.name) && !isColumnHidden(col.name)"
              class="row items-start no-wrap q-col-gutter-sm responsive-table__card-section"
            >
              <div class="col-5 text-weight-medium text-grey-7">{{ getColumnLabel(col.name, col.label) }}</div>
              <div class="col-7 text-right">
                <slot
                  :name="`mobile-cell-${col.name}`"
                  :row="props.row"
                  :col="col"
                  :value="formatColumnValue(props.row, col.name, col.value)"
                >
                  <span class="responsive-table__value" v-html="formatColumnValue(props.row, col.name, col.value)" />
                </slot>
              </div>
            </q-card-section>

            <template v-for="col in props.cols" :key="`${props.key}-${col.name}-actions`">
              <template v-if="isActionColumn(col.name) && !isColumnHidden(col.name)">
                <q-separator />
                <q-card-actions class="q-gutter-xs" align="right">
                  <slot
                    :name="`mobile-cell-${col.name}`"
                    :row="props.row"
                    :col="col"
                    :value="formatColumnValue(props.row, col.name, col.value)"
                  >
                    <span class="responsive-table__value" v-html="formatColumnValue(props.row, col.name, col.value)" />
                  </slot>
                </q-card-actions>
              </template>
            </template>
          </q-card>
        </div>
      </template>
    </q-table>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, useAttrs, useSlots } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  rowKey: { type: [String, Number, Function], default: 'id' },
  actionColumns: { type: Array, default: () => ['azioni'] },
  hiddenColumns: { type: Array, default: () => [] }
})

const attrs = useAttrs()
const slots = useSlots()

const isMobile = ref(false)

const tableAttrs = computed(() => ({
  ...attrs
}))

const normalizedColumns = computed(() =>
  props.columns.map(col => ({
    ...col,
    label: col.label ?? col.name,
    align: col.align ?? 'left'
  }))
)

const forwardedSlots = computed(() =>
  Object.keys(slots).filter(name => !name.startsWith('mobile-cell'))
)

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function formatColumnValue(row, name, value) {
  const slot = slots[`mobile-cell-${name}`]
  if (slot) {
    return value
  }

  if (value === null || value === undefined || value === '') {
    return '<span class="text-grey-6">-</span>'
  }
  return value
}

function getColumnLabel(name, fallback) {
  const column = props.columns.find(col => col.name === name)
  return column?.mobileLabel ?? column?.label ?? fallback ?? name
}

function isActionColumn(name) {
  return props.actionColumns.includes(name)
}

function isColumnHidden(name) {
  return props.hiddenColumns.includes(name)
}
</script>

<style scoped>
.responsive-table__table {
  background-color: white;
}

.responsive-table__card-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 0;
}

.responsive-table__card-section:last-of-type {
  border-bottom: none;
}

.responsive-table__value :deep(.q-badge) {
  margin-left: auto;
}

.responsive-table__card {
  border-radius: 14px;
  transition: background-color 0.2s ease;
}

.responsive-table__item:nth-of-type(odd) .responsive-table__card {
  background: #f9fafb;
}

.responsive-table__item:nth-of-type(even) .responsive-table__card {
  background: #ffffff;
}
</style>
