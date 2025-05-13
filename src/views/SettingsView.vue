<template>
  <div class="settings-view">
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
            <td>{{ dept.affiliation }}</td>
            <td>{{ dept.name }}</td>
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
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 管理者かどうか（モック）
const isAdmin = true;

// 部署マスター
const departmentMaster = [
  { code: '1001', name: '1部', affiliation: '営業' },
  { code: '2001', name: '2部', affiliation: '営業' },
  { code: '3001', name: '3部', affiliation: '営業' },
  { code: '4001', name: '4部', affiliation: '営業' },
  { code: '5001', name: '5部', affiliation: '営業' },
  { code: '6001', name: '6部', affiliation: '営業' },
  { code: '7001', name: '7部', affiliation: '営業' },
  { code: '8001', name: '8部', affiliation: '営業' },
  { code: '9001', name: '9部', affiliation: '営業' },
  { code: '1002', name: '1部', affiliation: '配電' },
  { code: '2002', name: '2部', affiliation: '配電' },
  { code: '3002', name: '3部', affiliation: '配電' },
  { code: '4002', name: '4部', affiliation: '配電' },
  { code: '5002', name: '5部', affiliation: '配電' },
  { code: '6002', name: '6部', affiliation: '配電' },
  { code: '7002', name: '7部', affiliation: '配電' },
  { code: '8002', name: '8部', affiliation: '配電' },
  { code: '9002', name: '9部', affiliation: '配電' },
];

// 部署データ（モック）
const departments = ref([
  {
    id: 1,
    code: '1001',
    name: '営業部',
    affiliation: '営業',
    role: '一般',
    emails: 'eigyo@example.com',
    isEditing: false,
  },
  {
    id: 2,
    code: '2001',
    name: '配電部',
    affiliation: '配電',
    role: '管理者',
    emails: 'haifu@example.com',
    isEditing: false,
  },
]);

const activeTab = ref<'auth' | 'notify'>('auth');

function handleEdit(dept: any) {
  if (!isAdmin) return;
  dept.isEditing = true;
}
function handleSave(dept: any) {
  dept.isEditing = false;
}
function handleCodeInput(dept: any) {
  const found = departmentMaster.find((m) => m.code === dept.code);
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
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
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
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}
th,
td {
  border: 1px solid #ddd;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
th {
  background: #f0f0f0;
}
input[type='text'] {
  width: 100%;
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
.add-btn {
  margin-bottom: 1rem;
  padding: 0.4rem 1.2rem;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
