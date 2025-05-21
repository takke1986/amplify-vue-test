<template>
  <div class="circular-detail">
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>読み込み中...</p>
    </div>
    <div v-else-if="circular" class="content">
      <div class="header">
        <h2>回覧箋詳細</h2>
        <div class="process-visual">
          <div style="min-width: 150px">
            <div class="process-header">
              <span class="process-name"
                >現在：{{ processNames[circular.process] }}工程</span
              >
            </div>
            <div class="process-steps-container">
              <div class="process-steps-names">
                <template v-for="i in processNames.length - 1" :key="i">
                  <div class="process-step-block">
                    <div
                      class="process-step"
                      :class="{
                        'process-step-active': i <= circular.process,
                        'process-step-current': i === circular.process,
                      }"
                      :title="processNames[i]"
                    ></div>
                    <div
                      class="process-step-label"
                      :class="{ 'current-label': i === circular.process }"
                    >
                      {{ processNames[i] }}
                    </div>
                  </div>
                  <div
                    v-if="i < processNames.length - 1"
                    class="process-step-connector"
                  ></div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="actions">
          <button
            v-if="
              !isEditMode &&
              isHaidenUser &&
              isKairanSakiHaiden &&
              circular?.status === 'in_progress'
            "
            @click="enterEditMode"
            class="btn-submit"
          >
            <span
              class="material-icons"
              style="font-size: 1em; vertical-align: middle; margin-right: 4px"
              >edit</span
            >編集
          </button>
          <button
            v-if="
              !isEditMode &&
              isEigyoUser &&
              isKairanSakiEigyo &&
              circular?.status === 'in_progress'
            "
            @click="enterEditMode"
            class="btn-submit"
          >
            <span
              class="material-icons"
              style="font-size: 1em; vertical-align: middle; margin-right: 4px"
              >edit</span
            >編集
          </button>
          <button
            v-if="
              !isEditMode &&
              circular?.status !== 'completed' &&
              ((isHaidenUser && isKairanSakiHaiden) ||
                (isEigyoUser && isKairanSakiEigyo) ||
                true)
            "
            @click="handleEdit"
            class="btn-edit"
          >
            <span
              class="material-icons"
              style="font-size: 1em; vertical-align: middle; margin-right: 4px"
              >edit_note</span
            >項目編集
          </button>
          <button
            v-if="
              !isEditMode &&
              circular?.status !== 'completed' &&
              ((isHaidenUser && isKairanSakiHaiden) ||
                (isEigyoUser && isKairanSakiEigyo) ||
                true)
            "
            @click="handleDelete"
            class="btn-delete"
          >
            <span
              class="material-icons"
              style="font-size: 1em; vertical-align: middle; margin-right: 4px"
              >delete</span
            >削除
          </button>
          <button
            v-if="isEditMode"
            @click="handleEditSubmit"
            class="btn-submit"
          >
            <span
              class="material-icons"
              style="font-size: 1em; vertical-align: middle; margin-right: 4px"
              >save</span
            >保存
          </button>
          <button v-if="isEditMode" @click="cancelEdit" class="btn-cancel">
            <span
              class="material-icons"
              style="font-size: 1em; vertical-align: middle; margin-right: 4px"
              >cancel</span
            >キャンセル
          </button>
          <button @click="handleBack" class="btn-back">
            <span
              class="material-icons"
              style="font-size: 1em; vertical-align: middle; margin-right: 4px"
              >list</span
            >一覧に戻る
          </button>
        </div>
      </div>

      <div v-if="!isEditMode" class="content">
        <div class="info-section">
          <div class="info-item">
            <h3>タイトル</h3>
            <div class="value">{{ circular.title }}</div>
          </div>
          <div class="info-item">
            <h3>作成者</h3>
            <div class="value">{{ circular.creator }}</div>
          </div>
          <div class="info-item">
            <h3>作成日</h3>
            <div class="value">{{ formatDate(circular.createdAt) }}</div>
          </div>
          <div class="info-item">
            <h3>期限</h3>
            <div class="value">{{ formatDate(circular.deadline) }}</div>
          </div>
          <div class="info-item">
            <h3>タグ</h3>
            <div class="value">
              <template v-if="circular.tags && circular.tags.length > 0">
                <span
                  v-for="tag in circular.tags"
                  :key="tag.id"
                  :style="{
                    background: tag.color,
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '2px 10px',
                    marginRight: '6px',
                    fontWeight: 600,
                  }"
                >
                  {{ tag.name }}
                </span>
              </template>
              <template v-else>
                <span
                  style="
                    background: #bdbdbd;
                    color: #fff;
                    border-radius: 6px;
                    padding: 2px 10px;
                    font-weight: 600;
                  "
                  >タグなし</span
                >
              </template>
            </div>
          </div>
        </div>

        <div class="content-section">
          <h3>本文</h3>
          <div class="content-text" v-html="circular.content"></div>
        </div>

        <div v-if="circular.files?.length" class="files-section">
          <h3>URLリンク</h3>
          <ul class="url-link-list">
            <li v-for="file in circular.files" :key="file.id">
              <span>{{ file.name || file.url }}</span>
              <a :href="file.url" target="_blank" rel="noopener noreferrer">{{
                file.url
              }}</a>
              <button
                type="button"
                class="btn-copy-url"
                @click="copyToClipboard(file.url)"
              >
                コピー
              </button>
            </li>
          </ul>
        </div>

        <div v-if="circular.history?.length" class="history-section">
          <h3>更新履歴</h3>
          <div class="history-list-rich">
            <div
              v-for="(h, idx) in circular.history"
              :key="idx"
              class="history-card"
            >
              <div class="history-card-header">
                <span class="history-date-badge">{{ formatDate(h.date) }}</span>
                <span class="history-user-badge">{{ h.user }}</span>
                <span class="history-action-badge">{{ h.action }}</span>
              </div>
              <div v-if="h.comment" class="history-comment-bubble">
                <span v-html="formatHistoryComment(h.comment)"></span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showCommentForm" class="comment-form">
          <h3>コメント</h3>
          <textarea
            v-model="comment"
            class="form-control"
            rows="3"
            placeholder="コメントを入力してください"
          ></textarea>
          <div class="form-actions">
            <button
              @click="handleSubmitComment"
              class="btn-submit"
              :disabled="isSubmitting"
            >
              送信
            </button>
            <button @click="handleCancelComment" class="btn-cancel">
              キャンセル
            </button>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="circular-create">
          <h2>回覧箋編集</h2>
          <form @submit.prevent="handleEditSubmit">
            <div class="form-group">
              <label for="edit-title"
                >タイトル<span class="required">*</span></label
              >
              <input
                id="edit-title"
                v-model="editForm.title"
                type="text"
                class="form-control"
                required
                placeholder="タイトルを入力してください"
              />
            </div>
            <div class="form-group">
              <label for="edit-deadline"
                >期限<span class="required">*</span></label
              >
              <input
                id="edit-deadline"
                v-model="editForm.deadline"
                type="date"
                class="form-control"
                required
                placeholder="期限を選択してください"
              />
            </div>
            <div class="form-group">
              <label for="edit-process"
                >工程<span class="required">*</span></label
              >
              <div class="process-select-buttons">
                <button
                  v-for="n in 15"
                  :key="n"
                  type="button"
                  :class="['process-btn', { selected: editForm.process === n }]"
                  @click="editForm.process = n"
                >
                  {{ processNames[n] }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>タグ</label>
              <div class="tag-select-btn-list">
                <button
                  v-for="tag in validTags"
                  :key="tag.id"
                  type="button"
                  :class="[
                    'tag-select-btn',
                    { selected: isTagSelected(tag.name) },
                  ]"
                  :style="{
                    background: tag.color,
                    color: '#fff',
                    marginRight: '8px',
                    marginBottom: '8px',
                  }"
                  @click="toggleTag(tag.name)"
                >
                  {{ tag.name }}
                  <span v-if="isTagSelected(tag.name)">✓</span>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label for="edit-content"
                >本文<span class="required">*</span></label
              >
              <div id="editor-container"></div>
            </div>
            <div class="form-group">
              <label>URLリンク</label>
              <div class="url-link-input-group">
                <input
                  v-model="editUrlNameInput"
                  type="text"
                  class="form-control"
                  placeholder="リンク名称"
                />
                <input
                  v-model="editUrlInput"
                  type="url"
                  class="form-control"
                  placeholder="https://example.com/"
                />
                <button
                  type="button"
                  class="btn-add-url"
                  @click="addEditUrlLink"
                >
                  追加
                </button>
              </div>
              <ul class="url-link-list">
                <li v-for="(file, idx) in editForm.files" :key="file.id">
                  <span>{{ file.name || file.url }}</span>
                  <a
                    :href="file.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ file.url }}</a
                  >
                  <button
                    type="button"
                    class="btn-remove-url"
                    @click="removeUrlLink(idx)"
                  >
                    削除
                  </button>
                </li>
              </ul>
            </div>
            <div class="form-group">
              <label for="edit-comment">編集コメント</label>
              <textarea
                id="edit-comment"
                v-model="editForm.editComment"
                class="form-control"
                rows="10"
                placeholder="編集内容や理由など"
              ></textarea>
            </div>
            <div v-if="editError" class="error-message">{{ editError }}</div>
            <div class="form-actions">
              <button type="submit" class="btn-submit">保存</button>
              <button type="button" class="btn-cancel" @click="cancelEdit">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-else class="error">
      <p>回覧箋の情報を取得できませんでした。</p>
    </div>
    <div class="scroll-guide" id="scroll-guide">{{ guideText }}</div>
    <div class="scroll-fade"></div>
    <div
      v-if="showImageModal"
      class="image-modal"
      @click.self="closeImageModal"
    >
      <div class="image-modal-content">
        <button class="image-modal-close" @click="closeImageModal">×</button>
        <img :src="modalImageSrc" alt="拡大画像" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  nextTick,
  inject,
  computed,
  onUnmounted,
  onUpdated,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { processNames } from '@/mocks/mockCirculars';
