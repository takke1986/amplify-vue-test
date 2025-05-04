<script lang="ts">
import { defineComponent } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    AppLayout,
  },
});
</script>

<template>
  <AppLayout>
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>未処理の回覧箋</h3>
        <p class="count">0</p>
      </div>
      <div class="dashboard-card">
        <h3>期限切れの回覧箋</h3>
        <p class="count">0</p>
      </div>
      <div class="dashboard-card">
        <h3>承認待ちの回覧箋</h3>
        <p class="count">0</p>
      </div>
      <div class="dashboard-card">
        <h3>作成した回覧箋</h3>
        <p class="count">0</p>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h3 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.count {
  font-size: 2rem;
  font-weight: bold;
  color: #0078d4;
  margin: 0;
}
</style>
