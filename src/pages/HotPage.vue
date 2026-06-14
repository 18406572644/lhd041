<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { TrendingUp, Heart, Award, Filter, Search, Sparkles } from 'lucide-vue-next';
import { useHeroStore } from '../stores/hero';
import { useUiStore } from '../stores/ui';
import HeroCard from '../components/hero/HeroCard.vue';

const router = useRouter();
const heroStore = useHeroStore();
const uiStore = useUiStore();

const hotHeroes = computed(() => heroStore.hotHeroes);
const templates = computed(() => heroStore.templates);
const isLoading = computed(() => heroStore.isGenerating);

const activeTab = ref<'hot' | 'templates'>('hot');
const sortBy = ref<'likes' | 'newest' | 'power'>('likes');

onMounted(async () => {
  if (hotHeroes.value.length === 0) {
    await heroStore.loadHotHeroes();
  }
});

async function handleLike(heroId: string) {
  try {
    await heroStore.likeHero(heroId);
    uiStore.showSuccess('点赞成功！');
  } catch (e) {
    uiStore.showError('点赞失败');
  }
}

function handleUseTemplate(templateId: string) {
  router.push(`/generator?template=${templateId}`);
}

const sortedHeroes = computed(() => {
  const heroes = [...hotHeroes.value];
  if (sortBy.value === 'likes') {
    return heroes.sort((a, b) => b.likes - a.likes);
  } else if (sortBy.value === 'newest') {
    return heroes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    return heroes.sort((a, b) => {
      const aTotal = a.stats.strength + a.stats.speed + a.stats.intelligence + a.stats.durability + a.stats.combat + a.stats.charisma;
      const bTotal = b.stats.strength + b.stats.speed + b.stats.intelligence + b.stats.durability + b.stats.combat + b.stats.charisma;
      return bTotal - aTotal;
    });
  }
});

function getRankStyle(index: number) {
  if (index === 0) return { background: 'linear-gradient(135deg, #ffd700, #ffb700)', color: '#212121' };
  if (index === 1) return { background: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)', color: '#212121' };
  if (index === 2) return { background: 'linear-gradient(135deg, #cd7f32, #b87333)', color: '#fafafa' };
  return { background: '#212121', color: '#fafafa' };
}
</script>

