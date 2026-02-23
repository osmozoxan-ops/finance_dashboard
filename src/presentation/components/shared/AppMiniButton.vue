<script setup lang="ts">

defineProps<{
  icon?: string;
  className?: string;

}>();
</script>

<template>
    <Button
        v-bind="$attrs"
        :icon="icon"
        :class="[
            'rounded-sm! w-10! h-10!', 
        className
    ]"
    />
</template>