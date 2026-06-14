<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { Home, Sparkles, Heart, TrendingUp, Menu, X } from 'lucide-vue-next';
import { useUiStore } from '../../stores/ui';

const router = useRouter();
const route = useRoute();
const uiStore = useUiStore();

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/generator', label: '角色生成', icon: Sparkles },
  { path: '/favorites', label: '我的收藏', icon: Heart },
  { path: '/hot', label: '热门英雄', icon: TrendingUp }
];

function navigate(path: string) {
  router.push(path);
  uiStore.closeMobileMenu();
}
</script>

<template>
  <nav class="comic-nav">
    <div class="nav-container">
      <div class="nav-logo" @click="navigate('/')">
        <span class="logo-icon">🦸</span>
        <span class="logo-text">超级英雄生成器</span>
      </div>
      
      <div class="nav-desktop">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="nav-btn"
          :class="{ active: route.path === item.path }"
          @click="navigate(item.path)"
        >
          <component :is="item.icon" class="nav-icon" :size="18" />
          <span>{{ item.label }}</span>
        </button>
      </div>
      
      <button class="mobile-menu-btn" @click="uiStore.toggleMobileMenu">
        <Menu v-if="!uiStore.isMobileMenuOpen" :size="24" />
        <X v-else :size="24" />
      </button>
    </div>
    
    <Transition name="slide">
      <div v-if="uiStore.isMobileMenuOpen" class="mobile-menu">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="mobile-nav-btn"
          :class="{ active: route.path === item.path }"
          @click="navigate(item.path)"
        >
          <component :is="item.icon" class="nav-icon" :size="20" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.comic-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 4px solid #e53935;
  box-shadow: 0 4px 0 #212121, 0 8px 20px rgba(0,0,0,0.3);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.nav-logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 32px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.logo-text {
  font-family: 'Bangers', cursive;
  font-size: 24px;
  color: #fdd835;
  text-shadow: 2px 2px 0 #e53935, 4px 4px 0 #212121;
  letter-spacing: 1px;
}

.nav-desktop {
  display: flex;
  gap: 8px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: 3px solid transparent;
  border-radius: 4px;
  color: #fafafa;
  font-family: 'Roboto Slab', serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.nav-btn:hover {
  background: rgba(229, 57, 53, 0.2);
  border-color: #e53935;
  transform: translateY(-2px);
}

.nav-btn.active {
  background: #e53935;
  border-color: #fdd835;
  box-shadow: 3px 3px 0 #212121;
}

.nav-icon {
  flex-shrink: 0;
}

.mobile-menu-btn {
  display: none;
  background: #e53935;
  border: 3px solid #fdd835;
  border-radius: 4px;
  padding: 8px;
  color: #fafafa;
  cursor: pointer;
  box-shadow: 2px 2px 0 #212121;
}

.mobile-menu {
  background: #1a1a2e;
  border-top: 4px solid #e53935;
  padding: 16px;
}

.mobile-nav-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: transparent;
  border: 3px solid transparent;
  border-radius: 4px;
  color: #fafafa;
  font-family: 'Roboto Slab', serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-nav-btn:hover,
.mobile-nav-btn.active {
  background: #e53935;
  border-color: #fdd835;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .nav-desktop {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .nav-container {
    height: 60px;
  }
}
</style>
