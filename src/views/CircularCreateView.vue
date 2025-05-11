<template>
  <div>
    <div
      v-if="currentUser && currentUser.value === null"
      class="loading-message"
    >
      ユーザー情報を取得中...
    </div>
    <div
      v-else-if="!currentUser || currentUser.value === false"
      class="error-message"
    >
      ユーザー情報が取得できません。再度ログインしてください。
    </div>
    <div class="circular-create" v-else-if="showEditor">
      <h2>回覧箋作成</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">タイトル<span class="required">*</span></label>
          <input
            id="title"
            v-model="title"
            type="text"
            class="form-control"
            required
            placeholder="タイトルを入力してください"
          />
        </div>
        <div class="form-group">
          <label for="deadline">期限<span class="required">*</span></label>
          <input
            id="deadline"
            v-model="deadline"
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
          <div
            id="editor-container"
            class="quill-editor"
            ref="editorContainer"
          ></div>
        </div>
        <div class="form-group">
          <label for="file">添付ファイル</label>
          <input id="file" type="file" class="form-control" />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div class="form-actions">
          <button type="submit" class="btn-submit btn-primary">作成</button>
          <button
            type="button"
            class="btn-submit btn-secondary"
            @click="handleTempSave"
          >
            一時保存
          </button>
        </div>
      </form>
    </div>
    <div v-else class="error-message">配電ユーザーは新規作成できません。</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject, computed, Ref, watch, nextTick } from 'vue';
import { circulars as mockCirculars } from '@/mocks/mockCirculars';
import Quill from 'quill';
import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
import 'quill/dist/quill.snow.css';

Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);

const currentUser = inject('currentUser', ref(null)) as Ref<any | null>;

const isHaidenUser = computed(() =>
  String(currentUser?.value?.busho).endsWith('2')
);

const showEditor = ref(false);
watch(
  [() => currentUser.value, isHaidenUser],
  ([user, haiden]) => {
    showEditor.value = !!user && !haiden;
  },
  { immediate: true }
);

const title = ref('');
const deadline = ref('');
const error = ref('');

// 1部署〜9部署の営業・配電
const departments = Array.from({ length: 9 }, (_, i) => [
  { id: `${(i + 1) * 1000 + 1}`, name: `${i + 1}部署（営業）` },
  { id: `${(i + 1) * 1000 + 2}`, name: `${i + 1}部署（配電）` },
]).flat();

function getKairanSaki(busho: string | number): string {
  const num = Number(busho);
  if (isNaN(num)) return '';
  return num % 10 === 1 ? String(num + 1) : String(num - 1);
}
const kairanSakiId = computed(() => getKairanSaki(currentUser?.value?.busho));
const kairanSakiName = computed(
  () => departments.find((d) => d.id === kairanSakiId.value)?.name || ''
);

const bodyHtml = ref('');

const image = reactive({
  type: '',
  dataUrl: null as string | null,
  blob: null as Blob | null,
  file: null as File | null,
});
const blobUrl = ref<string | null>(null);

const isUrl = (str: string) => {
  try {
    return Boolean(new URL(str));
  } catch (e) {
    return false;
  }
};

const imageHandler = (dataUrl: string, type: string) => {
  image.type = type;
  image.dataUrl = dataUrl;
  image.blob = null;
  image.file = null;
  blobUrl.value = null;
};

const textPasteHander = (text: string) => {
  const Delta = Quill.import('delta');
  return isUrl(text)
    ? new Delta().insert(text, { link: text })
    : new Delta().insert(text);
};

let quill: Quill | null = null;

const editorContainer = ref<HTMLElement | null>(null);

watch(
  showEditor,
  async (val) => {
    if (!val) return;
    if (quill) return;
    await nextTick();
    if (!editorContainer.value) return;
    quill = new Quill(editorContainer.value, {
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
        clipboard: {
          matchers: [
            [Node.TEXT_NODE, (node: any) => textPasteHander(node.data)],
          ],
        },
      },
      placeholder:
        '本文を入力、画像は貼り付け・ドラッグ＆ドロップ・画像ボタンで挿入できます',
      readOnly: false,
      theme: 'snow',
    });

    quill.getModule('toolbar').addHandler('image', (clicked: boolean) => {
      if (clicked) {
        let fileInput = document.querySelector(
          'input.ql-image[type=file]'
        ) as HTMLInputElement | null;
        if (fileInput == null) {
          fileInput = document.createElement('input');
          fileInput.setAttribute('type', 'file');
          fileInput.setAttribute(
            'accept',
            'image/png, image/gif, image/jpeg, image/bmp, image/x-icon'
          );
          fileInput.classList.add('ql-image');
          fileInput.addEventListener('change', (e: Event) => {
            const input = e.target as HTMLInputElement;
            const files = input.files;
            if (files && files.length > 0) {
              const fileObj = files[0];
              const type = fileObj.type;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                imageHandler(dataUrl, type);
                // Quillに画像を挿入
                const range = quill!.getSelection();
                quill!.insertEmbed(
                  range ? range.index : 0,
                  'image',
                  dataUrl,
                  'user'
                );
                fileInput!.value = '';
              };
              reader.readAsDataURL(fileObj);
            }
          });
        }
        fileInput.click();
      }
    });

    quill.on('text-change', () => {
      bodyHtml.value = quill!.root.innerHTML;
    });
  },
  { immediate: true }
);

