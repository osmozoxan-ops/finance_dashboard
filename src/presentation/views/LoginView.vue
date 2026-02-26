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

const emailTouched = ref(false);
const passwordTouched = ref(false);
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

const isEmailInvalid = computed(() => {
  if (!emailTouched.value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.value.length < 7 || !emailRegex.test(email.value);
});

// Валидация Пароля (минимум 6 или 7 символов, как ты хочешь)
const isPasswordInvalid = computed(() => {
  if (!passwordTouched.value) return false;
  return password.value.length > 0 && password.value.length < 7;
});

</script>


<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="p-8 rounded-lg max-w-md w-full neumorphism-card custom-override">
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
        
        <div class="mb-3">
          <label for="email1" class="block text-900 font-medium mb-2">Email</label>
          <InputText
            v-model="email"
            autocomplete="username"
            id="email1"
            type="email"
            class="w-full  custom-override"
            placeholder="Введите email"
            @blur = "emailTouched = true"
            :class="['w-full custom-override', { 'input-invalid': isEmailInvalid }]"
          />
          <span v-if="isEmailInvalid" class="error-text">Неверный формат email</span>
        </div>

        <label for="password1" class="block text-900 font-medium mb-2">Пароль</label>
        <InputText
          v-model="password"
          :autocomplete="passwordAutocomplete"
          id="password1"
          type="password"
          class="w-full  custom-override"
          placeholder="от 7 символов"
          @blur = "passwordTouched = true"
          :class="['w-full custom-override', { 'input-invalid': isPasswordInvalid }]"
        />
          <span v-if="isPasswordInvalid" class="error-text">Пароль должен быть больше 7 символов</span>
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
<style scoped>
/* Внутренняя красная тень для неоморфизма */
:deep(.input-invalid), 
.input-invalid {
  box-shadow: inset 4px 4px 8px #d1d9e6, 
              inset -4px -4px 8px #ffffff,
              inset 0 0 5px rgba(239, 68, 68, 0.4) !important;
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

/* Текст ошибки под инпутом */
.error-text {
  color: #ef4444;
  font-size: 11px;
  margin-top: 4px;
  margin-left: 4px;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

</style>