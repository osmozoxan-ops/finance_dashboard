<script setup lang="ts">
import Skeleton from 'primevue/skeleton';

defineProps<{
  loading: boolean
  width?: string;
  height?: string;
  count?: number;
  className?: string;
  shape?: "circle" | "rectangle";
}>();
</script>

<template>
  <template v-if="loading">
    
    <div v-if="count">
       <div v-for="n in count" :key="n" :class="className">
          <Skeleton :width="width || '100%'" :height="height || '64px'" class="m-2 mb-4" />
       </div>
    </div>

    <Skeleton 
      v-else 
      :shape="shape || 'rectangle'" 
      :width="width || '5rem'" 
      :height="height || '2rem'" 
      :class="className" 
    />
  </template>
  
  <slot v-else />
</template>
