<template>
  <div class="circular-list">
    <div class="header">
      <h2>回覧箋一覧</h2>
      <router-link to="/circulars/create" class="btn-create">
        新規作成
      </router-link>
    </div>

    <div class="filters">
      <div class="filter-items">
        <div class="filter-group">
          <label for="keyword">キーワード</label>
          <input
            type="text"
            id="keyword"
            v-model="filter.keyword"
            class="form-control"
            placeholder="タイトル・作成者・回覧先で検索"
          />
        </div>

        <div class="filter-group">
          <label for="status">ステータス</label>
          <select v-model="filter.status" id="status" class="form-control">
            <option value="not_completed">未完了のみ</option>
            <option value="">すべて</option>
            <option value="draft">作成中</option>
            <option value="in_progress">回覧中</option>
            <option value="completed">完了</option>
            <option value="expired">期限切れ</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="date-start">作成日（開始）</label>
          <input
            type="date"
            id="date-start"
            v-model="filter.dateRange.start"
            class="form-control"
          />
        </div>

        <div class="filter-group">
          <label for="date-end">作成日（終了）</label>
          <input
            type="date"
            id="date-end"
            v-model="filter.dateRange.end"
            class="form-control"
          />
        </div>

        <div class="filter-group">
          <label for="department">回覧先</label>
          <select
            v-model="filter.department"
            id="department"
            class="form-control"
          >
            <option value="">すべて</option>
            <option value="eigyo">営業</option>
            <option value="haiden">配電</option>
          </select>
        </div>
      </div>
      <div class="filter-reset">
        <button @click="resetFilters" class="btn-reset">
          フィルターをリセット
        </button>
      </div>
    </div>

    <div class="table-container">
      <div class="pagination-controls">
        <label for="itemsPerPage">表示件数：</label>
        <select
          id="itemsPerPage"
          v-model.number="itemsPerPage"
          @change="onItemsPerPageChange"
        >
          <option :value="5">5件</option>
          <option :value="10">10件</option>
          <option :value="20">20件</option>
          <option :value="50">50件</option>
        </select>
      </div>
      <table class="circular-table">
        <thead>
          <tr>
            <th>タイトル</th>
            <th>作成者</th>
            <th>作成日</th>
            <th>期限</th>
            <th>回覧先</th>
            <th>ステータス</th>
            <th>更新者</th>
            <th>更新日</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="circular in paginatedCirculars" :key="circular.id">
            <td>{{ circular.title }}</td>
            <td>{{ circular.creator }}</td>
            <td>{{ formatDate(circular.createdAt) }}</td>
            <td>{{ formatDate(circular.deadline) }}</td>
            <td>
              {{ kairanSakiName(circular.department) }}
            </td>
            <td>
              <span :class="['status-badge', circular.status]">
                {{ getStatusText(circular.status) }}
              </span>
            </td>
            <td>{{ circular.updatedBy }}</td>
            <td>{{ formatDate(circular.updatedAt) }}</td>
            <td>
              <router-link :to="'/circulars/' + circular.id" class="btn-detail">
                詳細
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">前へ</button>
      <template v-for="item in paginationRange" :key="item.key">
        <button
          v-if="item.type === 'page'"
          @click="goToPage(item.page!)"
          :class="{ active: item.page === currentPage }"
        >
          {{ item.page }}
        </button>
        <span v-else class="pagination-ellipsis">…</span>
      </template>
      <button @click="nextPage" :disabled="currentPage === totalPages">
        次へ
      </button>
    </div>
    <footer class="footer">© 2025 回覧箋システム</footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, onMounted } from 'vue';
import { circulars, departments } from '@/mocks/mockCirculars';

const FILTER_KEY = 'circulars_filter';
const defaultFilter = {
  keyword: '',
  status: 'not_completed',
  dateRange: {
    start: '',
    end: '',
  },
  department: '',
};
const filter = ref({ ...defaultFilter });

// localStorageからフィルターを復元
onMounted(() => {
  const saved = localStorage.getItem(FILTER_KEY);
  if (saved) {
    try {
      filter.value = JSON.parse(saved);
    } catch {}
  }
});

// フィルター変更時にlocalStorageへ保存
watch(
  filter,
  (val) => {
    localStorage.setItem(FILTER_KEY, JSON.stringify(val));
  },
  { deep: true }
);

// 部署グループ判定関数
function isSameBushoGroup(userBusho: unknown, recordBusho: unknown): boolean {
  const toNum = (b: unknown) => {
    if (typeof b === 'string' || typeof b === 'number') return Number(b);
    return NaN;
  };
  const userNum = toNum(userBusho);
  const recordNum = toNum(recordBusho);
  if (isNaN(userNum) || isNaN(recordNum)) return false;
  return Math.floor(userNum / 1000) === Math.floor(recordNum / 1000);
}

const currentUser = inject('currentUser') as any;

