<script setup lang="ts">
import type { Transaction } from '../../domain/entities/Transaction';
import ArrayTransactions from '../components/ArrayTransactions.vue';
import { ref, onMounted } from 'vue';
import PopUp from '../components/PopUp.vue';
import Select from 'primevue/select';
import { useTransaction } from '../composables/useTransaction';
import { useUser } from '../composables/useUser';
import Tooltip from 'primevue/tooltip';
import AppMiniButton from '../components/shared/AppMiniButton.vue';
import AppConfirm from '../components/shared/AppConfirm.vue'; 

const isConfirmVisible = ref<boolean>(false);
const vTooltip = Tooltip; 
const {  loadTransactions,
  setFilter,
  selectedMonth,
  availableMonths,
  deleteAllTransactions } = useTransaction();
const { loadUser } = useUser();

const showPopupNew = ref<boolean>(false);
const bufferTransaction = ref<Transaction | null>(null);

onMounted(async () => {
  await loadUser();
  await loadTransactions();
});
</script>

<template>
  <AppConfirm 
  v-model:visible="isConfirmVisible"
  title="Удаление данных"
  message="Вы уверены, что хотите очистить всю историю? Это действие нельзя отменить."
  @accept="deleteAllTransactions"
/>
  <PopUp 
  @bufferTransaction="bufferTransaction = $event" 
  @update="showPopupNew = $event" 
  :show-popup-new="showPopupNew" 
  :buffer-transaction="bufferTransaction || {}" />
  <div class="flex flex-col items-center justify-center min-h-screen">

    <div class="w-full max-w-lg mb-6">
      <!-- Контейнер фильтров -->
      <div class="flex flex-col gap-4 p-4 neumorphism-card rounded-2xl">
        <!-- Выбор месяца -->
        <div class="w-full">
          <label class="block text-xs font-bold opacity-40 mb-2 ml-1 uppercase tracking-wider">Период</label>
          <Select
            v-model="selectedMonth"
            :options="availableMonths"
            optionLabel="label"
            placeholder="Все время"
            showClear
            class="w-full custom-override neumorphism-select h-12"
          />
        </div>

        <!-- Кнопки фильтрации -->
        <div class="w-full">
          <label class="block text-xs font-bold opacity-40 mb-2 ml-1 uppercase tracking-wider">Тип операций</label>
          <div class="flex gap-3">
            <AppMiniButton
              @click="setFilter('income')"
              icon="pi pi-arrow-down-left"
              className="neumorphism-button-primary"
              v-tooltip.bottom="'Доходы'"
            />
           <AppMiniButton
              @click="setFilter('expense')"
              icon="pi pi-arrow-up-right"
              className="neumorphism-button-primary"
              v-tooltip.bottom="'Доходы'"
            />
            <AppMiniButton
              @click="setFilter('all')"
              icon="pi pi-list"
              className="neumorphism-button-primary"
              v-tooltip.bottom="'Доходы'"
            />
          </div>
        </div>
      </div>
    </div>

    <ArrayTransactions
      @bufferTransaction="bufferTransaction = $event"
      @update="showPopupNew = $event"
      :pageType="'transactions'"
      :show-popup-new="showPopupNew"
      :buffer-transaction="bufferTransaction || {}"/>
    
  <!-- Вспомогательные кнопки в ряд -->
  <div class="flex gap-4 w-full max-w-lg mt-8 mb-20 flex-col">
    <div class="flex">
       <Button
        @click="showPopupNew = !showPopupNew"
        label="Новая транзакция"
        type="button"
        icon="pi pi-plus"
        class="flex w-full neumorphism-button-primary"
      />
    </div>
    <div class="flex gap-4">
       <router-link to="/dashboard" class="flex-1">
      <Button
        label="Назад"
        icon="pi pi-home"
        class="w-full neumorphism-button-primary"
      />
    </router-link>
    
    <Button
     @click="isConfirmVisible = true"
      label="Очистить"
      icon="pi pi-trash"
      class="flex-1 neumorphism-button-secondary "
    />
    </div>
   
  </div>
  </div>
  
</template>

<style scoped></style>
