<template>
  <div class="circular-detail">
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>読み込み中...</p>
    </div>
    <div v-else-if="circular" class="content">
      <div class="header">
        <h2>回覧箋詳細</h2>
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
          <button
            v-if="
              !isEditMode && isEigyoUser && circular?.status !== 'completed'
            "
            @click="handleComplete"
            class="btn-complete"
          >
            完了
          </button>
          <button
            v-if="
              !isEditMode &&
              isHaidenUser &&
              isKairanSakiHaiden &&
              circular?.status === 'in_progress'
            "
            @click="handleNext"
            class="btn-next"
            :disabled="isSubmitting"
          >
            <span
              class="material-icons"
              style="font-size: 1em; vertical-align: middle; margin-right: 4px"
              >arrow_forward</span
            >次工程
          </button>
          <button
            v-if="
              !isEditMode &&
              isHaidenUser &&
              isKairanSakiHaiden &&
              circular?.status === 'in_progress'
            "
            @click="handleRemand"
            class="btn-remand"
            :disabled="isSubmitting"
          >
            <span
              class="material-icons"
              style="font-size: 1em; vertical-align: middle; margin-right: 4px"
              >undo</span
            >差し戻し
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
            <label>タイトル</label>
            <div class="value">{{ circular.title }}</div>
          </div>
          <div class="info-item">
            <label>作成者</label>
            <div class="value">{{ circular.creator }}</div>
          </div>
          <div class="info-item">
            <label>作成日</label>
            <div class="value">{{ formatDate(circular.createdAt) }}</div>
          </div>
          <div class="info-item">
            <label>期限</label>
            <div class="value">{{ formatDate(circular.deadline) }}</div>
          </div>
          <div class="info-item">
            <label>ステータス</label>
            <div class="value">
              <span :class="['status-badge', circular.status]">
                <span
                  class="material-icons"
                  v-if="circular.status === 'in_progress'"
                  style="
                    font-size: 1em;
                    vertical-align: middle;
                    margin-right: 4px;
                  "
                  >autorenew</span
                >
                <span
                  class="material-icons"
                  v-else-if="circular.status === 'completed'"
                  style="
                    font-size: 1em;
                    vertical-align: middle;
                    margin-right: 4px;
                  "
                  >check_circle</span
                >
                <span
                  class="material-icons"
                  v-else-if="circular.status === 'expired'"
                  style="
                    font-size: 1em;
                    vertical-align: middle;
                    margin-right: 4px;
                  "
                  >error</span
                >
                <span
                  class="material-icons"
                  v-else-if="circular.status === 'draft'"
                  style="
                    font-size: 1em;
                    vertical-align: middle;
                    margin-right: 4px;
                  "
                  >hourglass_empty</span
                >
                {{ getStatusText(circular.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="content-section">
          <h3>本文</h3>
          <div class="content-text" v-html="circular.content"></div>
        </div>

        <div v-if="circular.files?.length" class="files-section">
          <h3>添付ファイル</h3>
          <div class="file-list">
            <div
              v-for="file in circular.files"
              :key="file.id"
              class="file-item"
            >
              <a :href="file.url" target="_blank" class="file-link">
                {{ file.name }}
              </a>
            </div>
          </div>
        </div>

        <div class="circulation-section">
          <h3>回覧状況</h3>
          <div class="circulation-list">
            <div
              v-for="status in circular.circulationStatus"
              :key="status.departmentId"
              class="circulation-item"
            >
              <div class="department">
                {{ getDepartmentName(status.departmentId) }}
              </div>
              <div class="status">
                <span :class="['status-badge', status.status]">
                  <span
                    class="material-icons"
                    v-if="status.status === 'pending'"
                    style="
                      font-size: 1em;
                      vertical-align: middle;
                      margin-right: 4px;
                    "
                    >hourglass_empty</span
                  >
                  <span
                    class="material-icons"
                    v-else-if="status.status === 'next'"
                    style="
                      font-size: 1em;
                      vertical-align: middle;
                      margin-right: 4px;
                    "
                    >check_circle</span
                  >
                  <span
                    class="material-icons"
                    v-else-if="status.status === 'remand'"
                    style="
                      font-size: 1em;
                      vertical-align: middle;
                      margin-right: 4px;
                    "
                    >undo</span
                  >
                  {{ getCirculationStatusText(status.status) }}
                </span>
              </div>
              <div v-if="status.comment" class="comment">
                {{ status.comment }}
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
              <label>回覧先（自動決定）<span class="required">*</span></label>
              <input
                type="text"
                :value="kairanSakiName"
                class="form-control"
                readonly
              />
            </div>
            <div class="form-group">
              <label>本文<span class="required">*</span></label>
              <div id="editor-container" class="quill-editor"></div>
            </div>
            <div v-if="editError" class="error-message">{{ editError }}</div>
            <div class="form-actions">
              <button type="submit" class="btn-submit">保存</button>
              <button type="button" class="btn-cancel" @click="cancelEdit">
                キャンセル
              </button>
              <button
                v-if="isEigyoUser && isEditMode"
                type="button"
                class="btn-complete"
                @click="handleComplete"
              >
                完了
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-else class="error">
      <p>回覧箋の情報を取得できませんでした。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, inject, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  circulars as mockCirculars,
  departments as mockDepartments,
} from '@/mocks/mockCirculars';
import Quill from 'quill';
import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
import 'quill/dist/quill.snow.css';

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
});
let quill: any = null;

const currentUser = inject('currentUser') as any;

// 1部署〜9部署の営業・配電（mockから取得）
const departments = mockDepartments;

