<template>
  <div class="todo-detail-container">
    <GlobalMessage />
    <!-- 読み込み中表示 -->
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>読み込み中...</p>
    </div>
    <div v-else>
      <div class="header">
        <h2>工程変更通知の詳細</h2>
        <router-link to="/todos" class="btn-back"> 一覧に戻る </router-link>
      </div>

      <div v-if="notification" class="detail-content">
        <div class="detail-item">
          <h2 class="label">タイトル</h2>
          <span class="value">{{ notification.circularTitle }}</span>
        </div>
        <div class="detail-item">
          <h2 class="label">変更内容</h2>
          <div class="value">
            <span class="process-badge">{{
              getFromProcess(notification.changeDescription)
            }}</span>
            <span class="process-arrow">→</span>
            <span class="process-badge">{{
              getToProcess(notification.changeDescription)
            }}</span>
          </div>
        </div>
        <div class="detail-item">
          <h2 class="label">担当者</h2>
          <span class="value">{{ notification.assignee }}</span>
        </div>
        <div class="detail-item">
          <h2 class="label">期限</h2>
          <span class="value">{{ formatDateOnly(notification.dueDate) }}</span>
        </div>
        <div class="detail-item">
          <h2 class="label">ステータス</h2>
          <span class="value">
            <span class="status-badge" :class="notification.status">
              {{ getStatusText(notification.status) }}
            </span>
          </span>
        </div>
        <div class="detail-item">
          <h2 class="label">ステータス変更日</h2>
          <span class="value">{{
            formatDateOnly(notification.statusChangedAt)
          }}</span>
        </div>
        <div class="detail-item todo-messages">
          <h2 class="label">確認事項</h2>
          <div class="value">
            <template
              v-if="getTodoMessagesForNotification(notification).length"
            >
              <ul class="todo-message-list">
                <li
                  v-for="(msg, i) in getTodoMessagesForNotification(
                    notification
                  )"
                  :key="i"
                  class="todo-message-label2"
                >
                  <template v-if="typeof msg === 'object' && msg !== null">
                    <div class="todo-message-title">
                      {{ (msg as any).title }}
                    </div>
                    <div class="todo-message-body">{{ (msg as any).body }}</div>
                  </template>
                  <template v-else>
                    <div class="todo-message-title">{{ msg }}</div>
                  </template>
                </li>
              </ul>
            </template>
            <template v-else>
              <span class="no-messages">確認事項はありません</span>
            </template>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn view" @click="viewCircular">
          回覧箋を表示
        </button>
        <button class="action-btn status" @click="openStatusModal">
          ステータスを更新
        </button>
      </div>

      <!-- ステータス更新モーダル -->
      <div
        v-if="showStatusModal"
        class="modal-overlay"
        @click="closeStatusModal"
      >
        <div class="modal-content" @click.stop>
          <h3>ステータスの更新</h3>
          <div class="status-options">
            <button
              v-for="status in statusOptions"
              :key="status"
              :class="['status-option', { selected: newStatus === status }]"
              @click="newStatus = status"
            >
              {{ getStatusText(status) }}
            </button>
          </div>
          <div class="modal-actions">
            <button class="btn-submit btn-primary" @click="updateStatus">
              更新する
            </button>
            <button class="btn-submit btn-secondary" @click="closeStatusModal">
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useTagSettingsStore } from '@/stores/tagSettings';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { TagSetting, ProcessSetting } from '@/stores/tagSettings';
import GlobalMessage from '@/components/GlobalMessage.vue';
import { useMessageStore } from '@/stores/messageStore';

interface Notification {
  id: string;
  circularId: string;
  circularTitle: string;
  status: 'pending' | 'in_progress' | 'completed';
  statusText: string;
  changeDescription: string;
  actionRequired: string;
  assignee: string;
  dueDate: string;
  statusChangedAt: string;
  createdAt: string;
  updatedAt: string;
}

const route = useRoute();
const router = useRouter();
const client = generateClient<Schema>();
const notification = ref<Notification | null>(null);

const isLoading = ref(true);

// 通知データの取得
const fetchNotification = async () => {
  try {
    isLoading.value = true;
    const notificationId = route.params.id as string;
    const { data, errors } = await client.models.Notification.get({
      id: notificationId,
    });

    if (errors || !data) {
      console.error('通知データの取得に失敗しました:', errors);
      alert('通知データの取得に失敗しました。');
      return;
    }

    // Circularデータを取得してタイトルを設定
    const { data: circularData } = await client.models.Circular.get({
      id: data.circularId || '',
    });

    notification.value = {
      id: data.id || '',
      circularId: data.circularId || '',
      circularTitle: circularData?.title || 'タイトルなし',
      status:
        (data.status as 'pending' | 'in_progress' | 'completed') || 'pending',
      statusText: data.statusText || '',
      changeDescription: data.changeDescription || '',
      actionRequired: data.actionRequired || '',
      assignee: data.assignee || '',
      dueDate: data.dueDate || '',
      statusChangedAt: data.statusChangedAt || '',
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || '',
    };
  } catch (error) {
    console.error('通知データの取得に失敗しました:', error);
    alert('通知データの取得に失敗しました。');
  } finally {
    isLoading.value = false;
  }
};

