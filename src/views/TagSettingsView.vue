<template>
  <div class="tag-settings-view">
    <h1>タグ設定</h1>
    <button class="add-btn" @click="addTagSetting">タグ追加</button>
    <table class="tag-table">
      <thead>
        <tr>
          <th>タグ名</th>
          <th>作成部署</th>
          <th>作成日</th>
          <th class="actions-header">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tag, idx) in tagSettings" :key="tag.name + idx">
          <td>
            <span
              class="tag-badge"
              :style="{ background: tag.color, color: '#fff' }"
              >{{ tag.name || '未設定' }}</span
            >
          </td>
          <td>{{ tag.createdBy || '不明' }}</td>
          <td>
            {{
              tag.createdAt
                ? new Date(tag.createdAt).toLocaleString('ja-JP')
                : ''
            }}
          </td>
          <td class="actions-cell">
            <div class="actions-group">
              <button class="edit-btn" @click="openEditModal(idx)">編集</button>
              <button class="delete-btn" @click="removeTagSetting(idx)">
                削除
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- モーダル -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>工程別通知設定（{{ editingTag?.name }}）</h2>
        <div class="modal-tag-edit-row">
          <label
            >タグ名
            <input
              v-model="editingTag.name"
              class="modal-tag-name-input"
              maxlength="20"
              placeholder="20文字まで入力できます"
            />
          </label>
          <label
            >タグ色
            <input
              v-model="editingTag.color"
              type="color"
              class="modal-tag-color-input"
            />
          </label>
        </div>
        <table class="process-table">
          <thead>
            <tr>
              <th>工程名</th>
              <th>メール通知</th>
              <th>Todo通知文言</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(ps, idx) in editingTag.processSettings"
              :key="ps.process"
            >
              <td>{{ processNames[idx] }}</td>
              <td>
                <div class="mail-notify-toggle">
                  <button
                    :class="['notify-btn', { active: !ps.mailNotify }]"
                    @click="ps.mailNotify = false"
                    type="button"
                  >
                    未通知
                  </button>
                  <button
                    :class="['notify-btn', { active: ps.mailNotify }]"
                    @click="ps.mailNotify = true"
                    type="button"
                  >
                    通知
                  </button>
                </div>
              </td>
              <td>
                <div class="todo-message-list">
                  <template v-if="ps.todoMessages.length === 0">
                    <button class="add-btn small" @click="addTodoMessage(idx)">
                      ＋追加
                    </button>
                  </template>
                  <template v-else>
                    <div
                      v-for="(_, mIdx) in ps.todoMessages"
                      :key="mIdx"
                      class="todo-message-row"
                    >
                      <input
                        type="text"
                        v-model="ps.todoMessages[mIdx]"
                        placeholder="空欄の場合は通知されません"
                        class="todo-message-input"
                      />
                      <button
                        class="delete-btn small todo-delete-btn"
                        @click="removeTodoMessage(idx, mIdx)"
                        type="button"
                      >
                        削除
                      </button>
                    </div>
                    <button class="add-btn small" @click="addTodoMessage(idx)">
                      ＋追加
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="modal-actions">
          <button @click="saveProcessSettings">保存</button>
          <button @click="closeModal">キャンセル</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { useTagSettingsStore } from '@/stores/tagSettings';

const tagSettingsStore = useTagSettingsStore();
const { tagSettings } = storeToRefs(tagSettingsStore);

const currentUser = inject('currentUser') as any;

const PROCESS_COUNT = 15;
const processNames = [
  '起案',
  '確認',
  '承認',
  '決裁',
  '配布',
  '受領',
  '処理',
  '完了',
  '保管',
  '回収',
  '再確認',
  '再承認',
  '再決裁',
  '追加1',
  '追加2',
];

interface ProcessSetting {
  process: number;
  mailNotify: boolean;
  todoMessages: string[];
}
interface TagSetting {
  name: string;
  color: string;
  processSettings: ProcessSetting[];
  createdBy?: string;
  createdAt?: string;
}

function addTagSetting() {
  const newTag = {
    name: '',
    color: '#1976d2',
    processSettings: Array.from({ length: PROCESS_COUNT }, (_, i) => ({
      process: i + 1,
      mailNotify: false,
      todoMessages: [],
    })),
    createdBy: currentUser?.value?.busho || '不明',
    createdAt: new Date().toISOString(),
  };
  tagSettingsStore.setTagSettings([...tagSettings.value, newTag]);
}
function removeTagSetting(idx: number) {
  const newArr = [...tagSettings.value];
  newArr.splice(idx, 1);
  tagSettingsStore.setTagSettings(newArr);
}

// Todo文言追加・削除
function addTodoMessage(processIdx: number) {
  editingTag.processSettings[processIdx].todoMessages.push('');
}
function removeTodoMessage(processIdx: number, msgIdx: number) {
  editingTag.processSettings[processIdx].todoMessages.splice(msgIdx, 1);
}

// モーダル制御
const showModal = ref(false);
const editingTagIdx = ref<number | null>(null);
const editingTag = reactive({} as TagSetting);

