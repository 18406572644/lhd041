<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Wand2, Save, Image as ImageIcon, Sliders, Layers, ChevronDown, ChevronUp, Trash2 } from 'lucide-vue-next';
import type { PortraitConfig, PortraitTemplate, ImageFilterSettings } from '../../types';
import { useCharacterGenerator } from '../../composables/useCharacterGenerator';
import { usePortraitTemplatesStore } from '../../stores/portraitTemplates';
import { useUiStore } from '../../stores/ui';
import CharacterPortrait from './CharacterPortrait.vue';
import PortraitCandidates from './PortraitCandidates.vue';
import CustomImageUploader from './CustomImageUploader.vue';
import PortraitElementEditor from './PortraitElementEditor.vue';

const props = withDefaults(defineProps<{
  modelValue?: PortraitConfig;
  heroName?: string;
}>(), {
  modelValue: undefined,
  heroName: ''
});

const emit = defineEmits<{
  'update:modelValue': [config: PortraitConfig];
  'confirm': [config: PortraitConfig];
}>();

const portraitTemplates = usePortraitTemplatesStore();
const uiStore = useUiStore();
const generator = useCharacterGenerator(props.modelValue);

watch(() => props.modelValue, (val) => {
  if (val) {
    generator.applyConfigToCurrent(JSON.parse(JSON.stringify(val)));
  }
}, { deep: true, immediate: true });

const activeTab = ref<'candidates' | 'editor' | 'custom' | 'templates'>('candidates');
const showSaveDialog = ref(false);
const saveTemplateName = ref('');

const currentConfig = computed(() => generator.currentConfig.value);
const candidates = computed(() => generator.candidates.value);
const selectedIndex = computed(() => generator.selectedIndex.value);

function onSelectCandidate(idx: number) {
  generator.selectCandidate(idx);
  emit('update:modelValue', generator.currentConfig.value);
}

function onReshuffle() {
  generator.reshuffleCandidates();
}

function onEditorUpdate(cfg: PortraitConfig) {
  generator.applyConfigToCurrent(cfg);
  emit('update:modelValue', cfg);
}

function onCustomImageConfirm(data: { image?: string; filter: ImageFilterSettings }) {
  generator.setCustomImage(data.image, data.filter);
  emit('update:modelValue', generator.currentConfig.value);
}

function handleSaveTemplate() {
  if (!saveTemplateName.value.trim()) return;
  const tpl = portraitTemplates.saveTemplate(saveTemplateName.value, generator.currentConfig.value);
  uiStore.showSuccess(`模板「${tpl.name}」已保存`);
  showSaveDialog.value = false;
  saveTemplateName.value = '';
}

function handleApplyTemplate(id: string) {
  const cfg = portraitTemplates.applyTemplateToConfig(id);
  if (cfg) {
    generator.applyConfigToCurrent(cfg);
    emit('update:modelValue', cfg);
    uiStore.showSuccess('模板已应用');
  }
}

function handleDeleteTemplate(id: string) {
  if (confirm('确定删除该模板？')) {
    portraitTemplates.deleteTemplate(id);
    uiStore.showSuccess('模板已删除');
  }
}

function handleConfirm() {
  emit('confirm', generator.currentConfig.value);
}

function openSaveDialog() {
  saveTemplateName.value = props.heroName || '';
  showSaveDialog.value = true;
}
</script>

