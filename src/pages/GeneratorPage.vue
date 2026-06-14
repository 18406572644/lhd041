<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Sparkles, Save, RotateCcw, Palette, Zap, BookOpen, Image,
  Sparkles as EffectIcon, ArrowLeft, Package, X, Check, FolderPlus
} from 'lucide-vue-next';
import { useHeroStore } from '../stores/hero';
import { usePresetsStore } from '../stores/presets';
import { useUiStore } from '../stores/ui';
import type { Preset, FullPreset } from '../types';
import HeroPreview from '../components/hero/HeroPreview.vue';
import AppearanceEditor from '../components/hero/AppearanceEditor.vue';
import PowerEditor from '../components/hero/PowerEditor.vue';
import StoryEditor from '../components/hero/StoryEditor.vue';
import ComicCardEditor from '../components/hero/ComicCardEditor.vue';
import EffectEditor from '../components/hero/EffectEditor.vue';
import PresetsPanel from '../components/hero/PresetsPanel.vue';

const route = useRoute();
const router = useRouter();
const heroStore = useHeroStore();
const presetsStore = usePresetsStore();
const uiStore = useUiStore();

const activeTab = ref('appearance');
const isGenerating = computed(() => heroStore.isGenerating);
const currentHero = computed(() => heroStore.currentHero);

const showFullPresetDialog = ref(false);
const fullPresetName = ref('');
const showFolderDialog = ref(false);
const selectedFolderId = ref('default');
const newFolderName = ref('');
const newFolderIcon = ref('📁');
const newFolderColor = ref('#2196f3');
const showNewFolderInput = ref(false);

const folderIcons = ['📁', '🗡️', '🦸', '😈', '😂', '🤖', '🌟', '🔥', '💎', '🎯', '⚡', '🎭'];
const folderColors = ['#2196f3', '#4caf50', '#ff9800', '#e53935', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];

const folders = computed(() => heroStore.folders);

function openSaveDialog() {
  if (!currentHero.value) return;
  selectedFolderId.value = 'default';
  showNewFolderInput.value = false;
  newFolderName.value = '';
  newFolderIcon.value = '📁';
  newFolderColor.value = '#2196f3';
  showFolderDialog.value = true;
}

function toggleNewFolder() {
  showNewFolderInput.value = !showNewFolderInput.value;
  if (showNewFolderInput.value) {
    newFolderName.value = '';
    setTimeout(() => {
      const input = document.getElementById('new-folder-name-input') as HTMLInputElement;
      input?.focus();
    }, 100);
  }
}

function createAndSelectFolder() {
  const name = newFolderName.value.trim();
  if (!name) {
    uiStore.showWarning('请输入收藏夹名称');
    return;
  }
  const folder = heroStore.createFolder(name, newFolderIcon.value, newFolderColor.value);
  selectedFolderId.value = folder.id;
  showNewFolderInput.value = false;
  newFolderName.value = '';
  uiStore.showSuccess(`收藏夹「${name}」已创建`);
}

async function confirmSaveWithFolder() {
  if (!currentHero.value) return;
  
  try {
    const isNew = !heroStore.savedHeroes.some(h => h.id === currentHero.value!.id);
    heroStore.saveCurrentHero(selectedFolderId.value);
    const folder = heroStore.getFolderById(selectedFolderId.value);
    const folderName = folder ? folder.name : '未分组';
    uiStore.showSuccess(isNew ? `英雄已保存到「${folderName}」！` : '英雄已更新！');
    showFolderDialog.value = false;
    router.push('/favorites');
  } catch (e) {
    uiStore.showError('保存失败，请重试');
  }
}

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

function goBack() {
  router.back();
}

function openFullPresetDialog() {
  if (!currentHero.value) return;
  fullPresetName.value = currentHero.value.name ? `${currentHero.value.name}套装` : '';
  showFullPresetDialog.value = true;
  setTimeout(() => {
    const input = document.getElementById('full-preset-name-input') as HTMLInputElement;
    input?.focus();
    input?.select();
  }, 100);
}

function confirmSaveFullPreset() {
  if (!currentHero.value) return;
  const name = fullPresetName.value.trim();
  if (!name) {
    uiStore.showWarning('请输入套装名称');
    return;
  }
  try {
    presetsStore.saveFullPreset(name, currentHero.value);
    uiStore.showSuccess('整套预设已保存到「我的套装」！');
    showFullPresetDialog.value = false;
  } catch (e) {
    uiStore.showError('保存失败，请重试');
  }
}

