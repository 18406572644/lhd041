<script setup lang="ts">
import { ref, computed } from 'vue';
import { BookOpen, RefreshCw, User, Tag, MessageSquare, AlertTriangle } from 'lucide-vue-next';
import type { Hero, Preset, StoryPreset } from '../../types';
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
const isRegenerating = ref(false);

const weaknesses = [
  { id: 'kryptonite', name: '氪石', icon: '💎' },
  { id: 'water', name: '水', icon: '💧' },
  { id: 'fire', name: '火焰', icon: '🔥' },
  { id: 'cold', name: '寒冷', icon: '❄️' },
  { id: 'sound', name: '噪音', icon: '🔊' },
  { id: 'light', name: '强光', icon: '💡' },
  { id: 'magic', name: '魔法', icon: '✨' },
  { id: 'tech', name: '高科技', icon: '💻' },
  { id: 'gravity', name: '重力', icon: '⬇️' },
  { id: 'time', name: '时间', icon: '⏰' }
];

function updateBasicInfo(field: string, value: string) {
  heroStore.updateCurrentHero({ [field]: value });
}

function selectWeakness(weakness: string) {
  heroStore.updateCurrentHero({ weakness });
}

async function regenerateBackstory() {
  isRegenerating.value = true;
  try {
    await heroStore.regenerateCurrentBackstory();
    uiStore.showSuccess('背景故事已重新生成！');
  } catch (e) {
    uiStore.showError('生成故事失败，请重试');
  } finally {
    isRegenerating.value = false;
  }
}

function updateBackstory(value: string) {
  heroStore.updateCurrentHero({ backstory: value });
}

const placeholderCheatsheet = computed(() => {
  const powerNames = props.hero.powers.map((p, i) => `{{能力${i + 1}}}`).join('、');
  return [
    { key: '{{名字}}', desc: props.hero.name || '英雄称号' },
    { key: '{{真名}}', desc: props.hero.alias || '真实姓名' },
    { key: '{{弱点}}', desc: props.hero.weakness || '弱点' },
    ...props.hero.powers.slice(0, 4).map((p, i) => ({
      key: `{{能力${i + 1}}}`,
      desc: p.name
    }))
  ];
});

function insertPlaceholder(placeholder: string) {
  const textarea = document.querySelector('.editor-area textarea') as HTMLTextAreaElement;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const current = props.hero.backstory;
  const newVal = current.substring(0, start) + placeholder + current.substring(end);
  updateBackstory(newVal);
  setTimeout(() => {
    textarea.focus();
    const newPos = start + placeholder.length;
    textarea.setSelectionRange(newPos, newPos);
  }, 0);
}

function replacePlaceholders(template: string): string {
  let result = template;
  result = result.replace(/\{\{名字\}\}/g, props.hero.name || '[名字]');
  result = result.replace(/\{\{真名\}\}/g, props.hero.alias || '[真名]');
  result = result.replace(/\{\{弱点\}\}/g, props.hero.weakness || '[弱点]');
  props.hero.powers.forEach((p, i) => {
    result = result.replace(new RegExp(`\\{\\{能力${i + 1}\\}\\}`, 'g'), p.name);
  });
  return result;
}

function handleSavePreset(name: string) {
  try {
    presetsStore.saveStoryPreset(name, props.hero.catchphrase, props.hero.backstory);
    uiStore.showSuccess('故事预设已保存！');
  } catch (e) {
    uiStore.showError('保存失败，请重试');
  }
}

function handleApplyPreset(preset: Preset) {
  if (preset.category !== 'story') return;
  const storyPreset = preset as StoryPreset;
  const replacedBackstory = replacePlaceholders(storyPreset.data.backstoryTemplate);
  heroStore.updateCurrentHero({
    catchphrase: storyPreset.data.catchphrase,
    backstory: replacedBackstory
  });
}
</script>

