<script lang="ts">
import { defineComponent, ref, onMounted, provide, computed } from 'vue';
import { signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'vue-router';
import { departments } from '@/mocks/departments';

type JsonObject = { [key: string]: any };
type JsonArray = any[];

function getBushoName(busho: unknown): string {
  if (typeof busho !== 'string' && typeof busho !== 'number') return '不明';
  const num = parseInt(String(busho), 10);
  if (isNaN(num)) return '不明';
  const group = Math.floor(num / 1000);
  const ichi = num % 10;
  if (ichi === 1) return `${group}部署（営業）`;
  if (ichi === 2) return `${group}部署（配電）`;
  return `${group}部署（その他）`;
}

export default defineComponent({
  name: 'AppLayout',
  setup() {
    const isSigningOut = ref(false);
    const errorMessage = ref('');
    const currentUser = ref<{
      displayname: string;
      busho: string | number | boolean | JsonObject | JsonArray;
      role?: string;
    } | null>(null);
    const router = useRouter();
    const bushoName = computed(() =>
      currentUser.value ? getBushoName(currentUser.value.busho) : ''
    );
    const isAdmin = computed(() => {
      if (!currentUser.value) return false;
      const userBusho = String(currentUser.value.busho ?? '');
      const dept = departments.find((d) => String(d.code) === userBusho);
      return dept && dept.role === '管理者';
    });

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

    const isAllowedBusho = (busho: string) => {
      const num = parseInt(busho, 10);
      if (isNaN(num)) return false;
      const ichi = num % 10;
      return ichi === 1 || ichi === 2;
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

        const busho =
          session.tokens?.idToken?.payload?.['custom:busho'] ?? '未設定';
        const displayname =
          session.tokens?.idToken?.payload?.['name'] ||
          session.tokens?.idToken?.payload?.['custom:displayname'] ||
          user.username ||
          '未設定';
        const role = session.tokens?.idToken?.payload?.['custom:role'] || '';
        console.log('取得した部署:', busho);
        console.log('取得したdisplayname:', displayname);
        console.log('取得したrole:', role);

        // 許可部署以外は即サインアウト
        if (!isAllowedBusho(String(busho))) {
          await signOut();
          router.push('/login?error=not-allowed');
          return;
        }

        currentUser.value = {
          displayname: String(displayname),
          busho: busho as string | number | boolean | JsonObject | JsonArray,
          role: String(role),
        };
        console.log('設定後のcurrentUser:', currentUser.value);
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
        errorMessage.value =
          'ユーザー情報の取得に失敗しました。もう一度お試しください。';
      }
    };

    onMounted(() => {
      console.log('コンポーネントがマウントされました');
      fetchCurrentUser();
    });

    // currentUserをprovideで子コンポーネントに渡す
    provide('currentUser', currentUser);
    provide('isAdmin', isAdmin);

    return {
      handleSignOut,
      isSigningOut,
      errorMessage,
      currentUser,
      bushoName,
      isAdmin,
    };
  },
});
</script>

<template>
  <div class="app-layout">
    <header class="header">
      <div class="logo">回覧箋システム</div>
      <div class="user-info">
        <div class="user-details">
          <span class="username"
            >ユーザー名: {{ currentUser?.displayname }}</span
          >
          <span class="department">部署: {{ bushoName }}</span>
        </div>
        <button @click="handleSignOut" class="btn-signout">サインアウト</button>
      </div>
    </header>

    <div class="main-content">
      <aside class="sidebar">
        <nav>
          <router-link to="/" class="nav-item" exact>ホーム</router-link>
          <router-link to="/circulars/todo" class="nav-item"
            >工程変更通知</router-link
          >
          <router-link to="/circulars" class="nav-item">回覧箋一覧</router-link>
          <router-link to="/circulars/create" class="nav-item"
            >新規作成</router-link
          >
          <router-link to="/tag-settings" class="nav-item"
            >タグ設定</router-link
          >
          <router-link v-if="isAdmin" to="/circulars/settings" class="nav-item"
            >設定</router-link
          >
        </nav>
      </aside>

      <main class="content">
        <!-- <div class="notification-container">
          <NotificationList />
        </div> -->
        <div class="content-wrapper">
          <div class="content-body">
            <router-view></router-view>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 64px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
}

.logo {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.username {
  font-weight: 500;
  color: #333;
  font-size: 1rem;
}

.department {
  font-size: 0.875rem;
  color: #666;
}

.btn-signout {
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

.btn-signout:hover:not(:disabled) {
  background-color: #106ebe;
}

.btn-signout:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.main-content {
  display: block;
  margin-top: 0;
  margin-left: 250px; /* サイドバー分ずらす */
  width: calc(100vw - 250px);
  height: calc(100vh - 64px);
  background: #fff;
}

.sidebar {
  position: fixed;
  top: 64px; /* ヘッダー分下げる */
  left: 0;
  width: 250px;
  height: calc(100vh - 64px);
  background-color: #fff;
  border-right: 1px solid #e5e5e5;
  padding: 1rem 0;
  overflow-y: auto;
  z-index: 100;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}

.nav-item {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #333;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 4px;
  font-weight: 500;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

.nav-item.router-link-exact-active {
  background-color: #e5f1fb;
  color: #0078d4;
  border-left: 3px solid #0078d4;
}

.content {
  flex: 1;
  padding: 0.5rem 0;
  position: relative;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  background: #fff;
}

.content-wrapper {
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 2.5rem 2rem;
  width: 100%;
  height: 100%;
}

.content-body {
  min-height: 400px;
}

.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 300px;
  z-index: 1000;
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

/* レスポンシブデザイン */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    width: 100vw;
    height: auto;
  }
  .sidebar {
    display: none;
  }
  .content {
    padding: 1.5rem 0;
    min-height: auto;
  }
  .content-wrapper {
    padding: 1.5rem 0.5rem;
    border-radius: 0;
    box-shadow: none;
    height: auto;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .logo {
    font-size: 1.25rem;
  }

  .user-details {
    display: none;
  }

  .btn-signout {
    min-width: auto;
    padding: 0.5rem;
  }

  .sidebar {
    transform: translateX(-100%);
    z-index: 999;
  }

  .sidebar.active {
    transform: translateX(0);
  }

  .content {
    margin-left: 0;
    padding: 1rem 0;
  }

  .content-wrapper {
    padding: 1rem 0.25rem;
    border-radius: 0;
    box-shadow: none;
  }

  .notification-container {
    width: 100%;
    max-width: 300px;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0.75rem;
  }

  .logo {
    font-size: 1.1rem;
  }

  .content {
    padding: 0.5rem 0;
  }

  .content-wrapper {
    padding: 0.5rem 0.1rem;
    border-radius: 0;
    box-shadow: none;
  }

  .page-actions {
    flex-wrap: wrap;
  }
}
</style>
