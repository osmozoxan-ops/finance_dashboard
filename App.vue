<script setup lang="ts">
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
</script>

<template>
  <main class="app">
    <!-- Глобальные компоненты -->
    <Toast position="bottom-right" :pt="{
      root: { class: 'opacity-90' },
      message: { class: 'neumorphism-card border-none rounded-2xl shadow-xl' },
      summary: { class: 'font-bold text-gray-700' },
      detail: { class: 'text-sm text-gray-500' },
      icon: { class: 'text-blue-500' }
    }" />
    
    <!-- Важно для работы удаления -->
    <ConfirmDialog />

    <!-- Контент. Лоадеры оставляем локальными (скелетоны на экранах/секциях). -->
    <RouterView />
  </main>
</template>

<style>
/* Глобальные стили для всего приложения */
body {
  background-color: #e0e5ec;
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}

.app {
  /* Вместо Tailwind-класса пишем чистый CSS или используем @apply */
  min-height: 100vh;
  padding: 10px;
}
</style>
