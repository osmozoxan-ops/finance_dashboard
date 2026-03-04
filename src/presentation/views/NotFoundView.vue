<script setup lang="ts">
import { computed } from 'vue';
import { useUser } from '../composables/useUser';
import { useRouter } from 'vue-router';

const router = useRouter();
const { userId } = useUser();

const primaryCta = computed(() => (userId.value ? '/dashboard' : '/'));
const primaryLabel = computed(() => (userId.value ? 'На дашборд' : 'На страницу входа'));

const goHome = () => router.push(primaryCta.value);
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-3">
    <div class="w-full max-w-lg neumorphism-card rounded-3xl p-8 text-center">
      <div class="mx-auto w-16 h-16 rounded-full neumorphism-soft flex items-center justify-center text-blue-500 text-2xl">
        <i class="pi pi-compass"></i>
      </div>

      <h1 class="mt-6 text-2xl font-bold text-gray-700">Страница не найдена</h1>
      <p class="mt-2 text-sm text-gray-500 leading-relaxed">
        Похоже, вы перешли по неправильной ссылке или страница была перемещена.
      </p>

      <div class="mt-8 flex flex-col gap-3">
        <Button
          :label="primaryLabel"
          class="w-full neumorphism-button-primary py-4 rounded-2xl! border-none!"
          @click="goHome"
        />
        <Button
          label="Назад"
          class="w-full neumorphism-button-secondary py-4 rounded-2xl! border-none!"
          @click="router.back()"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
