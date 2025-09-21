<script lang="ts">
import { defineComponent, computed, ComputedRef } from 'vue';
import { randomSimpleId } from '../../../utils/helpers';

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'blur'],
  setup (props, { emit }) {
    const id: ComputedRef = computed(() => randomSimpleId());
    const handleInput = (e: Event) => {
      emit("update:modelValue", (e.target as HTMLInputElement).value);
    }
    const handleBlur = (event: Event) => {
      emit('blur', event)
    }
    return {
      id,
      handleInput,
      handleBlur
    }
  }
})
</script>

<template>
  <div class="input-group">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['input', { 'input-error': error, 'input-disabled': disabled }]"
      @input="handleInput"
      @blur="handleBlur"
    />
    <p v-if="error" class="input-error-message">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">

.input-group {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: $text-color;
  margin-bottom: 0.25rem;
}

.input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  background-color: white;
  @include transition;

  &:focus {
    border-color: $primary-color;
    @include focus-ring;
  }

  &.input-error {
    border-color: $danger-color;

    &:focus {
      border-color: $danger-color;
      outline-color: $danger-color;
    }
  }

  &.input-disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
}

.input-error-message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: $danger-color;
}
</style>