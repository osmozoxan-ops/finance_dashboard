<script setup lang="ts">
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from 'firebase/auth'
import { computed, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'

const toast = useToast()
const email = ref<string>('')
const password = ref<string>('')
const name = ref<string>('')
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
    const userCredential = await createUserWithEmailAndPassword(getAuth(), email.value, password.value)
    await updateProfile(userCredential.user, { displayName: name.value })
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
  <div class="flex items-center justify-center min-h-screen">
    <div class="p-8 rounded-lg max-w-md w-full neumorphism-convex custom-override m-3">
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
         <div v-if="!isLogin">
          <label for="name1" class="block text-900 font-medium mb-2">Имя</label>
          <InputText
            v-model="name"
            id="name1"
            type="text"
            class="w-full mb-3 custom-override"
            placeholder="Введите имя"
            required
          />
        </div>
        
        <label for="email1" class="block text-900 font-medium mb-2">Email</label>
        <InputText
          v-model="email"
          id="email1"
          type="email"
          class="w-full mb-3 custom-override"
          placeholder="Введите email"
        />

        <label for="password1" class="block text-900 font-medium mb-2">Пароль</label>
        <InputText
          v-model="password"
          id="password1"
          type="password"
          class="w-full mb-3 custom-override"
          placeholder="Введите пароль"
        />

          <Button
            :label="submitButtonText"
            type="submit"
            icon="pi pi-user"
            :loading="isLoading"
            class="w-full custom-override mt-4"
          ></Button>

      </form>
    </div>
  </div>
</template>