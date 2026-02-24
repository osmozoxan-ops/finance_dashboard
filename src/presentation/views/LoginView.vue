<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

// Импортируем наши слои
import { useUser } from '../composables/useUser'

const toast = useToast()
const router = useRouter()

// Настраиваем сервисы
const { signIn, signUp } = useUser();

const email = ref('')
const password = ref('')
const name = ref('')
const isLoading = ref(false)
const isLogin = ref(true)
const passwordAutocomplete = computed(() => 
  isLogin.value ? 'current-password' : 'new-password'
)

// Метод Входа
const handleAuth = async () => {
  isLoading.value = true
  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
    } else {
      await signUp(email.value, password.value, name.value)
    }
    router.push('/dashboard')
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Ошибка входа', detail: 'Неверынй пароль/email', life: 3000 })
  } finally {
    isLoading.value = false
  }
} 

const toggleAuth = () => {
  isLogin.value = !isLogin.value
  email.value = ''
  password.value = ''
  name.value = ''
  }
const subtitleText = computed(() => isLogin.value ? 'Аккаунта ещё нет?' : 'Уже есть аккаунт?')
const linkAccountText = computed(() => isLogin.value ? 'Создайте сейчас' : 'Войдите в него')
const submitButtonText = computed(() => isLogin.value ? 'Вход' : 'Регистрация')

const isFormValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const validEmail = emailRegex.test(email.value)
  const validPass = password.value.length >= 6
  const validName = isLogin.value ? true : name.value.trim().length >= 2
  
  return validEmail && validPass && validName
})
</script>


<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="p-8 rounded-lg max-w-md w-full neumorphism-card custom-override m-3">
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

      <form @submit.prevent="handleAuth">
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
          autocomplete="username"
          id="email1"
          type="email"
          class="w-full mb-3 custom-override"
          placeholder="Введите email"
        />

        <label for="password1" class="block text-900 font-medium mb-2">Пароль</label>
        <InputText
          v-model="password"
          :autocomplete="passwordAutocomplete"
          id="password1"
          type="password"
          class="w-full mb-3 custom-override"
          placeholder="Введите пароль"
        />

          <Button
                      :disabled="!isFormValid"
                      :label="submitButtonText"
                      type="submit"
                      icon="pi pi-user"
                      :loading="isLoading"
                      class="w-full neumorphism-button neumorphism-button-primary mt-4"
                    ></Button>

      </form>
    </div>
  </div>
</template>