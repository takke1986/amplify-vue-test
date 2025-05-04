<template>
  <div class="home">
    <h2>ホーム</h2>
    <div class="dashboard">
      <div class="card">
        <h3>未処理の回覧箋</h3>
        <p class="count">0件</p>
      </div>
      <div class="card">
        <h3>期限切れの回覧箋</h3>
        <p class="count">0件</p>
      </div>
      <div class="card">
        <h3>最近の活動</h3>
        <p>最近の活動はありません</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 必要に応じてデータ取得のロジックを追加
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
