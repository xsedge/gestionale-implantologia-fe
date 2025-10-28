<template>
  <div class="quantita-counter column q-gutter-xs q-pa-md bg-grey-1 rounded-borders">
    <div v-if="fieldLabelToShow" class="text-subtitle2 text-weight-medium">
      {{ fieldLabelToShow }}
    </div>

    <div v-if="isVertical" class="column q-gutter-sm">
      <div v-if="hasSteps" class="quantita-counter__buttons row items-center justify-center q-gutter-xs">
        <q-btn
          v-for="step in normalizedSteps"
          :key="`plus-${step}`"
          outline
          color="primary"
          dense
          size="sm"
          class="quantita-counter__button"
          icon="add"
          :label="formatStep(step)"
          no-caps
          @click="increment(step)"
          :disable="!canIncrement(step)"
        >
          <q-tooltip v-if="!canIncrement(step)">
            Raggiunto il valore massimo
          </q-tooltip>
        </q-btn>
      </div>

      <div class="quantita-counter__input-wrapper column items-stretch">
        <q-input
          v-model.number="internalValue"
          type="number"
          outlined
          dense
          hide-bottom-space
          input-class="text-center"
          :min="inputMin"
          :max="inputMax"
          :step="inputStep"
          @update:model-value="handleInputUpdate"
        />
        <div v-if="unitLabelToShow" class="text-caption text-grey-7 q-mt-xs text-center">
          {{ unitLabelToShow }}
        </div>
      </div>

      <div v-if="hasSteps" class="quantita-counter__buttons row items-center justify-center q-gutter-xs">
        <q-btn
          v-for="step in normalizedSteps"
          :key="`minus-${step}`"
          outline
          color="primary"
          dense
          size="sm"
          class="quantita-counter__button"
          icon="remove"
          :label="formatStep(step)"
          no-caps
          @click="decrement(step)"
          :disable="!canDecrement(step)"
        >
          <q-tooltip v-if="!canDecrement(step)">
            Raggiunto il valore minimo
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <div v-else class="quantita-counter__body row items-center no-wrap q-gutter-sm">
      <div v-if="hasSteps" class="quantita-counter__buttons row items-center justify-start q-gutter-xs">
        <q-btn
          v-for="step in normalizedSteps"
          :key="`minus-${step}`"
          outline
          color="primary"
          dense
          size="sm"
          class="quantita-counter__button"
          icon="remove"
          :label="formatStep(step)"
          no-caps
          @click="decrement(step)"
          :disable="!canDecrement(step)"
        >
          <q-tooltip v-if="!canDecrement(step)">
            Raggiunto il valore minimo
          </q-tooltip>
        </q-btn>
      </div>

      <div class="quantita-counter__input-wrapper column items-stretch">
        <q-input
          v-model.number="internalValue"
          type="number"
          outlined
          dense
          hide-bottom-space
          input-class="text-center"
          :min="inputMin"
          :max="inputMax"
          :step="inputStep"
          @update:model-value="handleInputUpdate"
        />
        <div v-if="unitLabelToShow" class="text-caption text-grey-7 q-mt-xs text-center">
          {{ unitLabelToShow }}
        </div>
      </div>

      <div v-if="hasSteps" class="quantita-counter__buttons row items-center justify-end q-gutter-xs">
        <q-btn
          v-for="step in normalizedSteps"
          :key="`plus-${step}`"
          outline
          color="primary"
          dense
          size="sm"
          class="quantita-counter__button"
          icon="add"
          :label="formatStep(step)"
          no-caps
          @click="increment(step)"
          :disable="!canIncrement(step)"
        >
          <q-tooltip v-if="!canIncrement(step)">
            Raggiunto il valore massimo
          </q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    default: () => [1, 5, 10]
  },
  modelValue: {
    type: Number,
    default: 0
  },
  orientation: {
    type: String,
    default: 'horizontal',
    validator: value => ['horizontal', 'vertical'].includes(value)
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: Infinity
  },
  fieldLabel: {
    type: String,
    default: ''
  },
  unitLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const fieldLabelToShow = computed(() => props.fieldLabel?.toString().trim() ?? '')
const unitLabelToShow = computed(() => props.unitLabel?.toString().trim() ?? '')

const clampValue = value => {
  let numericValue = Number(value)
  if (Number.isNaN(numericValue)) {
    numericValue = props.min
  }

  if (numericValue < props.min) {
    return props.min
  }

  if (numericValue > props.max) {
    return props.max
  }

  return numericValue
}

const internalValue = ref(clampValue(props.modelValue))

watch(
  () => props.modelValue,
  newValue => {
    internalValue.value = clampValue(newValue)
  }
)

watch(
  () => [props.min, props.max],
  () => {
    internalValue.value = clampValue(internalValue.value)
  }
)

watch(internalValue, value => {
  const clamped = clampValue(value)
  if (clamped !== value) {
    internalValue.value = clamped
    return
  }
  emit('update:modelValue', clamped)
})

const normalizedSteps = computed(() =>
  props.steps
    .map(step => Number(step))
    .filter(step => !Number.isNaN(step) && step > 0)
)

const hasSteps = computed(() => normalizedSteps.value.length > 0)
const isVertical = computed(() => props.orientation === 'vertical')

const inputMin = computed(() => (Number.isFinite(props.min) ? props.min : undefined))
const inputMax = computed(() => (Number.isFinite(props.max) ? props.max : undefined))

const inputStep = computed(() => {
  if (!normalizedSteps.value.length) {
    return 'any'
  }
  return Math.min(...normalizedSteps.value)
})

const formatStep = value => {
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) {
    return value
  }
  return numericValue.toString()
}

const canIncrement = step => internalValue.value + step <= props.max
const canDecrement = step => internalValue.value - step >= props.min

const increment = step => {
  internalValue.value = clampValue(internalValue.value + step)
}

const decrement = step => {
  internalValue.value = clampValue(internalValue.value - step)
}

const handleInputUpdate = value => {
  internalValue.value = clampValue(value)
}
</script>

<style scoped>
.quantita-counter {
  border: 1px solid var(--q-color-grey-4, #cfd8dc);
}

.quantita-counter__body {
  flex: 1 1 auto;
}

.quantita-counter__buttons {
  flex-wrap: wrap;
}

.quantita-counter__button {
  min-width: 0;
}

.quantita-counter__input-wrapper {
  flex: 1 1 160px;
}
</style>
