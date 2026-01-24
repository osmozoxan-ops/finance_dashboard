<script setup lang="ts">
import { useCollection } from 'vuefire';
import { getAuth, signOut } from 'firebase/auth'
import { getFirestore, setDoc, doc, collection, deleteDoc, updateDoc, orderBy, query } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { ref, computed, watch } from 'vue';
import type { ITransaction } from '../interface';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import SplitButton from 'primevue/splitbutton';
import Chart from 'primevue/chart';
import ToggleSwitch from 'primevue/toggleswitch';
import {v4 as uuidv4} from 'uuid';

// Интерфейс для события, которое передает ToggleSwitch
interface ToggleSwitchEvent {
  originalEvent: Event;
  value: boolean;
}

// Интерфейс для события, которое передает SplitButton
interface MenuItemCommandEvent {
  originalEvent: Event;
  item: MenuItem;
}

interface MenuItem {
  label: string;
  icon: string;
  command?: (event: MenuItemCommandEvent) => void;
}

const selectedItemLabel = ref<string>('Выберите категорию');
const selectedIcon = ref<string>('pi pi-apple');

const showPopup = ref<boolean>(false);
const showPopupNew = ref<boolean>(false);
let bufferTransaction = ref<any>({});

const db = getFirestore();
const isLoading = ref<boolean>(false);
const transactionMoney = ref<number>(0);
const transaction = ref<boolean>(false);
const items = ref<MenuItem[]>([
  {
    label: 'Еда',
    icon: 'pi pi-apple', 
    command: (event: MenuItemCommandEvent) => {
      selectedItemLabel.value = event.item.label;
      selectedIcon.value = event.item.icon;
    }
  },
  {
    label: 'Транспорт',
    icon: 'pi pi-car', 
    command: (event: MenuItemCommandEvent) => {
      selectedItemLabel.value = event.item.label;
      selectedIcon.value = event.item.icon;
    }
  },
  {
    label: 'Прочее',
    icon: 'pi pi-briefcase', 
    command: (event: MenuItemCommandEvent) => {
      selectedItemLabel.value = event.item.label;
      selectedIcon.value = event.item.icon;
    }
  }
]);

const userId = getAuth().currentUser?.uid;
const allTransaction = useCollection<ITransaction>(query(collection(db, `users/${userId}/transactions`), orderBy('createdAt', 'desc')));

const arrayDataTransaction = ref<ITransaction[]>([]);
watch(allTransaction, (newData) => {
  arrayDataTransaction.value = newData;
}, { immediate: true })

