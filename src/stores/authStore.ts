import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref(null);

  const setAuth = (auth: boolean) => {
    isAuthenticated.value = auth;
  };

  const setUser = (userData: any) => {
    user.value = userData;
  };

  return {
    isAuthenticated,
    user,
    setAuth,
    setUser,
  };
});
