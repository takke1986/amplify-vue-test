<script lang="ts">
import { defineComponent } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';

export default defineComponent({
  name: 'Home',
  components: {
    AppLayout,
  },
});
</script>

<template>
  <AppLayout>
    <div class="home-content">
      <h2>ホーム</h2>
      <p>ようこそ、回覧箋アプリへ</p>
    </div>
  </AppLayout>
</template>

<style scoped>
.home-content {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin: 0;
}
</style>
