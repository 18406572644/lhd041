<script setup lang="ts">
import { computed } from 'vue';
import { Heart, Download, Share2, Edit, Trash2, Copy } from 'lucide-vue-next';
import type { Hero } from '../../types';
import { colorSchemes, avatars } from '../../data/appearance';
import { useHeroStore } from '../../stores/hero';
import { useUiStore } from '../../stores/ui';
import { useRouter } from 'vue-router';
import CharacterPortrait from './CharacterPortrait.vue';
import { createDefaultPortraitConfig } from '../../data/portraitAssets';
import type { PortraitConfig } from '../../types';

const props = defineProps<{
  hero: Hero;
  showRank?: boolean;
  rank?: number;
  showActions?: boolean;
  isSaved?: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit', hero: Hero): void;
  (e: 'delete', heroId: string): void;
  (e: 'use-template', hero: Hero): void;
}>();

const heroStore = useHeroStore();
const uiStore = useUiStore();
const router = useRouter();

const colorScheme = computed(() => {
  return colorSchemes.find(c => c.id === props.hero.appearance.colorScheme) || colorSchemes[0];
});

const avatarEmoji = computed(() => {
  const avatar = avatars.find(a => a.id === props.hero.appearance.avatar);
  return avatar?.emoji || '🦸';
});

const portraitConfig = computed<PortraitConfig>(() => {
  if (props.hero.appearance.portrait) {
    return props.hero.appearance.portrait;
  }
  return createDefaultPortraitConfig();
});

const statTotal = computed(() => {
  const stats = props.hero.stats;
  return Math.round((stats.strength + stats.speed + stats.intelligence + stats.durability + stats.combat + stats.charisma) / 6);
});

async function handleLike() {
  const newLikes = await heroStore.likeHeroById(props.hero.id);
  if (newLikes !== null) {
    uiStore.showSuccess(`点赞成功！当前 ${newLikes} 赞`);
  }
}

function handleEdit() {
  emit('edit', props.hero);
}

function handleDelete() {
  if (confirm(`确定要删除「${props.hero.name}」吗？`)) {
    emit('delete', props.hero.id);
    uiStore.showSuccess('角色已删除');
  }
}

function handleUseTemplate() {
  emit('use-template', props.hero);
  router.push('/generator');
}

function handleShare() {
  navigator.clipboard.writeText(
    `超级英雄「${props.hero.name}」\n口头禅：${props.hero.catchphrase}\n能力：${props.hero.powers.map(p => p.name).join('、')}`
  );
  uiStore.showSuccess('角色信息已复制到剪贴板');
}
</script>

<template>
  <div class="hero-card" :style="{ '--primary': colorScheme.primary, '--secondary': colorScheme.secondary }">
    <div v-if="showRank && rank" class="rank-badge">
      #{{ rank }}
    </div>
    
    <div class="card-header">
      <div class="avatar-section">
        <span class="hero-avatar">{{ avatarEmoji }}</span>
      </div>
      <div class="hero-info">
        <h3 class="hero-name">{{ hero.name }}</h3>
        <p class="hero-alias">「{{ hero.alias }}」</p>
      </div>
    </div>
    
    <div class="power-section">
      <div class="catchphrase">"{{ hero.catchphrase }}"</div>
    </div>
    
    <div class="powers-list">
      <span
        v-for="power in hero.powers.slice(0, 3)"
        :key="power.id"
        class="power-tag"
      >
        {{ power.icon }} {{ power.name }}
      </span>
      <span v-if="hero.powers.length > 3" class="power-tag more">
        +{{ hero.powers.length - 3 }}
      </span>
    </div>
    
    <div class="stats-preview">
      <div class="stat-item">
        <span class="stat-value">{{ statTotal }}</span>
        <span class="stat-label">综合</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ hero.stats.strength }}</span>
        <span class="stat-label">力量</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ hero.stats.speed }}</span>
        <span class="stat-label">速度</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ hero.stats.intelligence }}</span>
        <span class="stat-label">智力</span>
      </div>
    </div>
    
    <div class="weakness">
      <span class="weakness-label">弱点:</span>
      <span class="weakness-value">{{ hero.weakness }}</span>
    </div>
    
    <div class="likes-section">
      <button class="like-btn" @click="handleLike">
        <Heart :size="18" />
        <span>{{ hero.likes }}</span>
      </button>
    </div>
    
    <div v-if="showActions" class="action-buttons">
      <button class="action-btn edit" @click="handleEdit" title="编辑">
        <Edit :size="16" />
      </button>
      <button class="action-btn template" @click="handleUseTemplate" title="使用模板">
        <Copy :size="16" />
      </button>
      <button class="action-btn share" @click="handleShare" title="分享">
        <Share2 :size="16" />
      </button>
      <button v-if="isSaved" class="action-btn delete" @click="handleDelete" title="删除">
        <Trash2 :size="16" />
      </button>
    </div>
    
    <div class="card-border"></div>
    <div class="halftone-overlay"></div>
  </div>
