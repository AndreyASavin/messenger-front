<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <MInput
            v-model="form.name"
            type="text"
            label="Full name"
            placeholder="Full name"
            :error="errors.name"
            @blur="validateField('name')"
          />
          <MInput
            v-model="form.email"
            type="email"
            label="Email address"
            placeholder="Email address"
            :error="errors.email"
            @blur="validateField('email')"
          />
          <MInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Password"
            :error="errors.password"
            @blur="validateField('password')"
          />
          <MInput
            v-model="form.confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Confirm password"
            :error="errors.confirmPassword"
            @blur="validateField('confirmPassword')"
          />
        </div>

        <div v-if="authError" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ authError }}</h3>
            </div>
          </div>
        </div>

        <MButton
          type="submit"
          :loading="isLoading"
          class="w-full"
        >
          Sign up
        </MButton>

        <div class="text-center">
          <router-link
            to="/login"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            Already have an account? Sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
// import { ExclamationIcon } from '@heroicons/vue/solid';
import { MButton, MInput } from '../../src/components/ui';
import { useAuth } from '../../src/composables/useAuth';
import type { RegisterData } from '../../src/types/auth';

const router = useRouter();
const { register, isLoading } = useAuth();

const form = reactive<RegisterData>({
  name: '',
  number: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const authError = ref('');

const validateField = (field: keyof typeof errors) => {
  if (field === 'name' && !form.name) {
    errors.name = 'Name is required';
  } else {
    errors.name = '';
  }

  if (field === 'email' && !form.email) {
    errors.email = 'Email is required';
  } else if (field === 'email' && !/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid';
  } else {
    errors.email = '';
  }

  if (field === 'password' && !form.password) {
    errors.password = 'Password is required';
  } else if (field === 'password' && form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else {
    errors.password = '';
  }

  if (field === 'confirmPassword' && !form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (field === 'confirmPassword' && form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  } else {
    errors.confirmPassword = '';
  }
};

const validateForm = (): boolean => {
  validateField('name');
  validateField('email');
  validateField('password');
  validateField('confirmPassword');

  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  authError.value = '';
  const result = await register(form);

  if (result.success) {
    router.push({ name: 'home' });
  } else {
    authError.value = result.error || 'Registration failed';
  }
};
</script>