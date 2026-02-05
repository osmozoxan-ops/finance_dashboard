<script setup lang="ts">
import { ref, computed  } from 'vue';
import { getAuth } from 'firebase/auth'
import { setDoc, doc, getFirestore, updateDoc } from 'firebase/firestore';
import type { ITransaction } from '../interface';
import {v4 as uuidv4} from 'uuid';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import SplitButton from 'primevue/splitbutton';

const props = defineProps<{
  showPopupNew: boolean;
  bufferTransaction: any;
  userId: string;
}>();

interface MenuItemCommandEvent {
  originalEvent: Event;
  item: MenuItem;
}
interface MenuItem {
  label: string;
  icon: string;
  command?: (event: MenuItemCommandEvent) => void;
}

const db = getFirestore();
const isLoading = ref<boolean>(false);
const transaction = ref<boolean>(false);
const transactionMoney = ref<string>('');
const selectedIcon = ref<string>('pi pi-apple');
const selectedItemLabel = ref<string>('Выберите категорию');

const items = ref<MenuItem[]>([
  {
    label: 'Еда',
    icon: 'pi pi-apple', 
    command: (event: MenuItemCommandEvent) => {
      if (bufferPopUp.value) {
        props.bufferTransaction.category = event.item.label;
      } else {
        selectedItemLabel.value = event.item.label;
      }
      selectedIcon.value = event.item.icon;
    }
  },
  {
    label: 'Транспорт',
    icon: 'pi pi-car', 
    command: (event: MenuItemCommandEvent) => {
      if (bufferPopUp.value) {
        props.bufferTransaction.category = event.item.label;
      } else {
        selectedItemLabel.value = event.item.label;
      }
      selectedIcon.value = event.item.icon;
    }
  },
  {
    label: 'Здоровье',
    icon: 'pi pi-heart', 
    command: (event: MenuItemCommandEvent) => {
      if (bufferPopUp.value) {
        props.bufferTransaction.category = event.item.label;
      } else {
        selectedItemLabel.value = event.item.label;
      }
      selectedIcon.value = event.item.icon;
    }
  },
  {
    label: 'Развлечения',
    icon: 'pi pi-ticket', 
    command: (event: MenuItemCommandEvent) => {
      if (bufferPopUp.value) {
        props.bufferTransaction.category = event.item.label;
      } else {
        selectedItemLabel.value = event.item.label;
      }
      selectedIcon.value = event.item.icon;
    }
  },
  {
    label: 'Прочее',
    icon: 'pi pi-briefcase', 
    command: (event: MenuItemCommandEvent) => {
      if (bufferPopUp.value) {
        props.bufferTransaction.category = event.item.label;
      } else {
        selectedItemLabel.value = event.item.label;
      }
      selectedIcon.value = event.item.icon;
    }
  }
]);

const disabledSaveButton = computed<boolean>(() => {
  return transactionMoney.value === '' || isNaN(Number(transactionMoney.value));
})

const AddNewTransaction = async(): Promise<void> => {
  if (disabledSaveButton.value) return;
  isLoading.value = true;
  try {
    if(transaction.value){
      selectedIcon.value = 'pi pi-money-bill'
    }
    const payLoad: ITransaction = {
      id: uuidv4(),
      transaction: Number(transactionMoney.value),
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
    transactionMoney.value = '';
    selectedItemLabel.value = 'Выберите категорию';
    selectedIcon.value = 'pi pi-apple';
    
  } catch (error) {
    console.error('Ошибка при сохранении:', error);
  } finally {
    isLoading.value = false;
  }
}

const editDoc = async(docRef: any): Promise<void> => {
  try {
    if(props.bufferTransaction.type){
      selectedIcon.value = 'pi pi-money-bill'
    }
    await updateDoc(docRef, {
      transaction: props.bufferTransaction.transaction,
      type: props.bufferTransaction.type,
      category: selectedItemLabel.value,
      icon: selectedIcon.value
    });
  } catch (error) {
    console.error('Ошибка при редактировании:', error);
  }
}

const bufferPopUp = computed(() => {
  return Object.keys(props.bufferTransaction).length > 0;
})

const isIncome = computed(() => {
  if (bufferPopUp.value) {
    return props.bufferTransaction.type;
  }
  return transaction.value;
});



</script>

<template>
    <div
      v-show="showPopupNew"
      @click="$emit('update', false); $emit('bufferTransaction', {});"
      class="z-50 absolute w-full h-full fixed bg-black/50 flex items-center justify-center"
    >
    <div class="bg-white p-8 rounded-lg w-full max-w-lg neumorphism-convex" @click.stop>
      <!-- блок дохода/расхода -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex flex-col" v-if="bufferPopUp == false">
            <span class="block text-900 font-medium mb-2">{{ transaction ? 'Доход' : 'Расход' }}</span>
            <toggle-switch class="custom-override" @click="transaction = !transaction" />
          </div>
          <div class="flex flex-col" v-else>
            <span class="block text-900 font-medium mb-2">{{ props.bufferTransaction.type ? 'Доход' : 'Расход' }}</span>
            <toggle-switch class="custom-override" v-model="props.bufferTransaction.type" @click="transaction = !transaction" />
          </div>
        </div>

        <!-- блок суммы -->
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2">Сумма</label>
          <div v-if="!bufferPopUp">
          <InputText
            type="text"
            v-model="transactionMoney"
            placeholder="Введите сумму"
            class="w-full mb-3 custom-override"
          />
        </div>
          <div v-else>
            <InputText 
            type="number" 
            v-model.number="props.bufferTransaction.transaction"
            placeholder="Введите сумму"
            class="w-full mb-3 custom-override"
          />
          </div>
        </div>
        

        <!-- блок категории -->
        <div v-if="!isIncome" class="mb-6">
          <label class="block text-900 font-medium mb-2">Категория</label>
          <SplitButton
          v-if="!bufferPopUp"
          :label="selectedItemLabel"
          :model="items"
          class="w-full"
          />
          <SplitButton
          v-else
          :label="props.bufferTransaction.category"
          :model="items"
          class="w-full"
          />
        </div>
        
        <!-- блок кнопок -->
        <div v-if="!bufferPopUp">
          <Button
            @click="AddNewTransaction(), $emit('update', false), selectedItemLabel = 'Выберите категорию';"
            :disabled="disabledSaveButton"
            label="Отправить"
            type="button"
            icon="pi pi-check"
            :loading="isLoading"
            class="w-full custom-override"
          />
        </div>
        <div v-else>
          <Button
          @click="editDoc(doc(db, `users/${userId}/transactions`, bufferTransaction.id)),
          $emit('update', false),
          $emit('bufferTransaction', {}),
          selectedItemLabel = 'Выберите категорию';"
          label="Изменить"
          type="button"
          icon="pi pi-check"
          :loading="isLoading"
          class="w-full custom-override"
          />
        </div>
      </div>
    </div>
</template>

<style scoped>

</style>