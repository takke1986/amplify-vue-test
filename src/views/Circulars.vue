<script lang="ts">
import { defineComponent } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';

export default defineComponent({
  name: 'Circulars',
  components: {
    AppLayout,
  },
});
</script>

<template>
  <AppLayout>
    <div class="circulars-list">
      <h2>回覧箋一覧</h2>
      <div class="empty-state">
        <p>回覧箋がありません</p>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.circulars-list {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}
</style>
