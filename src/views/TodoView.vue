<template>
  <div class="todo-container">
    <div class="header">
      <h2>工程変更通知</h2>
    </div>

    <div class="filters">
      <div class="filter-row">
        <div class="filter-items">
          <div class="filter-group">
            <label for="title">タイトル</label>
            <input
              type="text"
              id="title"
              v-model="searchQuery"
              class="form-control"
              placeholder="タイトルで検索"
            />
          </div>
          <div class="filter-group">
            <label for="status">ステータス</label>
            <select id="status" v-model="statusFilter" class="form-control">
              <option value="all">すべて</option>
              <option value="pending">未対応</option>
              <option value="in_progress">対応中</option>
              <option value="completed">確認済み</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="from-process">前工程</label>
            <select
              id="from-process"
              v-model="columnFilters.fromProcess"
              class="form-control"
            >
              <option value="">すべて</option>
              <option value="承認">承認工程</option>
              <option value="確認">確認工程</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="to-process">後工程</label>
            <select
              id="to-process"
              v-model="columnFilters.toProcess"
              class="form-control"
            >
              <option value="">すべて</option>
              <option value="承認">承認工程</option>
              <option value="確認">確認工程</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="assignee">担当者</label>
            <input
              type="text"
              id="assignee"
              v-model="columnFilters.assignee"
              class="form-control"
              placeholder="担当者で検索"
            />
          </div>
          <div class="filter-group">
            <label for="due-date">期限</label>
            <input
              type="date"
              id="due-date"
              v-model="columnFilters.dueDate"
              class="form-control"
            />
          </div>
          <div class="filter-group">
            <label for="status-changed">ステータス変更日</label>
            <input
              type="date"
              id="status-changed"
              v-model="columnFilters.statusChangedAt"
              class="form-control"
            />
          </div>
          <div class="filter-group reset-group">
            <button @click="resetFilters" class="btn-reset">リセット</button>
          </div>
        </div>
      </div>
    </div>

    <div class="table-container">
      <div class="pagination-controls">
        <label for="itemsPerPage">表示件数：</label>
        <select
          id="itemsPerPage"
          v-model.number="itemsPerPage"
          @change="onItemsPerPageChange"
          class="page-size-select"
        >
          <option :value="10">10件</option>
          <option :value="20">20件</option>
          <option :value="50">50件</option>
          <option :value="100">100件</option>
        </select>
      </div>

      <table class="notification-table">
        <thead>
          <tr>
            <th @click="sortBy('status')" class="sortable">
              ステータス
              <span v-if="sortKey === 'status'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('circularTitle')" class="sortable">
              回覧箋タイトル
              <span v-if="sortKey === 'circularTitle'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('changeDescription')" class="sortable">
              変更内容
              <span v-if="sortKey === 'changeDescription'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('assignee')" class="sortable">
              担当者
              <span v-if="sortKey === 'assignee'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('statusChangedAt')" class="sortable">
              ステータス変更日
              <span v-if="sortKey === 'statusChangedAt'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('dueDate')" class="sortable">
              期限
              <span v-if="sortKey === 'dueDate'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="notification in paginatedNotifications"
            :key="notification.id"
          >
            <td>
              <span class="status-badge" :class="notification.status">{{
                notification.statusText
              }}</span>
            </td>
            <td>{{ notification.circularTitle }}</td>
            <td>
              <span class="process-badge">{{
                getFromProcess(notification.changeDescription)
              }}</span>
              <span class="process-arrow">→</span>
              <span class="process-badge">{{
                getToProcess(notification.changeDescription)
              }}</span>
              <ul
                v-if="getTodoMessagesForNotification(notification).length"
                class="todo-message-list-inline"
              >
                <li
                  v-for="(msg, i) in getTodoMessagesForNotification(
                    notification
                  )"
                  :key="i"
                >
                  {{ msg }}
                </li>
              </ul>
            </td>
            <td>{{ notification.assignee }}</td>
            <td>{{ formatDateOnly(notification.statusChangedAt) }}</td>
            <td>{{ formatDateOnly(notification.dueDate) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="notification.status === 'pending'"
                  class="action-btn in-progress"
                  @click="updateStatus(notification.id, 'in_progress')"
                >
                  対応開始
                </button>
                <button
                  v-if="notification.status === 'in_progress'"
                  class="action-btn confirm"
                  @click="updateStatus(notification.id, 'completed')"
                >
                  確認済み
                </button>
                <button
                  class="action-btn view"
                  @click="viewCircular(notification.circularId)"
                >
                  表示
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        前へ
      </button>
      <span class="page-info">
        {{ currentPage }} / {{ totalPages }} ページ (全
        {{ filteredNotifications.length }} 件)
      </span>
      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        次へ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useTagSettingsStore } from '@/stores/tagSettings';

interface Notification {
  id: number;
  circularId: string;
  circularTitle: string;
  status: 'pending' | 'in_progress' | 'completed';
  statusText: string;
  timestamp: Date;
  changeDescription: string;
  actionRequired: string;
  assignee: string;
  dueDate: Date;
  statusChangedAt: Date;
}

const router = useRouter();
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const notifications = ref<Notification[]>([
  {
    id: 1,
    circularId: 'circ-001',
    circularTitle: '2024年度予算案の回覧',
    status: 'pending',
    statusText: '未対応',
    timestamp: new Date('2024-03-20T10:00:00'),
    changeDescription: '承認工程から確認工程に変更されました。',
    actionRequired: '内容を確認し、必要に応じてコメントを追加してください。',
    assignee: '山田太郎',
    dueDate: new Date('2024-03-25T17:00:00'),
    statusChangedAt: new Date('2024-03-20T10:00:00'),
  },
  {
    id: 2,
    circularId: 'circ-002',
    circularTitle: '新規プロジェクト提案書',
    status: 'in_progress',
    statusText: '対応中',
    timestamp: new Date('2024-03-19T15:30:00'),
    changeDescription: '確認工程から承認工程に変更されました。',
    actionRequired: '最終確認の上、承認してください。',
    assignee: '鈴木一郎',
    dueDate: new Date('2024-03-22T17:00:00'),
    statusChangedAt: new Date('2024-03-19T15:30:00'),
  },
]);

interface ColumnFilters {
  status: string;
  title: string;
  fromProcess: string;
  toProcess: string;
  assignee: string;
  dueDate: string;
  statusChangedAt: string;
}

const columnFilters = ref<ColumnFilters>({
  status: '',
  title: '',
  fromProcess: '',
  toProcess: '',
  assignee: '',
  dueDate: '',
  statusChangedAt: '',
});

const filteredNotifications = computed(() => {
  return notifications.value.filter((notification) => {
    const matchesSearch = notification.circularTitle
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesStatus =
      statusFilter.value === 'all' ||
      notification.status === statusFilter.value;

    const matchesColumnStatus =
      !columnFilters.value.status ||
      notification.status === columnFilters.value.status;

    const matchesColumnTitle =
      !columnFilters.value.title ||
      notification.circularTitle
        .toLowerCase()
        .includes(columnFilters.value.title.toLowerCase());

    // 前工程フィルタ
    const fromProcess = getFromProcess(notification.changeDescription).replace(
      '工程',
      ''
    );
    const matchesFromProcess =
      !columnFilters.value.fromProcess ||
      fromProcess === columnFilters.value.fromProcess;
    // 後工程フィルタ
    const toProcess = getToProcess(notification.changeDescription).replace(
      '工程',
      ''
    );
    const matchesToProcess =
      !columnFilters.value.toProcess ||
      toProcess === columnFilters.value.toProcess;

    const matchesColumnAssignee =
      !columnFilters.value.assignee ||
      notification.assignee
        .toLowerCase()
        .includes(columnFilters.value.assignee.toLowerCase());

    const matchesColumnDueDate =
      !columnFilters.value.dueDate ||
      formatDateOnly(notification.dueDate) ===
        formatDateOnly(new Date(columnFilters.value.dueDate));

    const matchesColumnStatusChangedAt =
      !columnFilters.value.statusChangedAt ||
      formatDateOnly(notification.statusChangedAt) ===
        formatDateOnly(new Date(columnFilters.value.statusChangedAt));

    return (
      matchesSearch &&
      matchesStatus &&
      matchesColumnStatus &&
      matchesColumnTitle &&
      matchesFromProcess &&
      matchesToProcess &&
      matchesColumnAssignee &&
      matchesColumnDueDate &&
      matchesColumnStatusChangedAt
    );
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage.value);
});

const sortKey = ref('');
const sortOrder = ref<'asc' | 'desc'>('asc');

function sortBy(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

const sortedNotifications = computed(() => {
  const arr = [...filteredNotifications.value];
  if (!sortKey.value) return arr;
  return arr.sort((a, b) => {
    let aVal = a[sortKey.value as keyof Notification];
    let bVal = b[sortKey.value as keyof Notification];
    // 日付型はDateとして比較
    if (sortKey.value === 'dueDate' || sortKey.value === 'statusChangedAt') {
      aVal = (aVal as Date)?.getTime?.() ?? 0;
      bVal = (bVal as Date)?.getTime?.() ?? 0;
    } else if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedNotifications.value.slice(start, end);
});

// 検索条件が変更されたときにページを1に戻す
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1;
});

// 表示件数が変更されたときにページを1に戻す
watch(itemsPerPage, () => {
  currentPage.value = 1;
});

// カラムフィルターが変更されたときにページを1に戻す
watch(
  columnFilters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

const updateStatus = (
  id: number,
  newStatus: 'pending' | 'in_progress' | 'completed'
) => {
  const notification = notifications.value.find((n) => n.id === id);
  if (notification) {
    notification.status = newStatus;
    notification.statusChangedAt = new Date();
    switch (newStatus) {
      case 'in_progress':
        notification.statusText = '対応中';
        break;
      case 'completed':
        notification.statusText = '確認済み';
        break;
      default:
        notification.statusText = '未対応';
    }
  }
};

const viewCircular = (circularId: string) => {
  router.push({
    name: 'circular-detail',
    params: { id: circularId },
  });
};

const formatDateOnly = (date: Date) => {
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
  return match ? match[1] + '工程' : '';
};

const onItemsPerPageChange = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  columnFilters.value = {
    status: '',
    title: '',
    fromProcess: '',
    toProcess: '',
    assignee: '',
    dueDate: '',
    statusChangedAt: '',
  };
};

const tagSettingsStore = useTagSettingsStore();
const { tagSettings } = storeToRefs(tagSettingsStore);

// 通知に該当するTodo文言リストを取得
function getTodoMessagesForNotification(notification: Notification): string[] {
  // 設定後の工程名を取得
  const toProcess = getToProcess(notification.changeDescription).replace(
    '工程',
    ''
  );
  // 各タグの該当工程のTodo文言を集める
  const result: string[] = [];
  tagSettings.value.forEach((tag: any) => {
    tag.processSettings?.forEach((ps: any) => {
      if (
        String(ps.process) === toProcess ||
        (typeof ps.process === 'string' && ps.process === toProcess)
      ) {
        if (Array.isArray(ps.todoMessages)) {
          ps.todoMessages.forEach((msg: string) => {
            if (msg && msg.trim()) result.push(msg);
          });
        }
      }
    });
  });
  return result;
}
</script>

<style scoped>
.todo-container {
  max-width: 1600px;
  margin: 0.5rem auto 0 auto;
  padding: 1.5rem 2rem 2.5rem 2rem;
  background: #fff;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h2 {
  margin-bottom: 1.2rem;
}

.filters {
  margin-bottom: 1.2rem;
  padding: 0.7rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  position: relative;
}

.filter-row {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-items {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  flex: 1 1 auto;
  min-width: 0;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 140px;
  max-width: 180px;
  flex: 1 1 140px;
}

.filter-group label {
  font-size: 16pt;
  color: #374151;
  font-weight: 500;
}

.form-control {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16pt;
  height: 40px;
  box-sizing: border-box;
  vertical-align: bottom;
}

.filter-group.reset-group {
  margin-top: auto;
}

.btn-reset {
  display: inline-block;
  padding: 8px;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 15pt;
  min-width: 80px;
  max-width: 120px;
  height: 40px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.btn-reset:hover {
  background-color: #e5e7eb;
}

.table-container {
  overflow-x: auto;
  margin-top: 0.5rem;
}

.notification-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.notification-table th,
.notification-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 16pt;
}

.notification-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
}

.notification-table tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: bold;
  display: inline-block;
}

.status-badge.pending {
  background-color: #ffd700;
  color: #000;
}

.status-badge.in_progress {
  background-color: #1e90ff;
  color: white;
}

.status-badge.completed {
  background-color: #32cd32;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
  font-size: 16pt;
}

.action-btn.in-progress {
  background-color: #ff9800;
  color: white;
}

.action-btn.in-progress:hover {
  background-color: #f57c00;
}

.action-btn.confirm {
  background-color: #4caf50;
  color: white;
}

.action-btn.confirm:hover {
  background-color: #45a049;
}

.action-btn.view {
  background-color: #2196f3;
  color: white;
}

.action-btn.view:hover {
  background-color: #1976d2;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.pagination-controls label {
  font-size: 16pt;
  color: #333;
}

.page-size-select {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 16pt;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0 0 0;
  flex-wrap: wrap;
  max-width: 100vw;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #999;
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  color: #666;
  font-size: 0.9em;
}

.process-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
  white-space: nowrap;
}

.process-arrow {
  margin: 0 8px;
  color: #666;
  font-weight: bold;
}

.sortable {
  cursor: pointer;
  user-select: none;
}
.sortable span {
  font-size: 0.9em;
  margin-left: 4px;
  color: #1976d2;
}

.todo-message-list-inline {
  margin: 0.5em 0 0 0;
  padding-left: 1.5em;
  color: #1976d2;
  font-size: 0.95em;
}
.todo-message-list-inline li {
  list-style-type: disc;
  margin-bottom: 0.1em;
}
</style>