<template>
  <div class="story-editor">
    <div class="section-title">
      <BookOpen :size="20" />
      <span>角色故事</span>
    </div>
    
    <div class="editor-content">
      <div class="basic-info">
        <h4 class="subsection-title">基本信息</h4>
        
        <div class="info-grid">
          <div class="info-item">
            <label>
              <User :size="16" />
              <span>英雄称号</span>
            </label>
            <input
              type="text"
              :value="hero.name"
              @input="updateBasicInfo('name', ($event.target as HTMLInputElement).value)"
              placeholder="输入英雄称号"
            />
          </div>
          
          <div class="info-item">
            <label>
              <Tag :size="16" />
              <span>真实姓名</span>
            </label>
            <input
              type="text"
              :value="hero.alias"
              @input="updateBasicInfo('alias', ($event.target as HTMLInputElement).value)"
              placeholder="输入真实姓名"
            />
          </div>
          
          <div class="info-item full-width">
            <label>
              <MessageSquare :size="16" />
              <span>口头禅</span>
            </label>
            <input
              type="text"
              :value="hero.catchphrase"
              @input="updateBasicInfo('catchphrase', ($event.target as HTMLInputElement).value)"
              placeholder="输入口头禅"
            />
          </div>
          
          <div class="info-item full-width">
            <label>
              <AlertTriangle :size="16" />
              <span>弱点</span>
            </label>
            <div class="weakness-grid">
              <button
                v-for="w in weaknesses"
                :key="w.id"
                class="weakness-option"
                :class="{ active: hero.weakness === w.name }"
                @click="selectWeakness(w.name)"
              >
                <span class="weakness-icon">{{ w.icon }}</span>
                <span class="weakness-name">{{ w.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="backstory-section">
        <div class="subsection-header">
          <h4 class="subsection-title">背景故事</h4>
          <button 
            class="regenerate-btn"
            :disabled="isRegenerating"
            @click="regenerateBackstory"
          >
            <RefreshCw :size="16" :class="{ spinning: isRegenerating }" />
            <span>{{ isRegenerating ? '生成中...' : '重新生成' }}</span>
          </button>
        </div>
        
        <div class="comic-panel">
          <div class="speech-bubble">
            <p class="bubble-text">{{ hero.backstory }}</p>
          </div>
        </div>
        
        <div class="editor-area">
          <div class="label-row">
            <label class="editor-label">编辑故事</label>
            <div class="placeholder-hint">可用变量占位符：</div>
          </div>
          <div class="placeholder-toolbar">
            <button
              v-for="ph in placeholderCheatsheet"
              :key="ph.key"
              class="placeholder-chip"
              :title="`插入 ${ph.key} = ${ph.desc}`"
              @click="insertPlaceholder(ph.key)"
            >
              <span class="ph-key">{{ ph.key }}</span>
              <span class="ph-desc">{{ ph.desc }}</span>
            </button>
          </div>
          <textarea
            :value="hero.backstory"
            @input="updateBackstory(($event.target as HTMLTextAreaElement).value)"
            rows="6"
            placeholder="在这里编辑你的英雄故事... 可用 {{名字}}、{{能力1}} 等占位符创建模板"
          />
        </div>
      </div>
    </div>

    <PresetsPanel
      category="story"
      @save="handleSavePreset"
      @apply="handleApplyPreset"
    />
  </div>
</template>

<style scoped>
.story-editor {
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

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
}

.info-item input {
  width: 100%;
  padding: 10px 12px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 4px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  box-shadow: 2px 2px 0 #212121;
  box-sizing: border-box;
}

.info-item input:focus {
  outline: none;
  border-color: #e53935;
}

.weakness-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.weakness-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
}

.weakness-option:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.weakness-option.active {
  background: #e53935;
  border-color: #fdd835;
  color: #fafafa;
}

.weakness-icon {
  font-size: 20px;
}

.weakness-name {
  font-family: 'Roboto Slab', serif;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
}

.regenerate-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #1565c0;
  border: 3px solid #212121;
  border-radius: 4px;
  color: #fafafa;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.regenerate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.regenerate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.comic-panel {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 4px;
  padding: 20px;
  position: relative;
  box-shadow: 3px 3px 0 #212121;
  margin-bottom: 16px;
}

.comic-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 8px 8px;
  opacity: 0.3;
  pointer-events: none;
}

.speech-bubble {
  position: relative;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 30px;
  border-width: 20px 15px 0;
  border-style: solid;
  border-color: #212121 transparent transparent;
}

.speech-bubble::before {
  content: '';
  position: absolute;
  bottom: -14px;
  left: 33px;
  border-width: 17px 12px 0;
  border-style: solid;
  border-color: #fafafa transparent transparent;
  z-index: 1;
}

.bubble-text {
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  line-height: 1.6;
  margin: 0;
  position: relative;
  z-index: 2;
}

.editor-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-label {
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
}

textarea {
  width: 100%;
  padding: 12px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 4px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  line-height: 1.6;
  box-shadow: 2px 2px 0 #212121;
  box-sizing: border-box;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: #e53935;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.placeholder-hint {
  font-family: 'Roboto Slab', serif;
  font-size: 11px;
  font-weight: 600;
  color: #1565c0;
}

.placeholder-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.placeholder-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #e3f2fd;
  border: 2px solid #1565c0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.placeholder-chip:hover {
  background: #1565c0;
  transform: translateY(-1px);
}

.placeholder-chip:hover .ph-key,
.placeholder-chip:hover .ph-desc {
  color: #fafafa;
}

.ph-key {
  font-family: 'Bangers', cursive;
  font-size: 11px;
  color: #1565c0;
  letter-spacing: 0.5px;
}

.ph-desc {
  font-family: 'Roboto Slab', serif;
  font-size: 10px;
  font-weight: 600;
  color: #424242;
}

@media (max-width: 768px) {
  .editor-content {
    grid-template-columns: 1fr;
  }
  
  .weakness-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
