// src/stores/user.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userId = ref<string>('')
  const userName = ref<string>('')

  // Метод для обновления данных в сторе
  function setUser(id: string, name: string) {
    userId.value = id
    userName.value = name
  }

  // Метод для очистки стора при выходе
  function clearUser() {
    userId.value = ''
    userName.value = ''
  }

  return { userId, userName, setUser, clearUser }
})