</template>

<style scoped>
.hero-card {
  position: relative;
  background: linear-gradient(145deg, #fafafa 0%, #f5f5f5 100%);
  border: 4px solid #212121;
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 6px 6px 0 #212121;
  cursor: pointer;
}

.hero-card:hover {
  transform: translateY(-8px) rotate(-1deg);
  box-shadow: 12px 12px 0 #212121, 0 20px 40px rgba(0,0,0,0.3);
}

.rank-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  background: #fdd835;
  color: #212121;
  border: 3px solid #212121;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bangers', cursive;
  font-size: 18px;
  font-weight: bold;
  transform: rotate(-10deg);
  z-index: 10;
  box-shadow: 2px 2px 0 #212121;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar-section {
  width: 64px;
  height: 64px;
  background: var(--primary);
  border: 4px solid #212121;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 3px 3px 0 #212121;
  flex-shrink: 0;
}

.hero-portrait {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-family: 'Bangers', cursive;
  font-size: 22px;
  color: var(--primary);
  margin: 0;
  text-shadow: 2px 2px 0 #212121;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-alias {
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  color: #757575;
  margin: 4px 0 0 0;
  font-style: italic;
}

.power-section {
  background: var(--secondary);
  border: 3px solid #212121;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  position: relative;
}

.power-section::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #212121;
}

.catchphrase {
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  color: #fafafa;
  font-weight: 700;
  margin: 0;
  text-align: center;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
}

.powers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.power-tag {
  background: #fafafa;
  border: 2px solid #212121;
  border-radius: 20px;
  padding: 4px 10px;
  font-family: 'Roboto Slab', serif;
  font-size: 11px;
  font-weight: 600;
  color: #212121;
  box-shadow: 2px 2px 0 #212121;
}

.power-tag.more {
  background: var(--primary);
  color: #fafafa;
}

.stats-preview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
  border: 2px dashed #bdbdbd;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-family: 'Bangers', cursive;
  font-size: 20px;
  color: var(--primary);
  text-shadow: 1px 1px 0 #212121;
}

.stat-label {
  font-family: 'Roboto Slab', serif;
  font-size: 10px;
  color: #757575;
  font-weight: 600;
}

.weakness {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffebee;
  border: 2px solid #c62828;
  border-radius: 4px;
  margin-bottom: 12px;
}

.weakness-label {
  font-family: 'Roboto Slab', serif;
  font-size: 11px;
  font-weight: 700;
  color: #c62828;
}

.weakness-value {
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  color: #212121;
}

.likes-section {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #fafafa;
  border: 3px solid #e53935;
  border-radius: 20px;
  color: #e53935;
  font-family: 'Bangers', cursive;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.like-btn:hover {
  background: #e53935;
  color: #fafafa;
  transform: translateY(-2px);
}

.action-buttons {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 2px dashed #bdbdbd;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 4px;
  color: #212121;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.action-btn.edit:hover {
  background: #1565c0;
  color: #fafafa;
}

.action-btn.template:hover {
  background: #2e7d32;
  color: #fafafa;
}

.action-btn.share:hover {
  background: #f57c00;
  color: #fafafa;
}

.action-btn.delete:hover {
  background: #c62828;
  color: #fafafa;
}

.card-border {
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  border: 2px dashed rgba(0,0,0,0.1);
  border-radius: 4px;
  pointer-events: none;
}

.halftone-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 4px 4px;
  pointer-events: none;
  opacity: 0.5;
}
</style>
