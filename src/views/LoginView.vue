<script setup lang="ts">
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth'
import { computed, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'

const toast = useToast()
const email = ref<string>('')
const password = ref<string>('')
const isLogin = ref<boolean>(true)
const isLoading = ref<boolean>(false)
const router = useRouter()

const toggleAuth = () => {
  isLogin.value = !isLogin.value
}

const subtitleText = computed<string>(() => {
  return isLogin.value ? 'Аккаунта ещё нет?' : 'Уже есть аккаунт?'
})

const linkAccountText = computed<string>(() => {
  return isLogin.value ? 'Создайте сейчас' : 'Войдите в него'
})

const submitButtonText = computed<string>(() => {
  return isLogin.value ? 'Вход' : 'Регистрация'
})

const signUp = async (): Promise<void> => {
  isLoading.value = true
  try {
    await createUserWithEmailAndPassword(getAuth(), email.value, password.value)
    router.push('/dashboard')
  } catch (error: unknown){
    if (error instanceof Error){
      toast.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000})
    }
  } finally {
    isLoading.value = false
  }
}

const signIn = async (): Promise<void> => {
  isLoading.value = true
  try {
    await signInWithEmailAndPassword(getAuth(), email.value, password.value)
    router.push('/dashboard')
  } catch (error: unknown){
    if (error instanceof Error){
      toast.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000})
    }
  } finally {
    isLoading.value = false
  }
}

const submitForm = (): void => {
  if (isLogin.value){
    signIn()
  } else {
    signUp()
  }
  
}
</script>

<template>
  <Toast position="bottom-right"> </Toast>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div class="text-center mb-6">
        <div class="text-900 text-3xl font-medium mb-3">Приветствую!</div>
        <span class="text-600 font-medium line-height-3">{{ subtitleText }}</span>
        <a 
          class="font-medium no-underline ml-2 text-blue-500 cursor-pointer hover:text-blue-700" 
          @click="toggleAuth"
        >
          {{ linkAccountText }}
        </a>
      </div>

      <form @submit.prevent="submitForm">
        <label for="email1" class="block text-900 font-medium mb-2">Email</label>
        <InputText 
          v-model="email" 
          id="email1" 
          type="email" 
          class="w-full mb-3" 
          placeholder="Введите email"
        />

        <label for="password1" class="block text-900 font-medium mb-2">Пароль</label>
        <InputText 
          v-model="password" 
          id="password1" 
          type="password" 
          class="w-full mb-3" 
          placeholder="Введите пароль"
        />


        <Button
          :label="submitButtonText"
          type="submit"
          icon="pi pi-user"
          :loading="isLoading"
          class="w-full"
        ></Button>
        
      </form>
    </div>
  </div>
  
  <router-link to="/another">Вход</router-link>
</template>