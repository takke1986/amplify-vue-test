<script lang="ts">
import { defineComponent } from 'vue';
import { signInWithRedirect } from 'aws-amplify/auth';

export default defineComponent({
  name: 'Login',
  setup() {
    const handleLogin = async () => {
      try {
        await signInWithRedirect({
          provider: { custom: 'MicrosoftEntraIDSAML' },
          options: {
            preferPrivateSession: false,
            lang: 'ja',
          },
        });
      } catch (error) {
        console.error('ログインエラー:', error);
      }
    };

    return {
      handleLogin,
    };
  },
});
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1>回覧箋アプリ</h1>
      <p>Microsoft Entra IDでログインしてください</p>
      <button class="login-button" @click="handleLogin">
        <svg
          class="ms-logo"
          viewBox="0 0 23 23"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#f3f3f3" d="M0 0h23v23H0z"></path>
          <path fill="#f35325" d="M1 1h10v10H1z"></path>
          <path fill="#81bc06" d="M12 1h10v10H12z"></path>
          <path fill="#05a6f0" d="M1 12h10v10H1z"></path>
          <path fill="#ffba08" d="M12 12h10v10H12z"></path>
        </svg>
        Microsoft Entra ID でサインイン
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #106ebe;
}

.ms-logo {
  margin-right: 0.5rem;
}
</style>
