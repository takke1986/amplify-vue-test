<template>
  <div class="circular-list">
    <div class="header">
      <h2>回覧箋一覧</h2>
      <router-link to="/circulars/create" class="btn-create">
        新規作成
      </router-link>
    </div>

    <div class="filters">
      <div class="filter-row">
        <div class="filter-items">
          <div class="filter-group">
            <label for="title">タイトル</label>
            <input
              type="text"
              id="title"
              v-model="filter.title"
              class="form-control"
              placeholder="タイトルで検索"
            />
          </div>
          <div class="filter-group">
            <label for="creator">作成者</label>
            <input
              type="text"
              id="creator"
              v-model="filter.creator"
              class="form-control"
              placeholder="作成者で検索"
            />
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
            <label for="update-date-start">更新日（開始）</label>
            <input
              type="date"
              id="update-date-start"
              v-model="filter.updateDateRange.start"
              class="form-control"
            />
          </div>
          <div class="filter-group">
            <label for="update-date-end">更新日（終了）</label>
            <input
              type="date"
              id="update-date-end"
              v-model="filter.updateDateRange.end"
              class="form-control"
            />
          </div>
          <div class="filter-group">
            <label for="process">工程</label>
            <select id="process" v-model="filter.process" class="form-control">
              <option value="">すべて</option>
              <option v-for="idx in 15" :key="idx" :value="idx">
                {{ idx }}: {{ processNames[idx] }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label for="updatedBy">更新者</label>
            <input
              type="text"
              id="updatedBy"
              v-model="filter.updatedBy"
              class="form-control"
              placeholder="更新者で検索"
            />
          </div>
          <div class="filter-group tag-filter-group">
            <label for="tag-filter">タグ</label>
            <div class="tag-filter-row-horizontal">
              <div class="tag-suggest-wrapper">
                <input
                  id="tag-filter"
                  v-model="tagInput"
                  @input="onTagInput"
                  @focus="showTagSuggest = true"
                  @blur="onTagBlur"
                  class="form-control"
                  placeholder="タグ名で検索"
                  autocomplete="off"
                />
                <ul
                  v-if="showTagSuggest && filteredTagSuggestions.length"
                  class="tag-suggest-list"
                >
                  <li
                    v-for="tag in filteredTagSuggestions"
                    :key="tag"
                    @mousedown.prevent="selectTagSuggestion(tag)"
                  >
                    {{ tag }}
                  </li>
                </ul>
              </div>
              <button @click="resetFilters" class="btn-reset tag-reset-btn">
                リセット
              </button>
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
            <th @click="sortBy('title')" class="sortable">
              タイトル
              <span v-if="sortKey === 'title'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('creator')" class="sortable">
              作成者
              <span v-if="sortKey === 'creator'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('createdAt')" class="sortable">
              作成日
              <span v-if="sortKey === 'createdAt'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('deadline')" class="sortable">
              期限
              <span v-if="sortKey === 'deadline'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('process')" class="sortable">
              工程
              <span v-if="sortKey === 'process'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('tags')" class="sortable">
              タグ
              <span v-if="sortKey === 'tags'">
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
            <th @click="sortBy('updatedAt')" class="sortable">
              更新日
              <span v-if="sortKey === 'updatedAt'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="circular in paginatedCirculars" :key="circular.id">
            <td>
              <span class="ellipsis-cell" :title="circular.title">{{
                circular.title
              }}</span>
            </td>
            <td>
              <span class="ellipsis-cell" :title="circular.creator">{{
                circular.creator
              }}</span>
            </td>
            <td>{{ formatDate(circular.createdAt) }}</td>
            <td>{{ formatDate(circular.deadline) }}</td>
            <td>
              <div style="min-width: 150px">
                <div class="process-header">
                  <span class="process-number">{{ circular.process }}</span>
                  <span class="process-total"
                    >/{{ processNames.length - 1 }}</span
                  >
                  <span class="process-name">{{
                    processNames[circular.process]
                  }}</span>
                </div>
                <div class="process-steps-container">
                  <!-- 1-8工程 -->
                  <div class="process-steps">
                    <div
                      v-for="i in 8"
                      :key="i"
                      class="process-step"
                      :class="{
                        'process-step-active': i <= circular.process,
                        'process-step-current': i === circular.process,
                      }"
                      :title="`${i}工程: ${processNames[i]}`"
                    ></div>
                  </div>
                  <!-- 9-16工程 -->
                  <div class="process-steps">
                    <div
                      v-for="i in 7"
                      :key="i + 7"
                      class="process-step"
                      :class="{
                        'process-step-active': i + 7 <= circular.process,
                        'process-step-current': i + 7 === circular.process,
                      }"
                      :title="`${i + 8}工程: ${processNames[i + 8]}`"
                    ></div>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div
                class="tag-cell"
                v-if="Array.isArray(circular.tags) && circular.tags.length"
              >
                <template
                  v-for="(tag, _) in circular.tags.slice(0, 2)"
                  :key="tag.name"
                >
                  <span
                    class="tag-badge ellipsis-cell"
                    :style="{
                      background: tag.color,
                      color: '#fff',
                      maxWidth: '80px',
                    }"
                    :title="tag.name"
                  >
                    {{
                      tag.name.length > 8
                        ? tag.name.slice(0, 8) + '…'
                        : tag.name
                    }}
                  </span>
                </template>
                <span
                  v-if="circular.tags.length > 2"
                  class="tag-more"
                  :title="circular.tags.map((t: Tag) => t.name).join(', ')"
                >
                  +{{ circular.tags.length - 2 }}
                </span>
                <div class="tag-tooltip">
                  <span
                    v-for="tag in circular.tags"
                    :key="tag.name"
                    class="tag-badge"
                    :style="{
                      background: tag.color,
                      color: '#fff',
                      marginRight: '6px',
                    }"
                  >
                    {{ tag.name }}
                  </span>
                </div>
              </div>
              <div v-else>-</div>
            </td>
            <td>
              <span class="ellipsis-cell" :title="circular.updatedBy">{{
                circular.updatedBy
              }}</span>
            </td>
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
    <div class="scroll-guide" id="scroll-guide">{{ guideText }}</div>
    <div class="scroll-fade"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject, onUnmounted } from 'vue';
