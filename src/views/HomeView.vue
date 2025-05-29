<template>
  <div class="home">
    <GlobalMessage />
    <h2>ホーム</h2>
    <div style="margin-bottom: 2rem">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <div class="dashboard">
      <div class="card">
        <h3>{{ statusLabels['expired'] }}の回覧箋</h3>
        <p class="count">{{ statusCounts['expired'] }}件</p>
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
import GlobalMessage from '@/components/GlobalMessage.vue';
import { Bar } from 'vue-chartjs';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  in_progress: '回覧中',
  expired: '期限切れ',
};

const statusColors: Record<string, string> = {
  in_progress: '#4caf50',
  expired: '#e57373',
};

// ステータス判定関数
function getStatus(c: any) {
  const processFinal = 15; // 最終完了
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = c.deadline ? new Date(c.deadline) : null;
  if (c.process !== processFinal && deadline && deadline < today) {
    return 'expired';
  }
  // draftもin_progressとして扱う
  return 'in_progress';
}

const filteredCirculars = computed(() => {
  return circulars.filter(
    (c) =>
      currentUser?.value?.busho &&
      isSameBushoGroup(currentUser.value.busho, c.department)
  );
});

// 期限日ごと・ステータスごとの件数を集計
const chartData = computed(() => {
  // 期限日（yyyy-MM-dd）ごとにグループ化
  const dateMap: Record<string, Record<string, number>> = {};
  filteredCirculars.value.forEach((c) => {
    const date = c.deadline
      ? new Date(c.deadline).toISOString().slice(0, 10)
      : '';
    if (!date) return;
    if (!dateMap[date]) {
      dateMap[date] = { in_progress: 0, expired: 0 };
    }
    const status = getStatus(c);
    if (dateMap[date][status] !== undefined) {
      dateMap[date][status]++;
    }
  });
  // 日付昇順
  const dates = Object.keys(dateMap).sort();
  // ステータスごとにデータ配列を作成
  const datasets = Object.keys(statusLabels).map((status) => ({
    label: statusLabels[status],
    backgroundColor: statusColors[status],
    data: dates.map((d) => dateMap[d][status]),
    stack: 'status',
  }));
  return {
    labels: dates,
    datasets,
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: '期限日ごとの案件数（ステータス別）' },
  },
  scales: {
    x: { stacked: true },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0,
      },
    },
  },
};

const statusCounts = computed(() => {
  const counts: Record<string, number> = {
    in_progress: 0,
    expired: 0,
  };
  circulars.forEach((c) => {
    const status = getStatus(c);
    if (
      currentUser?.value?.busho &&
      isSameBushoGroup(currentUser.value.busho, c.department)
    ) {
      counts[status] = (counts[status] || 0) + 1;
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