import Quill from 'quill';
import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
import 'quill/dist/quill.snow.css';
import { storeToRefs } from 'pinia';
import { useTagSettingsStore } from '@/stores/tagSettings';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

// プラグイン登録
Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);

interface File {
  id: string;
  name: string;
  url: string;
}

interface CirculationStatus {
  departmentId: string;
  status: 'pending' | 'next' | 'remand' | 'completed';
  comment?: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface HistoryItem {
  date: string;
  user: string;
  action: string;
  comment?: string;
}

interface Circular {
  id: string;
  title: string;
  content: string;
  creator: string;
  createdAt: string;
  deadline: string;
  status: 'draft' | 'in_progress' | 'completed' | 'expired';
  files?: File[];
  circulationStatus: CirculationStatus[];
  department: string;
  updatedBy: string;
  updatedAt: string;
  process: number;
  tags?: Tag[];
  history?: HistoryItem[];
}

const route = useRoute();
const router = useRouter();
const circular = ref<Circular | null>(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const showCommentForm = ref(false);
const comment = ref('');
const isEditMode = ref(false);
const editForm = ref({
  title: '',
  content: '',
  deadline: '',
  files: [] as any[],
  departments: [] as string[],
  selectedDepartment: '',
  tags: [] as Tag[],
  editComment: '',
  process: 1,
});
let quill: any = null;

const currentUser = inject('currentUser') as any;

function getKairanSaki(busho: string | number | undefined): string {
  if (busho === undefined) return '';
  const num = Number(busho);
  if (isNaN(num)) return '';
  return num % 10 === 1 ? String(num + 1) : String(num - 1);
}
const kairanSakiId = computed(() => getKairanSaki(circular.value?.department));

// 営業ユーザー判定
const isEigyoUser = computed(() =>
  String(currentUser?.value?.busho).endsWith('1')
);

// 配電ユーザー判定
const isHaidenUser = computed(() =>
  String(currentUser?.value?.busho).endsWith('2')
);

// 回覧先が営業でない判定
const isKairanSakiEigyo = computed(() => {
  const kairanSaki = circular.value?.circulationStatus?.[0]?.departmentId;
  return kairanSaki ? String(kairanSaki).endsWith('1') : false;
});

// 回覧先が配電かつ配電ユーザーの場合の判定
const isKairanSakiHaiden = computed(() => {
  const kairanSaki = circular.value?.circulationStatus?.[0]?.departmentId;
  return kairanSaki ? String(kairanSaki).endsWith('2') : false;
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP');
};

const client = generateClient<Schema>();

// IndexedDBの設定
const DB_NAME = 'circular_cache_db';
const DB_VERSION = 1;
const CIRCULAR_STORE = 'circulars';
const TAGS_STORE = 'tags';
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
      if (!db.objectStoreNames.contains(CIRCULAR_STORE)) {
        db.createObjectStore(CIRCULAR_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(TAGS_STORE)) {
        db.createObjectStore(TAGS_STORE, { keyPath: 'id' });
      }
    };
  });
};

