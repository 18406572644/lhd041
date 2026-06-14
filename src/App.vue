<script setup lang="ts">
import { onMounted } from 'vue';
import NavBar from './components/common/NavBar.vue';
import NotificationToast from './components/common/NotificationToast.vue';
import { useHeroStore } from './stores/hero';
import { useUiStore } from './stores/ui';

const heroStore = useHeroStore();
const uiStore = useUiStore();

onMounted(async () => {
  try {
    await heroStore.loadAllData();
    uiStore.showSuccess('欢迎来到超级英雄角色生成器！');
  } catch (e) {
    console.error('Initialization failed:', e);
  }
});
</script>

<template>
  <div id="app">
    <NavBar />
    <main>
      <router-view />
    </main>
    <NotificationToast />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding-top: 80px;
}

@media (max-width: 768px) {
  main {
    padding-top: 140px;
  }
}
</style>
