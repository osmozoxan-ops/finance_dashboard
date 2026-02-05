<script setup lang="ts">
import ArrayTransactions from '../components/ArrayTransactions.vue';
import { useCollection } from 'vuefire';
import { getFirestore, collection, orderBy, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref } from 'vue';
import type { ITransaction } from '../interface';
import PopUp from '../components/PopUp.vue';

const db = getFirestore();
const userId = getAuth().currentUser?.uid || '';
const allTransaction = useCollection<ITransaction>(query(collection(db, `users/${userId}/transactions`), orderBy('createdAt', 'desc')));
const showPopupNew = ref<boolean>(false);
let bufferTransaction = ref<any>({});
</script>

<template>
  <PopUp 
  @bufferTransaction="bufferTransaction = $event" 
  @update="showPopupNew = $event" 
  :user-id="userId" 
  :show-popup-new="showPopupNew" 
  :buffer-transaction="bufferTransaction" />
  <div class="flex flex-col items-center justify-center min-h-screen">
    <ArrayTransactions
      @bufferTransaction="bufferTransaction = $event" 
      @update="showPopupNew = $event"
      :pageType="'transactions'"
      :all-transaction="allTransaction"
      :show-popup-new="showPopupNew"
      :buffer-transaction="bufferTransaction"
      :user-id="userId" />
  </div>
</template>

<style scoped></style>
