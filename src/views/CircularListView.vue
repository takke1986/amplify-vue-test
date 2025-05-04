<template>
  <div class="circular-list">
    <div class="header">
      <h2>回覧箋一覧</h2>
      <router-link to="/circulars/create" class="btn-create">
        新規作成
      </router-link>
    </div>

    <div class="filters">
      <select v-model="filter.status" class="form-control">
        <option value="">すべて</option>
        <option value="draft">作成中</option>
        <option value="in_progress">回覧中</option>
        <option value="completed">完了</option>
        <option value="expired">期限切れ</option>
      </select>
    </div>

    <div class="table-container">
      <table class="circular-table">
        <thead>
          <tr>
            <th>タイトル</th>
            <th>作成者</th>
            <th>作成日</th>
            <th>期限</th>
            <th>ステータス</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="circular in filteredCirculars" :key="circular.id">
            <td>{{ circular.title }}</td>
            <td>{{ circular.creator }}</td>
            <td>{{ formatDate(circular.createdAt) }}</td>
            <td>{{ formatDate(circular.deadline) }}</td>
            <td>
              <span :class="['status-badge', circular.status]">
                {{ getStatusText(circular.status) }}
              </span>
            </td>
            <td>
              <router-link :to="'/circulars/' + circular.id" class="btn-detail">
                詳細
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Circular {
  id: string;
  title: string;
  creator: string;
  createdAt: string;
  deadline: string;
  status: 'draft' | 'in_progress' | 'completed' | 'expired';
}

// 仮のデータ（後でAPIから取得するように変更）
const circulars = ref<Circular[]>([
  {
    id: '1',
    title: '会議室の使用について',
    creator: '山田太郎',
    createdAt: '2024-03-01',
    deadline: '2024-03-15',
    status: 'in_progress',
  },
  {
    id: '2',
    title: '社内イベントのご案内',
    creator: '鈴木花子',
    createdAt: '2024-02-28',
    deadline: '2024-03-10',
    status: 'completed',
  },
]);

const filter = ref({
  status: '',
});

const filteredCirculars = computed(() => {
  if (!filter.value.status) return circulars.value;
  return circulars.value.filter((c) => c.status === filter.value.status);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP');
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
</script>

<style scoped>
.circular-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-create {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.filters {
  margin-bottom: 20px;
}

.form-control {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.table-container {
  overflow-x: auto;
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

.btn-detail {
  color: #2196f3;
  text-decoration: none;
}

.btn-detail:hover {
  text-decoration: underline;
}
</style>
