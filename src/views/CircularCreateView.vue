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
          <label for="process">工程<span class="required">*</span></label>
          <div class="process-select-buttons">
            <button
              v-for="n in 15"
              :key="n"
              type="button"
              :class="['process-btn', { selected: process === n }]"
              @click="process = n"
            >
              {{ processNames[n] }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>タグ</label>
          <div class="tag-select-btn-list">
            <button
              v-for="tag in tagSettings"
              :key="tag.name"
              type="button"
              :class="['tag-select-btn', { selected: isTagSelected(tag.name) }]"
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
          <label>本文<span class="required">*</span></label>
          <div
            id="editor-container"
            class="quill-editor"
            ref="editorContainer"
          ></div>
          <div class="form-group">
            <label for="url-link">URLリンク</label>
            <div class="url-link-input-group">
              <input
                id="url-link"
                v-model="urlInput"
                type="url"
                class="form-control"
                placeholder="https://example.com/"
              />
              <button type="button" class="btn-add-url" @click="addUrlLink">
                追加
              </button>
            </div>
            <ul class="url-link-list">
              <li v-for="(url, idx) in urlLinks" :key="url">
                <a :href="url" target="_blank" rel="noopener noreferrer">{{
                  url
                }}</a>
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
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div class="form-actions">
          <button type="submit" class="btn-submit btn-primary">作成</button>
          <button
            type="button"
            class="btn-submit btn-secondary"
            @click="handleReset"
          >
            リセット
          </button>
        </div>
      </form>
    </div>
    <div v-else class="error-message">配電ユーザーは新規作成できません。</div>
    <!-- 画像プレビューモーダル -->
    <div
      v-if="showImageModal"
      class="modal-overlay"
      @click.self="closeImageModal"
    >
      <div class="modal-content">
        <img
          v-if="imagePreviewUrl"
          :src="imagePreviewUrl"
          alt="画像プレビュー"
        />
        <button class="modal-close" @click="closeImageModal">閉じる</button>
      </div>
    </div>
    <div class="scroll-guide" id="scroll-guide">{{ guideText }}</div>
    <div class="scroll-fade"></div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  inject,
  computed,
  Ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
} from 'vue';
import {
  circulars as mockCirculars,
  processNames,
} from '@/mocks/mockCirculars';
import { storeToRefs } from 'pinia';
import { useTagSettingsStore } from '@/stores/tagSettings';
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
const process = ref(1);

const bodyHtml = ref('');

const image = reactive({
  type: '',
  dataUrl: null as string | null,
  blob: null as Blob | null,
  file: null as File | null,
});
const blobUrl = ref<string | null>(null);

const imagePreviewUrl = ref<string | null>(null);
const showImageModal = ref(false);

const imageHandler = (dataUrl: string, type: string) => {
  image.type = type;
  image.dataUrl = dataUrl;
  image.blob = null;
  image.file = null;
  blobUrl.value = null;
};

const textPasteHander = (text: string) => {
  const Delta = Quill.import('delta');
  let isUrl = false;
  try {
    isUrl = Boolean(new URL(text));
  } catch (e) {
    isUrl = false;
  }
  return isUrl
    ? new Delta().insert(text, { link: text })
    : new Delta().insert(text);
};

let quill: any = null;

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

const urlInput = ref('');
const urlLinks = ref<string[]>([]);

function addUrlLink() {
  const url = urlInput.value.trim();
  if (!url) return;
  try {
    new URL(url);
  } catch {
    error.value = '有効なURLを入力してください。';
    return;
  }
  if (urlLinks.value.includes(url)) {
    error.value = '同じURLは追加できません。';
    return;
  }
  urlLinks.value.push(url);
  urlInput.value = '';
  error.value = '';
}
function removeUrlLink(idx: number) {
  urlLinks.value.splice(idx, 1);
}

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
    process: process.value,
    department: String(currentUser?.value?.busho),
    recipients: [],
    files: urlLinks.value.map((url, i) => ({
      id: String(i + 1),
      name: url,
      url,
    })),
    tags: tagSettings.value.filter((t) => selectedTags.value.includes(t.name)),
    status: 'in_progress',
    circulationStatus: [],
    updatedBy:
      currentUser?.value?.displayname ||
      currentUser?.value?.username ||
      '未取得',
    updatedAt: now.toISOString(),
  } as any);
  alert('回覧箋を作成しました！');
  title.value = '';
  deadline.value = '';
  if (quill) quill.setContents([]);
  bodyHtml.value = '';
  urlLinks.value = [];
};

const STORAGE_KEY = 'circular_create_draft';

// 入力値をまとめて管理
const formState = reactive({
  title,
  deadline,
  process,
  bodyHtml,
  urlLinks,
  urlInput,
});

// 入力値が変わるたびにlocalStorageへ保存
watch(
  formState,
  () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        title: title.value,
        deadline: deadline.value,
        process: process.value,
        bodyHtml: bodyHtml.value,
        urlLinks: urlLinks.value,
        urlInput: urlInput.value,
      })
    );
  },
  { deep: true }
);

