<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Heart, Plus, Trash2, Edit, Share2, Search, Filter } from 'lucide-vue-next';
import { useHeroStore } from '../stores/hero';
import { useUiStore } from '../stores/ui';
import HeroCard from '../components/hero/HeroCard.vue';

const router = useRouter();
const heroStore = useHeroStore();
const uiStore = useUiStore();

const savedHeroes = computed(() => heroStore.savedHeroes);
const storageStats = computed(() => heroStore.getStorageStats());

async function handleEdit(hero: { id: string }) {
  await heroStore.editHero(hero.id);
  router.push('/generator');
}

async function handleDelete(heroId: string) {
  const hero = savedHeroes.value.find(h => h.id === heroId);
  if (confirm(`确定要删除英雄「${hero?.name}」吗？`)) {
    try {
      await heroStore.deleteSavedHero(heroId);
      uiStore.showSuccess('英雄已删除');
    } catch (e) {
      uiStore.showError('删除失败');
    }
  }
}

async function handleShare(heroId: string) {
  try {
    await heroStore.shareHero(heroId);
    uiStore.showSuccess('分享链接已复制到剪贴板！');
  } catch (e) {
    uiStore.showError('分享失败');
  }
}

function goToGenerator() {
  router.push('/generator');
}

async function clearAll() {
  if (savedHeroes.value.length === 0) return;
  if (confirm('确定要清空所有收藏的英雄吗？此操作不可恢复！')) {
    try {
      await heroStore.clearAllHeroes();
      uiStore.showSuccess('已清空所有收藏');
    } catch (e) {
      uiStore.showError('清空失败');
    }
  }
}
</script>

<template>
  <div class="favorites-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <Heart :size="32" fill="#e53935" />
          <span>我的收藏</span>
        </h1>
        <p class="page-subtitle">你收藏的超级英雄们</p>
      </div>
      <div class="header-right">
        <div class="stats-badge">
          <span class="stat-icon">🦸</span>
          <span class="stat-text">{{ savedHeroes.length }} 个英雄</span>
        </div>
        <button class="action-btn create" @click="goToGenerator">
          <Plus :size="20" />
          <span>创建新英雄</span>
        </button>
        <button 
          v-if="savedHeroes.length > 0"
          class="action-btn clear"
          @click="clearAll"
        >
          <Trash2 :size="18" />
          <span>清空</span>
        </button>
      </div>
    </div>
    
    <div v-if="savedHeroes.length > 0" class="storage-info">
      <div class="storage-bar">
        <div 
          class="storage-fill" 
          :style="{ width: `${Math.min(100, (storageStats.totalSize / (5 * 1024 * 1024)) * 100)}%` }"
        />
      </div>
      <span class="storage-text">
        已使用 {{ (storageStats.totalSize / 1024).toFixed(1) }} KB / 5 MB
      </span>
    </div>
    
    <div v-if="savedHeroes.length === 0" class="empty-state">
      <div class="empty-icon">
        <Heart :size="80" />
      </div>
      <h2 class="empty-title">还没有收藏的英雄</h2>
      <p class="empty-desc">创建你的第一个超级英雄，保存到收藏夹吧！</p>
      <button class="cta-btn primary" @click="goToGenerator">
        <Plus :size="24" />
        <span>开始创建</span>
      </button>
    </div>
    
    <div v-else class="heroes-grid">
      <HeroCard
        v-for="hero in savedHeroes"
        :key="hero.id"
        :hero="hero"
        showActions
        @edit="handleEdit"
        @delete="handleDelete"
        @share="handleShare"
      />
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 24px;
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  border: 5px solid #212121;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 8px 8px 0 #212121;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.header-left {
  position: relative;
  z-index: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Bangers', cursive;
  font-size: 42px;
  color: #fafafa;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
  text-shadow: 3px 3px 0 #212121;
}

.page-subtitle {
  font-family: 'Comic Neue', cursive;
  font-size: 16px;
  color: #fafafa;
  margin: 0;
  font-weight: 700;
  opacity: 0.9;
}

.header-right {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #fdd835;
  border: 3px solid #212121;
  border-radius: 20px;
  box-shadow: 3px 3px 0 #212121;
}

.stat-icon {
  font-size: 20px;
}

.stat-text {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  color: #212121;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  border: 3px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.action-btn.create {
  background: #4caf50;
  color: #fafafa;
}

.action-btn.clear {
  background: #fafafa;
  color: #c62828;
}

.storage-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 3px 3px 0 #212121;
}

.storage-bar {
  flex: 1;
  height: 12px;
  background: #e0e0e0;
  border: 2px solid #212121;
  border-radius: 6px;
  overflow: hidden;
  max-width: 300px;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #fdd835, #e53935);
  transition: width 0.5s ease;
}

.storage-text {
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fafafa;
  border: 5px dashed #bdbdbd;
  border-radius: 16px;
}

.empty-icon {
  color: #e0e0e0;
  margin-bottom: 24px;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.empty-title {
  font-family: 'Bangers', cursive;
  font-size: 32px;
  color: #757575;
  margin: 0 0 12px 0;
  letter-spacing: 2px;
}

.empty-desc {
  font-family: 'Comic Neue', cursive;
  font-size: 18px;
  color: #9e9e9e;
  margin: 0 0 32px 0;
  font-weight: 700;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  font-family: 'Bangers', cursive;
  font-size: 20px;
  letter-spacing: 2px;
  border: 4px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 4px 4px 0 #212121;
}

.cta-btn:hover {
  transform: translateY(-4px);
  box-shadow: 8px 8px 0 #212121;
}

.cta-btn.primary {
  background: #fdd835;
  color: #212121;
}

.heroes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .storage-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .storage-bar {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 640px) {
  .favorites-page {
    padding: 12px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .heroes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
