<template>
  <div class="settings-view">
    <template v-if="isAdmin">
      <h1>設定</h1>
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'auth' }"
          @click="activeTab = 'auth'"
        >
          認可設定
        </button>
        <button
          :class="{ active: activeTab === 'notify' }"
          @click="activeTab = 'notify'"
        >
          通知先設定
        </button>
      </div>

      <div v-if="activeTab === 'auth'" class="tab-content">
        <h2>認可設定</h2>
        <button class="add-btn" @click="addDepartment" :disabled="!isAdmin">
          ＋追加
        </button>
        <table class="auth-table">
          <thead>
            <tr>
              <th>部署コード</th>
              <th>部署名</th>
              <th>所属</th>
              <th>ロール</th>
              <th>編集</th>
              <th>削除</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dept in departments" :key="dept.id">
              <td>
                <input
                  type="text"
                  v-model="dept.code"
                  :disabled="!isAdmin || !dept.isEditing"
                  @input="handleCodeInput(dept)"
                  placeholder="例: 12345"
                />
              </td>
              <td>
                <input
                  type="text"
                  v-model="dept.name"
                  disabled
                  placeholder="例: 営業部"
                />
              </td>
              <td>
                <select v-model="dept.affiliation" disabled>
                  <option value="営業">営業</option>
                  <option value="配電">配電</option>
                </select>
              </td>
              <td>
                <select
                  v-model="dept.role"
                  :disabled="!isAdmin || !dept.isEditing"
                >
                  <option value="一般">一般</option>
                  <option value="管理者">管理者</option>
                </select>
              </td>
              <td>
                <button
                  v-if="!dept.isEditing"
                  :disabled="!isAdmin"
                  @click="handleEdit(dept)"
                >
                  編集
                </button>
                <button v-else :disabled="!isAdmin" @click="handleSave(dept)">
                  保存
                </button>
              </td>
              <td>
                <button :disabled="!isAdmin" @click="removeDepartment(dept.id)">
                  削除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="activeTab === 'notify'" class="tab-content">
        <h2>通知先設定</h2>
        <table class="notify-table">
          <thead>
            <tr>
              <th>部署コード</th>
              <th>部署名</th>
              <th>所属</th>
              <th>通知先メールアドレス（カンマ区切り可）</th>
              <th>編集</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dept in departments" :key="dept.id">
              <td>{{ dept.code }}</td>
              <td>{{ dept.name }}</td>
              <td>{{ dept.affiliation }}</td>
              <td>
                <input
                  type="text"
                  v-model="dept.emails"
                  :disabled="!isAdmin || !dept.isEditing"
                  placeholder="例: aaa@ex.com,bbb@ex.com"
                />
              </td>
              <td>
                <button
                  v-if="!dept.isEditing"
                  :disabled="!isAdmin"
                  @click="handleEdit(dept)"
                >
                  編集
                </button>
                <button v-else :disabled="!isAdmin" @click="handleSave(dept)">
                  保存
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <div
        style="
          padding: 2rem;
          text-align: center;
          color: #e53935;
          font-size: 1.2em;
        "
      >
        権限がありません
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, computed } from 'vue';
import { departments as departmentsMaster } from '@/mocks/departments';

const currentUser = inject('currentUser', ref<any>(null));
const departments = ref([...departmentsMaster]);
const isAdmin = computed(() => {
  if (!currentUser.value) return false;
  const userBusho = String(currentUser.value.busho ?? '');
  const dept = departments.value.find((d) => String(d.code) === userBusho);
  return dept && dept.role === '管理者';
});

const activeTab = ref<'auth' | 'notify'>('auth');

function handleEdit(dept: any) {
  if (!isAdmin) return;
  dept.isEditing = true;
}
function handleSave(dept: any) {
  dept.isEditing = false;
}
function handleCodeInput(dept: any) {
  const found = departmentsMaster.find((m) => m.code === dept.code);
  if (found) {
    dept.name = found.name;
    dept.affiliation = found.affiliation;
  } else {
    dept.name = '';
    dept.affiliation = '';
  }
}
function addDepartment() {
  const newId = Math.max(...departments.value.map((d) => d.id), 0) + 1;
  departments.value.push({
    id: newId,
    code: '',
    name: '',
    affiliation: '',
    role: '一般',
    emails: '',
    isEditing: true,
  });
}
function removeDepartment(id: number) {
  departments.value = departments.value.filter((d) => d.id !== id);
}
</script>

<style scoped>
.settings-view {
  max-width: 1600px;
  margin: 0.5rem auto 0 auto;
  padding: 1.5rem 2rem 2.5rem 2rem;
  background: #fff;
  min-height: 100vh;
}
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.tabs button {
  padding: 0.5rem 1.5rem;
  border: none;
  background: #eee;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  font-weight: bold;
  font-size: 16pt;
  height: 40px;
}
.tabs button.active {
  background: #1976d2;
  color: #fff;
}
.tab-content {
  background: #fafafa;
  padding: 1.5rem;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px #0001;
  font-size: 16pt;
}
.auth-table,
.notify-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.auth-table th,
.auth-table td,
.notify-table th,
.notify-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 16pt;
}
.auth-table th,
.notify-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
}
.auth-table tr:hover,
.notify-table tr:hover {
  background-color: #f8f9fa;
}
input[type='text'],
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #bbb;
  border-radius: 4px;
  height: 40px;
  font-size: 16pt;
  box-sizing: border-box;
}
button {
  padding: 0.25rem 0.75rem;
  background-color: #0078d4;
  color: white;
  border-radius: 0.25rem;
  font-size: 16pt;
  border: none;
  transition: background-color 0.2s;
  cursor: pointer;
}
button:hover:not([disabled]) {
  background-color: #106ebe;
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
  transition: background 0.2s;
}
.add-btn:hover {
  background: #1256a0;
}
button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
