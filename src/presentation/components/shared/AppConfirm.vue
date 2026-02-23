<script setup lang="ts">
import Dialog from 'primevue/dialog';

defineProps<{
  visible: boolean;
  title: string;
  message: string;
}>();

const emit = defineEmits(['update:visible', 'accept', 'reject']);
</script>

<!-- AppConfirm.vue -->
<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal
    :closable="false"
    class="neumorphism-card! bg-[#e0e5ec]! border-none! p-6! rounded-3xl! w-[90vw]! max-w-[400px]!"
    :pt="{
        mask: { class: 'backdrop-blur-sm bg-white/10' },
        header: { class: 'hidden' }
    }"
  >
    <div class="flex flex-col items-center gap-6 text-center ">
      <!-- Иконка -->
      <div class="w-16 h-16 rounded-full neumorphism-soft flex items-center justify-center text-red-500 text-2xl">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
      
      <!-- Текст -->
      <div class="flex flex-col gap-2">
        <h2 class="text-xl font-bold text-gray-700">{{ title }}</h2>
        <p class="text-sm text-gray-500 leading-relaxed">{{ message }}</p>
      </div>

      <!-- СТИЛИЗАЦИЯ КНОПОК -->
      <div class="flex gap-4 w-full px-2">
        <!-- Кнопка отмены (второстепенная) -->
        <Button 
          label="Отмена" 
          class="flex-1 neumorphism-button-primary py-4 rounded-2xl! border-none!" 
          @click="$emit('update:visible', false)"
        />
        <!-- Кнопка подтверждения (опасная) -->
        <Button 
          label="Удалить" 
          class="flex-1 neumorphism-button-secondary py-4 rounded-2xl! border-none!" 
          @click="$emit('accept'); $emit('update:visible', false)"
        />
      </div>
    </div>
  </Dialog>
</template>

