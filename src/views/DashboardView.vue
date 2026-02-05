<script setup lang="ts">
import { useCollection } from 'vuefire';
import { getAuth, signOut } from 'firebase/auth'
import { getFirestore, setDoc, doc, collection, deleteDoc, updateDoc, orderBy, query } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { ref, computed, watch } from 'vue';
import type { ITransaction } from '../interface';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import PopUp from '../components/PopUp.vue';
import ArrayTransactions from '../components/ArrayTransactions.vue';

// const transaction = ref<boolean>(false);
// const selectedItemLabel = ref<string>('Выберите категорию');
const showPopupNew = ref<boolean>(false);
let bufferTransaction = ref<any>({});

const db = getFirestore();
const isLoading = ref<boolean>(false);

const userName = getAuth().currentUser?.displayName || 'Пользователь';
const userId = getAuth().currentUser?.uid || '';
const allTransaction = useCollection<ITransaction>(query(collection(db, `users/${userId}/transactions`), orderBy('createdAt', 'desc')));

const arrayDataTransaction = ref<ITransaction[]>([]);
watch(allTransaction, (newData) => {
  arrayDataTransaction.value = newData;
}, { immediate: true })

const chartData = computed(() => {
  // Агрегация данных по категориям
  const categoryTotals: Record<string, number> = {
    'Еда': 0,
    'Транспорт': 0,
    'Здоровье': 0,
    'Развлечения': 0,
    'Прочее': 0
  };
  
  // Суммируем транзакции по категориям (только расходы)
  arrayDataTransaction.value.forEach(transaction => {
    if (!transaction.type && categoryTotals[transaction.category] !== undefined) {
      const currentTotal = categoryTotals[transaction.category];
      if (currentTotal !== undefined) {
        categoryTotals[transaction.category] = currentTotal + transaction.transaction;
      }
    }
  });
  
  return {
    labels: ['Еда', 'Транспорт', 'Здоровье', 'Развлечения', 'Прочее'],
    datasets: [
      {
        data: [
          categoryTotals['Еда'],
          categoryTotals['Транспорт'],
          categoryTotals['Здоровье'],
          categoryTotals['Развлечения'],
          categoryTotals['Прочее']
        ],
        backgroundColor: [
          '#FF6384', // Розовый
          '#36A2EB', // Синий
          '#FFCE56', // Желтый
          '#4BC0C0', // Бирюзовый
          '#9966FF' // Фиолетовый'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };
});
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#495057',
        padding: 20,
        usePointStyle: true, // Использовать точки вместо квадратов
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
  cutout: '0%', // Для создания пончика (doughnut) увеличьте процент (например, '50%')
  animation: {
    animateScale: true,
    animateRotate: true
  }
});

const router = useRouter();
const signOutMetod = async(): Promise<void> => {
  await signOut(getAuth())
  router.push('/')
}

const totalTransaction = computed(() => {
  return allTransaction.value.reduce((total, transaction) => {
    return transaction.type ? total + transaction.transaction : total - transaction.transaction;
  }, 0);
})

const totalWastes = computed(() => {
  return allTransaction.value.reduce((total, transaction) => {
    return transaction.type ? total : total + transaction.transaction;
  }, 0);
})
const totalProfit = computed(() => {
  return allTransaction.value.reduce((total, transaction) => {
    return transaction.type == false ? total : total + transaction.transaction;
  }, 0);
})
</script>

<template>
  <!-- Popup для добавления новой транзакции -->
  <PopUp 
  @bufferTransaction="bufferTransaction = $event" 
  @update="showPopupNew = $event" 
  :user-id="userId" 
  :show-popup-new="showPopupNew" 
  :buffer-transaction="bufferTransaction" />

  <!-- блок с юзером -->
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div class="flex p-8 rounded-lg w-full max-w-lg neumorphism-convex m-3 justify-between">
    <div> Добрый день, <br> {{ userName }}</div>
    <Button
    @click="signOutMetod"
    type="button"
    icon="pi pi-sign-out"
    class="c w-[50px]! h-[50px]! rounded-full!"
  />
  </div>

  <!-- блок с балансом -->
    <div class="p-8 mb-0 rounded-lg w-full max-w-lg neumorphism-convex m-3">
      <p>Общая баланс: </p>
      <p class="text-2xl">{{totalTransaction}}₽</p>
    </div>
    <div class="flex w-full max-w-lg">
      <div class="p-8 rounded-lg w-full max-w-lg neumorphism-convex mr-1.5 mt-3 mb-3 py-6">
        <p class="text-sm">Расходы:</p>
        <p class="text-lg">{{totalWastes}}₽</p>
      </div>
      <div class="p-8 rounded-lg w-full max-w-lg neumorphism-convex ml-1.5 mt-3 mb-3 py-6">
        <p class="text-sm">Доходы: </p>
        <p class="text-lg">{{totalProfit}}₽</p>
      </div>
  </div>

  <!-- блок графика -->
  <div class="p-4 rounded-lg w-full max-w-lg neumorphism-convex mb-2">
    <Chart type="pie" :data="chartData" :options="chartOptions" />
  </div>


    <Button
        @click="showPopupNew = !showPopupNew"
        label="Добавить транзакцию"
        type="button"
        icon="pi pi-plus"
        class="p-8 rounded-lg w-full max-w-lg custom-override ml-1.5 mt-3 mb-3 py-6"
      />

    <!-- блок транзакций -->
    <ArrayTransactions
    @bufferTransaction="bufferTransaction = $event" 
    @update="showPopupNew = $event"
    :pageType="'dashboard'"
    :all-transaction="allTransaction"
    :show-popup-new="showPopupNew"
    :buffer-transaction="bufferTransaction"
    :user-id="userId" />
  <router-link to="/transactions" class="w-full max-w-lg mb-20">
    <Button
      label="Все транзакции"
      class="p-4 rounded-lg w-full max-w-lg subtle-button mt-3 py-6"
    />
  </router-link>
  </div>
</template>

<style scoped></style>