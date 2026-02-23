<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUser } from './src/presentation/composables/useUser';

const { initSession } = useUser()
const isLoading = ref<boolean>(true)

onMounted(async() => {
  await initSession()
  isLoading.value = false
})
</script>

<template>
  <main>
  <div v-if="isLoading" class="fixed inset-0 flex justify-center items-center bg-white/50 backdrop-blur-sm z-50">
      <ProgressSpinner style="width: 200px; height: 200px" />
  </div>  
    <RouterView v-else />
  </main>
</template>

<style scoped></style>
