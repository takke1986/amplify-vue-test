<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AuthGuard',
  setup() {
    const router = useRouter();
    const isAuthenticated = ref(false);
    const isLoading = ref(true);

    onMounted(async () => {
      try {
        const session = await fetchAuthSession();
        isAuthenticated.value = !!session.tokens?.idToken;
      } catch (error) {
        console.error('認証チェックエラー:', error);
        isAuthenticated.value = false;
      } finally {
        isLoading.value = false;
      }
    });

    return {
      isAuthenticated,
      isLoading,
    };
  },
});
</script>

<template>
  <div v-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
  </div>
  <router-view v-else-if="isAuthenticated" />
  <div v-else class="auth-required">
    <h2>認証が必要です</h2>
    <p>このページを表示するにはログインが必要です。</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.auth-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 20px;
}

.auth-required h2 {
  color: #333;
  margin-bottom: 16px;
}

.auth-required p {
  color: #666;
}
</style>
