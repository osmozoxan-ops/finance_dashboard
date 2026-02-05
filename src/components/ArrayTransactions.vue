
<script setup lang="ts">
import type { ITransaction } from '../interface';
import { doc, deleteDoc, getFirestore } from 'firebase/firestore';
import { computed, ref } from 'vue';
import Paginator from 'primevue/paginator';

const db = getFirestore();
const selectedItemLabel = ref<string>('Выберите категорию');
const props = defineProps<{
  showPopupNew: boolean;
  allTransaction: ITransaction[];
  bufferTransaction: any;
  userId: string;
  pageType: string
}>();

const itemsPerPage = ref(4);
const currentPage = ref(0);
const totalRecords = computed(() => props.allTransaction.length);

const ArrayTransactions = computed(() => {
  if(props.pageType === 'dashboard'){
    return props.allTransaction.slice(0, 3)
  } else if (props.pageType === 'transactions') {
    const start = currentPage.value * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return props.allTransaction.slice(start, end);
  }
})

const emit = defineEmits<{
  (e: 'update', value: boolean): void;
  (e: 'bufferTransaction', value: any): void;
}>();

const delDoc = async(docRef: any): Promise<void> => {
  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Ошибка при удалении:', error);
  }
}

const onPageChange = (event: any) => {
  currentPage.value = event.page;
  itemsPerPage.value = event.rows;
}
</script>

<template>
  <div class="p-4 rounded-lg w-full max-w-lg neumorphism-convex m-2" v-for="transaction in ArrayTransactions" :key="transaction.id">
      <div class="p-4" >
        <div class="flex mb-4 justify-between">
          <div class="flex">
            <div class="w-20 h-20 rounded-sm flex justify-center items-center neumorphism-soft">
              <i :class="transaction.icon" class="text-2xl!"></i>
            </div>
            <div class="ml-3 flex justify-center flex-col gray-400">
              <div class="m-1 text-lg">
                <span :class="transaction.type ? 'text-green-500' : ''">
                  {{ transaction.type ? '+ ' : '- ' }}{{ transaction.transaction }}₽
                </span>
              </div>
              <div class="text-sm text-gray-600">
                <div v-if="transaction.icon == 'pi pi-money-bill'">
                  Пополнение
                </div>
                <div v-else>
                  {{ transaction.category }}
                </div>
              </div>
              <div class="text-sm text-gray-600">
                {{ transaction.createdAt.toDate().toLocaleString('ru-RU') }}
              </div>
            </div>
          </div>
          <Button
            class="mr-2 custom-override h-[40px]"
            @click="delDoc(doc(db, `users/${userId}/transactions`, transaction.id))"
            type="button"
            icon="pi pi-trash"
          />
        </div>
        <div>
          <Button
            class="mr-3 custom-override"
            @click="$emit('update', true);
            $emit('bufferTransaction', {...transaction});
             selectedItemLabel = transaction.category"
            type="button"
            icon="pi pi-pencil"
            label="Редактировать"
          />
        </div>
      </div>
    </div>
    <Paginator v-if="props.pageType === 'transactions'"
    :rows="itemsPerPage"
    :totalRecords="totalRecords"
    :rowsPerPageOptions="[2, 4, 6, 8]"
    @page="onPageChange"
    class="mt-3 w-full max-w-lg"></Paginator>
</template>

<style scoped>
</style>
