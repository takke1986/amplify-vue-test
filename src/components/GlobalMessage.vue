<template>
  <div v-if="visible" :class="['global-message', type]">
    <span class="material-icons message-icon">{{ icon }}</span>
    <span class="message-text">{{ message }}</span>
    <button class="close-btn" @click="clearMessage">
      <span class="material-icons">close</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMessageStore } from '@/stores/messageStore';

const messageStore = useMessageStore();
const { message, type, visible } = storeToRefs(messageStore);

const icon = computed(() => {
  switch (type.value) {
    case 'success':
      return 'check_circle';
    case 'error':
      return 'error';
    case 'info':
    default:
      return 'info';
  }
});

const clearMessage = () => {
  messageStore.clearMessage();
};
</script>

<style scoped>
.global-message {
  position: relative;
  margin: 0 0 20px 0;
  padding: 1rem 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  font-size: 16pt;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 2px solid #1976d2;
  background: #e3f2fd;
  color: #1976d2;
  gap: 1rem;
}
.global-message.success {
  background: #e8f5e9;
  color: #2e7d32;
  border-bottom: 2px solid #2e7d32;
}
.global-message.error {
  background: #ffebee;
  color: #c62828;
  border-bottom: 2px solid #c62828;
}
.global-message.info {
  background: #e3f2fd;
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
}
.message-icon {
  font-size: 2rem;
  vertical-align: middle;
}
.message-text {
  flex: 1;
  word-break: break-all;
}
.close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.close-btn:hover {
  opacity: 1;
}
</style>
