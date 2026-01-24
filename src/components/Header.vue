<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { ref, onMounted, watch, computed } from 'vue'
import { useFirestore, useCollection } from 'vuefire';
import { collection } from 'firebase/firestore';

const userStore = useUserStore()
const db = useFirestore();
const auth = getAuth();

const isLoading = ref(true)
const userId = ref<string | null>(null)
const transactionsRef = computed(() => {
  if (userId.value) {
    return collection(db, `users/${userId.value}/transactions`)
  }
  return null
})

const { data: transactions } = useCollection(transactionsRef)

// Отслеживаем изменение состояния аутентификации
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId.value = user.uid
    } else {
      userId.value = null
    }
    isLoading.value = false
  })
})

// Логируем при изменении transactions
watch(transactions, (newTransactions) => {
  console.log('Transactions updated:', newTransactions)
})
</script>

<template>
 
</template>