import { circulars, processNames } from '@/mocks/mockCirculars';

interface Tag {
  name: string;
  color: string;
}

const FILTER_KEY = 'circulars_filter';
const defaultFilter = {
  title: '',
  creator: '',
  dateRange: {
    start: '',
    end: '',
  },
  updateDateRange: {
    start: '',
    end: '',
  },
  process: '',
  updatedBy: '',
  tag: '',
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

  // まずログイン者の部署グループでフィルタリング
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

  // タイトルフィルタ
  if (filter.value.title) {
    const titleKw = filter.value.title.toLowerCase();
    result = result.filter((c: any) => c.title.toLowerCase().includes(titleKw));
  }

  // 作成者フィルタ
  if (filter.value.creator) {
    const creatorKw = filter.value.creator.toLowerCase();
    result = result.filter((c: any) =>
      c.creator.toLowerCase().includes(creatorKw)
    );
  }

  // 工程フィルタ
  if (filter.value.process) {
    result = result.filter(
      (c: any) => String(c.process) === String(filter.value.process)
    );
  }

  // 更新者フィルタ
  if (filter.value.updatedBy) {
    const updatedByKw = filter.value.updatedBy.toLowerCase();
    result = result.filter(
      (c: any) => c.updatedBy && c.updatedBy.toLowerCase().includes(updatedByKw)
    );
  }

  // 作成日範囲でフィルタリング
  if (filter.value.dateRange.start) {
    const startDate = new Date(filter.value.dateRange.start);
    result = result.filter((c: any) => new Date(c.createdAt) >= startDate);
  }
  if (filter.value.dateRange.end) {
    const endDate = new Date(filter.value.dateRange.end);
    result = result.filter((c: any) => new Date(c.createdAt) <= endDate);
  }

  // 更新日範囲でフィルタリング
  if (filter.value.updateDateRange.start) {
    const updateStart = new Date(filter.value.updateDateRange.start);
    result = result.filter((c: any) => new Date(c.updatedAt) >= updateStart);
  }
  if (filter.value.updateDateRange.end) {
    const updateEnd = new Date(filter.value.updateDateRange.end);
    result = result.filter((c: any) => new Date(c.updatedAt) <= updateEnd);
  }

  // タグフィルタ
  if (filter.value.tag) {
    result = result.filter(
      (c: any) =>
        Array.isArray(c.tags) &&
        c.tags.some((t: any) => t.name === filter.value.tag)
    );
  }

  return result;
});

