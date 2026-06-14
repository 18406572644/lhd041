import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
      meta: { title: '首页 - 超级英雄角色生成器' }
    },
    {
      path: '/generator',
      name: 'generator',
      component: () => import('../pages/GeneratorPage.vue'),
      meta: { title: '角色生成器 - 超级英雄角色生成器' }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../pages/FavoritesPage.vue'),
      meta: { title: '我的收藏 - 超级英雄角色生成器' }
    },
    {
      path: '/hot',
      name: 'hot',
      component: () => import('../pages/HotPage.vue'),
      meta: { title: '热门英雄 - 超级英雄角色生成器' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '超级英雄角色生成器';
  next();
});

export default router;
