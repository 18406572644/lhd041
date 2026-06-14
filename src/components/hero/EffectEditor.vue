<script setup lang="ts">
import { computed } from 'vue';
import { Sparkles, Plus, X } from 'lucide-vue-next';
import type { Hero, ComicEffect } from '../../types';
import { useHeroStore } from '../../stores/hero';
import { useUiStore } from '../../stores/ui';

const props = defineProps<{
  hero: Hero;
}>();

const heroStore = useHeroStore();
const uiStore = useUiStore();

const effectOptions = [
  { type: 'boom', text: 'BOOM!', icon: '💥', color: '#e53935' },
  { type: 'zap', text: 'ZAP!', icon: '⚡', color: '#fdd835' },
  { type: 'pow', text: 'POW!', icon: '💪', color: '#7b1fa2' },
  { type: 'bam', text: 'BAM!', icon: '💥', color: '#f57c00' },
  { type: 'wham', text: 'WHAM!', icon: '🔨', color: '#2e7d32' },
  { type: 'swoosh', text: 'SWOOSH!', icon: '💨', color: '#1565c0' },
  { type: 'smash', text: 'SMASH!', icon: '💎', color: '#c62828' },
  { type: 'crash', text: 'CRASH!', icon: '💫', color: '#ff6f00' }
];

const hasEffect = computed(() => (type: string) => {
  return props.hero.effects.some(e => e.type === type);
});

function addEffect(option: typeof effectOptions[0]) {
  if (props.hero.effects.length >= 4) {
    uiStore.showWarning('最多只能添加4个特效');
    return;
  }
  
  if (hasEffect.value(option.type)) {
    uiStore.showWarning('该特效已添加');
    return;
  }
  
  heroStore.addEffect({
    type: option.type as ComicEffect['type'],
    text: option.text,
    x: 50,
    y: 50,
    rotation: 0,
    scale: 1
  });
}

function removeEffect(type: string) {
  const effect = props.hero.effects.find(e => e.type === type);
  if (effect) {
    heroStore.removeEffect(effect.id);
  }
}
</script>