const handleSubmit = () => {
  error.value = '';
  if (
    !title.value ||
    !deadline.value ||
    !bodyHtml.value ||
    bodyHtml.value === '<p><br></p>'
  ) {
    error.value = 'すべての必須項目を入力してください。';
    return;
  }
  // mockCircularsに追加（status: in_progress）
  const now = new Date();
  mockCirculars.push({
    id: String(mockCirculars.length + 1),
    title: title.value,
    content: bodyHtml.value,
    creator:
      currentUser?.value?.displayname ||
      currentUser?.value?.username ||
      '未取得',
    createdAt: now.toISOString(),
    deadline: deadline.value,
    status: 'in_progress',
    department: String(currentUser?.value?.busho),
    recipients: [],
    files: [],
    circulationStatus: [
      {
        departmentId: kairanSakiId.value,
        status: 'pending',
        comment: '',
      },
    ],
    updatedBy:
      currentUser?.value?.displayname ||
      currentUser?.value?.username ||
      '未取得',
    updatedAt: now.toISOString(),
  });
  alert('回覧箋を作成しました！');
  title.value = '';
  deadline.value = '';
  if (quill) quill.setContents([]);
  bodyHtml.value = '';
};

const handleTempSave = () => {
  error.value = '';
  if (!title.value) {
    error.value = 'タイトルは必須です（一時保存）';
    return;
  }
  // mockCircularsに追加（status: draft）
  const now = new Date();
  mockCirculars.push({
    id: String(mockCirculars.length + 1),
    title: title.value,
    content: bodyHtml.value,
    creator:
      currentUser?.value?.displayname ||
      currentUser?.value?.username ||
      '未取得',
    createdAt: now.toISOString(),
    deadline: deadline.value,
    status: 'draft',
    department: String(currentUser?.value?.busho),
    recipients: [],
    files: [],
    circulationStatus: [
      {
        departmentId: kairanSakiId.value,
        status: 'pending',
        comment: '',
      },
    ],
    updatedBy:
      currentUser?.value?.displayname ||
      currentUser?.value?.username ||
      '未取得',
    updatedAt: now.toISOString(),
  });
  alert('一時保存しました！');
  title.value = '';
  deadline.value = '';
  if (quill) quill.setContents([]);
  bodyHtml.value = '';
  // ファイル情報もリセット
  image.type = '';
  image.dataUrl = null;
  image.blob = null;
  image.file = null;
  blobUrl.value = null;
};

// これでmockCircularsの変更が即時反映される
const circulars = mockCirculars;
</script>

<style scoped>
.login-user {
  font-size: 1rem;
  color: #1976d2;
  font-weight: 600;
  margin-bottom: 1.2rem;
}
.circular-create {
  max-width: 700px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 2rem;
}
h2 {
  margin-bottom: 2rem;
  font-size: 1.7rem;
  color: #222;
  font-weight: 700;
}
.form-group {
  margin-bottom: 1.5rem;
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
.radio-group {
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
}
.radio-label {
  display: flex;
  align-items: center;
  font-size: 1.08rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}
.radio-label input[type='radio'] {
  accent-color: #0078d4;
  width: 1.2em;
  height: 1.2em;
  margin-right: 0.5em;
}
.radio-label input[type='radio']:focus {
  outline: 2px solid #1976d2;
}
.radio-label input[type='radio']:checked + span {
  color: #0078d4;
}
.form-actions {
  display: flex;
  gap: 1rem;
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
.error-message {
  color: #e53935;
  margin-bottom: 1rem;
  font-size: 1rem;
}
/* 追加: ボタンのバリエーション */
.btn-primary {
  background: #0078d4;
}
.btn-primary:hover {
  background: #005fa3;
}
.btn-secondary {
  background: #bdbdbd;
  color: #222;
}
.btn-secondary:hover {
  background: #9e9e9e;
}
.loading-message {
  color: #1976d2;
  margin-bottom: 1rem;
  font-size: 1rem;
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