function handleApplyFullPreset(preset: Preset) {
  if (preset.category !== 'full' || !currentHero.value) return;
  const fullPreset = preset as FullPreset;
  const d = fullPreset.data;
  
  const newEffects = d.effects.map(e => ({
    ...e,
    id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${Math.random().toString(36).substr(2, 3)}`
  }));
  
  heroStore.updateCurrentHero({
    appearance: { ...d.appearance },
    powers: d.powers.map(p => ({ ...p })),
    stats: { ...d.stats },
    weakness: d.weakness,
    catchphrase: d.catchphrase,
    backstory: d.backstory,
    cardTemplate: d.cardTemplate,
    effects: newEffects
  });
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
          class="action-btn preset"
          :disabled="!currentHero"
          @click="openFullPresetDialog"
          title="一键保存全部5项配置为套装"
        >
          <Package :size="18" />
          <span>💾 我的套装</span>
        </button>
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
          @click="openSaveDialog"
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
        
        <div class="full-presets-section">
          <PresetsPanel
            category="full"
            @save="openFullPresetDialog"
            @apply="handleApplyFullPreset"
          />
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

    <Teleport to="body">
      <div v-if="showFullPresetDialog" class="dialog-overlay" @click.self="showFullPresetDialog = false">
        <div class="save-full-dialog">
          <div class="dialog-header">
            <Package :size="20" />
            <span>保存为我的套装</span>
            <button class="dialog-close" @click="showFullPresetDialog = false">
              <X :size="18" />
            </button>
          </div>
          <div class="dialog-body">
            <div class="preset-summary">
              <div class="summary-item"><span>🎨</span>外观配置</div>
              <div class="summary-item"><span>⚡</span>{{ currentHero?.powers.length || 0 }} 个超能力</div>
              <div class="summary-item"><span>📖</span>故事模板</div>
              <div class="summary-item"><span>✨</span>{{ currentHero?.effects.length || 0 }} 个特效</div>
              <div class="summary-item"><span>🎴</span>卡片模板</div>
            </div>
            <label class="input-label">套装名称</label>
            <input
              id="full-preset-name-input"
              type="text"
              class="name-input"
              v-model="fullPresetName"
              placeholder="给套装起个名字..."
              @keyup.enter="confirmSaveFullPreset"
              @keyup.escape="showFullPresetDialog = false"
            />
          </div>
          <div class="dialog-footer">
            <button class="dialog-btn cancel" @click="showFullPresetDialog = false">取消</button>
            <button class="dialog-btn confirm" @click="confirmSaveFullPreset">
              <Check :size="16" />
              <span>保存套装</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showFolderDialog" class="dialog-overlay" @click.self="showFolderDialog = false">
        <div class="save-folder-dialog">
          <div class="dialog-header folder-header">
            <Save :size="20" />
            <span>保存到收藏夹</span>
            <button class="dialog-close" @click="showFolderDialog = false">
              <X :size="18" />
            </button>
          </div>
          <div class="dialog-body">
            <label class="input-label">选择收藏夹</label>
            <div class="folder-list">
              <div
                v-for="folder in folders"
                :key="folder.id"
                class="folder-option"
                :class="{ selected: selectedFolderId === folder.id }"
                @click="selectedFolderId = folder.id"
              >
                <span class="folder-icon">{{ folder.icon }}</span>
                <span class="folder-name">{{ folder.name }}</span>
                <span class="folder-count">{{ heroStore.getHeroesByFolder(folder.id).length }}</span>
                <span v-if="selectedFolderId === folder.id" class="folder-check">✓</span>
              </div>
            </div>

            <button class="new-folder-toggle" @click="toggleNewFolder">
              <FolderPlus :size="16" />
              <span>{{ showNewFolderInput ? '取消新建' : '新建收藏夹' }}</span>
            </button>

            <div v-if="showNewFolderInput" class="new-folder-form">
              <div class="form-row">
                <input
                  id="new-folder-name-input"
                  type="text"
                  class="name-input"
                  v-model="newFolderName"
                  placeholder="收藏夹名称..."
                  @keyup.enter="createAndSelectFolder"
                />
              </div>
              <div class="form-row">
                <label class="input-label">图标</label>
                <div class="icon-picker">
                  <button
                    v-for="icon in folderIcons"
                    :key="icon"
                    class="icon-btn"
                    :class="{ active: newFolderIcon === icon }"
                    @click="newFolderIcon = icon"
                  >{{ icon }}</button>
                </div>
              </div>
              <div class="form-row">
                <label class="input-label">颜色</label>
                <div class="color-picker">
                  <button
                    v-for="color in folderColors"
                    :key="color"
                    class="color-btn"
                    :class="{ active: newFolderColor === color }"
                    :style="{ background: color }"
                    @click="newFolderColor = color"
                  />
                </div>
              </div>
              <button class="create-folder-btn" @click="createAndSelectFolder">
                <Check :size="16" />
                <span>创建并选择</span>
              </button>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="dialog-btn cancel" @click="showFolderDialog = false">取消</button>
            <button class="dialog-btn confirm save-confirm" @click="confirmSaveWithFolder">
              <Save :size="16" />
              <span>保存英雄</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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

.action-btn.preset {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
  color: #fafafa;
}

.action-btn.preset:hover:not(:disabled) {
  background: linear-gradient(135deg, #ab47bc, #8e24aa);
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.full-presets-section {
  max-height: 520px;
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
  
  .full-presets-section {
    max-height: none;
  }
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.save-full-dialog {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 8px 8px 0 #212121;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
  color: #fafafa;
  font-family: 'Bangers', cursive;
  font-size: 20px;
  letter-spacing: 1px;
  text-shadow: 2px 2px 0 #212121;
}

.dialog-close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #fafafa;
  border-radius: 50%;
  color: #fafafa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.dialog-close:hover {
  background: #c62828;
}

.dialog-body {
  padding: 20px;
}

.preset-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 14px;
  background: #f3e5f5;
  border: 3px dashed #9c27b0;
  border-radius: 8px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #4a148c;
}

.summary-item span {
  font-size: 18px;
}

.input-label {
  display: block;
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
  margin-bottom: 8px;
}

.name-input {
  width: 100%;
  padding: 12px 14px;
  border: 3px solid #212121;
  border-radius: 6px;
  font-family: 'Comic Neue', cursive;
  font-size: 15px;
  font-weight: 700;
  color: #212121;
  background: #fafafa;
  box-shadow: 2px 2px 0 #212121;
  box-sizing: border-box;
  outline: none;
}

.name-input:focus {
  border-color: #9c27b0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 3px dashed #bdbdbd;
}

.dialog-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border: 3px solid #212121;
  border-radius: 6px;
  font-family: 'Bangers', cursive;
  font-size: 15px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.dialog-btn.cancel {
  background: #fafafa;
  color: #212121;
}

.dialog-btn.confirm {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
  color: #fafafa;
}

.dialog-btn:hover {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.save-folder-dialog {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  width: 90%;
  max-width: 520px;
  box-shadow: 8px 8px 0 #212121;
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.folder-header {
  background: linear-gradient(135deg, #4caf50, #2e7d32) !important;
}

.save-folder-dialog .dialog-body {
  overflow-y: auto;
  flex: 1;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.folder-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fafafa;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.folder-option:hover {
  border-color: #4caf50;
  background: #e8f5e9;
}

.folder-option.selected {
  border-color: #4caf50;
  background: #e8f5e9;
  box-shadow: 2px 2px 0 #4caf50;
}

.folder-icon {
  font-size: 22px;
  line-height: 1;
}

.folder-name {
  flex: 1;
  font-family: 'Comic Neue', cursive;
  font-size: 15px;
  font-weight: 700;
  color: #212121;
}

.folder-count {
  padding: 2px 10px;
  background: #e0e0e0;
  border-radius: 12px;
  font-family: 'Bangers', cursive;
  font-size: 13px;
  color: #616161;
}

.folder-check {
  color: #4caf50;
  font-weight: 700;
  font-size: 18px;
}

.new-folder-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: transparent;
  border: 3px dashed #bdbdbd;
  border-radius: 8px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #757575;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.new-folder-toggle:hover {
  border-color: #4caf50;
  color: #4caf50;
  background: #e8f5e9;
}

.new-folder-form {
  margin-top: 12px;
  padding: 16px;
  background: #e8f5e9;
  border: 3px solid #4caf50;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  border-color: #4caf50;
}

.icon-btn.active {
  border-color: #4caf50;
  background: #c8e6c9;
  box-shadow: 2px 2px 0 #4caf50;
}

.color-picker {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.15);
}

.color-btn.active {
  border-color: #212121;
  box-shadow: 2px 2px 0 #212121;
  transform: scale(1.15);
}

.create-folder-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: #4caf50;
  color: #fafafa;
  border: 3px solid #212121;
  border-radius: 6px;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.create-folder-btn:hover {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.save-confirm {
  background: linear-gradient(135deg, #4caf50, #2e7d32) !important;
}
</style>
