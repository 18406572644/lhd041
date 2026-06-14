<script setup lang="ts">
import { computed, ref } from 'vue';
import { Image, Download, Copy, Sparkles } from 'lucide-vue-next';
import type { Hero, Preset, CardPreset } from '../../types';
import { useHeroStore } from '../../stores/hero';
import { usePresetsStore } from '../../stores/presets';
import { useUiStore } from '../../stores/ui';
import { useCardExport } from '../../composables/useCardExport';
import { avatars, colorSchemes } from '../../data/appearance';
import PresetsPanel from './PresetsPanel.vue';

const props = defineProps<{
  hero: Hero;
}>();

const heroStore = useHeroStore();
const presetsStore = usePresetsStore();
const uiStore = useUiStore();
const { exportAndDownload, copyToClipboard, isExporting } = useCardExport();

const cardRef = ref<HTMLElement | null>(null);

const selectedCardTemplate = computed(() => {
  return heroStore.cardTemplates.find(t => t.id === props.hero.cardTemplate);
});

const selectedColorScheme = computed(() => {
  return colorSchemes.find(c => c.id === props.hero.appearance.colorScheme);
});

const selectedAvatar = computed(() => {
  return avatars.find(a => a.id === props.hero.appearance.avatar);
});

function selectCardTemplate(templateId: string) {
  heroStore.updateCurrentHero({ cardTemplate: templateId });
}

async function downloadCard() {
  if (!cardRef.value) return;
  try {
    await exportAndDownload(cardRef.value, `${props.hero.name}-card`);
    uiStore.showSuccess('卡片已下载！');
  } catch (e) {
    uiStore.showError('下载失败，请重试');
  }
}

async function copyCard() {
  if (!cardRef.value) return;
  try {
    await copyToClipboard(cardRef.value);
    uiStore.showSuccess('卡片已复制到剪贴板！');
  } catch (e) {
    uiStore.showError('复制失败，请重试');
  }
}

function handleSavePreset(name: string) {
  try {
    presetsStore.saveCardPreset(name, props.hero.cardTemplate);
    uiStore.showSuccess('卡片预设已保存！');
  } catch (e) {
    uiStore.showError('保存失败，请重试');
  }
}

function handleApplyPreset(preset: Preset) {
  if (preset.category !== 'card') return;
  const cardPreset = preset as CardPreset;
  heroStore.updateCurrentHero({
    cardTemplate: cardPreset.data.cardTemplate
  });
}
</script>