const statusOptions = ['pending', 'in_progress', 'completed'] as const;
type StatusType = (typeof statusOptions)[number];

// ステータス更新モーダル用の状態
const showStatusModal = ref(false);
const newStatus = ref<StatusType>('pending');

// ステータス更新モーダルを開く
const openStatusModal = () => {
  if (!notification.value) return;
  newStatus.value = notification.value.status;
  showStatusModal.value = true;
};

// ステータス更新モーダルを閉じる
const closeStatusModal = () => {
  showStatusModal.value = false;
};

// ステータスを更新
const updateStatus = async () => {
  if (!notification.value) return;

  try {
    const { errors } = await client.models.Notification.update({
      id: notification.value.id,
      status: newStatus.value,
      statusText: getStatusText(newStatus.value),
      statusChangedAt: new Date().toISOString(),
    });

    if (errors) {
      console.error('ステータスの更新に失敗しました:', errors);
      return;
    }

    // ローカルのデータを更新
    if (notification.value) {
      notification.value = {
        ...notification.value,
        status: newStatus.value,
        statusText: getStatusText(newStatus.value),
        statusChangedAt: new Date().toISOString(),
      };
    }
    // グローバル通知に識別番号(ID)を表示
    messageStore.setMessage(
      `識別番号: ${notification.value.id} を更新しました`
    );
    closeStatusModal();
  } catch (error) {
    console.error('ステータスの更新に失敗しました:', error);
  }
};

// ステータスに応じたテキストを取得
const getStatusText = (status: StatusType): string => {
  switch (status) {
    case 'pending':
      return '未対応';
    case 'in_progress':
      return '対応中';
    case 'completed':
      return '確認済み';
    default:
      return '未対応';
  }
};

// 回覧箋表示処理
const viewCircular = async () => {
  if (!notification.value) return;

  try {
    // 回覧箋の存在確認
    const { data, errors } = await client.models.Circular.get({
      id: notification.value.circularId,
    });

    if (errors || !data) {
      alert('回覧箋が見つかりませんでした。');
      return;
    }

    router.push({
      name: 'circular-detail',
      params: { id: notification.value.circularId },
    });
  } catch (error) {
    console.error('回覧箋の取得に失敗しました:', error);
    alert('回覧箋の取得に失敗しました。');
  }
};

const formatDateOnly = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// 変更前の工程を抽出する関数
const getFromProcess = (description: string): string => {
  const match = description.match(/(.*?)工程から/);
  return match ? match[1] + '工程' : '';
};

// 変更後の工程を抽出する関数
const getToProcess = (description: string): string => {
  const match = description.match(/から(.*?)工程/);
  return match ? match[1] : '';
};

// 工程名から工程番号を取得する関数
const getProcessNumber = (processName: string): number => {
  const processMap: { [key: string]: number } = {
    起案: 1,
    確認: 2,
    承認: 3,
    決裁: 4,
    配布: 5,
    受領: 6,
    処理: 7,
    完了: 8,
    保管: 9,
    回収: 10,
    再確認: 11,
    再承認: 12,
    再決裁: 13,
    変更承認: 14,
    最終完了: 15,
  };
  return processMap[processName] || 0;
};

const tagSettingsStore = useTagSettingsStore();
const { tagSettings } = storeToRefs(tagSettingsStore);

// タグ設定を取得する関数
const fetchTagSettings = async () => {
  try {
    const { data, errors } = await client.models.Tag.list();
    if (errors) {
      console.error('タグ設定の取得に失敗:', errors);
      return;
    }

    // processSettingsをJSONとしてパース
    const parsedTags: TagSetting[] = data.map((tag) => ({
      id: tag.id || '',
      name: tag.name || '',
      color: tag.color || '',
      processSettings: JSON.parse(tag.processSettings || '[]'),
      createdBy: tag.createdBy || '',
      createdAt: tag.createdAt || '',
    }));

    tagSettingsStore.setTagSettings(parsedTags);
    console.log('タグ設定の取得完了:', parsedTags);
  } catch (error) {
    console.error('タグ設定の取得に失敗:', error);
  }
};

// コンポーネントマウント時の処理
onMounted(async () => {
  try {
    await fetchTagSettings();
    await fetchNotification();
    console.log('通知データの取得完了:', notification.value);
    console.log('タグ設定:', tagSettings.value);
  } catch (error) {
    console.error('データの取得に失敗:', error);
  }
});