const resetFilters = () => {
  filter.value = { ...defaultFilter };
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP');
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

const sortedCirculars = computed(() => {
  const arr = [...filteredCirculars.value];
  if (!sortKey.value) return arr;
  return arr.sort((a, b) => {
    let aVal = a[sortKey.value];
    let bVal = b[sortKey.value];
    // 日付型はDateとして比較
    if (
      sortKey.value === 'createdAt' ||
      sortKey.value === 'deadline' ||
      sortKey.value === 'updatedAt'
    ) {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else if (sortKey.value === 'tags') {
      // タグは1つ目のタグ名で比較
      aVal =
        Array.isArray(aVal) && aVal.length > 0
          ? aVal[0].name.toLowerCase()
          : '';
      bVal =
        Array.isArray(bVal) && bVal.length > 0
          ? bVal[0].name.toLowerCase()
          : '';
    } else if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const paginatedCirculars = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedCirculars.value.slice(start, start + itemsPerPage.value);
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

// ↓ スクロールガイド用
const guideText = ref('↓ まだ下に続きがあります');
function handleScrollGuide() {
  const scrollGuide = document.getElementById('scroll-guide');
  if (!scrollGuide) return;
  const scrollY = window.scrollY || window.pageYOffset;
  const windowH = window.innerHeight;
  const docH = document.documentElement.scrollHeight;
  if (scrollY + windowH >= docH - 2) {
    guideText.value = '--- 最下部です ---';
  } else {
    guideText.value = '↓ まだ下に続きがあります';
  }
}
onMounted(() => {
  window.addEventListener('scroll', handleScrollGuide);
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollGuide);
});
// ↑ スクロールガイド用

// 全回覧からユニークなタグ名一覧を取得
const uniqueTags = computed(() => {
  const tags = new Set<string>();
  (circulars as { tags?: Tag[] }[]).forEach((c) => {
    if (Array.isArray(c.tags)) {
      c.tags.forEach((t: Tag) => tags.add(t.name));
    }
  });
  return Array.from(tags);
});

// タグサジェスト用
const tagInput = ref('');
const showTagSuggest = ref(false);
const filteredTagSuggestions = computed(() => {
  if (!tagInput.value) return uniqueTags.value;
  return uniqueTags.value.filter((t) => t.includes(tagInput.value));
});
function onTagInput() {
  filter.value.tag = tagInput.value;
  showTagSuggest.value = true;
}
function selectTagSuggestion(tag: string) {
  tagInput.value = tag;
  filter.value.tag = tag;
  showTagSuggest.value = false;
}
function onTagBlur() {
  setTimeout(() => (showTagSuggest.value = false), 100);
}
</script>

<style scoped>
.circular-list {
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

.btn-create {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16pt;
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

.table-container {
  overflow-x: auto;
  margin-top: 0.5rem;
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
  font-size: 16pt;
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
  display: inline-block;
  padding: 0.3rem 0.3rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 15pt;
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
  font-size: 16pt;
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
  font-size: 16pt;
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
  font-size: 16pt;
  color: #333;
}
.pagination-controls select {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 16pt;
}

.footer {
  margin-top: 3rem;
  padding: 1.5rem 0 0 0;
  text-align: center;
  color: #888;
  font-size: 16pt;
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

.process-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.process-number {
  font-size: 1.2em;
  font-weight: bold;
  color: #1976d2;
}

.process-total {
  color: #666;
  font-size: 0.9em;
  margin-right: 4px;
}

.process-name {
  font-weight: 600;
  color: #444;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  margin-left: 4px;
}

.process-steps-container {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.process-steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  position: relative;
  gap: 6px;
}

.process-step {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e0e0e0;
  position: relative;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #ddd;
}

.process-step-active {
  background: #4caf50;
  box-shadow: 0 0 0 1px #4caf50;
}

.process-step-current {
  background: #1976d2;
  box-shadow: 0 0 0 1px #1976d2;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}

.scroll-guide {
  position: sticky;
  bottom: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  text-align: center;
  font-size: 1.1em;
  color: #1976d2;
  padding: 0.5em 0 0.7em 0;
  z-index: 10;
  pointer-events: none;
  user-select: none;
  letter-spacing: 0.1em;
}
.scroll-fade {
  position: sticky;
  bottom: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff 80%);
  pointer-events: none;
  z-index: 9;
}

.tag-cell {
  position: relative;
  display: inline-block;
  max-width: 180px;
}
.tag-badge {
  border-radius: 6px;
  padding: 2px 10px;
  margin-right: 6px;
  font-weight: 600;
  font-size: 0.95em;
  display: inline-block;
  white-space: nowrap;
  transition: filter 0.2s;
}
.tag-more {
  background: #bdbdbd;
  color: #fff;
  border-radius: 6px;
  padding: 2px 10px;
  font-weight: 600;
  font-size: 0.95em;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
}
.tag-cell:hover .tag-tooltip {
  display: block;
}
.tag-tooltip {
  display: none;
  position: absolute;
  left: 0;
  top: 120%;
  background: #fff;
  border: 1px solid #bdbdbd;
  border-radius: 8px;
  box-shadow: 0 2px 8px #0002;
  padding: 8px 12px;
  z-index: 20;
  min-width: 120px;
  white-space: nowrap;
}

.ellipsis-cell {
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.tag-badge.ellipsis-cell {
  max-width: 80px;
}

.tag-filter-row-horizontal {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 0;
}
.tag-suggest-wrapper {
  width: 100%;
  max-width: 320px;
}
.tag-reset-btn {
  margin-left: 0;
  margin-top: 0;
  min-width: 80px;
  max-width: 120px;
  height: 40px;
  width: auto;
  box-sizing: border-box;
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

.filter-group.tag-filter-group {
  flex-basis: 100%;
  width: 100%;
  max-width: 100%;
  margin-top: 0.5rem;
}

@media (max-width: 700px) {
  .tag-filter-row-horizontal {
    flex-direction: column;
    align-items: stretch;
    gap: 0.3rem;
  }
  .tag-suggest-wrapper,
  .tag-reset-btn {
    max-width: 100%;
    min-width: 0;
  }
}
</style>
