<template>
  <div class="settings-view">
    <GlobalMessage />
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
              <th>ロール</th>
              <th>編集</th>
              <th>削除</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dept in localPermissions" :key="dept.departmentId">
              <td>
                <input
                  type="text"
                  v-model="dept.departmentId"
                  :disabled="!isAdmin || !dept.isEditing"
                  placeholder="例: 12345"
                />
              </td>
              <td>
                <input
                  type="text"
                  v-model="dept.departmentName"
                  :disabled="!isAdmin || !dept.isEditing"
                  placeholder="例: 営業部"
                />
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
                <button
                  :disabled="!isAdmin"
                  @click="removeDepartment(dept.departmentId)"
                >
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
              <th>通知先メールアドレス（カンマ区切り可）</th>
              <th>編集</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dept in localPermissions" :key="dept.departmentId">
              <td>{{ dept.departmentId }}</td>
              <td>{{ dept.departmentName }}</td>
              <td>
                <input
                  type="text"
                  :value="dept.notificationEmails.join(',')"
                  :disabled="!isAdmin || !dept.isEditing"
                  placeholder="例: aaa@ex.com,bbb@ex.com"
                  @input="onEmailsInput($event, dept)"
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
import { ref, inject, computed, watch, onMounted } from 'vue';
import { usePermissionStore } from '@/stores/permission';
import { storeToRefs } from 'pinia';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import GlobalMessage from '@/components/GlobalMessage.vue';
import type { DepartmentPermission } from '@/stores/permission';

const client = generateClient<Schema>();

const currentUser = inject('currentUser', ref<any>(null));
const permissionStore = usePermissionStore();
const { permissions } = storeToRefs(permissionStore);

// DBから部署権限一覧を取得
async function fetchPermissions() {
  const { data, errors } = await client.models.Department.list({
    limit: 1000,
  });
  if (!errors && data) {
    permissionStore.setPermissions(
      data.map(
        (d) =>
          ({
            id: d.id ?? '',
            departmentId: d.departmentId ?? '',
            departmentName: d.departmentName ?? '',
            role: d.role === '管理者' ? '管理者' : '一般',
            editable: false,
            notificationEmails: d.notificationEmails ?? [],
          } as DepartmentPermission)
      )
    );
  }
}

// isEditingを拡張したローカルUI用の型
interface LocalDepartment {
  id: string;
  departmentId: string;
  departmentName: string;
  role: string;
  editable: boolean;
  notificationEmails: string[];
  isEditing: boolean;
}

const localPermissions = ref<LocalDepartment[]>(
  permissions.value.map((p) => ({
    id: p.id ?? '',
    departmentId: p.departmentId ?? '',
    departmentName: p.departmentName ?? '',
    role: p.role ?? '',
    editable: p.editable ?? false,
    notificationEmails: p.notificationEmails ?? [],
    isEditing: false,
  }))
);

watch(
  permissions,
  (newVal) => {
    localPermissions.value = newVal.map((p) => ({
      id: p.id ?? '',
      departmentId: p.departmentId ?? '',
      departmentName: p.departmentName ?? '',
      role: p.role ?? '',
      editable: p.editable ?? false,
      notificationEmails: p.notificationEmails ?? [],
      isEditing: false,
    }));
  },
  { deep: true }
);

onMounted(async () => {
  await fetchPermissions();
  // 2001管理者がなければ自動追加
  const exists = localPermissions.value.some(
    (d) => d.departmentId === '2001' && d.role === '管理者'
  );
  if (!exists) {
    if (client.models.Department) {
      await client.models.Department.create({
        departmentId: '2001',
        departmentCode: '2001',
        departmentName: '管理部',
        affiliationCode: '',
        affiliationName: '',
        role: '管理者',
        notificationEmails: [],
      });
      await fetchPermissions();
    }
  }
});

const isAdmin = computed(() => {
  if (!currentUser.value) return false;
  const userBusho = String(currentUser.value.busho ?? '');
  const dept = localPermissions.value.find(
    (d) => String(d.departmentId) === userBusho
  );
  return dept && dept.role === '管理者';
});

const activeTab = ref<'auth' | 'notify'>('auth');

function handleEdit(dept: LocalDepartment) {
  if (!isAdmin.value) return;
  dept.isEditing = true;
}
async function handleSave(dept: LocalDepartment) {
  dept.isEditing = false;
  await client.models.Department.update({
    id: dept.id,
    departmentId: dept.departmentId,
    departmentName: dept.departmentName,
    role: dept.role,
    notificationEmails: dept.notificationEmails,
  });
  await fetchPermissions();
}
async function addDepartment() {
  const newId = (
    localPermissions.value.length > 0
      ? Math.max(...localPermissions.value.map((d) => Number(d.departmentId))) +
        1
      : 1001
  ).toString();
  await client.models.Department.create({
    departmentId: newId,
    departmentName: '',
    role: '一般',
    notificationEmails: [],
  });
  await fetchPermissions();
}
async function removeDepartment(departmentId: string) {
  const dept = localPermissions.value.find(
    (d) => d.departmentId === departmentId
  );
  if (!dept) return;
  await client.models.Department.delete({ id: dept.id });
  await fetchPermissions();
}
// 通知先メールアドレスinputの型安全なハンドラ
function onEmailsInput(event: Event, dept: LocalDepartment) {
  const target = event.target as HTMLInputElement;
  dept.notificationEmails = target.value
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e);
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
