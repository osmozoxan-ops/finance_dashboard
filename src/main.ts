import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initializeApp } from "firebase/app"

import PrimeVue from 'primevue/config'
import App from './views/App.vue'
import router from './router'
import Aura from '@primeuix/themes/aura';

import 'primeicons/primeicons.css';

import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import ToggleSwitch from 'primevue/toggleswitch'
import SplitButton from 'primevue/splitbutton'
import Chart from 'primevue/chart';


const firebaseConfig = {
  apiKey: "AIzaSyDNkh9SQ5Ji2gWCjb2U-CSEf8umgd29swE",
  authDomain: "finance-dashboard-2c13a.firebaseapp.com",
  projectId: "finance-dashboard-2c13a",
  storageBucket: "finance-dashboard-2c13a.firebasestorage.app",
  messagingSenderId: "19408692906",
  appId: "1:19408692906:web:14391edec128071b5b52d3",
  measurementId: "G-229H1NEERL"
}

// Initialize Firebase
initializeApp(firebaseConfig)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ToastService)
// Создаем кастомизированную тему на основе Aura с голубым цветом
const CustomAura = {
  ...Aura,
  semantic: {
    ...Aura.semantic,
    primary: {
      ...Aura.semantic.primary,
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}'
    }
  }
};

// Используем PrimeVue (после router)
app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        preset: CustomAura,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
});

// Регистрируем компоненты глобально
app.component('Button', Button)
app.component('InputText', InputText) 
app.component('Toast', Toast)
app.component('ProgressSpinner', ProgressSpinner)
app.component('toggle-switch', ToggleSwitch)
app.component('split-button', SplitButton)
app.component('chart', Chart)
app.mount('#app')