<template>
  <div class="portrait-generator">
    <div class="generator-header">
      <div class="header-title">
        <Wand2 class="title-icon" />
        <span>立绘生成器</span>
      </div>
    </div>

    <div class="preview-section">
      <CharacterPortrait
        :config="currentConfig"
        size="large"
        :show-background="true"
      />
    </div>

    <div class="tabs-nav">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'candidates' }"
        @click="activeTab = 'candidates'"
      >
        <span class="tab-emoji">🎲</span>
        <span>候选</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'editor' }"
        @click="activeTab = 'editor'"
      >
        <span class="tab-emoji">✏️</span>
        <span>微调</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'custom' }"
        @click="activeTab = 'custom'"
      >
        <span class="tab-emoji">🖼️</span>
        <span>自定义图片</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'templates' }"
        @click="activeTab = 'templates'"
      >
        <span class="tab-emoji">📋</span>
        <span>模板</span>
      </button>
    </div>

    <div class="tab-content">
      <div v-show="activeTab === 'candidates'" class="tab-panel">
        <PortraitCandidates
          :candidates="candidates"
          :selected-index="selectedIndex"
          size="md"
          @select="onSelectCandidate"
          @reshuffle="onReshuffle"
        />
      </div>

      <div v-show="activeTab === 'editor'" class="tab-panel">
        <PortraitElementEditor
          :model-value="currentConfig"
          @update:model-value="onEditorUpdate"
        />
      </div>

      <div v-show="activeTab === 'custom'" class="tab-panel">
        <CustomImageUploader
          :model-value="currentConfig.customImage"
          :initial-filter="currentConfig.imageFilter"
          @confirm="onCustomImageConfirm"
        />
      </div>

      <div v-show="activeTab === 'templates'" class="tab-panel">
        <div v-if="portraitTemplates.templates.length === 0" class="empty-templates">
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂无保存的模板</div>
          <div class="empty-hint">点击下方「保存为模板」按钮保存当前配置</div>
        </div>
        <div v-else class="templates-grid">
          <div
            v-for="tpl in portraitTemplates.templates"
            :key="tpl.id"
            class="template-card"
          >
            <div class="template-preview">
              <CharacterPortrait
                :config="tpl.config"
                size="small"
                :show-background="true"
              />
            </div>
            <div class="template-info">
              <div class="template-name">{{ tpl.name }}</div>
              <div class="template-meta">
                <span>使用 {{ tpl.usageCount }} 次</span>
              </div>
            </div>
            <div class="template-actions">
              <button class="tpl-btn apply-btn" @click="handleApplyTemplate(tpl.id)">
                应用
              </button>
              <button class="tpl-btn delete-btn" @click="handleDeleteTemplate(tpl.id)">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button class="action-btn save-btn" @click="openSaveDialog">
        <Save :size="18" />
        <span>保存为模板</span>
      </button>
      <button class="action-btn confirm-btn" @click="handleConfirm">
        <span>✅ 确认使用</span>
      </button>
    </div>

    <div v-if="showSaveDialog" class="modal-overlay" @click.self="showSaveDialog = false">
      <div class="modal-dialog">
        <div class="modal-title">保存为模板</div>
        <div class="modal-body">
          <input
            v-model="saveTemplateName"
            type="text"
            class="template-name-input"
            placeholder="请输入模板名称"
            @keyup.enter="handleSaveTemplate"
          />
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel-btn" @click="showSaveDialog = false">
            取消
          </button>
          <button class="modal-btn ok-btn" @click="handleSaveTemplate">
            确认保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portrait-generator {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: #FAFAFA;
  border: 4px solid #212121;
  border-radius: 8px;
  box-shadow: 6px 6px 0 #212121;
  font-family: inherit;
}

.generator-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Bangers', cursive;
  font-size: 32px;
  color: #E53935;
  text-shadow: 3px 3px 0 #212121;
  letter-spacing: 2px;
}

.title-icon {
  width: 36px;
  height: 36px;
  stroke: #FFD54F;
  stroke-width: 2.5;
  filter: drop-shadow(2px 2px 0 #212121);
}

.preview-section {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #FFFFFF;
  border: 3px solid #212121;
  border-radius: 6px;
  box-shadow: 4px 4px 0 #212121;
}

.tabs-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #FFFFFF;
  border: 3px solid #212121;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 3px 3px 0 #212121;
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 13px;
  color: #212121;
}

.tab-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 #212121;
  background: #FFF8E1;
}

.tab-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #212121;
}

.tab-btn.active {
  background: #E53935;
  color: #FAFAFA;
  border-color: #FFD54F;
}

.tab-emoji {
  font-size: 20px;
  line-height: 1;
}