function openEditModal(idx: number) {
  editingTagIdx.value = idx;
  const base = JSON.parse(JSON.stringify(tagSettings.value[idx]));
  const settings = base.processSettings || [];
  const newSettings: ProcessSetting[] = [];
  for (let i = 0; i < processNames.length; i++) {
    if (settings[i]) {
      newSettings.push({
        process: i + 1,
        mailNotify: settings[i].mailNotify ?? false,
        todoMessages: Array.isArray(settings[i].todoMessages)
          ? settings[i].todoMessages
          : [],
      });
    } else {
      newSettings.push({
        process: i + 1,
        mailNotify: false,
        todoMessages: [],
      });
    }
  }
  base.processSettings = newSettings;
  Object.assign(editingTag, base);
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}
function saveProcessSettings() {
  if (editingTagIdx.value !== null) {
    // editingTagの内容をtagSettingsに反映
    const newArr = [...tagSettings.value];
    newArr[editingTagIdx.value] = JSON.parse(JSON.stringify(editingTag));
    tagSettingsStore.setTagSettings(newArr);
  }
  showModal.value = false;
}
</script>

<style scoped>
.tag-settings-view {
  max-width: 1600px;
  margin: 0.5rem auto 0 auto;
  padding: 1.5rem 2rem 2.5rem 2rem;
  background: #fff;
  min-height: 100vh;
}
.add-btn {
  margin-bottom: 1rem;
  padding: 8px 24px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16pt;
  cursor: pointer;
  height: 40px;
  min-width: 100px;
  max-width: 200px;
  transition: background 0.2s;
}
.add-btn:hover {
  background: #1256a0;
}
.tag-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.tag-table th,
.tag-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 16pt;
}
.tag-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
}
.tag-table tr:hover {
  background-color: #f8f9fa;
}
.tag-table input[type='text'] {
  font-size: 16pt !important;
  height: 40px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #222;
  font-weight: 500;
  letter-spacing: 0.02em;
  box-sizing: border-box;
  min-width: 500px;
  max-width: 100%;
  width: 100%;
  overflow: visible;
}
.tag-table input[type='color'] {
  width: 48px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
}
/* モーダル タグ編集欄 */
.modal-tag-edit-row {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
}
.modal-tag-edit-row label {
  font-size: 16pt;
  color: #374151;
  font-weight: 500;
  min-width: 480px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.modal-tag-name-input {
  font-size: 16pt;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #bbb;
  border-radius: 4px;
  background: #fff;
  color: #222;
  font-weight: 500;
  letter-spacing: 0.02em;
  box-sizing: border-box;
  min-width: 200px;
  max-width: 400px;
  width: 100%;
}
.modal-tag-color-input {
  width: 48px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
}
.edit-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16pt;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #1256a0;
}
.delete-btn {
  background: #c62828;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16pt;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #a31515;
}
.delete-btn.small,
.add-btn.small {
  font-size: 13pt;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}
.add-btn.small {
  background: #43a047;
  color: #fff;
  border: none;
  transition: background 0.2s;
  width: 100%;
}
.add-btn.small:hover {
  background: #2e7031;
}
.todo-message-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.todo-message-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
/* モーダル用 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 10px;
  padding: 2rem 2.5rem;
  min-width: 800px;
  max-width: 1400px;
  box-shadow: 0 4px 24px #0003;
  max-height: 90vh;
  overflow-y: auto;
}
.process-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}
.process-table th,
.process-table td {
  border-left: none;
  border-right: none;
  border-top: none;
  border-bottom: 1px solid #ccc;
  padding: 0.5rem 0.5rem;
  text-align: left;
  font-size: 16pt;
}
.process-table th {
  background: #f5f5f5;
}
.process-table input[type='text'] {
  font-size: 16pt !important;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #bbb;
  border-radius: 4px;
  background: #fff;
  color: #222;
  font-weight: 500;
  letter-spacing: 0.02em;
  box-sizing: border-box;
  min-width: 200px;
  max-width: 400px;
  width: 100%;
}
.modal-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
}
.modal-actions button {
  padding: 8px 24px;
  font-size: 16pt;
  border-radius: 4px;
  border: none;
  background: #1976d2;
  color: #fff;
  cursor: pointer;
}
.modal-actions button:last-child {
  background: #aaa;
  color: #fff;
}
.tag-badge {
  border-radius: 6px;
  padding: 2px 16px;
  font-weight: 600;
  font-size: 1.2em;
  display: inline-block;
  white-space: nowrap;
  max-width: 600px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  margin: 2px 0;
}
.tag-table th.actions-header,
.tag-table td.actions-cell {
  text-align: center;
  width: 220px;
}
.actions-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.mail-notify-toggle {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}
.notify-btn {
  min-width: 80px;
  padding: 8px 0;
  font-size: 15pt;
  border: 1.5px solid #bbb;
  border-radius: 4px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.notify-btn.active {
  background: #1976d2;
  color: #fff;
  border-color: #1976d2;
}
.notify-btn:not(.active):hover {
  background: #e5e7eb;
}
.todo-message-input {
  font-size: 16pt;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #bbb;
  border-radius: 4px;
  background: #fff;
  color: #222;
  font-weight: 500;
  letter-spacing: 0.02em;
  box-sizing: border-box;
  min-width: 200px;
  max-width: 800px;
  width: 100%;
}
.todo-delete-btn {
  min-width: 80px;
  max-width: 100px;
  width: auto;
  height: 40px;
  font-size: 13pt;
  padding: 0.15rem 0.5rem;
  box-sizing: border-box;
  border-radius: 4px;
  margin-left: 0.5rem;
}
</style>