// キャッシュからデータを取得
const getFromCache = async (storeName: string, id: string) => {
  try {
    const db = await initDB();
    return new Promise<any>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const data = request.result;
        if (data && Date.now() - data.timestamp < CACHE_EXPIRY) {
          resolve(data.data);
        } else {
          // 有効期限切れのデータを削除
          const deleteTransaction = db.transaction(storeName, 'readwrite');
          const deleteStore = deleteTransaction.objectStore(storeName);
          deleteStore.delete(id);
          resolve(null);
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
    return null;
  }
};

// データをキャッシュに保存
const saveToCache = async (storeName: string, id: string, data: any) => {
  try {
    const db = await initDB();
    return new Promise<boolean>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({
        id,
        data,
        timestamp: Date.now(),
      });

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('キャッシュの保存に失敗しました:', error);
    return false;
  }
};

// キャッシュをクリア
const clearCache = async (id: string) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(
      [CIRCULAR_STORE, TAGS_STORE],
      'readwrite'
    );
    const circularStore = transaction.objectStore(CIRCULAR_STORE);
    const tagsStore = transaction.objectStore(TAGS_STORE);

    circularStore.delete(id);
    tagsStore.delete(id);

    return new Promise<boolean>((resolve) => {
      transaction.oncomplete = () => {
        db.close();
        resolve(true);
      };
    });
  } catch (error) {
    console.error('キャッシュのクリアに失敗しました:', error);
    return false;
  }
};

