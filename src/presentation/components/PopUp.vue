<script setup lang="ts">
import { TRANSACTION_CATEGORIES, DEFAULT_INCOME_ICON, DEFAULT_EXPENSE_ICON } from '../../domain/constants/Categories';
import { ref, computed, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import SplitButton from 'primevue/splitbutton';
import ToggleSwitch from 'primevue/toggleswitch';
import { useTransaction } from '../composables/useTransaction';
import type { Transaction } from '../../domain/entities/Transaction';

const props = defineProps<{
  showPopupNew: boolean;
  bufferTransaction: Partial<Transaction>;
}>();

const emit = defineEmits<{
  (e: 'update', value: boolean): void;
  (e: 'bufferTransaction', value: Transaction): void;
}>();

const { createTransaction, updateTransaction } = useTransaction();

// ЛОКАЛЬНОЕ СОСТОЯНИЕ (Единственный источник правды для формы)
const isLoading = ref<boolean>(false);
const transaction = ref<boolean>(false);
const transactionMoney = ref<string>('');
const selectedIcon = ref<string>(DEFAULT_EXPENSE_ICON); 
const selectedItemLabel = ref<string>('Выберите категорию');


const resetForm = () => {
  transactionMoney.value = '';
  transaction.value = false;
  selectedItemLabel.value = 'Выберите категорию';
  selectedIcon.value = 'pi pi-apple';
  emit('bufferTransaction', {} as Transaction);
}

const handleAddTransaction = async () => {
  if (disabledSaveButton.value) return;
  isLoading.value = true;
  try {
    await createTransaction({
      transaction: Number(transactionMoney.value),
      type: transaction.value,
      category: transaction.value ? 'Доход' : selectedItemLabel.value,
      icon: selectedIcon.value
    });
    resetForm();
    emit('update', false);
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleEditTransaction = async () => {
  isLoading.value = true;
  try {
    await updateTransaction({
      id: props.bufferTransaction.id || '',
      transaction: Number(transactionMoney.value),
      type: transaction.value,
      category: transaction.value ? 'Доход' : selectedItemLabel.value,
      createdAt: props.bufferTransaction.createdAt || new Date(),
      icon: selectedIcon.value
    });
    resetForm();
    emit('update', false);
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleCategorySelect = (label: string, icon: string) => {
  selectedItemLabel.value = label;
  selectedIcon.value = icon;
};

const items = computed(() => {
  return TRANSACTION_CATEGORIES.map(cat => ({
    label: cat.label,
    icon: cat.icon,
    command: () => handleCategorySelect(cat.label, cat.icon)
  }));
});


const disabledSaveButton = computed(() => {
  const isMoneyInvalid = transactionMoney.value === '' || isNaN(Number(transactionMoney.value));
  
  // Кнопка должна быть выключена, если это расход И категория не выбрана
  const isCategoryInvalid = !transaction.value && selectedItemLabel.value === 'Выберите категорию';

  return isMoneyInvalid || isCategoryInvalid;
});


const bufferPopUp = computed(() => !!props.bufferTransaction?.id);

// Синхронизация: когда открываем попап, копируем данные из пропсов в локальные ref
watch(() => props.showPopupNew, (isOpen) => {
  if (isOpen && bufferPopUp.value) {
    transactionMoney.value = props.bufferTransaction.transaction?.toString() || '';
    transaction.value = props.bufferTransaction.type ?? false;
    selectedIcon.value = props.bufferTransaction.icon || DEFAULT_EXPENSE_ICON;

    selectedItemLabel.value = props.bufferTransaction.type 
    ? 'Выберите категорию' 
    : (props.bufferTransaction.category ?? 'Выберите категорию'); 
  } else if (isOpen) {
    resetForm();
  }
});

watch(transaction, (isIncome) => {
  if (isIncome) {
    selectedIcon.value = DEFAULT_INCOME_ICON;
    selectedItemLabel.value = 'Доход';
  } else {
    selectedItemLabel.value = 'Выберите категорию';
    selectedIcon.value = DEFAULT_EXPENSE_ICON;
  }
});
</script>

<template>
  <div
    v-show="showPopupNew"
    @click="$emit('update', false); resetForm();"
    class="z-50 absolute w-full h-full fixed bg-black/50 flex items-center justify-center"
  >
    <div class="neumorphism-card! bg-[#e0e5ec]! border-none! p-9! rounded-3xl! w-[90vw]! max-w-[400px]!" @click.stop>
      
      <!-- Тип транзакции -->
      <div class="flex flex-col mb-4">
        <span class="block text-900 font-medium mb-2">{{ transaction ? 'Доход' : 'Расход' }}</span>
        <toggle-switch v-model="transaction" class="custom-override" />
      </div>

      <!-- Сумма -->
      <div class="mb-4">
        <label class="block text-900 font-medium mb-2">Сумма</label>
        <InputText
          type="text"
          v-model="transactionMoney"
          placeholder="Введите сумму"
          class="w-full mb-3 custom-override"
        />
      </div>

      <!-- Категория (только для расходов) -->
      <div v-if="!transaction" class="mb-6">
        <label class="block text-900 font-medium mb-2">Категория</label>
        <SplitButton
          :label="selectedItemLabel"
          :model="items"
          class="w-full neumorphism-split-button"
          :pt="{
            root: { class: 'rounded-xl overflow-hidden' },
            pcButton: { 
              root: { class: 'neumorphism-button-primary-split border-none! rounded-r-none! h-12 flex-1' } 
            },
            pcMenuButton: { 
              root: { class: 'neumorphism-button-primary-split border-none! border-l! border-white/20 rounded-l-none! w-12 h-12' } 
            },
            menu: { class: 'neumorphism-select-panel border-none! mt-2' },
            item: { class: 'hover:bg-white/20 rounded-lg m-1' }
          }"
        />
      </div>

      <!-- Кнопки -->
      <Button
              v-if="!bufferPopUp"
              @click="handleAddTransaction"
              :disabled="disabledSaveButton"
              label="Отправить"
              icon="pi pi-check"
              :loading="isLoading"
              class="w-full neumorphism-button neumorphism-button-primary"
            />
            <Button
              v-else
              @click="handleEditTransaction"
              :disabled="disabledSaveButton"
              label="Изменить"
              icon="pi pi-check"
              :loading="isLoading"
              class="w-full neumorphism-button neumorphism-button-primary"
            />
    </div>
  </div>
</template>

<style scoped>
</style>