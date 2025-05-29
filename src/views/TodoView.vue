<template>
  <div class="todo-container">
    <GlobalMessage />
    <ToastMessage ref="toastRef" />
    <div class="header">
      <h2>工程変更通知</h2>
    </div>

    <div class="filters">
      <!-- 1段目: データ取得条件（やや濃いグレー） -->
      <div class="fetch-filter-block">
        <div class="filter-row">
          <div class="filter-items">
            <div class="filter-group">
              <label for="status">ステータス</label>
              <select id="status" v-model="statusFilter" class="form-control">
                <option value="all">確認済み以外</option>
                <option value="pending">未対応</option>
                <option value="in_progress">対応中</option>
                <option value="completed">確認済み</option>
              </select>
            </div>
            <div class="filter-group">
              <label for="status-changed-from">ステータス変更日（自）</label>
              <input
                type="date"
                id="status-changed-from"
                v-model="statusChangedAtFrom"
                class="form-control"
              />
            </div>
            <div class="filter-group">
              <label for="status-changed-to">ステータス変更日（至）</label>
              <input
                type="date"
                id="status-changed-to"
                v-model="statusChangedAtTo"
                class="form-control"
              />
            </div>
            <div class="filter-group" style="align-self: flex-end">
              <button class="refresh-btn" @click="onFetchNotifications">
                <span class="refresh-icon">↻</span>
                データ取得
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- 1段目と2段目の間に余白 -->
      <div style="height: 0.5rem"></div>
      <!-- 2段目: ローカルフィルタ（薄いグレー） -->
      <div class="local-filter-block">
        <div class="filter-row">
          <div class="filter-items">
            <div class="filter-group">
              <label for="column-status">カラムステータス</label>
              <select
                id="column-status"
                v-model="columnFilters.status"
                class="form-control"
              >
                <option value="">すべて</option>
                <option value="pending">未対応</option>
                <option value="in_progress">対応中</option>
                <option value="completed">確認済み</option>
              </select>
            </div>
            <div class="filter-group">
              <label for="id">識別番号</label>
              <input
                type="text"
                id="id"
                v-model="columnFilters.id"
                class="form-control"
                placeholder="識別番号で検索"
              />
            </div>
            <div class="filter-group filter-group-title">
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
              <label for="from-process">変更内容(前)</label>
              <input
                type="text"
                id="from-process"
                v-model="columnFilters.fromProcess"
                class="form-control"
                placeholder="前工程で検索"
              />
            </div>
            <div class="filter-group">
              <label for="to-process">変更内容(後)</label>
              <input
                type="text"
                id="to-process"
                v-model="columnFilters.toProcess"
                class="form-control"
                placeholder="後工程で検索"
              />
            </div>
            <div class="filter-group">
              <label for="due-date-from">期限（自）</label>
              <input
                type="date"
                id="due-date-from"
                v-model="columnFilters.dueDateFrom"
                class="form-control"
              />
            </div>
            <div class="filter-group">
              <label for="due-date-to">期限（至）</label>
              <input
                type="date"
                id="due-date-to"
                v-model="columnFilters.dueDateTo"
                class="form-control"
              />
            </div>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-items">
            <div class="filter-group">
              <label for="update-date-from">更新日（自）</label>
              <input
                type="date"
                id="update-date-from"
                v-model="columnFilters.updateDateFrom"
                class="form-control"
              />
            </div>
            <div class="filter-group">
              <label for="update-date-to">更新日（至）</label>
              <input
                type="date"
                id="update-date-to"
                v-model="columnFilters.updateDateTo"
                class="form-control"
              />
            </div>
            <div class="filter-group">
              <label for="updatedBy">更新者</label>
              <input
                type="text"
                id="updatedBy"
                v-model="columnFilters.updatedBy"
                class="form-control"
                placeholder="更新者で検索"
              />
            </div>
            <div class="filter-group reset-group" style="margin-left: auto">
              <button @click="resetFilters" class="btn-reset">リセット</button>
            </div>
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
            <th @click="sortBy('id')" class="sortable">
              識別番号
              <span v-if="sortKey === 'id'">
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
            <th @click="sortBy('dueDate')" class="sortable">
              期限
              <span v-if="sortKey === 'dueDate'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('updatedAt')" class="sortable">
              更新日
              <span v-if="sortKey === 'updatedAt'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('updatedBy')" class="sortable">
              更新者
              <span v-if="sortKey === 'updatedBy'">
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
              <button
                class="status-toggle"
                :class="notification.status"
                @click="toggleStatus(notification)"
              >
                {{ getStatusText(notification.status) }}
              </button>
            </td>
            <td>
              <span
                class="id-cell"
                :title="notification.id"
                @click="copyId(notification.id)"
                style="cursor: pointer; color: #1976d2"
              >
                {{
                  notification.id.length > 6
                    ? notification.id.slice(0, 3) +
                      '...' +
                      notification.id.slice(-3)
                    : notification.id
                }}
              </span>
            </td>
            <td>{{ notification.circularTitle }}</td>
            <td>
              <span class="process-badge">
                {{ getFromProcess(notification.changeDescription) }}
              </span>
              <span class="process-arrow">→</span>
              <span class="process-badge">
                {{ getToProcess(notification.changeDescription) }}
              </span>
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
            <td>{{ formatDateOnly(notification.dueDate) }}</td>
            <td>{{ formatDateOnly(notification.updatedAt) }}</td>
            <td>{{ notification.updatedBy }}</td>
            <td>
              <div class="action-buttons">
                <button
                  class="action-btn view"
                  @click="viewCircular(notification.circularId)"
                >
                  表示
                </button>
                <router-link
                  :to="{
                    name: 'todo-detail',
                    params: { id: notification.id },
                  }"
                  class="action-btn detail"
                >
                  詳細
                </router-link>
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

    <!-- Todo詳細モーダル -->
    <div
      v-if="showDetailModal"
      class="modal-overlay"
      @click.self="closeDetailModal"
    >
      <div class="modal-content todo-detail-modal">
        <h3>工程変更通知の詳細</h3>
        <div class="detail-content">
          <div class="detail-item">
            <span class="label">タイトル：</span>
            <span class="value">{{ selectedNotification?.circularTitle }}</span>
          </div>
          <div class="detail-item">
            <span class="label">変更内容：</span>
            <div class="value">
              <span class="process-badge">{{
                getFromProcess(selectedNotification?.changeDescription || '')
              }}</span>
              <span class="process-arrow">→</span>
              <span class="process-badge">{{
                getToProcess(selectedNotification?.changeDescription || '')
              }}</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="label">更新者：</span>
            <span class="value">{{ selectedNotification?.updatedBy }}</span>
          </div>
          <div class="detail-item">
            <span class="label">期限：</span>
            <span class="value">{{
              formatDate(selectedNotification?.dueDate || new Date())
            }}</span>
          </div>
          <div class="detail-item">
            <span class="label">ステータス：</span>
            <span class="value">
              <span class="status-badge" :class="selectedNotification?.status">
                {{ selectedNotification?.statusText }}
              </span>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">ステータス変更日：</span>
            <span class="value">{{
              formatDate(selectedNotification?.statusChangedAt || new Date())
            }}</span>
          </div>
          <div
            class="detail-item todo-messages"
            v-if="getTodoMessagesForNotification(selectedNotification || {} as Notification).length"
          >
            <span class="label">確認事項：</span>
            <ul class="todo-message-list">
              <li
                v-for="(msg, i) in getTodoMessagesForNotification(selectedNotification || {} as Notification)"
                :key="i"
              >
                {{ msg }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-actions">
          <button class="action-btn close" @click="closeDetailModal">
            閉じる
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useTagSettingsStore } from '@/stores/tagSettings';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import GlobalMessage from '@/components/GlobalMessage.vue';
import ToastMessage from '@/components/ToastMessage.vue';

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
  updatedBy: string;
}

