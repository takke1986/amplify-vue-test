<template>
  <transition name="toast-fade">
    <div v-if="visible" class="toast-message">
      {{ message }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const message = ref('');
let timer: number | null = null;

function show(msg: string, duration = 3000) {
  message.value = msg;
  visible.value = true;
  if (timer) clearTimeout(timer);
  timer = window.setTimeout(() => {
    visible.value = false;
    message.value = '';
  }, duration);
}

defineExpose({ show });
</script>

<style scoped>
.toast-message {
  position: fixed;
  right: 32px;
  bottom: 32px;
  background: #1976d2;
  color: #fff;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 1.1em;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  min-width: 180px;
  text-align: center;
  pointer-events: none;
}
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}
</style>
