<script setup lang="ts">
import type { Transaction } from '../../domain/entities/Transaction';
import { computed, ref, watch } from 'vue';
import { useTransaction } from '../composables/useTransaction';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import AppLoader from './shared/AppLoader.vue';
import { GroupTransactionsByDateUseCase } from '../../domain/use-cases/transaction/GroupTransactionsByDateUseCase';
import AppMiniButton from './shared/AppMiniButton.vue';


// Инициализация инструментов
const groupUseCase = new GroupTransactionsByDateUseCase();
const itemsPerPage = ref(4);
const currentPage = ref(0);

// Получаем данные из хука
const { 
  deleteTransaction,
  recentTransactions,
  getPagedTransactions, 
  filteredTransactions, 
  isLoading 
} = useTransaction();

const props = defineProps<{ 
  showPopupNew: boolean;
  bufferTransaction: Partial<Transaction>;
  pageType: string
}>();

// Основные данные для отображения
const displayData = computed(() => {
  if (props.pageType === 'dashboard') {
    // На дашборде создаем одну группу без заголовка
    return [{
      dateLabel: '',
      transactions: recentTransactions.value
    }];
  }
  
  // На странице транзакций режем на страницы и группируем по датам
  const pageItems = getPagedTransactions(currentPage.value, itemsPerPage.value);
  return groupUseCase.execute(pageItems); 
});

const totalRecords = computed(() => filteredTransactions.value.length);

const emit = defineEmits<{
  (e: 'update', value: boolean): void;
  (e: 'bufferTransaction', value: any): void;
}>();

const onPageChange = (event: any) => {
  currentPage.value = event.page;
  itemsPerPage.value = event.rows;
}

// Если фильтры изменились — возвращаемся на 1-ю страницу
watch(filteredTransactions, () => {
  currentPage.value = 0;
});
</script>

<template>
  <div class="w-full max-w-lg">
    
    <!-- 1. ЛОАДЕР (Скелетоны показываются, пока идет загрузка) -->
    <AppLoader 
      v-if="isLoading" 
      :loading="true" 
      :count="4" 
      height="100px" 
      class-name="m-2" 
    />

    <!-- 2. КОНТЕНТ (Показывается, когда загрузка завершена и есть данные) -->
    <div v-else-if="displayData.length > 0">
      <div v-for="group in displayData" :key="group.dateLabel" class="mb-6">
        
        <!-- Заголовок даты (только для страницы списка) -->
        <div v-if="props.pageType === 'transactions' && group.dateLabel" 
             class="text-sm font-bold opacity-40 px-4 mb-2">
          {{ group.dateLabel }}
        </div>

        <!-- Карточки транзакций -->
        <div
          v-for="transaction in group.transactions"
          :key="transaction.id"
          class="p-4 rounded-lg neumorphism-card m-2 mb-4"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <!-- Иконка категории -->
              <div class="w-12 h-12 rounded flex justify-center items-center neumorphism-soft mr-3 text-xl">
                <i :class="transaction.icon"></i>
              </div>
              
              <!-- Инфо (Сумма и Категория) -->
              <div class="flex flex-col">
                <span :class="transaction.type ? 'text-green-500' : ''">
                  {{ transaction.type ? '+' : '-' }} {{ transaction.transaction }}₽
                </span>
                <span class="text-xs opacity-60">{{ transaction.category }}</span>
              </div>
            </div>

            <!-- Кнопки управления -->
            <div class="flex gap-2">
              <AppMiniButton
              icon="pi pi-pencil"
              className="neumorphism-button-primary"
              @click="$emit('update', true); $emit('bufferTransaction', {...transaction})"
              /> 
              <AppMiniButton
              icon="pi pi-trash"
              className="neumorphism-button-secondary"
              @click="deleteTransaction(transaction.id)"
              /> 
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. ПУСТОЕ СОСТОЯНИЕ (Если загрузка кончилась, а данных нет) -->
    <div v-else class="text-center py-10 opacity-50 font-medium">
       Транзакций пока нет
    </div>

    <!-- 4. ПАГИНАЦИЯ -->
    <Paginator
      v-if="props.pageType === 'transactions' && !isLoading && totalRecords > itemsPerPage"
      :first="currentPage * itemsPerPage"
      :rows="itemsPerPage"
      :totalRecords="totalRecords"
      @page="onPageChange"
      class="mt-3 w-full"
      :pt="{
        root: {
          style: {
            background: '#e0e5ec',
            boxShadow: '5px 5px 10px #c5cad0, -5px -5px 10px #fbffff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            width: '100%'
          }
        },
      }"
    />
  </div>
</template>

<style scoped>
/* Дополнительные правки для кнопок, если они нужны локально */
:deep(.p-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 !important;
}
</style>