const fetchCircular = async () => {
  try {
    isLoading.value = true;
    const id = route.params.id as string;

    // キャッシュから回覧箋データを取得
    const cachedCircular = await getFromCache(CIRCULAR_STORE, id);
    if (cachedCircular) {
      circular.value = cachedCircular as Circular;
      isLoading.value = false;
      return;
    }

    const { data, errors } = await client.models.Circular.get({
      id,
      selectionSet: [
        'id',
        'title',
        'content',
        'creator',
        'createdAt',
        'deadline',
        'status',
        'department',
        'updatedBy',
        'updatedAt',
        'process',
        'history',
        'circulationStatus',
        'fileLinks',
        { circularTags: [{ tag: ['id', 'name', 'color'] }] },
      ] as any,
    });

    if (errors) {
      console.error('回覧箋の取得エラー:', errors);
      circular.value = null;
      return;
    }

    if (!data) {
      console.error('回覧箋のデータが存在しません');
      circular.value = null;
      return;
    }

    // タグ情報を取得
    try {
      // キャッシュからタグ情報を取得
      const cachedTags = await getFromCache(TAGS_STORE, id);
      let tags: Tag[] = [];

      if (cachedTags) {
        tags = cachedTags;
      } else {
        const { data: circularTags } = await client.models.CircularTag.list({
          filter: {
            circularId: { eq: id },
          },
        });

        if (Array.isArray(circularTags)) {
          for (const ct of circularTags) {
            if (ct.tagId) {
              const { data: tagData } = await client.models.Tag.get({
                id: ct.tagId,
              });
              if (tagData) {
                tags.push({
                  id: tagData.id,
                  name: tagData.name,
                  color: tagData.color,
                });
              }
            }
          }
        }
        // タグ情報をキャッシュに保存
        await saveToCache(TAGS_STORE, id, tags);
      }

      // fileLinks(JSON文字列)を配列に
      let files: File[] = [];
      try {
        files = data.fileLinks ? JSON.parse(data.fileLinks) : [];
      } catch {
        files = [];
      }
      // history(JSON文字列)を配列に
      let history: HistoryItem[] = [];
      try {
        history = data.history ? JSON.parse(data.history) : [];
      } catch {
        history = [];
      }
      // circulationStatus(JSON文字列)を配列に
      let circulationStatus: CirculationStatus[] = [];
      try {
        circulationStatus = data.circulationStatus
          ? JSON.parse(data.circulationStatus)
          : [];
      } catch {
        circulationStatus = [];
      }

      const circularData: Circular = {
        id: String(data.id),
        title: String(data.title),
        content: String(data.content),
        creator: String(data.creator),
        createdAt: String(data.createdAt),
        deadline: String(data.deadline),
        status: data.status as
          | 'draft'
          | 'in_progress'
          | 'completed'
          | 'expired',
        department: String(data.department),
        updatedBy: String(data.updatedBy),
        updatedAt: String(data.updatedAt),
        process: Number(data.process),
        tags,
        files,
        history,
        circulationStatus,
      };

      // 回覧箋データをキャッシュに保存
      await saveToCache(CIRCULAR_STORE, id, circularData);
      circular.value = circularData;
    } catch (tagError) {
      console.error('タグ情報の取得に失敗しました:', tagError);
      // タグ情報の取得に失敗しても、他の情報は表示する
      const circularData: Circular = {
        id: String(data.id),
        title: String(data.title),
        content: String(data.content),
        creator: String(data.creator),
        createdAt: String(data.createdAt),
        deadline: String(data.deadline),
        status: data.status as
          | 'draft'
          | 'in_progress'
          | 'completed'
          | 'expired',
        department: String(data.department),
        updatedBy: String(data.updatedBy),
        updatedAt: String(data.updatedAt),
        process: Number(data.process),
        tags: [],
        files: data.fileLinks ? JSON.parse(data.fileLinks) : [],
        history: data.history ? JSON.parse(data.history) : [],
        circulationStatus: data.circulationStatus
          ? JSON.parse(data.circulationStatus)
          : [],
      };

      // 回覧箋データをキャッシュに保存
      await saveToCache(CIRCULAR_STORE, id, circularData);
      circular.value = circularData;
    }
  } catch (error) {
    console.error('回覧箋の取得に失敗しました:', error);
    circular.value = null;
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = () => {
  enterEditMode();
};

// 削除時のキャッシュクリア
const deleteCircularFromCache = async (id: string) => {
  try {
    // 回覧箋データとタグ情報のキャッシュを削除
    await clearCache(id);
    return true;
  } catch (error) {
    console.error('回覧箋のキャッシュ削除に失敗しました:', error);
    return false;
  }
};

const handleDelete = async () => {
  if (
    !circular.value ||
    !window.confirm('この回覧箋を削除してもよろしいですか？')
  ) {
    return;
  }

  try {
    // APIで削除
    const { errors } = await client.models.Circular.delete({
      id: circular.value.id,
    });

    if (errors) {
      console.error('回覧箋の削除に失敗しました:', errors);
      alert('回覧箋の削除に失敗しました。');
      return;
    }

    // キャッシュからも削除
    await deleteCircularFromCache(circular.value.id);

    // 一覧に戻る
    router.push('/circulars');
  } catch (error) {
    console.error('回覧箋の削除に失敗しました:', error);
    alert('回覧箋の削除に失敗しました。');
  }
};

const handleSubmitComment = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    // TODO: APIを呼び出して承認/否認を送信
    console.log('コメント:', comment.value);
    showCommentForm.value = false;
    comment.value = '';
    await fetchCircular(); // 回覧箋の情報を再取得
  } catch (error) {
    console.error('コメントの送信に失敗しました:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancelComment = () => {
  showCommentForm.value = false;
  comment.value = '';
};

const handleBack = () => {
  router.push('/circulars');
};

// 編集モードに入る前の状態を保存
const originalState = ref<any>(null);

const enterEditMode = async () => {
  if (!circular.value) return;

  // 現在の状態を保存
  originalState.value = {
    title: circular.value.title,
    content: circular.value.content,
    deadline: circular.value.deadline,
    files: circular.value.files ? [...circular.value.files] : [],
    tags: circular.value.tags ? [...circular.value.tags] : [],
    process: circular.value.process || 1,
    departments: circular.value.circulationStatus.map((cs) => cs.departmentId),
  };

  isEditMode.value = true;
  // 編集用フォームに値をコピー
  editForm.value.title = circular.value.title;
  editForm.value.content = circular.value.content;
  editForm.value.deadline = circular.value.deadline;
  editForm.value.files = circular.value.files ? [...circular.value.files] : [];
  // タグの初期化を修正
  editForm.value.tags = circular.value.tags
    ? circular.value.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      }))
    : [];
  editForm.value.process = circular.value.process || 1;
  editForm.value.departments = circular.value.circulationStatus.map(
    (cs) => cs.departmentId
  );

  await nextTick();
  quill = new Quill('#editor-container', {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
      imageDropAndPaste: true,
    },
    placeholder:
      '本文を入力、画像は貼り付け・ドラッグ＆ドロップ・画像ボタンで挿入できます',
    readOnly: false,
    theme: 'snow',
  });
  quill.root.innerHTML = editForm.value.content;
  quill.on('text-change', () => {
    editForm.value.content = quill!.root.innerHTML;
  });
};

