<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUser } from './src/presentation/composables/useUser';
import Toast from 'primevue/toast';

const { initSession } = useUser()
const isLoading = ref<boolean>(true)

onMounted(async() => {
  await initSession()
  isLoading.value = false
})
</script>

<template>
  <main class="app">
    <Toast position="bottom-right" :pt="{
    root: { class: 'opacity-90' },
    message: { class: 'neumorphism-card border-none rounded-2xl shadow-xl' },
    summary: { class: 'font-bold text-gray-700' },
    detail: { class: 'text-sm text-gray-500' },
    icon: { class: 'text-blue-500' }
}" />
  <div v-if="isLoading" class="fixed inset-0 flex justify-center items-center bg-white/50 backdrop-blur-sm z-50">
      <ProgressSpinner style="width: 200px; height: 200px" />
  </div>  
    <RouterView v-else />
  </main>
</template>

<style scoped>
.app {
  margin: 10px;
}
</style>
