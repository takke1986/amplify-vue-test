<script lang="ts">
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

export default defineComponent({
  name: 'App',
  components: {
    RouterView,
  },
});
</script>

<template>
  <RouterView />
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