const editError = ref('');

// 新規作成時のキャッシュ保存
const saveNewCircularToCache = async (circularData: Circular) => {
  try {
    // 回覧箋データをキャッシュに保存
    await saveToCache(CIRCULAR_STORE, circularData.id, circularData);

    // タグ情報をキャッシュに保存
    if (circularData.tags && circularData.tags.length > 0) {
      await saveToCache(TAGS_STORE, circularData.id, circularData.tags);
    }

    return true;
  } catch (error) {
    console.error('新規回覧箋のキャッシュ保存に失敗しました:', error);
    return false;
  }
};

// 更新時のキャッシュ保存
const updateCircularInCache = async (circularData: Circular) => {
  try {
    // 既存のキャッシュをクリア
    await clearCache(circularData.id);

    // 新しいデータをキャッシュに保存
    await saveToCache(CIRCULAR_STORE, circularData.id, circularData);

    // タグ情報をキャッシュに保存
    if (circularData.tags && circularData.tags.length > 0) {
      await saveToCache(TAGS_STORE, circularData.id, circularData.tags);
    }

    return true;
  } catch (error) {
    console.error('回覧箋のキャッシュ更新に失敗しました:', error);
    return false;
  }
};

const handleEditSubmit = async () => {
  editError.value = '';
  if (
    !editForm.value.title ||
    !editForm.value.deadline ||
    !editForm.value.content ||
    editForm.value.content === '<p><br></p>'
  ) {
    editError.value = 'すべての必須項目を入力してください。';
    return;
  }
  if (!circular.value) return;

  try {
    const prevProcess = circular.value.process;
    const updateData = {
      id: circular.value.id,
      title: editForm.value.title,
      content: editForm.value.content,
      deadline: editForm.value.deadline,
      process: editForm.value.process,
      editComment: editForm.value.editComment,
      updatedBy:
        currentUser?.value?.displayname ||
        currentUser?.value?.username ||
        '未取得',
      updatedAt: new Date().toISOString(),
    };

    // 履歴追加
    let history = circular.value.history || [];
    let comment = editForm.value.editComment || '';
    if (prevProcess !== editForm.value.process) {
      const from = processNames[prevProcess];
      const to = processNames[editForm.value.process];
      comment = `工程を${from}→${to}に変更` + (comment ? `／${comment}` : '');
    }
    history.push({
      date: new Date().toISOString(),
      user:
        currentUser?.value?.displayname ||
        currentUser?.value?.username ||
        '未取得',
      action: '編集',
      comment,
    });

    // 回覧先（自動決定）を反映
    const circulationStatus = [
      {
        departmentId: kairanSakiId.value,
        status: 'pending',
        comment: '',
      },
    ];

    const { errors } = await client.models.Circular.update({
      id: updateData.id,
      title: updateData.title,
      content: updateData.content,
      deadline: updateData.deadline,
      process: updateData.process,
      updatedBy: updateData.updatedBy,
      updatedAt: updateData.updatedAt,
      history: JSON.stringify(history),
      circulationStatus: JSON.stringify(circulationStatus),
    });

    if (errors) {
      console.error('回覧箋の更新に失敗しました:', errors);
      editError.value = '回覧箋の更新に失敗しました。';
      return;
    }

    // タグの更新
    // 1. 既存のCircularTagを取得
    const { data: existingCircularTags } = await client.models.CircularTag.list(
      {
        filter: {
          circularId: { eq: circular.value.id },
        },
      }
    );

    // 2. 既存のタグを削除
    if (existingCircularTags) {
      for (const circularTag of existingCircularTags) {
        await client.models.CircularTag.delete({ id: circularTag.id });
      }
    }

    // 3. 新しいタグを作成
    if (editForm.value.tags && editForm.value.tags.length > 0) {
      for (const tag of editForm.value.tags) {
        const tagData = tagSettings.value.find((t) => t.name === tag.name);
        if (tagData) {
          await client.models.CircularTag.create({
            circularId: circular.value.id,
            tagId: tagData.id,
          });
        }
      }
    }

    // 更新されたデータをキャッシュに保存
    const updatedCircularData: Circular = {
      ...circular.value,
      title: updateData.title,
      content: updateData.content,
      deadline: updateData.deadline,
      process: updateData.process,
      updatedBy: updateData.updatedBy,
      updatedAt: updateData.updatedAt,
      history,
      circulationStatus,
      tags: editForm.value.tags || [],
    };

    await updateCircularInCache(updatedCircularData);

    // 更新成功後、回覧箋の情報を再取得
    await fetchCircular();
    isEditMode.value = false;
  } catch (error) {
    console.error('回覧箋の更新に失敗しました:', error);
    editError.value = '回覧箋の更新に失敗しました。';
  }
};

