<script setup lang="ts">
import { computed } from 'vue';
import type { Hero } from '../../types';
import { colorSchemes, avatars, costumes, bodyTypes, hairStyles, eyeStyles, accessories } from '../../data/appearance';
import CharacterPortrait from './CharacterPortrait.vue';
import { createDefaultPortraitConfig } from '../../data/portraitAssets';
import type { PortraitConfig } from '../../types';

const props = defineProps<{
  hero: Hero;
  size?: 'small' | 'medium' | 'large';
}>();

const size = computed(() => props.size || 'medium');

const sizeMap = {
  small: { container: 'w-32 h-40', avatar: 'text-4xl', name: 'text-sm' },
  medium: { container: 'w-48 h-60', avatar: 'text-6xl', name: 'text-lg' },
  large: { container: 'w-64 h-80', avatar: 'text-8xl', name: 'text-xl' }
};

const portraitConfig = computed<PortraitConfig>(() => {
  if (props.hero.appearance.portrait) {
    return props.hero.appearance.portrait;
  }
  return createDefaultPortraitConfig();
});

const portraitSizeMap = {
  small: 'small' as const,
  medium: 'medium' as const,
  large: 'large' as const
};

const colorScheme = computed(() => {
  return colorSchemes.find(c => c.id === props.hero.appearance.colorScheme) || colorSchemes[0];
});

const avatarEmoji = computed(() => {
  const avatar = avatars.find(a => a.id === props.hero.appearance.avatar);
  return avatar?.emoji || '🦸';
});

const costumeName = computed(() => {
  const costume = costumes.find(c => c.id === props.hero.appearance.costume);
  return costume?.name || '经典紧身衣';
});

const bodyTypeName = computed(() => {
  const bt = bodyTypes.find(b => b.id === props.hero.appearance.bodyType);
  return bt?.name || '标准型';
});

const hairStyleName = computed(() => {
  const hs = hairStyles.find(h => h.id === props.hero.appearance.hairStyle);
  return hs?.name || '短发';
});

const eyeStyleName = computed(() => {
  const es = eyeStyles.find(e => e.id === props.hero.appearance.eyeStyle);
  return es?.name || '普通眼睛';
});

const accessoryNames = computed(() => {
  return props.hero.appearance.accessories
    .map(id => accessories.find(a => a.id === id))
    .filter(Boolean)
    .map(a => a!.emoji + ' ' + a!.name);
});
</script>

<template>
  <div 
    class="hero-preview"
    :class="sizeMap[size].container"
    :style="{ '--primary': colorScheme.primary, '--secondary': colorScheme.secondary }"
  >
    <div class="preview-header">
      <CharacterPortrait
        :config="portraitConfig"
        :size="portraitSizeMap[size]"
        class="hero-portrait"
        show-background
      />
    </div>
    
    <div class="preview-body">
      <h3 class="hero-name" :class="sizeMap[size].name">{{ hero.name }}</h3>
      <p class="hero-alias">{{ hero.alias }}</p>
      
      <div v-if="size !== 'small'" class="appearance-details">
        <div class="detail-item">
          <span class="detail-label">服装:</span>
          <span class="detail-value">{{ costumeName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">体型:</span>
          <span class="detail-value">{{ bodyTypeName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">发型:</span>
          <span class="detail-value">{{ hairStyleName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">眼睛:</span>
          <span class="detail-value">{{ eyeStyleName }}</span>
        </div>
      </div>
      
      <div v-if="size === 'large'" class="accessories">
        <span class="accessories-label">配饰:</span>
        <div class="accessories-list">
          <span v-for="acc in accessoryNames" :key="acc" class="accessory-tag">
            {{ acc }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="halftone-overlay"></div>
  </div>
</template>

<style scoped>
.hero-preview {
  position: relative;
  background: linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%);
  border: 4px solid #212121;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 6px 6px 0 #212121;
  transition: all 0.3s;
}

.hero-preview:hover {
  transform: translateY(-4px);
  box-shadow: 10px 10px 0 #212121;
}

.preview-header {
  height: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.15);
  border-bottom: 3px solid #212121;
  padding: 8px;
  box-sizing: border-box;
}

.hero-portrait {
  filter: drop-shadow(3px 3px 0 #212121);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.preview-body {
  height: 60%;
  padding: 12px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.hero-name {
  font-family: 'Bangers', cursive;
  color: var(--primary);
  margin: 0 0 4px 0;
  text-align: center;
  text-shadow: 2px 2px 0 #212121;
  letter-spacing: 1px;
}

.hero-alias {
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  color: #757575;
  margin: 0 0 8px 0;
  text-align: center;
  font-style: italic;
}

.appearance-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.detail-label {
  font-family: 'Roboto Slab', serif;
  font-weight: 700;
  color: #424242;
}

.detail-value {
  font-family: 'Comic Neue', cursive;
  color: #212121;
}

.accessories {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 2px dashed #bdbdbd;
}

.accessories-label {
  font-family: 'Roboto Slab', serif;
  font-size: 11px;
  font-weight: 700;
  color: #424242;
  display: block;
  margin-bottom: 4px;
}

.accessories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.accessory-tag {
  background: var(--secondary);
  color: #fafafa;
  padding: 2px 6px;
  border-radius: 10px;
  font-family: 'Comic Neue', cursive;
  font-size: 10px;
  font-weight: 700;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
}

.halftone-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 6px 6px;
  pointer-events: none;
}
</style>