// 初期化時にlocalStorageから復元
onMounted(() => {
  // ...既存のonMounted内容の前に追加...
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      title.value = data.title || '';
      deadline.value = data.deadline || '';
      process.value = data.process || 1;
      bodyHtml.value = data.bodyHtml || '';
      urlLinks.value = Array.isArray(data.urlLinks) ? data.urlLinks : [];
      urlInput.value = data.urlInput || '';
      if (quill && data.bodyHtml) quill.root.innerHTML = data.bodyHtml;
    } catch {}
  }
  // ...既存のonMounted内容...
  watch(
    () => showEditor.value,
    (val) => {
      if (!val) return;
      setTimeout(() => {
        const editor = document.querySelector('#editor-container .ql-editor');
        if (editor) {
          const setImgClick = () => {
            const imgs = editor.querySelectorAll('img');
            imgs.forEach((img) => {
              img.style.cursor = 'pointer';
              img.onclick = (e) => {
                imagePreviewUrl.value = (e.target as HTMLImageElement).src;
                showImageModal.value = true;
              };
            });
          };
          setImgClick();
          // 画像が追加された場合にも再度イベントを設定
          const observer = new MutationObserver(setImgClick);
          observer.observe(editor, { childList: true, subtree: true });
        }
        // 本文の内容をエディタに反映
        if (quill && bodyHtml.value) {
          quill.root.innerHTML = bodyHtml.value;
        }
      }, 0);
    },
    { immediate: true }
  );
  window.addEventListener('scroll', handleScrollGuide);
});

function handleReset() {
  title.value = '';
  deadline.value = '';
  process.value = 1;
  bodyHtml.value = '';
  urlLinks.value = [];
  urlInput.value = '';
  error.value = '';
  if (quill) quill.setContents([]);
  image.type = '';
  image.dataUrl = null;
  image.blob = null;
  image.file = null;
  blobUrl.value = null;
  localStorage.removeItem(STORAGE_KEY);
}

function closeImageModal() {
  showImageModal.value = false;
  imagePreviewUrl.value = null;
}

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
  watch(
    () => showEditor.value,
    (val) => {
      if (!val) return;
      setTimeout(() => {
        const editor = document.querySelector('#editor-container .ql-editor');
        if (editor) {
          const setImgClick = () => {
            const imgs = editor.querySelectorAll('img');
            imgs.forEach((img) => {
              img.style.cursor = 'pointer';
              img.onclick = (e) => {
                imagePreviewUrl.value = (e.target as HTMLImageElement).src;
                showImageModal.value = true;
              };
            });
          };
          setImgClick();
          // 画像が追加された場合にも再度イベントを設定
          const observer = new MutationObserver(setImgClick);
          observer.observe(editor, { childList: true, subtree: true });
        }
        // 本文の内容をエディタに反映
        if (quill && bodyHtml.value) {
          quill.root.innerHTML = bodyHtml.value;
        }
      }, 0);
    },
    { immediate: true }
  );
  window.addEventListener('scroll', handleScrollGuide);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollGuide);
});

// タグ選択用
const selectedTags = ref<string[]>([]); // nameのみ保持
function toggleTag(tagName: string) {
  const idx = selectedTags.value.indexOf(tagName);
  if (idx === -1) {
    selectedTags.value.push(tagName);
  } else {
    selectedTags.value.splice(idx, 1);
  }
}
function isTagSelected(tagName: string) {
  return selectedTags.value.includes(tagName);
}

const tagSettingsStore = useTagSettingsStore();
const { tagSettings } = storeToRefs(tagSettingsStore);
</script>

<style scoped>
.login-user {
  font-size: 1rem;
  color: #1976d2;
  font-weight: 600;
  margin-bottom: 1.2rem;
}
.circular-create {
  max-width: 1600px;
  margin: 0.5rem auto 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 2rem 2.5rem 2rem;
}
h2 {
  margin-bottom: 1.2rem;
  font-size: 16pt;
  color: #222;
  font-weight: 700;
}
.form-group {
  margin-bottom: 1.2rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 16pt;
}
.required {
  color: #e53935;
  margin-left: 0.25em;
  font-size: 16pt;
}
.form-control {
  width: 100%;
  padding: 0.7rem;
  border: 1.5px solid #bdbdbd;
  border-radius: 4px;
  font-size: 16pt;
  transition: border-color 0.2s;
  min-width: 120px;
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
.preview-area {
  margin-top: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px #0001;
}
.preview-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
}
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
  border-radius: 8px;
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  box-shadow: 0 4px 24px #0003;
  text-align: center;
  position: relative;
  max-width: 90vw;
  max-height: 80vh;
}
.modal-content img {
  max-width: 60vw;
  max-height: 60vh;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}
.modal-close {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 2.2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
}
.modal-close:hover {
  background: #005fa3;
}
.url-link-input-group {
  display: flex;
  gap: 0.5rem;
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
.url-link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.url-link-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
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
.quill-editor {
  font-size: 16pt;
  background: none;
}
@media (max-width: 900px) {
  .form-2col {
    flex-direction: column;
    gap: 1rem;
  }
  .form-col-left,
  .form-col-right {
    max-width: 100%;
    min-width: 0;
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
</style>

<style>
.ql-editor {
  min-height: 480px;
  background: #fafbfc;
  border-radius: 4px;
  font-size: 16pt;
}
.ql-editor img {
  max-width: 100%;
  height: auto;
}
</style>