function getKairanSaki(busho: string | number | undefined): string {
  if (busho === undefined) return '';
  const num = Number(busho);
  if (isNaN(num)) return '';
  return num % 10 === 1 ? String(num + 1) : String(num - 1);
}
const kairanSakiId = computed(() => getKairanSaki(circular.value?.department));
const kairanSakiName = computed(
  () => departments.find((d) => d.id === kairanSakiId.value)?.name || ''
);

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

const getDepartmentName = (id: string) => {
  return departments.find((dept) => dept.id === id)?.name || '不明な部署';
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

const getCirculationStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '未処理',
    next: '次工程済み',
    remand: '差し戻し',
    completed: '処理完了',
  };
  return statusMap[status] || status;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP');
};

const fetchCircular = async () => {
  try {
    isLoading.value = true;
    const id = route.params.id as string;
    const found = mockCirculars.find((c) => c.id === id);
    if (found) {
      circular.value = { ...found };
    } else {
      circular.value = null;
    }
  } catch (error) {
    console.error('回覧箋の取得に失敗しました:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleNext = () => {
  showCommentForm.value = true;
  // ここで「次工程」用の処理を追加
};

const handleRemand = () => {
  showCommentForm.value = true;
  // ここで「差し戻し」用の処理を追加
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

const enterEditMode = async () => {
  if (!circular.value) return;
  isEditMode.value = true;
  // 編集用フォームに値をコピー
  editForm.value.title = circular.value.title;
  editForm.value.content = circular.value.content;
  editForm.value.deadline = circular.value.deadline;
  editForm.value.files = circular.value.files ? [...circular.value.files] : [];
  // 回覧先（仮：全ての部署IDを取得）
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

const handleEditSubmit = () => {
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
  // 仮保存：circular.valueを更新
  if (!circular.value) return;
  circular.value.title = editForm.value.title;
  circular.value.content = editForm.value.content;
  circular.value.deadline = editForm.value.deadline;
  // 回覧先（自動決定）を反映
  circular.value.circulationStatus = [
    {
      departmentId: kairanSakiId.value,
      status: 'pending',
      comment: '',
    },
  ];
  // 更新者・更新日を反映
  const now = new Date();
  circular.value.updatedBy =
    currentUser?.value?.displayname || currentUser?.value?.username || '未取得';
  circular.value.updatedAt = now.toISOString();
  // mockCircularsも更新
  const idx = mockCirculars.findIndex((c) => c.id === circular.value!.id);
  if (idx !== -1) {
    mockCirculars[idx] = { ...mockCirculars[idx], ...circular.value };
  }
  isEditMode.value = false;
};

const cancelEdit = () => {
  isEditMode.value = false;
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const newFiles = Array.from(input.files);
    // 既存ファイルと新規ファイルをマージ（重複除外）
    const merged = [...editForm.value.files, ...newFiles].filter(
      (file, index, self) =>
        self.findIndex((f) => f.name === file.name && f.size === file.size) ===
        index
    );
    editForm.value.files = merged;
    input.value = '';
  }
};
const removeFile = (index: number) => {
  editForm.value.files.splice(index, 1);
};

const handleComplete = () => {
  if (!circular.value) return;
  circular.value.status = 'completed';
  isEditMode.value = false;
  // 回覧状況にも処理完了を反映
  const myBusho = currentUser?.value?.busho;
  if (myBusho) {
    const found = circular.value.circulationStatus.find(
      (cs) => cs.departmentId === myBusho
    );
    if (found) {
      found.status = 'completed';
      found.comment = '処理完了';
    } else {
      circular.value.circulationStatus.push({
        departmentId: myBusho,
        status: 'completed',
        comment: '処理完了',
      });
    }
  }
};

onMounted(() => {
  fetchCircular();
});
</script>

<style scoped>
.circular-create,
.circular-detail > .content {
  max-width: 700px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 2rem;
}
.section-card {
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 1.5rem 1rem;
  margin-bottom: 2rem;
}
h2 {
  margin-bottom: 2rem;
  font-size: 1.7rem;
  color: #222;
  font-weight: 700;
}
h3 {
  margin-bottom: 1rem;
  font-size: 1.15rem;
  color: #1565c0;
  font-weight: 600;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}
.required {
  color: #e53935;
  margin-left: 0.25em;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-control {
  width: 100%;
  padding: 0.7rem;
  border: 1.5px solid #bdbdbd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}
.form-control:focus {
  border-color: #1976d2;
  outline: none;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.btn-submit {
  background: #0078d4;
  color: #fff;
  border: none;
  padding: 0.85rem 2.2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-submit:hover {
  background: #005fa3;
  box-shadow: 0 4px 16px rgba(0, 120, 212, 0.15);
}
.btn-next {
  background: #43a047;
  color: #fff;
  border: none;
  padding: 0.85rem 2.2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(67, 160, 71, 0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-next:hover {
  background: #2e7031;
  box-shadow: 0 4px 16px rgba(67, 160, 71, 0.15);
}
.btn-remand {
  background: #e53935;
  color: #fff;
  border: none;
  padding: 0.85rem 2.2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(229, 57, 53, 0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-remand:hover {
  background: #b71c1c;
  box-shadow: 0 4px 16px rgba(229, 57, 53, 0.15);
}
.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.85rem 2.2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover {
  background: #e5e7eb;
}
.btn-back {
  background: #222;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.85rem 2.2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-back:hover {
  background: #444;
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
.info-section,
.content-section,
.files-section,
.circulation-section {
  margin-bottom: 2rem;
}
.info-item {
  margin-bottom: 1.2rem;
}
.value {
  font-size: 1.08rem;
  color: #333;
  margin-top: 0.2rem;
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
</style>

<style>
.ql-editor {
  min-height: 200px;
  background: #fafbfc;
  border-radius: 4px;
}
.ql-editor img {
  max-width: 100%;
  height: auto;
}
</style>