// 新規作成時の処理
const handleCreate = async (circularData: Circular) => {
  try {
    // APIで新規作成
    const { data, errors } = await client.models.Circular.create({
      title: circularData.title,
      content: circularData.content,
      deadline: circularData.deadline,
      process: circularData.process,
      creator:
        currentUser?.value?.displayname ||
        currentUser?.value?.username ||
        '未取得',
      createdAt: new Date().toISOString(),
      updatedBy:
        currentUser?.value?.displayname ||
        currentUser?.value?.username ||
        '未取得',
      updatedAt: new Date().toISOString(),
      department: circularData.department,
      status: 'draft',
      history: JSON.stringify([
        {
          date: new Date().toISOString(),
          user:
            currentUser?.value?.displayname ||
            currentUser?.value?.username ||
            '未取得',
          action: '作成',
          comment: '',
        },
      ]),
      circulationStatus: JSON.stringify([
        {
          departmentId: kairanSakiId.value,
          status: 'pending',
          comment: '',
        },
      ]),
    });

    if (errors) {
      console.error('回覧箋の作成に失敗しました:', errors);
      return null;
    }

    if (!data) {
      console.error('回覧箋の作成に失敗しました: データが返されませんでした');
      return null;
    }

    // 作成されたデータをキャッシュに保存
    const newCircularData: Circular = {
      ...circularData,
      id: data.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    await saveNewCircularToCache(newCircularData);

    return newCircularData;
  } catch (error) {
    console.error('回覧箋の作成に失敗しました:', error);
    return null;
  }
};

const cancelEdit = () => {
  // Quillエディタのクリーンアップ
  if (quill) {
    const editor = document.querySelector('#editor-container');
    if (editor) {
      editor.innerHTML = '';
    }
    quill = null;
  }

  // 編集フォームの状態をリセット
  editForm.value = {
    title: '',
    content: '',
    deadline: '',
    files: [],
    departments: [],
    selectedDepartment: '',
    tags: [],
    editComment: '',
    process: 1,
  };

  // URL入力欄をリセット
  editUrlNameInput.value = '';
  editUrlInput.value = '';

  // エラーメッセージをクリア
  editError.value = '';

  // 編集モードを終了
  isEditMode.value = false;

  // 回覧箋の情報を再取得
  fetchCircular();
};

// タグ選択用
function toggleTag(tagName: string) {
  if (!editForm.value.tags) editForm.value.tags = [];
  const tag = tagSettings.value.find((t) => t.name === tagName);
  if (tag && tag.name) {
    // タグ名が存在する場合のみ処理
    const idx = editForm.value.tags.findIndex((t) => t.name === tagName);
    if (idx === -1) {
      editForm.value.tags.push({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      });
    } else {
      editForm.value.tags.splice(idx, 1);
    }
  }
}

function isTagSelected(tagName: string) {
  return editForm.value.tags?.some((t) => t.name === tagName) || false;
}

// 有効なタグのみをフィルタリング
const validTags = computed(() => {
  return tagSettings.value.filter((tag) => tag.name && tag.name.trim() !== '');
});

// 履歴コメントの工程部分をバッジ化
function formatHistoryComment(comment: string): string {
  // 「工程を〇〇→△△に変更」パターンを検出
  const regex = /工程を(.+?)→(.+?)に変更/;
  const match = comment.match(regex);
  if (match) {
    const from = match[1];
    const to = match[2];
    const badgeFrom = `<span class='process-badge'>${from}</span>`;
    const badgeTo = `<span class='process-badge'>${to}</span>`;
    // 工程部分をバッジに置換
    return comment.replace(regex, `工程を${badgeFrom}→${badgeTo}に変更`);
  }
  return comment;
}

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
  fetchCircular();
  window.addEventListener('scroll', handleScrollGuide);
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollGuide);
});
// ↑ スクロールガイド用

// 画像モーダル用
const showImageModal = ref(false);
const modalImageSrc = ref('');
function openImageModal(src: string) {
  modalImageSrc.value = src;
  showImageModal.value = true;
}
function closeImageModal() {
  showImageModal.value = false;
  modalImageSrc.value = '';
}
// 本文内画像クリックでモーダル表示（詳細画面・編集画面で分けてバインド）
function bindImageClickEvent() {
  nextTick(() => {
    const detailContent = document.querySelector('.content-text');
    if (detailContent) {
      detailContent.removeEventListener('click', handleDetailImageClick);
      detailContent.addEventListener('click', handleDetailImageClick);
    }
    const quillEditor = document.querySelector('#editor-container .ql-editor');
    if (quillEditor) {
      quillEditor.removeEventListener('click', handleQuillImageClick);
      quillEditor.addEventListener('click', handleQuillImageClick);
    }
  });
}
function handleDetailImageClick(e: any) {
  if (e.target && e.target.tagName === 'IMG') {
    openImageModal(e.target.src);
  }
}
function handleQuillImageClick(e: any) {
  if (e.target && e.target.tagName === 'IMG') {
    openImageModal(e.target.src);
  }
}
onMounted(() => {
  fetchCircular();
  window.addEventListener('scroll', handleScrollGuide);
  bindImageClickEvent();
});
onUpdated(() => {
  bindImageClickEvent();
});

