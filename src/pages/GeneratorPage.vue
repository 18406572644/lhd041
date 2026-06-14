<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Sparkles, Save, RotateCcw, Palette, Zap, BookOpen, Image, Sparkles as EffectIcon, ArrowLeft } from 'lucide-vue-next';
import { useHeroStore } from '../stores/hero';
import { useUiStore } from '../stores/ui';
import HeroPreview from '../components/hero/HeroPreview.vue';
import AppearanceEditor from '../components/hero/AppearanceEditor.vue';
import PowerEditor from '../components/hero/PowerEditor.vue';
import StoryEditor from '../components/hero/StoryEditor.vue';
import ComicCardEditor from '../components/hero/ComicCardEditor.vue';
import EffectEditor from '../components/hero/EffectEditor.vue';

const route = useRoute();
const router = useRouter();
const heroStore = useHeroStore();
const uiStore = useUiStore();

const activeTab = ref('appearance');
const isGenerating = computed(() => heroStore.isGenerating);
const currentHero = computed(() => heroStore.currentHero);

const tabs = [
  { id: 'appearance', label: '外观', icon: Palette },
  { id: 'powers', label: '能力', icon: Zap },
  { id: 'story', label: '故事', icon: BookOpen },
  { id: 'effects', label: '特效', icon: EffectIcon },
  { id: 'card', label: '卡片', icon: Image }
];

onMounted(async () => {
  const templateId = route.query.template as string;
  if (templateId) {
    await heroStore.loadFromTemplate(templateId);
  } else if (!currentHero.value) {
    await generateNewHero();
  }
});

async function generateNewHero() {
  try {
    await heroStore.generateRandomHero();
    uiStore.showSuccess('新英雄已生成！');
  } catch (e) {
    uiStore.showError('生成失败，请重试');
  }
}

async function saveHero() {
  if (!currentHero.value) return;
  
  try {
    const isNew = !heroStore.savedHeroes.some(h => h.id === currentHero.value!.id);
    await heroStore.saveCurrentHero();
    uiStore.showSuccess(isNew ? '英雄已保存到收藏！' : '英雄已更新！');
    router.push('/favorites');
  } catch (e) {
    uiStore.showError('保存失败，请重试');
  }
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="generator-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
        <span>返回</span>
      </button>
      <h1 class="page-title">
        <Sparkles :size="32" />
        <span>角色生成器</span>
      </h1>
      <div class="header-actions">
        <button 
          class="action-btn regenerate"
          :disabled="isGenerating"
          @click="generateNewHero"
        >
          <RotateCcw :size="18" :class="{ spinning: isGenerating }" />
          <span>{{ isGenerating ? '生成中...' : '重新生成' }}</span>
        </button>
        <button 
          class="action-btn save"
          :disabled="!currentHero"
          @click="saveHero"
        >
          <Save :size="18" />
          <span>保存英雄</span>
        </button>
      </div>
    </div>
    
    <div class="generator-content">
      <div class="preview-sidebar">
        <div class="sticky-preview">
          <div class="preview-header">
            <h3>实时预览</h3>
          </div>
          <div class="preview-container" v-if="currentHero">
            <HeroPreview :hero="currentHero" size="large" />
          </div>
          <div class="preview-placeholder" v-else>
            <Sparkles :size="48" />
            <p>正在生成英雄...</p>
          </div>
        </div>
      </div>
      
      <div class="editor-main">
        <div class="tabs-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" :size="18" />
            <span>{{ tab.label }}</span>
          </button>
        </div>
        
        <div class="tab-content">
          <AppearanceEditor v-if="activeTab === 'appearance' && currentHero" :hero="currentHero" />
          <PowerEditor v-else-if="activeTab === 'powers' && currentHero" :hero="currentHero" />
          <StoryEditor v-else-if="activeTab === 'story' && currentHero" :hero="currentHero" />
          <EffectEditor v-else-if="activeTab === 'effects' && currentHero" :hero="currentHero" />
          <ComicCardEditor v-else-if="activeTab === 'card' && currentHero" :hero="currentHero" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.generator-page {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #e53935 0%, #1565c0 100%);
  border: 4px solid #212121;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 6px 6px 0 #212121;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 6px;
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.back-btn:hover {
  background: #fdd835;
  transform: translateX(-4px);
  box-shadow: 6px 6px 0 #212121;
}

.page-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Bangers', cursive;
  font-size: 32px;
  color: #fafafa;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 3px 3px 0 #212121;
}

.header-actions {
  display: flex;
  gap: 12px;
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
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn.regenerate {
  background: #fdd835;
  color: #212121;
}

.action-btn.save {
  background: #4caf50;
  color: #fafafa;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.generator-content {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  align-items: start;
}

.preview-sidebar {
  position: sticky;
  top: 20px;
}

.sticky-preview {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 6px 6px 0 #212121;
}

.preview-header {
  padding: 16px;
  background: #212121;
  text-align: center;
}

.preview-header h3 {
  font-family: 'Bangers', cursive;
  font-size: 20px;
  color: #fdd835;
  margin: 0;
  letter-spacing: 2px;
}

.preview-container {
  padding: 24px;
  display: flex;
  justify-content: center;
  background: repeating-linear-gradient(
    45deg,
    #f5f5f5,
    #f5f5f5 10px,
    #e8e8e8 10px,
    #e8e8e8 20px
  );
}

.preview-placeholder {
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #757575;
  background: repeating-linear-gradient(
    45deg,
    #f5f5f5,
    #f5f5f5 10px,
    #e8e8e8 10px,
    #e8e8e8 20px
  );
}

.preview-placeholder p {
  font-family: 'Comic Neue', cursive;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.editor-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tabs-nav {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #212121;
  border: 4px solid #212121;
  border-radius: 12px;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: 3px solid transparent;
  border-radius: 8px;
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  color: #bdbdbd;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
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

.tab-content {
  min-height: 500px;
}

@media (max-width: 1200px) {
  .generator-content {
    grid-template-columns: 1fr;
  }
  
  .preview-sidebar {
    position: static;
  }
  
  .sticky-preview {
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-wrap: wrap;
    padding: 16px;
  }
  
  .page-title {
    order: -1;
    width: 100%;
    justify-content: center;
    font-size: 24px;
  }
  
  .back-btn, .header-actions {
    flex: 1;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .tabs-nav {
    padding: 6px;
  }
  
  .tab-btn {
    padding: 10px 14px;
    font-size: 14px;
  }
  
  .tab-btn span {
    display: none;
  }
}
</style>
