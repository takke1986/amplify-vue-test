<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { fetchAuthSession } from 'aws-amplify/auth';

export default defineComponent({
  name: 'AuthGuard',
  setup() {
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
    <p class="loading-text">認証状態を確認中...</p>
  </div>
  <router-view v-else-if="isAuthenticated" />
  <div v-else class="auth-required">
    <h2>認証が必要です</h2>
    <p>このページを表示するにはログインが必要です。</p>
    <router-link to="/login" class="login-link">ログインページへ</router-link>
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

.loading-text {
  margin-top: 1rem;
  color: #666;
  font-size: 1.1rem;
}

.login-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #0078d4;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.login-link:hover {
  background-color: #106ebe;
}
</style>
