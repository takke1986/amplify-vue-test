<template>
  <div class="circular-list">
    <GlobalMessage />
    <ToastMessage ref="toastRef" />
    <div class="header">
      <h2>回覧箋一覧</h2>
      <router-link to="/circulars/create" class="btn-create">
        新規作成
      </router-link>
    </div>

    <div class="filters">
      <!-- 1段目: データ取得条件（やや濃いグレー） -->
      <div class="fetch-filter-block">
        <div class="filter-row">
          <div class="filter-items">
            <div class="filter-group">
              <label for="db-process">工程</label>
              <select
                id="db-process"
                v-model="dbFilter.process"
                class="form-control"
              >
                <option value="">すべて</option>
                <option v-for="idx in 15" :key="idx" :value="idx">
                  {{ idx }}: {{ processNames[idx] }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label for="db-deadline-start">期限（開始）</label>
              <input
                type="date"
                id="db-deadline-start"
                v-model="dbFilter.deadlineRange.start"
                class="form-control"
              />
            </div>
            <div class="filter-group">
              <label for="db-deadline-end">期限（終了）</label>
              <input
                type="date"
                id="db-deadline-end"
                v-model="dbFilter.deadlineRange.end"
                class="form-control"
              />
            </div>
            <div
              class="filter-group apply-button-group"
              style="align-self: flex-end"
            >
              <label>&nbsp;</label>
              <button @click="applyDbFilter" class="btn-apply">
                <span class="refresh-icon">↻</span>データ取得
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 1段目と2段目の間に余白 -->
    <div style="height: 0.5rem"></div>
    <!-- 2段目・3段目まとめてグレー背景で囲む -->
    <div class="local-filter-block">
      <div class="filter-row">
        <div class="filter-items">
          <div class="filter-group">
            <label for="id">識別番号</label>
            <input
              type="text"
              id="id"
              v-model="filter.id"
              class="form-control id-form-control"
              placeholder="識別番号で検索"
            />
          </div>
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
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-items">
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
            <th></th>
            <th @click="sortBy('id')" class="sortable">
              識別番号
              <span v-if="sortKey === 'id'">
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th @click="sortBy('title')" class="sortable">
              タイトル
              <span v-if="sortKey === 'title'">
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="circular in paginatedCirculars" :key="circular.id">
            <td>
              <router-link :to="'/circulars/' + circular.id" class="btn-detail">
                詳細
              </router-link>
            </td>
            <td>
              <span
                class="ellipsis-cell id-cell"
                :title="circular.id"
                @click="copyId(circular.id)"
              >
                {{
                  circular.id.length > 12
                    ? circular.id.slice(0, 4) + '…' + circular.id.slice(-4)
                    : circular.id
                }}
              </span>
            </td>
            <td>
              <span class="ellipsis-cell" :title="circular.title">{{
                circular.title
              }}</span>
            </td>
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
                      maxWidth: '120px',
                    }"
                    :title="tag.name"
                  >
                    {{
                      tag.name.length > 3
                        ? tag.name.slice(0, 4) + '…'
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
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        前へ
      </button>
      <span class="page-info">
        {{ currentPage }} / {{ totalPages }} ページ (全
        {{ filteredCirculars.length }} 件)
      </span>
      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        次へ
      </button>
    </div>
    <footer class="footer">© 2025 回覧箋システム</footer>
    <div class="scroll-guide" id="scroll-guide">{{ guideText }}</div>
    <div class="scroll-fade"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, onActivated } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { processNames } from '@/mocks/mockCirculars';
import GlobalMessage from '@/components/GlobalMessage.vue';
import ToastMessage from '@/components/ToastMessage.vue';

interface Tag {
  name: string;
  color: string;
}

const FILTER_KEY = 'circulars_filter';
const PAGINATION_KEY = 'circulars_pagination';

const defaultFilter = {
  id: '',
  title: '',
  creator: '',
  updateDateRange: {
    start: '',
    end: '',
  },
  process: '',
  updatedBy: '',
  tag: '',
};

const defaultPagination = {
  currentPage: 1,
  itemsPerPage: 10,
  viewedPages: new Set<number>(),
};

const filter = ref({ ...defaultFilter });
const currentPage = ref(defaultPagination.currentPage);
const itemsPerPage = ref(defaultPagination.itemsPerPage);

const client = generateClient<Schema>();

const circulars = ref<any[]>([]);
const isLoading = ref(false);

// ローカルストレージのキー
const CIRCULARS_DATA_KEY = 'circulars_data';

const dbFilter = ref({
  process: '',
  deadlineRange: {
    start: '',
    end: '',
  },
});

const toastRef = ref();

// ページネーション設定をローカルストレージから読み込む
function loadPaginationFromStorage() {
  const saved = localStorage.getItem(PAGINATION_KEY);
  if (saved) {
    try {
      const pagination = JSON.parse(saved);
      currentPage.value = pagination.currentPage;
      itemsPerPage.value = pagination.itemsPerPage;
      // 閲覧済みページの情報を復元
      if (pagination.viewedPages) {
        defaultPagination.viewedPages = new Set(pagination.viewedPages);
      }
    } catch (e) {
      console.error('ページネーション設定の読み込みエラー:', e);
    }
  }
}

// ページネーション設定をローカルストレージに保存
function savePaginationToStorage() {
  try {
    localStorage.setItem(
      PAGINATION_KEY,
      JSON.stringify({
        currentPage: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        viewedPages: Array.from(defaultPagination.viewedPages), // Setを配列に変換して保存
      })
    );
  } catch (e) {
    console.error('ページネーション設定の保存エラー:', e);
  }
}

// ページネーション設定の変更を監視
watch(
  [currentPage, itemsPerPage],
  () => {
    savePaginationToStorage();
  },
  { deep: true }
);

// ローカルストレージからデータを読み込む
function loadCircularsFromStorage() {
  const savedData = localStorage.getItem(CIRCULARS_DATA_KEY);
  if (savedData) {
    try {
      circulars.value = JSON.parse(savedData);
    } catch (e) {
      console.error('ローカルストレージからのデータ読み込みエラー:', e);
    }
  }
}

// データをローカルストレージに保存
function saveCircularsToStorage() {
  try {
    localStorage.setItem(CIRCULARS_DATA_KEY, JSON.stringify(circulars.value));
  } catch (e) {
    console.error('ローカルストレージへのデータ保存エラー:', e);
  }
}

async function fetchCirculars() {
  isLoading.value = true;

  try {
    // データベースフィルターの構築
    const filter: any = {};

    // 工程フィルター
    if (dbFilter.value.process) {
      filter.process = { eq: Number(dbFilter.value.process) };
    }

    // 期限フィルター
    if (
      dbFilter.value.deadlineRange.start ||
      dbFilter.value.deadlineRange.end
    ) {
      filter.deadline = {};
      if (dbFilter.value.deadlineRange.start) {
        filter.deadline.ge = new Date(
          dbFilter.value.deadlineRange.start
        ).toISOString();
      }
      if (dbFilter.value.deadlineRange.end) {
        filter.deadline.le = new Date(
          dbFilter.value.deadlineRange.end
        ).toISOString();
      }
    }

    const { data, errors } = await client.models.Circular.list({
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      selectionSet: [
        'id',
        'title',
        'creator',
        'createdAt',
        'deadline',
        'process',
        'department',
        'updatedBy',
        'updatedAt',
        'fileLinks',
        'content',
        'circulationStatus',
        'circularTags.tag.id',
        'circularTags.tag.name',
        'circularTags.tag.color',
      ],
    });

    if (errors) {
      console.error('APIエラー:', errors);
      return;
    }

    circulars.value = (data ?? []).map((c: any) => {
      const tags = Array.isArray(c.circularTags)
        ? c.circularTags
            .map((ct: any) => (ct && ct.tag ? ct.tag : null))
            .filter(Boolean)
        : [];

      let fileLinks: any[] = [];
      if (typeof c.fileLinks === 'string') {
        try {
          fileLinks = JSON.parse(c.fileLinks);
        } catch (e) {
          console.error('fileLinks JSONパースエラー:', e);
        }
      } else if (Array.isArray(c.fileLinks)) {
        fileLinks = c.fileLinks;
      }

      let circulationStatus: any[] = [];
      if (typeof c.circulationStatus === 'string') {
        try {
          circulationStatus = JSON.parse(c.circulationStatus);
        } catch (e) {
          console.error('circulationStatus JSONパースエラー:', e);
        }
      } else if (Array.isArray(c.circulationStatus)) {
        circulationStatus = c.circulationStatus;
      }

      return {
        ...c,
        tags,
        fileLinks,
        circulationStatus,
        content: typeof c.content === 'string' ? c.content : '',
      };
    });

    // データをローカルストレージに保存
    saveCircularsToStorage();
  } catch (error) {
    console.error('予期せぬエラー:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  // 初期表示時はローカルストレージからデータを読み込む
  loadCircularsFromStorage();

  // フィルター設定を読み込む
  const saved = localStorage.getItem(FILTER_KEY);
  if (saved) {
    try {
      filter.value = JSON.parse(saved);
    } catch {}
  }

  // ページネーション設定を読み込む
  loadPaginationFromStorage();
});

onActivated(() => {
  // ページネーション設定を再読み込み
  loadPaginationFromStorage();
});

watch(
  filter,
  (newVal, oldVal) => {
    // フィルターが実際に変更された場合のみページをリセット
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      currentPage.value = 1;
      savePaginationToStorage();
    }
  },
  { deep: true }
);

const filteredCirculars = computed(() => {
  let result = circulars.value;

  // IDフィルタ
  if (filter.value.id) {
    const idKw = filter.value.id.toLowerCase();
    result = result.filter((c: any) => c.id.toLowerCase().includes(idKw));
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
  currentPage.value = 1;
  savePaginationToStorage();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP');
};

// ページネーション用の状態
const totalPages = computed(() => {
  return Math.ceil(filteredCirculars.value.length / itemsPerPage.value);
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
  const end = start + itemsPerPage.value;
  return sortedCirculars.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    // 閲覧済みページとして記録
    defaultPagination.viewedPages.add(currentPage.value);
    savePaginationToStorage();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    // 閲覧済みページとして記録
    defaultPagination.viewedPages.add(currentPage.value);
    savePaginationToStorage();
  }
};

const onItemsPerPageChange = () => {
  currentPage.value = 1;
  savePaginationToStorage();
};

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
  (circulars.value as { tags?: Tag[] }[]).forEach((c) => {
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

// データベースフィルター適用関数
const applyDbFilter = () => {
  currentPage.value = 1;
  savePaginationToStorage();
  fetchCirculars();
};

function copyId(id: string) {
  navigator.clipboard.writeText(id).then(() => {
    toastRef.value?.show('識別番号をコピーしました: ' + id);
  });
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
  background-color: #008080;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16pt;
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
  color: #424242;
  font-weight: 500;
  min-height: 24px;
  display: flex;
  align-items: center;
  min-width: 80px;
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
  vertical-align: middle;
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
  background-color: #9e9e9e;
}

.status-badge.in_progress {
  background-color: #e67a00;
  color: #ffffff;
}

.status-badge.completed {
  background-color: #008080;
  color: #ffffff;
}

.status-badge.expired {
  background-color: #b8677a;
  color: #ffffff;
}

.btn-reset {
  display: inline-block;
  padding: 0.3rem 0.3rem;
  background-color: #f5f5f5;
  color: #424242;
  border: 1px solid #9e9e9e;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 15pt;
  transition: all 0.2s;
}

.btn-reset:hover {
  background-color: #9e9e9e;
}

.btn-detail {
  padding: 0.25rem 0.75rem;
  background-color: #1976d2;
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
  font-size: 16pt;
  transition: background-color 0.2s;
}

.btn-detail:hover {
  background-color: #1565c0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
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
.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  color: #bbb;
}
.page-info {
  color: #666;
  font-size: 1.1em;
}

.footer {
  margin-top: 3rem;
  padding: 1.5rem 0 0 0;
  text-align: center;
  color: #9e9e9e;
  font-size: 16pt;
}

.recipient-badge {
  display: inline-block;
  background: #f5f5f5;
  color: #424242;
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
  color: #9e9e9e;
  font-size: 0.9em;
  margin-right: 4px;
}

.process-name {
  font-weight: 600;
  color: #424242;
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
  background: #9e9e9e;
  position: relative;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #9e9e9e;
}

.process-step-active {
  background: #008080;
  box-shadow: 0 0 0 1px #008080;
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
  background: #9e9e9e;
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
  border: 1px solid #9e9e9e;
  border-radius: 8px;
  box-shadow: 0 2px 8px #0002;
  padding: 8px 12px;
  z-index: 20;
  min-width: 120px;
  white-space: nowrap;
}

.ellipsis-cell {
  display: inline-block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.tag-badge.ellipsis-cell {
  max-width: 120px;
}

.tag-filter-row-horizontal {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 0;
}
.tag-suggest-wrapper {
  position: relative;
}
.tag-suggest-list {
  max-height: 220px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: absolute;
  z-index: 100;
  width: 100%;
}
.tag-reset-btn {
  margin-left: 0;
  margin-top: 0;
  min-width: 80px;
  max-width: 120px;
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

.apply-button-group {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 140px;
  max-width: 180px;
}

.btn-apply {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16pt;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  margin-top: 0;
}

.btn-apply:hover {
  background-color: #1565c0;
}

.pagination button.viewed {
  background: #f5f5f5;
  border-color: #1976d2;
  color: #1976d2;
}

.pagination button.viewed:hover {
  background: #e3f2fd;
}

.pagination button.viewed.active {
  background: #1976d2;
  color: #fff;
  border-color: #1976d2;
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

/* ID列の幅・中央揃え */
.circular-table th.id-header,
.circular-table td.id-cell {
  max-width: 120px;
  min-width: 80px;
  width: 120px;
  text-align: center;
}

/* 2段目・3段目まとめてグレー背景 */
.local-filter-block {
  background: #f5f5f5;
  border-radius: 0.5rem;
  padding: 1rem 0.7rem;
  margin-bottom: 1.2rem;
}

/* IDフィルタのフォーム幅を100%に */
.id-form-control {
  width: 100%;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.pagination-controls label,
.pagination-controls select {
  font-size: 16pt;
}
</style>