const tagSettingsStore = useTagSettingsStore();
const { tagSettings } = storeToRefs(tagSettingsStore);

// 編集画面のURLリンク入力欄を修正
const editUrlNameInput = ref('');
const editUrlInput = ref('');
function addEditUrlLink() {
  const name = editUrlNameInput.value.trim();
  const url = editUrlInput.value.trim();
  if (!url) return;
  try {
    new URL(url);
  } catch {
    editError.value = '有効なURLを入力してください。';
    return;
  }
  if (editForm.value.files.some((file) => file.url === url)) {
    editError.value = '同じURLは追加できません。';
    return;
  }
  editForm.value.files.push({
    id: Date.now().toString(),
    name: name || url,
    url,
  });
  editUrlNameInput.value = '';
  editUrlInput.value = '';
  editError.value = '';
}
function copyToClipboard(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    alert('リンクをコピーしました');
  });
}
function removeUrlLink(idx: number) {
  if (Array.isArray(editForm.value.files)) {
    editForm.value.files.splice(idx, 1);
  }
}

// タグの初期化
onMounted(async () => {
  await tagSettingsStore.fetchTags();
  await fetchCircular();
  window.addEventListener('scroll', handleScrollGuide);
  bindImageClickEvent();
});
</script>

<style scoped>
.circular-create,
.circular-detail > .content {
  max-width: 1600px;
  margin: 0.5rem auto 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 2rem 2.5rem 2rem;
}
.section-card {
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 1.5rem 1rem;
  margin-bottom: 2rem;
}
h2 {
  margin-bottom: 1.2rem;
  font-size: 2rem;
  color: #222;
  font-weight: 700;
}
h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #1565c0;
  font-weight: 600;
}
label,
.value,
.file-link,
.info-section,
.content-section,
.files-section,
.circulation-section,
.history-section,
.history-list,
.history-date,
.history-user,
.history-action,
.history-comment {
  font-size: 16pt;
}
.required {
  color: #e53935;
  margin-left: 0.25em;
}
.form-group {
  margin-bottom: 1.2rem;
}
.form-control {
  width: 100%;
  padding: 0.7rem;
  border: 1.5px solid #bdbdbd;
  border-radius: 4px;
  font-size: 16pt;
  transition: border-color 0.2s;
}
.form-control:focus {
  border-color: #1976d2;
  outline: none;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.btn-submit,
.btn-next,
.btn-remand,
.btn-cancel,
.btn-back,
.btn-complete {
  font-size: 16pt;
  padding: 0.85rem 2.5rem;
}
.btn-submit:hover,
.btn-next:hover,
.btn-remand:hover,
.btn-cancel:hover,
.btn-back:hover,
.btn-complete:hover {
  background: #005fa3;
  box-shadow: 0 4px 16px rgba(0, 120, 212, 0.15);
}
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 1em;
  font-weight: 600;
  margin-right: 0.5em;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.status-badge.draft {
  background-color: #e0e0e0;
  color: #616161;
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
.status-badge .material-icons {
  margin-right: 6px;
  font-size: 1.2em;
}
.status-badge.in_progress .material-icons {
  color: #ff9800;
}
.status-badge.completed .material-icons {
  color: #43a047;
}
.status-badge.expired .material-icons {
  color: #e53935;
}
.status-badge.draft .material-icons {
  color: #757575;
}
.status-badge.remand {
  background-color: #ffebee;
  color: #c62828;
}
.status-badge.remand .material-icons {
  color: #e53935;
}
.status-badge.next {
  background-color: #e8f5e9;
  color: #2e7d32;
}
.status-badge.next .material-icons {
  color: #43a047;
}
.status-badge.pending {
  background-color: #e3f2fd;
  color: #1976d2;
}
.status-badge.pending .material-icons {
  color: #1976d2;
}
.info-item {
  margin-bottom: 1.8rem;
}
.file-link {
  color: #1976d2;
  text-decoration: underline;
  font-weight: 600;
  transition: color 0.2s;
}
.file-link:hover {
  color: #0d47a1;
}
.circulation-item {
  margin-bottom: 1.2rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid #e0e0e0;
}
.circulation-item:last-child {
  border-bottom: none;
}
.department {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.2rem;
}
.comment {
  margin-top: 0.3rem;
  color: #616161;
  font-size: 0.98em;
}
.error-message {
  color: #e53935;
  margin-bottom: 1rem;
  font-size: 1rem;
}
.form-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}
.loading {
  text-align: center;
  padding: 3rem 0;
}
.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0078d4;
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
.btn-complete {
  background: #2e7d32;
  color: #fff;
  border: none;
  padding: 0.85rem 2.2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-complete:hover {
  background: #1b5e20;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.15);
}
.url-link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.url-link-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.3rem;
}
.url-link-input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.btn-add-url {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-add-url:hover {
  background: #005fa3;
}
.btn-remove-url {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.2rem 0.8rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-remove-url:hover {
  background: #b71c1c;
}
.tag-select-btn-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.tag-select-btn {
  border: none;
  border-radius: 6px;
  padding: 0.4em 1.2em;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s, box-shadow 0.2s;
}
.tag-select-btn.selected {
  opacity: 1;
  box-shadow: 0 0 0 2px #1976d2;
}
.process-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}
.process-name {
  font-weight: 600;
  color: #444;
  background: #f5f5f5;
  padding: 10px 10px;
  border-radius: 4px;
  font-size: 2em;
  margin-left: 4px;
}
.process-steps-container {
  margin-top: 20px;
  margin-bottom: 30px;
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
  width: 15px;
  height: 15px;
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
.process-steps-names {
  display: flex;
  flex-direction: row;
  gap: 0px;
  justify-content: flex-start;
  align-items: flex-end;
  margin-bottom: 10px;
}
.process-step-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
  position: relative;
}
.process-step-connector {
  width: 32px;
  height: 0;
  border-bottom: 2px dashed #bbb;
  align-self: center;
  margin-bottom: 18px;
}
.process-step-label {
  font-size: 0.85em;
  color: #888;
  margin-top: 2px;
  white-space: nowrap;
  text-align: center;
  max-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.current-label {
  color: #1976d2;
  font-weight: bold;
  background: #e3f2fd;
  border-radius: 6px;
  padding: 0 4px;
}
.process-step-current {
  background: #1976d2 !important;
  box-shadow: 0 0 0 1px #1976d2;
}
.process-select-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.process-btn {
  background: #f5f5f5;
  color: #1976d2;
  border: 1.5px solid #bdbdbd;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border 0.2s;
}
.process-btn.selected {
  background: #1976d2;
  color: #fff;
  border: 2px solid #1976d2;
}
.process-btn:hover {
  background: #e3f2fd;
}
</style>

<style>
.ql-editor {
  min-height: 320px;
  height: 100%;
  background: #fafbfc;
  border-radius: 4px;
  font-size: 16pt;
}
.ql-editor img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
  cursor: pointer;
  border: 1.5px solid #e0e0e0;
  box-sizing: border-box;
}
.content-text img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
  cursor: pointer;
  border: 1.5px solid #e0e0e0;
  box-sizing: border-box;
}
#editor-container {
  margin-bottom: 1rem;
}
</style>