.tab-content {
  min-height: 200px;
}

.tab-panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.empty-templates {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  background: #FFFFFF;
  border: 3px dashed #757575;
  border-radius: 6px;
}

.empty-icon {
  font-size: 48px;
}

.empty-text {
  font-family: 'Bangers', cursive;
  font-size: 22px;
  color: #424242;
  letter-spacing: 1px;
}

.empty-hint {
  font-size: 14px;
  color: #757575;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.template-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #FFFFFF;
  border: 3px solid #212121;
  border-radius: 6px;
  box-shadow: 3px 3px 0 #212121;
  transition: all 0.15s ease;
}

.template-card:hover {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 #212121;
}

.template-preview {
  display: flex;
  justify-content: center;
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.template-name {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 15px;
  color: #212121;
  text-align: center;
  word-break: break-all;
}

.template-meta {
  font-size: 11px;
  color: #757575;
}

.template-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.tpl-btn {
  flex: 1;
  padding: 8px 10px;
  border: 2px solid #212121;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.apply-btn {
  background: #FFD54F;
  color: #212121;
  box-shadow: 2px 2px 0 #212121;
}

.apply-btn:hover {
  background: #FFC107;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #212121;
}

.delete-btn {
  background: #EF5350;
  color: #FFFFFF;
  box-shadow: 2px 2px 0 #212121;
  padding: 8px;
  flex: 0 0 auto;
}

.delete-btn:hover {
  background: #E53935;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #212121;
}

.action-bar {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: 3px solid #212121;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: 'Bangers', cursive;
  font-size: 17px;
  letter-spacing: 1px;
  box-shadow: 4px 4px 0 #212121;
}

.action-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #212121;
}

.action-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #212121;
}

.save-btn {
  background: #FFFFFF;
  color: #212121;
}

.save-btn:hover {
  background: #F5F5F5;
}

.confirm-btn {
  background: #E53935;
  color: #FAFAFA;
}

.confirm-btn:hover {
  background: #D32F2F;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
}

.modal-dialog {
  width: 90%;
  max-width: 400px;
  background: #FAFAFA;
  border: 4px solid #212121;
  border-radius: 8px;
  box-shadow: 6px 6px 0 #212121;
  overflow: hidden;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.9) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-title {
  padding: 16px 20px;
  background: #E53935;
  color: #FAFAFA;
  font-family: 'Bangers', cursive;
  font-size: 22px;
  letter-spacing: 1px;
  text-shadow: 2px 2px 0 #212121;
  border-bottom: 3px solid #212121;
}

.modal-body {
  padding: 20px;
}

.template-name-input {
  width: 100%;
  padding: 12px 14px;
  border: 3px solid #212121;
  border-radius: 4px;
  font-family: 'Comic Neue', cursive;
  font-size: 16px;
  font-weight: 700;
  color: #212121;
  background: #FFFFFF;
  box-shadow: 3px 3px 0 #212121;
  outline: none;
  box-sizing: border-box;
}

.template-name-input:focus {
  border-color: #FFD54F;
  background: #FFFDE7;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 3px solid #212121;
  background: #F5F5F5;
}

.modal-btn {
  flex: 1;
  padding: 10px 16px;
  border: 3px solid #212121;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: 'Bangers', cursive;
  font-size: 15px;
  letter-spacing: 1px;
  box-shadow: 3px 3px 0 #212121;
}

.modal-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 #212121;
}

.modal-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 #212121;
}

.cancel-btn {
  background: #FFFFFF;
  color: #212121;
}

.cancel-btn:hover {
  background: #F5F5F5;
}

.ok-btn {
  background: #FFD54F;
  color: #212121;
}

.ok-btn:hover {
  background: #FFC107;
}

@media (max-width: 640px) {
  .portrait-generator {
    padding: 16px;
    gap: 14px;
  }

  .header-title {
    font-size: 24px;
  }

  .title-icon {
    width: 28px;
    height: 28px;
  }

  .tabs-nav {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-bar {
    flex-direction: column;
  }

  .templates-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
