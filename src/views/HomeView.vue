<template>
  <div class="home">
    <h2>ホーム</h2>
    <div class="dashboard">
      <div
        class="card"
        v-for="status in ['draft', 'in_progress', 'expired']"
        :key="status"
      >
        <h3>{{ statusLabels[status] }}の回覧箋</h3>
        <p class="count">{{ statusCounts[status] }}件</p>
      </div>
      <div class="card">
        <h3>最近の活動</h3>
        <p>最近の活動はありません</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { circulars } from '@/mocks/mockCirculars';
import { computed, inject } from 'vue';

const currentUser = inject('currentUser') as any;

function isSameBushoGroup(
  userBusho: string | number,
  recordBusho: string | number
) {
  const userNum = Number(userBusho);
  const recordNum = Number(recordBusho);
  if (isNaN(userNum) || isNaN(recordNum)) return false;
  return Math.floor(userNum / 1000) === Math.floor(recordNum / 1000);
}

const statusLabels: Record<string, string> = {
  draft: '作成中',
  in_progress: '回覧中',
  expired: '期限切れ',
};

const statusCounts = computed(() => {
  const counts: Record<string, number> = {
    draft: 0,
    in_progress: 0,
    expired: 0,
  };
  circulars.forEach((c) => {
    if (
      c.status !== 'completed' &&
      currentUser?.value?.busho &&
      isSameBushoGroup(currentUser.value.busho, c.department)
    ) {
      counts[c.status] = (counts[c.status] || 0) + 1;
    }
  });
  return counts;
});
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.count {
  font-size: 24px;
  font-weight: bold;
  color: #4caf50;
  margin: 0;
}
</style>
