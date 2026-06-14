<script setup lang="ts">
import { computed } from 'vue';
import { Palette, User, Shirt, Scissors, Eye, PersonStanding, Sparkles } from 'lucide-vue-next';
import type { Hero, Preset, AppearancePreset } from '../../types';
import { avatars, costumes, colorSchemes, accessories, bodyTypes, hairStyles, eyeStyles } from '../../data/appearance';
import { useHeroStore } from '../../stores/hero';
import { usePresetsStore } from '../../stores/presets';
import { useUiStore } from '../../stores/ui';
import PresetsPanel from './PresetsPanel.vue';

const props = defineProps<{
  hero: Hero;
}>();

const heroStore = useHeroStore();
const presetsStore = usePresetsStore();
const uiStore = useUiStore();

const selectedColorScheme = computed(() => {
  return colorSchemes.find(c => c.id === props.hero.appearance.colorScheme);
});

function updateAppearance(key: keyof typeof props.hero.appearance, value: any) {
  heroStore.updateCurrentHero({
    appearance: {
      ...props.hero.appearance,
      [key]: value
    }
  });
}

function toggleAccessory(accId: string) {
  const current = props.hero.appearance.accessories;
  const hasAcc = current.includes(accId);
  if (hasAcc) {
    updateAppearance('accessories', current.filter(id => id !== accId));
  } else {
    if (current.length < 4) {
      updateAppearance('accessories', [...current, accId]);
    } else {
      uiStore.showWarning('最多只能选择4个配饰');
    }
  }
}

function handleSavePreset(name: string) {
  try {
    presetsStore.saveAppearancePreset(name, props.hero.appearance);
    uiStore.showSuccess('外观预设已保存！');
  } catch (e) {
    uiStore.showError('保存失败，请重试');
  }
}

function handleApplyPreset(preset: Preset) {
  if (preset.category !== 'appearance') return;
  const appearancePreset = preset as AppearancePreset;
  heroStore.updateCurrentHero({
    appearance: { ...appearancePreset.data }
  });
}
</script>

<template>
  <div class="appearance-editor">
    <div class="section-title">
      <Palette :size="20" />
      <span>外观编辑</span>
    </div>
    
    <div class="editor-grid">
      <div class="editor-section">
        <div class="section-label">
          <User :size="16" />
          <span>头像风格</span>
        </div>
        <div class="avatar-grid">
          <button
            v-for="avatar in avatars"
            :key="avatar.id"
            class="avatar-option"
            :class="{ active: hero.appearance.avatar === avatar.id }"
            :title="avatar.name"
            @click="updateAppearance('avatar', avatar.id)"
          >
            <span class="avatar-emoji">{{ avatar.emoji }}</span>
          </button>
        </div>
      </div>
      
      <div class="editor-section">
        <div class="section-label">
          <Shirt :size="16" />
          <span>服装类型</span>
        </div>
        <div class="select-wrapper">
          <select
            :value="hero.appearance.costume"
            @change="updateAppearance('costume', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="costume in costumes" :key="costume.id" :value="costume.id">
              {{ costume.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="editor-section">
        <div class="section-label">
          <Palette :size="16" />
          <span>配色方案</span>
        </div>
        <div class="color-grid">
          <button
            v-for="scheme in colorSchemes"
            :key="scheme.id"
            class="color-option"
            :class="{ active: hero.appearance.colorScheme === scheme.id }"
            :title="scheme.name"
            :style="{ background: `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%` }"
            @click="updateAppearance('colorScheme', scheme.id)"
          />
        </div>
        <div v-if="selectedColorScheme" class="selected-colors">
          <span class="color-preview" :style="{ background: selectedColorScheme.primary }" />
          <span class="color-preview" :style="{ background: selectedColorScheme.secondary }" />
          <span class="color-name">{{ selectedColorScheme.name }}</span>
        </div>
      </div>
      
      <div class="editor-section">
        <div class="section-label">
          <PersonStanding :size="16" />
          <span>体型</span>
        </div>
        <div class="select-wrapper">
          <select
            :value="hero.appearance.bodyType"
            @change="updateAppearance('bodyType', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="bt in bodyTypes" :key="bt.id" :value="bt.id">
              {{ bt.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="editor-section">
        <div class="section-label">
          <Scissors :size="16" />
          <span>发型</span>
        </div>
        <div class="select-wrapper">
          <select
            :value="hero.appearance.hairStyle"
            @change="updateAppearance('hairStyle', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="hs in hairStyles" :key="hs.id" :value="hs.id">
              {{ hs.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="editor-section">
        <div class="section-label">
          <Eye :size="16" />
          <span>眼睛</span>
        </div>
        <div class="select-wrapper">
          <select
            :value="hero.appearance.eyeStyle"
            @change="updateAppearance('eyeStyle', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="es in eyeStyles" :key="es.id" :value="es.id">
              {{ es.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="editor-section full-width">
        <div class="section-label">
          <Sparkles :size="16" />
          <span>配饰 ({{ hero.appearance.accessories.length }}/4)</span>
        </div>
        <div class="accessories-grid">
          <button
            v-for="acc in accessories"
            :key="acc.id"
            class="accessory-option"
            :class="{ active: hero.appearance.accessories.includes(acc.id) }"
            :title="acc.name"
            @click="toggleAccessory(acc.id)"
          >
            <span class="acc-emoji">{{ acc.emoji }}</span>
            <span class="acc-name">{{ acc.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <PresetsPanel
      category="appearance"
      @save="handleSavePreset"
      @apply="handleApplyPreset"
    />
  </div>
</template>

<style scoped>
.appearance-editor {
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

.editor-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-section.full-width {
  grid-column: 1 / -1;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.avatar-option {
  aspect-ratio: 1;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 0 #212121;
}

.avatar-option:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.avatar-option.active {
  background: #e53935;
  border-color: #fdd835;
}

.avatar-emoji {
  font-size: 24px;
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: '▼';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #212121;
  pointer-events: none;
}

select {
  width: 100%;
  padding: 10px 36px 10px 12px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 4px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  cursor: pointer;
  box-shadow: 2px 2px 0 #212121;
  appearance: none;
}

select:focus {
  outline: none;
  border-color: #e53935;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.color-option {
  aspect-ratio: 1;
  border: 3px solid #212121;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #fdd835;
  box-shadow: 0 0 0 3px #e53935, 4px 4px 0 #212121;
}

.selected-colors {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border: 2px solid #212121;
  border-radius: 4px;
}

.color-name {
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  font-weight: 700;
  color: #424242;
}

.accessories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.accessory-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
}

.accessory-option:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.accessory-option.active {
  background: #e53935;
  border-color: #fdd835;
  color: #fafafa;
}

.acc-emoji {
  font-size: 20px;
}

.acc-name {
  font-family: 'Roboto Slab', serif;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 768px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .accessories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
