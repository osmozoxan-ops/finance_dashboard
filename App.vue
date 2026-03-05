<script setup lang="ts">
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
</script>

<template>
  <main class="app">
    <!-- Глобальные компоненты -->
   <Toast position="bottom-center" :pt="{
    root: { class: 'mobile-toast-root' },
    message: { class: 'neumorphism-card border-none rounded-2xl shadow-xl mx-4 mb-4' }
}" />
    
    <!-- Важно для работы удаления -->
    <ConfirmDialog />

    <!-- Контент. Лоадеры оставляем локальными (скелетоны на экранах/секциях). -->
    <RouterView />
  </main>
</template>