<template>
  <div class="effect-editor">
    <div class="section-title">
      <Sparkles :size="20" />
      <span>漫画特效</span>
    </div>
    
    <div class="editor-content">
      <div class="current-effects">
        <h4 class="subsection-title">当前特效 ({{ hero.effects.length }}/4)</h4>
        
        <div class="effects-display">
          <div
            v-for="effect in hero.effects"
            :key="effect.id"
            class="effect-display-item"
            :class="effect.type"
          >
            <span class="effect-icon">
              {{ effectOptions.find(o => o.type === effect.type)?.icon || '✨' }}
            </span>
            <span class="effect-text">{{ effect.text }}</span>
            <button class="remove-effect" @click="removeEffect(effect.type)">
              <X :size="14" />
            </button>
          </div>
          
          <div v-if="hero.effects.length === 0" class="empty-effects">
            <Sparkles :size="24" />
            <span>点击下方添加漫画特效</span>
          </div>
        </div>
      </div>
      
      <div class="available-effects">
        <h4 class="subsection-title">可选特效</h4>
        
        <div class="effects-grid">
          <button
            v-for="option in effectOptions"
            :key="option.type"
            class="effect-option"
            :class="{ [option.type]: true, disabled: hasEffect(option.type) }"
            :disabled="hasEffect(option.type)"
            @click="addEffect(option)"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-text">{{ option.text }}</span>
            <Plus v-if="!hasEffect(option.type)" :size="16" class="add-icon" />
            <span v-else class="added-badge">已添加</span>
          </button>
        </div>
      </div>
      
      <div class="effect-preview">
        <h4 class="subsection-title">特效预览</h4>
        <div class="preview-panel">
          <div class="comic-background">
            <div
              v-for="(effect, index) in hero.effects"
              :key="effect.id"
              class="preview-effect"
              :class="effect.type"
              :style="{
                top: `${20 + (index * 60)}px`,
                left: `${30 + (index % 2) * 100}px`,
                animationDelay: `${index * 0.2}s`
              }"
            >
              <span class="preview-icon">
                {{ effectOptions.find(o => o.type === effect.type)?.icon || '✨' }}
              </span>
              <span class="preview-text">{{ effect.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.effect-editor {
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
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.subsection-title {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  color: #212121;
  margin: 0 0 12px 0;
  letter-spacing: 1px;
}

.current-effects {
  grid-column: 1 / -1;
}

.effects-display {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 60px;
  padding: 16px;
  background: repeating-linear-gradient(
    45deg,
    #f5f5f5,
    #f5f5f5 10px,
    #e8e8e8 10px,
    #e8e8e8 20px
  );
  border: 3px dashed #bdbdbd;
  border-radius: 8px;
}

.effect-display-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 3px solid #212121;
  border-radius: 8px;
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  box-shadow: 3px 3px 0 #212121;
  position: relative;
}

.effect-display-item.boom {
  background: #e53935;
  color: #fafafa;
  transform: rotate(-2deg);
}

.effect-display-item.zap {
  background: #fdd835;
  color: #212121;
  transform: rotate(2deg);
}

.effect-display-item.pow {
  background: #7b1fa2;
  color: #fafafa;
  transform: rotate(-1deg);
}

.effect-display-item.bam {
  background: #f57c00;
  color: #fafafa;
  transform: rotate(1deg);
}

.effect-display-item.wham {
  background: #2e7d32;
  color: #fafafa;
  transform: rotate(-2deg);
}

.effect-display-item.swoosh {
  background: #1565c0;
  color: #fafafa;
  transform: rotate(2deg);
}

.effect-display-item.smash {
  background: #c62828;
  color: #fafafa;
  transform: rotate(-1deg);
}

.effect-display-item.crash {
  background: #ff6f00;
  color: #fafafa;
  transform: rotate(1deg);
}

.effect-icon {
  font-size: 20px;
}

.remove-effect {
  width: 24px;
  height: 24px;
  background: #212121;
  border: 2px solid #fafafa;
  border-radius: 50%;
  color: #fafafa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-effect:hover {
  background: #c62828;
  transform: scale(1.1);
}

.empty-effects {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #757575;
  font-family: 'Comic Neue', cursive;
  font-size: 16px;
  font-weight: 700;
}

.effects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.effect-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
  position: relative;
  overflow: hidden;
}

.effect-option:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.effect-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.effect-option.boom:not(.disabled):hover { background: #ffebee; }
.effect-option.zap:not(.disabled):hover { background: #fff9c4; }
.effect-option.pow:not(.disabled):hover { background: #f3e5f5; }
.effect-option.bam:not(.disabled):hover { background: #fff3e0; }
.effect-option.wham:not(.disabled):hover { background: #e8f5e9; }
.effect-option.swoosh:not(.disabled):hover { background: #e3f2fd; }
.effect-option.smash:not(.disabled):hover { background: #ffebee; }
.effect-option.crash:not(.disabled):hover { background: #fff3e0; }

.option-icon {
  font-size: 20px;
}

.option-text {
  flex: 1;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
}

.add-icon {
  color: #4caf50;
}

.added-badge {
  font-family: 'Roboto Slab', serif;
  font-size: 10px;
  font-weight: 700;
  background: #4caf50;
  color: #fafafa;
  padding: 2px 6px;
  border-radius: 4px;
}

.effect-preview {
  grid-column: 1 / -1;
}

.preview-panel {
  height: 200px;
  background: linear-gradient(135deg, #e53935 0%, #1565c0 100%);
  border: 4px solid #212121;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.comic-background {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 8px 8px;
}

.preview-effect {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 3px solid #212121;
  border-radius: 8px;
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  box-shadow: 3px 3px 0 #212121;
  animation: popIn 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes popIn {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(var(--rotation, 0deg));
    opacity: 1;
  }
}

.preview-effect.boom {
  background: #e53935;
  color: #fafafa;
  --rotation: -3deg;
}

.preview-effect.zap {
  background: #fdd835;
  color: #212121;
  --rotation: 3deg;
}

.preview-effect.pow {
  background: #7b1fa2;
  color: #fafafa;
  --rotation: -2deg;
}

.preview-effect.bam {
  background: #f57c00;
  color: #fafafa;
  --rotation: 2deg;
}

.preview-effect.wham {
  background: #2e7d32;
  color: #fafafa;
  --rotation: -3deg;
}

.preview-effect.swoosh {
  background: #1565c0;
  color: #fafafa;
  --rotation: 3deg;
}

.preview-effect.smash {
  background: #c62828;
  color: #fafafa;
  --rotation: -2deg;
}

.preview-effect.crash {
  background: #ff6f00;
  color: #fafafa;
  --rotation: 2deg;
}

.preview-icon {
  font-size: 18px;
}

@media (max-width: 768px) {
  .editor-content {
    grid-template-columns: 1fr;
  }
  
  .effects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
