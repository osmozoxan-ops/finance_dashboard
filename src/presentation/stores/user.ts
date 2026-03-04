// src/stores/user.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userId = ref<string>('')
  const userName = ref<string>('')
  const monthlyLimit = ref<number | null>(null) 

  // Метод для обновления данных в сторе
  const setUser = (id: string, name: string, limit?: number) => {
    userId.value = id
    userName.value = name
    if (limit !== undefined) monthlyLimit.value = limit
  }

  const setUserLimit = (limit: number) => {
    monthlyLimit.value = limit
  }

  // Метод для очистки стора при выходе
  function clearUser() {
    userId.value = ''
    userName.value = ''
    monthlyLimit.value = null 
  }

  return { userId, userName, setUser, clearUser, monthlyLimit, setUserLimit }
})
