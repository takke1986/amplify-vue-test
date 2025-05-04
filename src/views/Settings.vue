<script lang="ts">
import { defineComponent } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';

export default defineComponent({
  name: 'Settings',
  components: {
    AppLayout,
  },
});
</script>

<template>
  <AppLayout>
    <div class="settings-form">
      <h2>設定</h2>
      <div class="form-container">
        <p>設定機能は準備中です</p>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.settings-form {
  max-width: 800px;
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

.form-container {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}
</style>