<template>
  <div class="comic-card-editor">
    <div class="section-title">
      <Image :size="20" />
      <span>漫画卡片制作</span>
    </div>
    
    <div class="editor-content">
      <div class="template-selector">
        <h4 class="subsection-title">选择卡片模板</h4>
        <div class="template-grid">
          <button
            v-for="template in heroStore.cardTemplates"
            :key="template.id"
            class="template-option"
            :class="{ active: hero.cardTemplate === template.id }"
            :style="{ '--template-color': template.primaryColor }"
            @click="selectCardTemplate(template.id)"
          >
            <div 
              class="template-preview"
              :style="{ background: `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})` }"
            >
              <span class="template-icon">{{ template.icon }}</span>
            </div>
            <span class="template-name">{{ template.name }}</span>
          </button>
        </div>
      </div>
      
      <div class="card-preview-section">
        <div class="subsection-header">
          <h4 class="subsection-title">卡片预览</h4>
          <div class="action-buttons">
            <button 
              class="action-btn copy"
              :disabled="isExporting"
              @click="copyCard"
            >
              <Copy :size="16" />
              <span>复制</span>
            </button>
            <button 
              class="action-btn download"
              :disabled="isExporting"
              @click="downloadCard"
            >
              <Download :size="16" />
              <span>{{ isExporting ? '导出中...' : '下载' }}</span>
            </button>
          </div>
        </div>
        
        <div class="card-wrapper">
          <div 
            ref="cardRef"
            class="comic-card"
            :style="{
              '--primary': selectedCardTemplate?.primaryColor || '#e53935',
              '--secondary': selectedCardTemplate?.secondaryColor || '#1565c0',
              '--accent': selectedColorScheme?.primary || '#e53935',
              '--accent-2': selectedColorScheme?.secondary || '#1565c0'
            }"
          >
            <div class="card-header">
              <div class="card-badge">{{ selectedCardTemplate?.icon }}</div>
              <h2 class="hero-name">{{ hero.name }}</h2>
              <div class="hero-alias">{{ hero.alias }}</div>
            </div>
            
            <div class="card-avatar">
              <div class="avatar-frame">
                <span class="avatar-display">{{ selectedAvatar?.emoji || '🦸' }}</span>
              </div>
              <div class="comic-effects">
                <span 
                  v-for="effect in hero.effects.slice(0, 3)" 
                  :key="effect.id"
                  class="effect-tag"
                  :class="effect.type"
                >
                  {{ effect.text || effect.type.toUpperCase() + '!' }}
                </span>
              </div>
            </div>
            
            <div class="card-powers">
              <div 
                v-for="power in hero.powers" 
                :key="power.id"
                class="power-chip"
              >
                <span class="chip-icon">{{ power.icon }}</span>
                <span class="chip-name">{{ power.name }}</span>
                <span class="chip-level">{{ power.level }}%</span>
              </div>
            </div>
            
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-label">💪</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: hero.stats.strength + '%', background: '#e53935' }" />
                </div>
                <span class="stat-num">{{ hero.stats.strength }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">⚡</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: hero.stats.speed + '%', background: '#fdd835' }" />
                </div>
                <span class="stat-num">{{ hero.stats.speed }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">🧠</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: hero.stats.intelligence + '%', background: '#1565c0' }" />
                </div>
                <span class="stat-num">{{ hero.stats.intelligence }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">🛡️</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: hero.stats.durability + '%', background: '#2e7d32' }" />
                </div>
                <span class="stat-num">{{ hero.stats.durability }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="catchphrase">"{{ hero.catchphrase }}"</div>
              <div class="weakness">⚠️ 弱点: {{ hero.weakness }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PresetsPanel
      category="card"
      @save="handleSavePreset"
      @apply="handleApplyPreset"
    />
  </div>
</template>

<style scoped>
.comic-card-editor {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 4px 4px 0 #212121;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Bangers', cursive;
  font-size: 24px;
  color: #e53935;
  text-shadow: 2px 2px 0 #212121;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.editor-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 24px;
}

.subsection-title {
  font-family: 'Bangers', cursive;
  font-size: 18px;
  color: #212121;
  margin: 0 0 16px 0;
  letter-spacing: 1px;
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.template-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
}

.template-option:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.template-option.active {
  border-color: var(--template-color);
  box-shadow: 0 0 0 3px var(--template-color), 4px 4px 0 #212121;
}

.template-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #212121;
}

.template-icon {
  font-size: 32px;
}

.template-name {
  font-family: 'Roboto Slab', serif;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 3px solid #212121;
  border-radius: 4px;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn.copy {
  background: #fdd835;
  color: #212121;
}

.action-btn.download {
  background: #4caf50;
  color: #fafafa;
}

.card-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: repeating-linear-gradient(
    45deg,
    #e0e0e0,
    #e0e0e0 10px,
    #f5f5f5 10px,
    #f5f5f5 20px
  );
  border: 3px solid #212121;
  border-radius: 8px;
}

.comic-card {
  width: 320px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border: 5px solid #212121;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 8px 8px 0 #212121;
  position: relative;
}

.comic-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px);
  background-size: 6px 6px;
  pointer-events: none;
}

.card-header {
  background: var(--accent);
  padding: 16px;
  text-align: center;
  border-bottom: 4px solid #212121;
  position: relative;
}

.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  background: #fdd835;
  border: 3px solid #212121;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 2px 2px 0 #212121;
}

.hero-name {
  font-family: 'Bangers', cursive;
  font-size: 32px;
  color: #fafafa;
  margin: 0;
  text-shadow: 3px 3px 0 #212121;
  letter-spacing: 2px;
}

.hero-alias {
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  color: #fafafa;
  opacity: 0.9;
  font-weight: 700;
}

.card-avatar {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: var(--accent-2);
  border-bottom: 4px solid #212121;
}

.avatar-frame {
  width: 100px;
  height: 100px;
  background: #fafafa;
  border: 5px solid #212121;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0 #212121;
}

.avatar-display {
  font-size: 56px;
}

.comic-effects {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.effect-tag {
  font-family: 'Bangers', cursive;
  font-size: 12px;
  padding: 4px 10px;
  border: 2px solid #212121;
  border-radius: 4px;
  box-shadow: 2px 2px 0 #212121;
}

.effect-tag.boom {
  background: #e53935;
  color: #fafafa;
  transform: rotate(-3deg);
}

.effect-tag.zap {
  background: #fdd835;
  color: #212121;
  transform: rotate(2deg);
}

.effect-tag.pow {
  background: #7b1fa2;
  color: #fafafa;
  transform: rotate(-2deg);
}

.effect-tag.bam {
  background: #f57c00;
  color: #fafafa;
  transform: rotate(3deg);
}

.card-powers {
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  background: #fafafa;
  border-bottom: 3px solid #212121;
}

.power-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--accent);
  border: 2px solid #212121;
  border-radius: 12px;
  box-shadow: 2px 2px 0 #212121;
}

.chip-icon {
  font-size: 14px;
}

.chip-name {
  font-family: 'Roboto Slab', serif;
  font-size: 11px;
  font-weight: 700;
  color: #fafafa;
}

.chip-level {
  font-family: 'Bangers', cursive;
  font-size: 11px;
  color: #fdd835;
  text-shadow: 1px 1px 0 #212121;
}

.card-stats {
  padding: 12px 16px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 3px solid #212121;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 16px;
  width: 24px;
}

.stat-bar {
  flex: 1;
  height: 12px;
  background: #e0e0e0;
  border: 2px solid #212121;
  border-radius: 6px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stat-num {
  font-family: 'Bangers', cursive;
  font-size: 14px;
  color: #212121;
  width: 30px;
  text-align: right;
}

.card-footer {
  padding: 12px;
  background: var(--primary);
  text-align: center;
}

.catchphrase {
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #fafafa;
  font-style: italic;
  margin-bottom: 8px;
}

.weakness {
  font-family: 'Roboto Slab', serif;
  font-size: 12px;
  color: #fdd835;
  font-weight: 600;
}

@media (max-width: 900px) {
  .editor-content {
    grid-template-columns: 1fr;
  }
  
  .template-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .template-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
