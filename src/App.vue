<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useTagStore } from './stores/tagStore';
import { useAuthStore } from './stores/authStore';
import { watch } from 'vue';

const tagStore = useTagStore();
const authStore = useAuthStore();

// ログイン状態の監視
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      // ログイン時にタグデータを読み込む
      await tagStore.fetchTags();
    } else {
      // ログアウト時にタグデータをクリア
      tagStore.clearTags();
    }
  }
);
</script>

<template>
  <RouterView />
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  padding: 20px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