const router = useRouter();
const client = generateClient<Schema>();
const notifications = ref<Notification[]>([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(10);

// IndexedDBの設定
const DB_NAME = 'todo_cache_db';
const DB_VERSION = 1;
const NOTIFICATION_STORE = 'notifications';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24時間

// IndexedDBの初期化
const initDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDBの初期化に失敗しました');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(NOTIFICATION_STORE)) {
        db.createObjectStore(NOTIFICATION_STORE, { keyPath: 'id' });
      }
    };
  });
};

// キャッシュからデータを取得
const getFromCache = async () => {
  try {
    const db = await initDB();
    return new Promise<any[]>((resolve, reject) => {
      const transaction = db.transaction(NOTIFICATION_STORE, 'readonly');
      const store = transaction.objectStore(NOTIFICATION_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const data = request.result;
        if (data && data.length > 0) {
          // 有効期限切れのデータをフィルタリング
          const validData = data.filter(
            (item) => Date.now() - item.timestamp < CACHE_EXPIRY
          );
          resolve(validData.map((item) => item.data));
        } else {
          resolve([]);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('キャッシュの取得に失敗しました:', error);
    return [];
  }
};

// データをキャッシュに保存
const saveToCache = async (notifications: Notification[]) => {
  try {
    const db = await initDB();
    return new Promise<boolean>((resolve, reject) => {
      const transaction = db.transaction(NOTIFICATION_STORE, 'readwrite');
      const store = transaction.objectStore(NOTIFICATION_STORE);

      // 既存のデータをクリア
      store.clear();

      // 新しいデータを保存（シンプルな形式に変換）
      notifications.forEach((notification) => {
        const cacheData = {
          id: notification.id,
          circularId: notification.circularId,
          circularTitle: notification.circularTitle,
          status: notification.status,
          statusText: notification.statusText,
          changeDescription: notification.changeDescription,
          actionRequired: notification.actionRequired,
          assignee: notification.assignee,
          dueDate: notification.dueDate,
          statusChangedAt: notification.statusChangedAt,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
          updatedBy: notification.updatedBy,
        };
        store.put({
          id: notification.id,
          data: cacheData,
          timestamp: Date.now(),
        });
      });

      transaction.oncomplete = () => {
        db.close();
        resolve(true);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('キャッシュの保存に失敗しました:', error);
    return false;
  }
};

const statusChangedAtFrom = ref('');
const statusChangedAtTo = ref('');

// データ取得ボタン用
const onFetchNotifications = async () => {
  // ステータスがcompletedの場合は日付必須
  if (statusFilter.value === 'completed') {
    if (!statusChangedAtFrom.value || !statusChangedAtTo.value) {
      alert(
        '「確認済み」を選択した場合はステータス変更日の両方を入力してください。'
      );
      return;
    }
  }
  await fetchNotifications(true);
};

// 通知データの取得
const fetchNotifications = async (forceRefresh = false) => {
  try {
    // キャッシュからデータを取得（強制更新でない場合のみ）
    if (!forceRefresh) {
      const cachedNotifications = await getFromCache();
      if (cachedNotifications.length > 0) {
        notifications.value = cachedNotifications;
        return;
      }
    }

    // 1段目のフィルタ条件をAPIリクエストに反映
    let filter: any = {};
    if (statusFilter.value === 'all') {
      filter.status = { ne: 'completed' };
    } else {
      filter.status = { eq: statusFilter.value };
    }
    // ステータス変更日範囲
    if (statusChangedAtFrom.value) {
      filter.statusChangedAt = filter.statusChangedAt || {};
      filter.statusChangedAt.ge = statusChangedAtFrom.value;
    }
    if (statusChangedAtTo.value) {
      filter.statusChangedAt = filter.statusChangedAt || {};
      filter.statusChangedAt.le = statusChangedAtTo.value;
    }

    const { data, errors } = await client.models.Notification.list({
      filter,
    });

    if (errors) {
      console.error('通知データの取得に失敗しました:', errors);
      return;
    }

    // Circularデータを取得してタイトルと更新者を設定
    const notificationsWithTitles = await Promise.all(
      data.map(async (notification) => {
        const { data: circularData } = await client.models.Circular.get(
          { id: notification.circularId || '' },
          { selectionSet: ['title', 'updatedBy'] }
        );

        // シンプルな形式でデータを返す
        return {
          id: notification.id || '',
          circularId: notification.circularId || '',
          circularTitle: circularData?.title || 'タイトルなし',
          status:
            (notification.status as 'pending' | 'in_progress' | 'completed') ||
            'pending',
          statusText: notification.statusText || '',
          changeDescription: notification.changeDescription || '',
          actionRequired: notification.actionRequired || '',
          assignee: notification.assignee || '',
          dueDate: notification.dueDate || '',
          statusChangedAt: notification.statusChangedAt || '',
          createdAt: notification.createdAt || '',
          updatedAt: notification.updatedAt || '',
          updatedBy: circularData?.updatedBy || '',
        };
      })
    );

    // 表示用のデータを設定
    notifications.value = notificationsWithTitles;
    // キャッシュに保存
    await saveToCache(notificationsWithTitles);
  } catch (error) {
    console.error('通知データの取得に失敗しました:', error);
  }
};

interface ColumnFilters {
  id: string;
  status: string;
  title: string;
  changeDescription: string;
  fromProcess: string;
  toProcess: string;
  updatedBy: string;
  dueDateFrom: string;
  dueDateTo: string;
  updateDateFrom: string;
  updateDateTo: string;
  statusChangedAtFrom: string;
  statusChangedAtTo: string;
}

const columnFilters = ref<ColumnFilters>({
  id: '',
  status: '',
  title: '',
  changeDescription: '',
  fromProcess: '',
  toProcess: '',
  updatedBy: '',
  dueDateFrom: '',
  dueDateTo: '',
  updateDateFrom: '',
  updateDateTo: '',
  statusChangedAtFrom: '',
  statusChangedAtTo: '',
});

const filteredNotifications = computed(() => {
  return notifications.value.filter((notification) => {
    // 識別番号フィルタ
    const matchesId =
      !columnFilters.value.id ||
      notification.id
        .toLowerCase()
        .includes(columnFilters.value.id.toLowerCase());
    // 変更内容フィルタ
    const matchesChangeDescription =
      !columnFilters.value.changeDescription ||
      notification.changeDescription
        .toLowerCase()
        .includes(columnFilters.value.changeDescription.toLowerCase());
    // 更新日範囲フィルタ
    let matchesUpdateDate = true;
    if (columnFilters.value.updateDateFrom) {
      matchesUpdateDate =
        matchesUpdateDate &&
        notification.updatedAt >= columnFilters.value.updateDateFrom;
    }
    if (columnFilters.value.updateDateTo) {
      matchesUpdateDate =
        matchesUpdateDate &&
        notification.updatedAt <= columnFilters.value.updateDateTo;
    }
    // ...既存のフィルタ条件...
    const matchesSearch = notification.circularTitle
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
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
    const matchesColumnUpdatedBy =
      !columnFilters.value.updatedBy ||
      (notification.updatedBy &&
        notification.updatedBy
          .toLowerCase()
          .includes(columnFilters.value.updatedBy.toLowerCase()));
    // 期限範囲フィルタ
    let matchesColumnDueDate = true;
    if (columnFilters.value.dueDateFrom) {
      matchesColumnDueDate =
        matchesColumnDueDate &&
        notification.dueDate >= columnFilters.value.dueDateFrom;
    }
    if (columnFilters.value.dueDateTo) {
      matchesColumnDueDate =
        matchesColumnDueDate &&
        notification.dueDate <= columnFilters.value.dueDateTo;
    }
    // ステータス変更日範囲フィルタ
    let matchesColumnStatusChangedAt = true;
    if (columnFilters.value.statusChangedAtFrom) {
      matchesColumnStatusChangedAt =
        matchesColumnStatusChangedAt &&
        notification.statusChangedAt >= columnFilters.value.statusChangedAtFrom;
    }
    if (columnFilters.value.statusChangedAtTo) {
      matchesColumnStatusChangedAt =
        matchesColumnStatusChangedAt &&
        notification.statusChangedAt <= columnFilters.value.statusChangedAtTo;
    }
    return (
      matchesId &&
      matchesChangeDescription &&
      matchesUpdateDate &&
      matchesSearch &&
      matchesColumnStatus &&
      matchesColumnTitle &&
      matchesFromProcess &&
      matchesToProcess &&
      matchesColumnUpdatedBy &&
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
    // 日付型はstringからDateに変換して比較
    if (sortKey.value === 'dueDate' || sortKey.value === 'statusChangedAt') {
      const aTime = aVal ? new Date(aVal as string).getTime() : 0;
      const bTime = bVal ? new Date(bVal as string).getTime() : 0;
      if (aTime < bTime) return sortOrder.value === 'asc' ? -1 : 1;
      if (aTime > bTime) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
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

const viewCircular = (circularId: string) => {
  router.push({
    name: 'circular-detail',
    params: { id: circularId },
  });
};

// 日付のフォーマット
const formatDate = (date: string | Date | null) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 日付のみのフォーマット関数を追加
const formatDateOnly = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 変更前の工程を抽出する関数
const getFromProcess = (description: string): string => {
  // 「工程を◯◯工程」パターン
  const match1 = description.match(/工程を([^工程]+工程)/);
  if (match1) return match1[1];
  // 「◯◯工程から」パターン
  const match2 = description.match(/([^工程]+工程)から/);
  if (match2) return match2[1];
  return '';
};

// 変更後の工程を抽出する関数
const getToProcess = (description: string): string => {
  // 「から◯◯工程」パターン
  const match1 = description.match(/から(.*?)工程/);
  if (match1) return match1[1] + '工程';
  // 「工程を◯◯」パターン（後工程が明示されていない場合）
  const match2 = description.match(/工程を(.*?)(工程)?$/);
  if (match2) return match2[1] + '工程';
  return '';
};

const onItemsPerPageChange = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  columnFilters.value = {
    id: '',
    status: '',
    title: '',
    changeDescription: '',
    fromProcess: '',
    toProcess: '',
    updatedBy: '',
    dueDateFrom: '',
    dueDateTo: '',
    updateDateFrom: '',
    updateDateTo: '',
    statusChangedAtFrom: '',
    statusChangedAtTo: '',
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

// ToastMessage用
const toastRef = ref();
function copyId(id: string) {
  navigator.clipboard.writeText(id).then(() => {
    toastRef.value?.show('識別番号をコピーしました: ' + id);
  });
}

// 詳細モーダル用の状態
const showDetailModal = ref(false);
const selectedNotification = ref<Notification | null>(null);

// 詳細モーダルを閉じる
const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedNotification.value = null;
};

// ステータス更新をトグル処理
const toggleStatus = async (notification: Notification) => {
  try {
    const newStatus =
      notification.status === 'pending'
        ? 'in_progress'
        : notification.status === 'in_progress'
        ? 'completed'
        : 'pending';
    const newStatusText = getStatusText(newStatus);
    const now = new Date().toISOString();

    const { errors } = await client.models.Notification.update({
      id: notification.id,
      status: newStatus,
      statusText: newStatusText,
      statusChangedAt: now,
    });

    if (errors) {
      console.error('ステータスの更新に失敗しました:', errors);
      return;
    }

    // ローカルの状態を更新
    const index = notifications.value.findIndex(
      (n) => n.id === notification.id
    );
    if (index !== -1) {
      notifications.value[index] = {
        ...notifications.value[index],
        status: newStatus,
        statusText: newStatusText,
        statusChangedAt: now,
      };
      // キャッシュを更新
      await saveToCache(notifications.value);
    }
  } catch (error) {
    console.error('ステータスの更新に失敗しました:', error);
  }
};

// ステータスに応じたテキストを取得
const getStatusText = (status: string): string => {
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

// ローカルストレージ用キー
const TODO_FILTER_KEY = 'todo_filters';
const TODO_PAGINATION_KEY = 'todo_pagination';

// フィルタ・ページングの保存
function saveFiltersToStorage() {
  localStorage.setItem(
    TODO_FILTER_KEY,
    JSON.stringify({
      statusFilter: statusFilter.value,
      statusChangedAtFrom: statusChangedAtFrom.value,
      statusChangedAtTo: statusChangedAtTo.value,
      columnFilters: columnFilters.value,
      searchQuery: searchQuery.value,
    })
  );
}
function savePaginationToStorage() {
  localStorage.setItem(
    TODO_PAGINATION_KEY,
    JSON.stringify({
      currentPage: currentPage.value,
      itemsPerPage: itemsPerPage.value,
    })
  );
}
// フィルタ・ページングの復元
function loadFiltersFromStorage() {
  const saved = localStorage.getItem(TODO_FILTER_KEY);
  if (saved) {
    try {
      const obj = JSON.parse(saved);
      if (obj.statusFilter !== undefined) statusFilter.value = obj.statusFilter;
      if (obj.statusChangedAtFrom !== undefined)
        statusChangedAtFrom.value = obj.statusChangedAtFrom;
      if (obj.statusChangedAtTo !== undefined)
        statusChangedAtTo.value = obj.statusChangedAtTo;
      if (obj.columnFilters !== undefined)
        columnFilters.value = { ...columnFilters.value, ...obj.columnFilters };
      if (obj.searchQuery !== undefined) searchQuery.value = obj.searchQuery;
    } catch {}
  }
}
function loadPaginationFromStorage() {
  const saved = localStorage.getItem(TODO_PAGINATION_KEY);
  if (saved) {
    try {
      const obj = JSON.parse(saved);
      if (obj.currentPage !== undefined) currentPage.value = obj.currentPage;
      if (obj.itemsPerPage !== undefined) itemsPerPage.value = obj.itemsPerPage;
    } catch {}
  }
}

// 変更時に自動保存
watch(
  [
    statusFilter,
    statusChangedAtFrom,
    statusChangedAtTo,
    columnFilters,
    searchQuery,
  ],
  saveFiltersToStorage,
  { deep: true }
);
watch([currentPage, itemsPerPage], savePaginationToStorage);

// 初回マウント時に復元
onMounted(() => {
  loadFiltersFromStorage();
  loadPaginationFromStorage();
  statusFilter.value = statusFilter.value || 'all';
  statusChangedAtFrom.value = statusChangedAtFrom.value || '';
  statusChangedAtTo.value = statusChangedAtTo.value || '';
  fetchNotifications();
});
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
  color: #424242;
}

.filters {
  margin-bottom: 1.2rem;
  padding: 0;
  background-color: transparent;
  border-radius: 0.5rem;
  position: relative;
}

/* 1段目: データ取得条件 */
.fetch-filter-block {
  background: #e0e0e0;
  border-radius: 0.5rem;
  padding: 1rem 0.7rem;
}

/* 2段目: ローカルフィルタ */
.local-filter-block {
  background: #f5f5f5;
  border-radius: 0.5rem;
  padding: 1rem 0.7rem;
  margin-bottom: 1.2rem;
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
  color: #424242;
  font-weight: 500;
}

.form-control {
  padding: 8px;
  border: 1px solid #9e9e9e;
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
  background-color: #f5f5f5;
  color: #424242;
  border: 1px solid #9e9e9e;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 15pt;
  min-width: 80px;
  max-width: 120px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.btn-reset:hover {
  background-color: #e0e0e0;
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
  background-color: #f5f5f5;
  font-weight: bold;
  color: #424242;
}

.notification-table tr:hover {
  background-color: #f5f5f5;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: bold;
  display: inline-block;
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
  background-color: #1976d2;
  color: white;
}

.action-btn.view:hover {
  background-color: #1565c0;
}

.action-btn.detail {
  background-color: #b8677a;
  color: white;
}

.action-btn.detail:hover {
  background-color: #a05a6b;
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
  color: #1976d2;
  font-size: 16pt;
  min-width: 80px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 1;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #999;
  color: #1565c0;
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  color: #bbb;
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
  color: #9e9e9e;
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

.todo-detail-modal {
  max-width: 800px;
  width: 90%;
}

.detail-content {
  margin: 1.5rem 0;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1.5rem;
}

.detail-item {
  display: flex;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  align-items: flex-start;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  font-weight: 600;
  color: #424242;
  width: 160px;
  flex-shrink: 0;
}

.detail-item .value {
  color: #424242;
  flex-grow: 1;
}

.todo-message-list {
  margin: 0.5em 0 0 0;
  padding-left: 1.5em;
  color: #1976d2;
}

.todo-message-list li {
  margin-bottom: 0.5em;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.modal-actions .action-btn {
  min-width: 160px;
}

.action-btn.close {
  background-color: #9e9e9e;
  color: white;
}

.action-btn.close:hover {
  background-color: #757575;
}

.status-toggle {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  min-width: 100px;
}

.status-toggle.pending {
  background-color: #e67a00;
  color: white;
}

.status-toggle.in_progress {
  background-color: #1976d2;
  color: white;
}

.status-toggle.completed {
  background-color: #008080;
  color: white;
}

.status-toggle:hover {
  filter: brightness(90%);
}

.action-btn.detail {
  background-color: #b8677a;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: bold;
  transition: background-color 0.2s;
  min-width: 80px;
  text-align: center;
}

.action-btn.detail:hover {
  background-color: #a05a6b;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 16pt;
  font-weight: bold;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #1565c0;
}

.refresh-icon {
  font-size: 1.2em;
}

.id-cell {
  cursor: pointer;
  color: #1976d2;
  transition: background 0.2s;
}
.id-cell:hover {
  background: #e3f2fd;
}

/* タイトルフィルタの幅を広げる */
.filter-group-title {
  min-width: 220px;
  max-width: 340px;
  flex: 2 1 220px;
}
</style>
