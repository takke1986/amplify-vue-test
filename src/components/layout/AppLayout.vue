<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AppLayout',
  setup() {
    const isSigningOut = ref(false);
    const errorMessage = ref('');
    const currentUser = ref<{
      username: string;
      busho: string;
    } | null>(null);
    const router = useRouter();

    const handleSignOut = async () => {
      if (isSigningOut.value) return;

      isSigningOut.value = true;
      errorMessage.value = '';

      try {
        await signOut();
        router.push('/login');
      } catch (error) {
        console.error('サインアウトエラー:', error);
        errorMessage.value =
          'サインアウトに失敗しました。もう一度お試しください。';
      } finally {
        isSigningOut.value = false;
      }
    };

    const fetchCurrentUser = async () => {
      try {
        console.log('ユーザー情報の取得を開始します');
        const user = await getCurrentUser();
        console.log('取得したユーザー情報（生データ）:', user);
        console.log('ユーザー名:', user.username);
        console.log('サインイン詳細:', user.signInDetails);
        console.log('すべてのプロパティ:', Object.keys(user));

        // fetchAuthSessionから取得したデータを表示
        const session = await fetchAuthSession();
        console.log('認証セッション:', session);
        console.log('IDトークン:', session.tokens?.idToken);
        console.log('アクセストークン:', session.tokens?.accessToken);
        console.log(
          'IDトークンのペイロード:',
          session.tokens?.idToken?.payload
        );
        console.log(
          'アクセストークンのペイロード:',
          session.tokens?.accessToken?.payload
        );

        if (user && user.username) {
          // セッション情報から部署を取得
          const busho = String(
            session.tokens?.idToken?.payload?.['custom:busho'] || '未設定'
          );
          console.log('取得した部署:', busho);

          currentUser.value = {
            username: user.username,
            busho: busho,
          };
          console.log('設定後のcurrentUser:', currentUser.value);
        } else {
          console.error('ユーザー情報が不完全です:', user);
          errorMessage.value = 'ユーザー情報の取得に失敗しました。';
        }
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
        errorMessage.value = 'ユーザー情報の取得に失敗しました。';
      }
    };

    onMounted(() => {
      console.log('コンポーネントがマウントされました');
      fetchCurrentUser();
    });

    return {
      handleSignOut,
      isSigningOut,
      errorMessage,
      currentUser,
    };
  },
});
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>回覧箋アプリ</h1>
      <div class="header-right">
        <div v-if="currentUser" class="user-info">
          <span class="username">{{ currentUser.username }}</span>
          <span class="employee-id">部署: {{ currentUser.busho }}</span>
        </div>
        <div v-else class="user-info">
          <span class="username">ユーザー情報を読み込み中...</span>
        </div>
        <button
          class="sign-out-button"
          @click="handleSignOut"
          :disabled="isSigningOut"
        >
          <span v-if="isSigningOut" class="loading-spinner"></span>
          {{ isSigningOut ? 'サインアウト中...' : 'サインアウト' }}
        </button>
      </div>
    </header>
    <div class="content-wrapper">
      <nav class="side-menu">
        <ul>
          <li><router-link to="/">ホーム</router-link></li>
          <li><router-link to="/circulars">回覧箋一覧</router-link></li>
          <li><router-link to="/circulars/create">新規作成</router-link></li>
        </ul>
      </nav>
      <main class="main-content">
        <router-view></router-view>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.username {
  font-weight: 500;
  color: #333;
}

.employee-id {
  font-size: 0.875rem;
  color: #666;
}

.sign-out-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  justify-content: center;
  font-weight: 500;
}

.sign-out-button:hover:not(:disabled) {
  background-color: #106ebe;
}

.sign-out-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.content-wrapper {
  display: flex;
  flex: 1;
}

.side-menu {
  width: 250px;
  background-color: #fff;
  border-right: 1px solid #e5e5e5;
  padding: 1rem 0;
}

.side-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.side-menu li {
  margin: 0;
}

.side-menu a {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
}

.side-menu a:hover {
  background-color: #f5f5f5;
}

.side-menu a.router-link-active {
  background-color: #e5f1fb;
  color: #0078d4;
  border-left: 3px solid #0078d4;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #f5f5f5;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  max-width: 1200px;
  margin: 1rem auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
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
</style>