const chartData = computed(() => {
  // Агрегация данных по категориям
  const categoryTotals: Record<string, number> = {
    'Едаа': 0,
    'Транспорт': 0,
    'Прочее': 0
  };
  
  // Суммируем транзакции по категориям (только расходы)
  arrayDataTransaction.value.forEach(transaction => {
    if (!transaction.type && categoryTotals[transaction.category] !== undefined) {
      categoryTotals[transaction.category] += transaction.transaction;
    }
  });
  
  return {
    labels: ['Еда', 'Транспорт', 'Прочее'],
    datasets: [
      {
        data: [
          categoryTotals['Еда'],
          categoryTotals['Транспорт'],
          categoryTotals['Прочее']
        ],
        backgroundColor: [
          '#FF6384', // Розовый
          '#36A2EB', // Синий
          '#FFCE56', // Желтый
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
      position: 'top',
      labels: {
        color: '#495057',
        padding: 20,
        usePointStyle: true, // Использовать точки вместо квадратов
        pointStyle: 'circle',
        font: {
          size: 14
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
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

const disabledSaveButton = computed<boolean>(() => {
  return transactionMoney.value === 0 ;
})

const AddNewTransaction = async(): Promise<void> => {
  if (disabledSaveButton.value) return;
  isLoading.value = true;
  try {
    const payLoad: ITransaction = {
      id: uuidv4(),
      transaction: transactionMoney.value,
      type: transaction.value,
      category: selectedItemLabel.value,
      createdAt: new Date(),
      icon: selectedIcon.value
    };
    
    const userId = getAuth().currentUser?.uid;
    if (userId) {
      await setDoc(doc(db, `users/${userId}/transactions`, payLoad.id), payLoad)
    }
    
    // Сброс формы
    transactionMoney.value = 0;
    selectedItemLabel.value = 'Выберите категорию';
    selectedIcon.value = 'pi pi-apple';
    
  } catch (error) {
    console.error('Ошибка при сохранении:', error);
  } finally {
    isLoading.value = false;
  }
}

const delDoc = async(docRef: any): Promise<void> => {
  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Ошибка при удалении:', error);
  }
}


const editDoc = async(docRef: any): Promise<void> => {
  try {
    await updateDoc(docRef, {
      transaction: bufferTransaction.value.transaction,
      type: bufferTransaction.value.type,
      category: selectedItemLabel.value,
    });
  } catch (error) {
    console.error('Ошибка при редактировании:', error);
  }
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
     <Chart type="pie" :data="chartData" :options="chartOptions" />
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div class="flex p-8 rounded-lg w-full max-w-md neumorphism-convex m-3">
    <div> Добрый день, {{ userId }}</div>
    <Button
    @click="signOutMetod"
    type="button"
    icon="pi pi-sign-out"
    class="w-[50px]! h-[50px]! p-0! rounded-full! neumorphism-convex bg-[#e0e5ec]! text-blue-50!"
  />
  </div>

    <div class="p-8 mb-0 rounded-lg w-full max-w-md neumorphism-convex m-3">
      <p>Общая баланс: </p>
      <p class="text-2xl">{{totalTransaction}}₽</p>
    </div>
    <div class="flex w-full max-w-md">
      <div class=" p-8 rounded-lg w-full max-w-md neumorphism-convex mr-1.5 mt-3 mb-3 py-6">
        <p class="text-sm">Расходы:</p>
        <p class="text-lg">{{totalWastes}}₽</p>
      </div>
      <div class="p-8 rounded-lg w-full max-w-md neumorphism-convex ml-1.5 mt-3 mb-3 py-6">
        <p class="text-sm">Доходы: </p>
        <p class="text-lg">{{totalProfit}}₽</p>
      </div>
  </div>

    <Button
        @click="showPopupNew = !showPopupNew"
        label="Добавить транзакцию"
        type="button"
        icon="pi pi-plus"
        class="p-8 rounded-lg w-full max-w-md neumorphism-convex ml-1.5 mt-3 mb-3 py-6"
      />

    <div class="p-4 rounded-lg w-full max-w-md neumorphism-convex m-2" v-for="transaction in allTransaction" :key="transaction.id">
      <div class="p-4" >
        <div class="flex mb-4 ">
          <div class="w-12 h-12 bg-gray-100 rounded-sm flex justify-center items-center">
            <i :class="transaction.icon"></i>
          </div>
          <div class="ml-3 flex justify-between flex-col gray-400">
            <div>
              <div class="text-lg">
              <span v-if="transaction.type == false">-</span>
              <span v-else>+</span>
              {{ transaction.transaction }}₽ 
            </div>
            </div>
            <div class="text-sm text-gray-600">
              {{ transaction.category }}
            </div>
            <div class="text-sm text-gray-600">
              {{ transaction.createdAt.toDate() }}
            </div>
          </div>
        </div>
        <div>
          <Button
            class="mr-2 neumorphism-convex"
            @click="showPopup = !showPopup, bufferTransaction = {...transaction}, selectedItemLabel = transaction.category"
            type="button"
            icon="pi pi-pencil"
            label="Редактировать"
          />
          <Button
            class="mr-2 neumorphism-convex"
            @click="delDoc(doc(db, `users/${userId}/transactions`, transaction.id))"
            type="button"
            icon="pi pi-trash"
            label="Удалить"
          />
        </div>
      </div>
      
      
    </div>

    <!-- Popup для редактирования транзакции -->
    <div 
      v-show="showPopup" 
      @click="showPopup = false" 
      class="absolute w-full h-full fixed bg-black/50 flex items-center justify-center"
    >
      <div class="bg-white p-8 rounded-lg w-full max-w-md" @click.stop>
        <label class="block text-900 font-medium mb-2">Тип операции</label>
        <div class="flex items-center gap-2 mb-4">
          <span>{{ bufferTransaction.type ? 'Расход' : 'Доход' }}</span>
          <toggle-switch v-model="bufferTransaction.type" />
        </div>
        
        <label class="block text-900 font-medium mb-2">Сумма</label>
        <InputText 
          type="number" 
          v-model.number="bufferTransaction.transaction"
          placeholder="Введите сумму"
          class="w-full mb-4"
        />

        <label class="block text-900 font-medium mb-2">Категория</label>
        <SplitButton 
          :label="selectedItemLabel"
          :model="items" 
          class="w-full mb-4"
        />
        
        <Button
          @click="editDoc(doc(db, `users/${userId}/transactions`, bufferTransaction.id)), showPopup = false, selectedItemLabel = 'Выберите категорию';"
          label="Изменить"
          type="button"
          icon="pi pi-check"
          :loading="isLoading"
          class="w-full"
        />
      </div>
    </div>
    
    <!-- Popup для добавления новой транзакции -->
    <div 
      v-show="showPopupNew" 
      @click="showPopupNew = false" 
      class="absolute w-full h-full fixed bg-black/50 flex items-center justify-center"
    >
      <div class="bg-white p-8 rounded-lg w-full max-w-md" @click.stop>
        <label class="block text-900 font-medium mb-2">Тип операции</label>
        <div class="flex items-center gap-2 mb-4">
          <span>{{ transaction ? 'Расход' : 'Доход' }}</span>
          <toggle-switch @click="transaction = !transaction" />
        </div>
        
        <label class="block text-900 font-medium mb-2">Сумма</label>
        <InputText 
          type="number" 
          v-model.number="transactionMoney"
          placeholder="Введите сумму"
          class="w-full mb-4"
        />

        <label class="block text-900 font-medium mb-2">Категория</label>
        <SplitButton 
          :label="selectedItemLabel"
          :model="items" 
          class="w-full mb-4"
        />
        
        <Button
          @click="AddNewTransaction(), showPopupNew = false, selectedItemLabel = 'Выберите категорию';"
          :disabled="disabledSaveButton"
          label="Отправить"
          type="button"
          icon="pi pi-check"
          :loading="isLoading"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>