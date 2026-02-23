<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useTransaction } from '../composables/useTransaction';
import { useUser } from '../composables/useUser';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import PopUp from '../components/PopUp.vue';
import ArrayTransactions from '../components/ArrayTransactions.vue';
import type { Transaction } from '../../domain/entities/Transaction';
import AppLoader from '../components/shared/AppLoader.vue';
import AppConfirm from '../components/shared/AppConfirm.vue'; 

const isConfirmVisible = ref<boolean>(false);
const router = useRouter();
const {
  loadTransactions,
  totalBalance,
  totalExpenses,
  totalIncome,
  deleteAllTransactions,
  categoryStats,
  isLoading
} = useTransaction();
const { userName, loadUser, signOut } = useUser();


const showPopupNew = ref<boolean>(false);
const bufferTransaction = ref<Transaction | null>(null);

const isChartReady = ref(false);

onMounted(async () => {
  await loadUser();
  await loadTransactions();
  
  // Даем браузеру 100мс, чтобы отрисовать блок после лоадера
  setTimeout(() => {
    isChartReady.value = true;
  }, 100);
});

const signOutMethod = async (): Promise<void> => {
  await signOut();
  router.push('/');
};

// Вычисляем данные для графика
const chartData = computed(() => ({
  labels: categoryStats.value.map(s => s.label),
  datasets: [{
    data: categoryStats.value.map(s => s.total),
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    borderWidth: 2,
    borderColor: '#fff'
  }]
}));

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#495057',
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  },
  cutout: '0%',
  animation: {
    animateScale: true,
    animateRotate: true
  }
});

const hasExpenses = computed(() => {
  return categoryStats.value.some(s => s.total > 0);
});
</script>

<template>
    <AppConfirm 
  v-model:visible="isConfirmVisible"
  title="Удаление данных"
  message="Вы уверены, что хотите очистить всю историю? Это действие нельзя отменить."
  @accept="deleteAllTransactions"
/>
  <!-- Popup для добавления новой транзакции -->
  <PopUp
    @bufferTransaction="bufferTransaction = $event"
    @update="showPopupNew = false"
    :show-popup-new="showPopupNew"
    :buffer-transaction="bufferTransaction || {}"
  />

  <!-- блок с юзером -->
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div class="flex p-8 rounded-lg w-full max-w-lg neumorphism-card m-3 justify-between">
      <div> Добрый день, <br> {{ userName || 'Пользователь' }}</div>
      <Button
        @click="signOutMethod"
        type="button"
        icon="pi pi-sign-out"
        class="neumorphism-button neumorphism-button-secondary w-[50px]! h-[50px]! rounded-full! flex items-center justify-center p-0"
        />
    </div>

    <!-- блок с балансом -->
    <div class="p-8 mb-0 rounded-lg w-full max-w-lg neumorphism-card m-3">
      <p>Общий баланс: </p>
      <AppLoader :loading="isLoading"> 
      <p class="text-2xl">{{ totalBalance }}₽</p>
      </AppLoader>
    </div>
    <div class="flex w-full max-w-lg">
      <div class="p-8 rounded-lg w-full max-w-lg neumorphism-card mr-1.5 mt-3 mb-3 py-6">
        <p class="text-sm">Расходы:</p>
        <AppLoader :loading="isLoading"> 
        <p class="text-lg">{{ totalExpenses }}₽</p>
        </AppLoader>
      </div>
      <div class="p-8 rounded-lg w-full max-w-lg neumorphism-card ml-1.5 mt-3 mb-3 py-6">
        <p class="text-sm">Доходы: </p>
        <AppLoader :loading="isLoading"> 
        <p class="text-lg">{{ totalIncome }}₽</p>
        </AppLoader>
      </div>
    </div>

    <!-- блок графика -->
    <div class="p-4 rounded-lg w-full max-w-lg neumorphism-card mb-2">
      <AppLoader 
      :loading="isLoading" 
      width="100px" 
      height="100px" 
      shape="circle" 
      class-name="mx-auto"
    >
    <div v-if="hasExpenses" >
      <Chart v-if="isChartReady" type="pie" :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="flex items-center justify-center">
      <p>
        Добавите расходы, чтобы увидеть график
      </p>
    </div>
    </AppLoader>
    </div>
<div class="grid grid-cols-2 gap-4 w-full max-w-lg my-4">
  <!-- Кнопка Добавить (Акцентная) -->
  <Button
    @click="showPopupNew = !showPopupNew"
    label="Добавить"
    icon="pi pi-plus"
    class="neumorphism-button-primary h-17 flex flex-col items-center justify-center gap-2"
  >
    <template #icon>
      <i class="pi pi-plus-circle text-xl"></i>
    </template>
  </Button>

  <!-- Кнопка Очистить (Второстепенная) -->
  <Button
    @click="isConfirmVisible = true"
    label="Очистить"
    icon="pi pi-trash"
    class="neumorphism-button-secondary h-17 flex flex-col items-center justify-center gap-2"
  >
    <template #icon>
      <i class="pi pi-trash text-xl"></i>
    </template>
  </Button>
</div>

    <!-- блок транзакций -->
    <ArrayTransactions
      @bufferTransaction="bufferTransaction = $event"
      @update="showPopupNew = $event"
      :pageType="'dashboard'"
      :show-popup-new="showPopupNew"
      :buffer-transaction="bufferTransaction || {}"
    />
    <router-link to="/transactions" class="w-full max-w-lg mb-20">
      <Button
              label="Все транзакции"
              class="p-4 rounded-lg w-full max-w-lg neumorphism-button-primary mt-3 py-6"
            />
    </router-link>
  </div>
</template>

<style scoped></style>