// 通知に該当するTodo文言リストを取得
function getTodoMessagesForNotification(notification: Notification): string[] {
  if (!notification || !notification.changeDescription) {
    console.log('通知データが不正です');
    return [];
  }

  // 設定後の工程名を取得
  const toProcess = getToProcess(notification.changeDescription).trim();
  const processNumber = getProcessNumber(toProcess);
  console.log('対象工程名:', toProcess, '工程番号:', processNumber);
  console.log('タグ設定:', tagSettings.value);

  // 各タグの該当工程のTodo文言を集める
  const result: string[] = [];
  if (!tagSettings.value || tagSettings.value.length === 0) {
    console.log('タグ設定が取得できていません');
    return [];
  }

  tagSettings.value.forEach((tag: TagSetting) => {
    console.log('タグ名:', tag.name);
    if (!tag.processSettings) {
      console.log('工程設定がありません:', tag.name);
      return;
    }

    tag.processSettings.forEach((ps: ProcessSetting) => {
      console.log('工程設定:', ps.process, 'Todo文言:', ps.todoMessages);
      // 工程番号で比較
      if (ps.process === processNumber) {
        console.log('工程番号一致:', ps.process);
        if (Array.isArray(ps.todoMessages)) {
          ps.todoMessages.forEach((msg: string) => {
            if (msg && msg.trim()) {
              console.log('追加する文言:', msg);
              result.push(msg);
            }
          });
        }
      }
    });
  });
  console.log('最終的な結果:', result);
  return result;
}

const messageStore = useMessageStore();
</script>

<style scoped>
.todo-detail-container {
  max-width: 1600px;
  margin: 0.5rem auto 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 2rem 2.5rem 2rem;
  min-height: 100vh;
  font-size: 16pt;
}

.loading {
  text-align: center;
  padding: 3rem 0;
}
.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

h2 {
  margin: 0;
  font-size: 16pt;
  color: #222;
  font-weight: 700;
}

.btn-back {
  padding: 0.5rem 1rem;
  background-color: #9e9e9e;
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
  font-size: 16pt;
  transition: background-color 0.2s;
}

.btn-back:hover {
  background-color: #757575;
}

.detail-content {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.detail-item {
  display: flex;
  margin-bottom: 1.8rem;
  font-size: 16pt;
  align-items: flex-start;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  font-weight: 700;
  color: #1565c0;
  width: 140px;
  flex-shrink: 0;
  font-size: 1.3em;
  margin: 0 0.7em 0 0;
  padding: 0.5rem 0 0 0;
  line-height: 1.2;
}

.detail-item h2.label {
  font-size: 1.3em;
  font-weight: 700;
  color: #1565c0;
  margin: 0 0.7em 0 0;
  padding: 0.5rem 0 0 0;
  width: 140px;
  flex-shrink: 0;
  line-height: 1.2;
}

.detail-item .value {
  color: #1f2937;
  flex-grow: 1;
  padding: 0.5rem 0;
  font-size: 1em;
  white-space: nowrap;
}

.process-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 16pt;
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
  white-space: nowrap;
  font-weight: 600;
}

.process-arrow {
  margin: 0 1rem;
  color: #9e9e9e;
  font-weight: bold;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge.pending {
  background-color: #e67a00;
  color: white;
}

.status-badge.in_progress {
  background-color: #1976d2;
  color: white;
}

.status-badge.completed {
  background-color: #008080;
  color: white;
}

.todo-message-list {
  margin: 0.5em 0 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.todo-message-label2 {
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 14pt;
  font-weight: 500;
  margin: 0;
  padding: 0.5em 1em;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: none;
  border: none;
  transition: none;
}

.todo-message-title {
  font-weight: bold;
  font-size: 15pt;
  margin-bottom: 0.2em;
}

.todo-message-body {
  font-size: 13pt;
  color: #1f2937;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.action-btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 16pt;
  min-width: 180px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn.view {
  background-color: #1976d2;
  color: white;
  border: 2px solid #1976d2;
}

.action-btn.status {
  background-color: #e67a00;
  color: white;
  border: 2px solid #e67a00;
}

.action-btn.view:hover {
  background-color: #1565c0;
  border-color: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.status:hover {
  background-color: #d35400;
  border-color: #d35400;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ステータス更新モーダル用のスタイル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  min-width: 500px;
  max-width: 600px;
}

.modal-content h3 {
  font-size: 16pt;
  color: #1976d2;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.status-option {
  padding: 1rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 16pt;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  color: #424242;
}

.status-option.selected {
  border-color: #1976d2;
  background: #e3f2fd;
  color: #1976d2;
}

.status-option:hover {
  border-color: #1976d2;
  transform: translateY(-1px);
  background: #f5f5f5;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.modal-actions button {
  min-width: 180px;
  padding: 0.8rem 2rem;
  font-size: 16pt;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #1976d2;
  color: white;
  border: 2px solid #1976d2;
}

.btn-secondary {
  background: #9e9e9e;
  color: white;
  border: 2px solid #9e9e9e;
}

.btn-primary:hover {
  background: #1565c0;
  border-color: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary:hover {
  background: #757575;
  border-color: #757575;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.no-messages {
  color: #9e9e9e;
  font-style: italic;
  display: block;
  padding: 0.8rem 0;
  font-size: 16pt;
}
</style>
