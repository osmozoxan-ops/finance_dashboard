import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged } from "firebase/auth"

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

import App from '../App.vue'
import router from '../router'
import { useUserStore } from '@/presentation/stores/user'
import { useUser } from '@/presentation/composables/useUser'

// Импорт стилей
import 'primeicons/primeicons.css'
import './style.css'

// Импорт компонентов PrimeVue
import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import ToggleSwitch from 'primevue/toggleswitch'
import SplitButton from 'primevue/splitbutton'
import Chart from 'primevue/chart'
import Paginator from 'primevue/paginator'
import Select from 'primevue/select'

const firebaseConfig = {
  apiKey: "AIzaSyDNkh9SQ5Ji2gWCjb2U-CSEf8umgd29swE",
  authDomain: "finance-dashboard-2c13a.firebaseapp.com",
  projectId: "finance-dashboard-2c13a",
  storageBucket: "finance-dashboard-2c13a.firebasestorage.app",
  messagingSenderId: "19408692906",
  appId: "1:19408692906:web:14391edec128071b5b52d3",
  measurementId: "G-229H1NEERL"
}

// 1. Инициализируем Firebase ПЕРЕД созданием приложения
initializeApp(firebaseConfig)
const auth = getAuth()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(ToastService)

// Настройка кастомной темы
const CustomAura = {
  ...Aura,
  semantic: {
    ...Aura.semantic,
    primary: {
      50: '{sky.50}', 100: '{sky.100}', 200: '{sky.200}', 300: '{sky.300}',
      400: '{sky.400}', 500: '{sky.500}', 600: '{sky.600}', 700: '{sky.700}',
      800: '{sky.800}', 900: '{sky.900}', 950: '{sky.950}'
    }
  }
}

app.use(PrimeVue, {
    theme: {
        preset: CustomAura,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
})

// Глобальная регистрация твоих компонентов
app.component('Button', Button)
app.component('InputText', InputText) 
app.component('Toast', Toast)
app.component('ProgressSpinner', ProgressSpinner)
app.component('toggle-switch', ToggleSwitch)
app.component('split-button', SplitButton)
app.component('chart', Chart)
app.component('paginator', Paginator)
app.component('Select', Select)
app.directive('tooltip', Tooltip)

// 2. ГЛАВНЫЙ ЗАМОК ДЛЯ РОУТЕРА
let isAppMounted = false

// Слушаем состояние авторизации ПЕРЕД тем, как запустить роутер и смонтировать приложение
onAuthStateChanged(auth, async (user) => {
  const userStore = useUserStore();
  const { loadUser } = useUser();

  if (user) {
    userStore.userId = user.uid;
    await loadUser(); // Ждем данные профиля
  } else {
    userStore.userId = '';
  }

  if (!isAppMounted) {
    app.use(router);
    app.mount('#app'); // ТОЛЬКО ЗДЕСЬ лоадер из index.html исчезнет
    isAppMounted = true;
  }
});