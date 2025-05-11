import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser } from 'aws-amplify/auth';
import HomeView from '@/views/HomeView.vue';
import Login from '@/views/Login.vue';
import CircularListView from '@/views/CircularListView.vue';
import CircularDetail from '@/views/CircularDetail.vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import CircularCreateView from '@/views/CircularCreateView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'circulars',
          name: 'circulars',
          component: CircularListView,
        },
        {
          path: 'circulars/create',
          name: 'circular-create',
          component: CircularCreateView,
        },
        {
          path: 'circulars/:id',
          name: 'circular-detail',
          component: CircularDetail,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('@/views/CircularCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

// ナビゲーションガード
router.beforeEach(async (to, _, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  try {
    const user = await getCurrentUser();
    if (requiresAuth && !user) {
      next('/login');
    } else if (!requiresAuth && user) {
      next('/');
    } else {
      next();
    }
  } catch (error) {
    if (requiresAuth) {
      next('/login');
    } else {
      next();
    }
  }
});

export default router;
