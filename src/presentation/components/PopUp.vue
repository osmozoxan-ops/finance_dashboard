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
const isTouched = ref(false);

const resetForm = () => {
  transactionMoney.value = '';
  transaction.value = false;
  selectedItemLabel.value = 'Выберите категорию';
  selectedIcon.value = 'pi pi-apple';
  isTouched.value = false; 
  emit('bufferTransaction', {} as Transaction);
}

const isMoneyInvalid = computed(() => {
  if (!isTouched.value) return false;
  return transactionMoney.value === '' || isNaN(Number(transactionMoney.value)) || Number(transactionMoney.value) <= 0;
});

const isCategoryInvalid = computed(() => {
  if (!isTouched.value) return false;
  return !transaction.value && selectedItemLabel.value === 'Выберите категорию';
});

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
      <div class="mb-4 flex flex-col">
        <label class="block text-900 font-medium mb-2 uppercase text-xs opacity-50">Сумма</label>
        <InputText
          type="text"
          v-model="transactionMoney"
          @blur="isTouched = true" 
          placeholder="Введите сумму"
          :class="['w-full custom-override', { 'input-invalid': isMoneyInvalid }]"
        />
        <span v-if="isMoneyInvalid" class="error-text">Введите корректное число</span>
      </div>

      <!-- Категория (только для расходов) -->
      <div v-if="!transaction" class="mb-6 flex flex-col">
        <label class="block text-900 font-medium mb-2 uppercase text-xs opacity-50">Категория</label>
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
        <span v-if="isCategoryInvalid" class="error-text">Выберите категорию расхода</span>
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