const filteredCirculars = computed(() => {
  let result = circulars as any[];

  // キーワード検索
  if (filter.value.keyword) {
    const kw = filter.value.keyword.toLowerCase();
    result = result.filter(
      (c: any) =>
        c.title.toLowerCase().includes(kw) ||
        c.creator.toLowerCase().includes(kw) ||
        (c.recipients &&
          c.recipients.some((r: string) => r.toLowerCase().includes(kw)))
    );
  }

  // ステータスでフィルタリング
  if (filter.value.status) {
    if (filter.value.status === 'not_completed') {
      result = result.filter((c: any) => c.status !== 'completed');
    } else {
      result = result.filter((c: any) => c.status === filter.value.status);
    }
  }

  // 日付範囲でフィルタリング
  if (filter.value.dateRange.start) {
    const startDate = new Date(filter.value.dateRange.start);
    result = result.filter((c: any) => new Date(c.createdAt) >= startDate);
  }
  if (filter.value.dateRange.end) {
    const endDate = new Date(filter.value.dateRange.end);
    result = result.filter((c: any) => new Date(c.createdAt) <= endDate);
  }

  // 回覧先でフィルタリング（営業・配電）
  if (filter.value.department === 'eigyo') {
    result = result.filter(
      (c: any) =>
        c.circulationStatus &&
        c.circulationStatus.some((cs: any) =>
          String(cs.departmentId).endsWith('1')
        )
    );
  } else if (filter.value.department === 'haiden') {
    result = result.filter(
      (c: any) =>
        c.circulationStatus &&
        c.circulationStatus.some((cs: any) =>
          String(cs.departmentId).endsWith('2')
        )
    );
  }

  // 部署グループでフィルタリング（作成者または回覧先のいずれかが同じグループなら表示）
  if (currentUser?.value?.busho) {
    const userBusho = currentUser.value.busho;
    result = result.filter((c: any) => {
      // 作成者部署が同じグループ
      if (isSameBushoGroup(userBusho, c.department)) return true;
      // 回覧先のいずれかが同じグループ
      if (c.circulationStatus && Array.isArray(c.circulationStatus)) {
        return c.circulationStatus.some((cs: any) =>
          isSameBushoGroup(userBusho, cs.departmentId)
        );
      }
      return false;
    });
  }

  return result;
});

const resetFilters = () => {
  filter.value = { ...defaultFilter };
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP');
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '作成中',
    in_progress: '回覧中',
    completed: '完了',
    expired: '期限切れ',
  };
  return statusMap[status] || status;
};

// ページネーション用の状態
const currentPage = ref(1);
const itemsPerPage = ref(10);

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredCirculars.value.length / itemsPerPage.value)
  );
});

const paginatedCirculars = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCirculars.value.slice(start, start + itemsPerPage.value);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const onItemsPerPageChange = () => {
  currentPage.value = 1;
};

// フィルターが変わったら1ページ目に戻す
watch(filteredCirculars, () => {
  currentPage.value = 1;
});

// ページネーションの表示範囲を計算
const paginationRange = computed(() => {
  const range: { type: 'page' | 'ellipsis'; page?: number; key: string }[] = [];
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2; // 現在ページの前後何ページを表示するか

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      range.push({ type: 'page', page: i, key: `page-${i}` });
    }
    return range;
  }

  // 先頭
  range.push({ type: 'page', page: 1, key: 'page-1' });

  // 省略（左）
  if (current > delta + 2) {
    range.push({ type: 'ellipsis', key: 'ellipsis-left' });
  }

  // 中央
  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);
  for (let i = start; i <= end; i++) {
    range.push({ type: 'page', page: i, key: `page-${i}` });
  }

  // 省略（右）
  if (current < total - delta - 1) {
    range.push({ type: 'ellipsis', key: 'ellipsis-right' });
  }

  // 最後
  range.push({ type: 'page', page: total, key: `page-${total}` });

  return range;
});

function getKairanSaki(busho: string | number | undefined): string {
  if (busho === undefined) return '';
  const num = Number(busho);
  if (isNaN(num)) return '';
  return num % 10 === 1 ? String(num + 1) : String(num - 1);
}
const kairanSakiName = (department: string) =>
  departments.find(
    (d: { id: string; name: string }) => d.id === getKairanSaki(department)
  )?.name || '';
</script>

<style scoped>
.circular-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-create {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.filter-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  flex: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.form-control {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.table-container {
  overflow-x: auto;
}

.circular-table {
  width: 100%;
  border-collapse: collapse;
}

.circular-table th,
.circular-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.circular-table th {
  background-color: #f5f5f5;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status-badge.draft {
  background-color: #e0e0e0;
}

.status-badge.in_progress {
  background-color: #fff3e0;
  color: #e65100;
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.expired {
  background-color: #ffebee;
  color: #c62828;
}

.btn-reset {
  align-self: flex-end;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-reset:hover {
  background-color: #e5e7eb;
}

.btn-detail {
  padding: 0.25rem 0.75rem;
  background-color: #0078d4;
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-detail:hover {
  background-color: #106ebe;
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
.pagination button {
  background: #f5f5f5;
  border: 1px solid #888;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: #222;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.pagination button.active {
  background: #0078d4;
  color: #fff;
  border-color: #0078d4;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-ellipsis {
  padding: 0 0.5rem;
  color: #888;
  font-size: 1.2rem;
  user-select: none;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.pagination-controls label {
  font-size: 0.95rem;
  color: #333;
}
.pagination-controls select {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.footer {
  margin-top: 3rem;
  padding: 1.5rem 0 0 0;
  text-align: center;
  color: #888;
  font-size: 0.95rem;
}

.recipient-badge {
  display: inline-block;
  background: #f3f4f6;
  color: #333;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.85em;
  margin-right: 2px;
}

.filter-reset {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: auto;
}
</style>
