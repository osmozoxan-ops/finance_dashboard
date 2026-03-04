<script setup lang="ts">
import { TRANSACTION_CATEGORIES, DEFAULT_EXPENSE_ICON } from '../../domain/constants/Categories';
import { ref, computed, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import ToggleSwitch from 'primevue/toggleswitch';
import { useTransaction } from '../composables/useTransaction';
import type { Transaction } from '../../domain/entities/Transaction';
import type { CategoryItem } from '../../domain/entities/CategoryItem';


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
const selectedCategoryObject = ref<CategoryItem | null>(null);

const resetForm = () => {
  transactionMoney.value = '';
  transaction.value = false;
  
  // Сбрасываем объект для компонента Select
  selectedCategoryObject.value = null; 
  
  // Сбрасываем текстовые метки для логики сохранения
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
      category: transaction.value 
        ? 'Доход' 
        : (selectedCategoryObject.value?.label || 'Выберите категорию'),
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

const onCategoryChange = (event: any) => {
  // Вытаскиваем данные из выбранного объекта
  const { label, icon } = event.value;
  selectedItemLabel.value = label;
  selectedIcon.value = icon;
};

const handleEditTransaction = async () => {
  isLoading.value = true;
  try {
    await updateTransaction({
      id: props.bufferTransaction.id || '',
      transaction: Number(transactionMoney.value),
      type: transaction.value,
      category: transaction.value 
        ? 'Доход' 
        : (selectedCategoryObject.value?.label || 'Выберите категорию'),
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

    if (props.bufferTransaction.type) {
      // 1. Если это ДОХОД — селект должен быть пустым
      selectedCategoryObject.value = null; 
    } else {
    // 2. Если это РАСХОД — собираем объект из буфера
    selectedCategoryObject.value = {
      label: props.bufferTransaction.category ?? 'Выберите категорию',
      icon: props.bufferTransaction.icon ?? DEFAULT_EXPENSE_ICON
    };
}


    
  } else if (isOpen) {
    resetForm();
  }
});

</script>

<template>
  <Dialog
    :visible="showPopupNew" 
    @update:visible="$emit('update', $event)"
    :modal="true" 
    @hide="resetForm" 
    :showHeader="false"
    :dismissableMask="true"
    :closable="false"
    class="neumorphism-card! bg-[#e0e5ec]! border-none! p-6! rounded-3xl! "
    :pt="{
        header: { class: 'hidden' },
        content: { 
          class: 'p-5!' 
        },
    }"
  >
  
    <div class="neumorphism-card! bg-[#e0e5ec]! border-none! rounded-3xl! w-[90vw]! max-w-[330px]!">
      
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
      <div v-if="!transaction"  class="mb-6 flex flex-col">
        <label class="block text-900 font-medium mb-2 uppercase text-xs opacity-50">Категория</label>
        <Select 
          v-model="selectedCategoryObject" 
          :options="items" 
          optionLabel="label"
          placeholder="Выберите категорию"
          class="w-full neumorphism-select-button h-14"
          :pt="{
            root: { 
              class: 'neumorphism-card border-none! flex items-center px-4 cursor-pointer rounded-2xl shadow-sm transition-all active:scale-[0.98]' 
            },
            label: { 
              class: 'flex items-center gap-3 p-0 font-medium text-gray-600' 
            },
            dropdown: { 
              class: 'p-select-dropdown' 
            },
            panel: { 
              class: 'neumorphism-card border-none! mt-2 rounded-2xl p-2 shadow-2xl animate-fade-in' 
            },
            list: { class: 'p-0 flex flex-col gap-1' },
            item: { 
              class: 'rounded-xl m-0 px-4 py-3 transition-all hover:bg-white/40 hover:shadow-inner text-gray-600' 
            }
          }"
          @change="onCategoryChange"
        >
          <!-- Как выглядит ВЫБРАННОЕ значение в кнопке -->
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center gap-3">
              <i :class="[slotProps.value.icon, 'text-blue-500 text-lg']"></i>
              <span class="font-medium text-gray-700">{{ slotProps.value.label }}</span>
            </div>
            <span v-else class="opacity-40">Выберите категорию</span>
          </template>

          <!-- Как выглядят ВАРИАНТЫ в выпадающем списке -->
          <template #option="slotProps">
            <div class="flex items-center gap-3 py-1">
              <i :class="[slotProps.option.icon, 'text-gray-400']"></i>
              <span class="text-sm font-medium text-gray-600">{{ slotProps.option.label }}</span>
            </div>
          </template>
        </Select>
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
  </Dialog>
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