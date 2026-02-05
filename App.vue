<script setup lang="ts">
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Header from "./src/components/Header.vue";
import { onMounted, ref } from 'vue';
import { useUserStore } from './src/stores/user';

const userStore = useUserStore()
const isLoading = ref<boolean>(true)

onMounted(() => {
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      userStore.userId = user.uid
    } else {
      userStore.userId = ''
    }
    isLoading.value = false
  })
})
</script>

<template>
  <Header />
  <main>
    <ProgressSpinner v-if="isLoading" />
    <RouterView v-else />
  </main>
</template>

<style scoped></style>