<template>
  <div class="hot-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <TrendingUp :size="32" />
          <span>热门英雄</span>
        </h1>
        <p class="page-subtitle">看看最受欢迎的超级英雄们</p>
      </div>
    </div>
    
    <div class="tabs-container">
      <div class="tabs-nav">
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'hot' }"
          @click="activeTab = 'hot'"
        >
          <Award :size="20" />
          <span>热门排行</span>
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'templates' }"
          @click="activeTab = 'templates'"
        >
          <Sparkles :size="20" />
          <span>角色模板</span>
        </button>
      </div>
      
      <div v-if="activeTab === 'hot'" class="sort-controls">
        <span class="sort-label">排序方式:</span>
        <div class="sort-buttons">
          <button
            class="sort-btn"
            :class="{ active: sortBy === 'likes' }"
            @click="sortBy = 'likes'"
          >
            <Heart :size="16" />
            <span>最多点赞</span>
          </button>
          <button
            class="sort-btn"
            :class="{ active: sortBy === 'newest' }"
            @click="sortBy = 'newest'"
          >
            <span>最新发布</span>
          </button>
          <button
            class="sort-btn"
            :class="{ active: sortBy === 'power' }"
            @click="sortBy = 'power'"
          >
            <span>最强能力</span>
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="activeTab === 'hot'" class="hot-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner" />
        <p>正在加载热门英雄...</p>
      </div>
      
      <div v-else-if="sortedHeroes.length === 0" class="empty-state">
        <Award :size="80" />
        <h2>暂无热门英雄</h2>
        <p>快来创建第一个超级英雄吧！</p>
      </div>
      
      <div v-else class="rankings-list">
        <div
          v-for="(hero, index) in sortedHeroes"
          :key="hero.id"
          class="ranking-item"
          :class="{ 'top-three': index < 3 }"
        >
          <div class="rank-badge" :style="getRankStyle(index)">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          
          <div class="hero-content">
            <HeroCard :hero="hero" compact />
          </div>
          
          <div class="hero-actions">
            <button 
              class="action-btn like"
              @click="handleLike(hero.id)"
            >
              <Heart :size="20" :fill="hero.likes > 0 ? '#e53935' : 'none'" />
              <span class="like-count">{{ hero.likes }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="templates-content">
      <div class="templates-grid">
        <div
          v-for="template in templates"
          :key="template.id"
          class="template-card"
        >
          <div class="template-badge">
            <Sparkles :size="16" />
            <span>模板</span>
          </div>
          <HeroCard :hero="template" compact />
          <button class="use-template-btn" @click="handleUseTemplate(template.id)">
            <Sparkles :size="18" />
            <span>使用此模板</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hot-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  padding: 24px;
  background: linear-gradient(135deg, #fdd835 0%, #f57c00 100%);
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
  background-image: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
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
  color: #212121;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
  text-shadow: 3px 3px 0 #fafafa;
}

.page-subtitle {
  font-family: 'Comic Neue', cursive;
  font-size: 16px;
  color: #212121;
  margin: 0;
  font-weight: 700;
}

.tabs-container {
  background: #212121;
  border: 4px solid #212121;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 6px 6px 0 #212121;
}

.tabs-nav {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #212121;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  border: 3px solid transparent;
  border-radius: 8px;
  font-family: 'Bangers', cursive;
  font-size: 18px;
  letter-spacing: 1px;
  color: #bdbdbd;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #fafafa;
  background: rgba(255,255,255,0.1);
}

.tab-btn.active {
  background: #fdd835;
  border-color: #fdd835;
  color: #212121;
  box-shadow: 0 0 0 2px #212121 inset;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-top: 3px solid #212121;
}

.sort-label {
  font-family: 'Roboto Slab', serif;
  font-size: 14px;
  font-weight: 700;
  color: #424242;
}

.sort-buttons {
  display: flex;
  gap: 8px;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 6px;
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
}

.sort-btn:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.sort-btn.active {
  background: #1565c0;
  color: #fafafa;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fafafa;
  border: 5px dashed #bdbdbd;
  border-radius: 16px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #e0e0e0;
  border-top-color: #e53935;
  border-radius: 50%;
  margin: 0 auto 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p, .empty-state h2, .empty-state p {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  color: #757575;
  margin: 0;
}

.empty-state h2 {
  font-family: 'Bangers', cursive;
  font-size: 28px;
  color: #757575;
  margin: 24px 0 12px;
  letter-spacing: 2px;
}

.empty-state p {
  font-size: 18px;
  color: #9e9e9e;
}

.empty-state svg {
  color: #e0e0e0;
}

.rankings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  box-shadow: 4px 4px 0 #212121;
  transition: all 0.3s;
}

.ranking-item:hover {
  transform: translateX(8px);
  box-shadow: 8px 8px 0 #212121;
}

.ranking-item.top-three {
  background: linear-gradient(135deg, #fff9c4 0%, #fff3e0 100%);
}

.rank-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 4px solid #212121;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bangers', cursive;
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: 3px 3px 0 #212121;
}

.hero-content {
  flex: 1;
  min-width: 0;
}

.hero-actions {
  flex-shrink: 0;
}

.action-btn.like {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: #ffebee;
  border: 3px solid #e53935;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.action-btn.like:hover {
  background: #e53935;
  color: #fafafa;
  transform: scale(1.05);
}

.action-btn.like:hover svg {
  stroke: #fafafa;
}

.like-count {
  font-family: 'Bangers', cursive;
  font-size: 18px;
  color: #e53935;
}

.action-btn.like:hover .like-count {
  color: #fafafa;
}

.templates-content {
  padding: 8px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.template-card {
  position: relative;
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 4px 4px 0 #212121;
  transition: all 0.3s;
}

.template-card:hover {
  transform: translateY(-8px) rotate(-1deg);
  box-shadow: 8px 12px 0 #212121;
}

.template-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #fdd835;
  border: 3px solid #212121;
  border-radius: 20px;
  font-family: 'Bangers', cursive;
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 10;
  box-shadow: 2px 2px 0 #212121;
}

.use-template-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  border: none;
  border-top: 4px solid #212121;
  font-family: 'Bangers', cursive;
  font-size: 18px;
  letter-spacing: 1px;
  color: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
}

.use-template-btn:hover {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
}

@media (max-width: 900px) {
  .page-title {
    font-size: 32px;
  }
  
  .sort-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .ranking-item {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-actions {
    width: 100%;
  }
  
  .action-btn.like {
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .hot-page {
    padding: 12px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .tabs-nav {
    flex-direction: column;
  }
  
  .tab-btn {
    width: 100%;
    justify-content: center;
  }
  
  .sort-buttons {
    flex-wrap: wrap;
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