<style scoped>
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
</style>

<style>
/* 更新履歴リッチ表示用CSSを追加 */
.history-list-rich {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}
.history-card {
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 5px solid #1976d2;
}
.history-card-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.history-date-badge {
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 0.95em;
  font-weight: 600;
}
.history-user-badge {
  background: #fffde7;
  color: #bfa100;
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 0.95em;
  font-weight: 600;
}
.history-action-badge {
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 0.95em;
  font-weight: 600;
}
.history-comment-bubble {
  background: #fff;
  border: 1.5px solid #bdbdbd;
  border-radius: 8px;
  padding: 0.7em 1em;
  margin-top: 0.3em;
  color: #333;
  font-size: 1em;
  position: relative;
}
.history-comment-bubble:before {
  content: '';
  position: absolute;
  top: -10px;
  left: 24px;
  border-width: 0 10px 10px 10px;
  border-style: solid;
  border-color: transparent transparent #bdbdbd transparent;
}
.history-comment-bubble:after {
  content: '';
  position: absolute;
  top: -8px;
  left: 25px;
  border-width: 0 9px 9px 9px;
  border-style: solid;
  border-color: transparent transparent #fff transparent;
}
</style>

<style>
/* 履歴工程バッジ用CSSを追加 */
.process-badge {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.95em;
  font-weight: 600;
  margin: 0 2px;
}
</style>

<style>
/* ボタン色分け */
.btn-submit {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.85rem 2.5rem;
  font-size: 16pt;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-submit:hover {
  background: #1565c0;
}
.btn-edit {
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.85rem 2.5rem;
  font-size: 16pt;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-edit:hover {
  background: #f57c00;
}
.btn-delete {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.85rem 2.5rem;
  font-size: 16pt;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-delete:hover {
  background: #b71c1c;
}
.btn-cancel,
.btn-back {
  background: #bdbdbd;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.85rem 2.5rem;
  font-size: 16pt;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-cancel:hover,
.btn-back:hover {
  background: #757575;
}
.btn-complete {
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.85rem 2.5rem;
  font-size: 16pt;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-complete:hover {
  background: #1b5e20;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.15);
}
</style>

<style>
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.image-modal-content {
  position: relative;
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.25);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-modal-content img {
  max-width: 80vw;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.image-modal-close {
  position: fixed;
  top: 32px;
  right: 48px;
  background: #fff;
  border: none;
  font-size: 2rem;
  color: #333;
  cursor: pointer;
  z-index: 10001;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: background 0.2s;
}
.image-modal-close:hover {
  background: #eee;
}
</style>
