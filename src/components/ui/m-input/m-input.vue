<script lang="ts">
import { defineComponent, computed, ComputedRef } from 'vue';
import { randomSimpleId } from '@/utils/helpers';

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

<style scoped>

</style>