<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Save, Search, Pin, PinOff, Pencil, Trash2, X, Check,
  ArrowUpDown, Clock, Flame, Type, Package
} from 'lucide-vue-next';
import type { Preset, PresetCategory, SortMode } from '../../types';
import { usePresetsStore } from '../../stores/presets';
import { useUiStore } from '../../stores/ui';

const props = defineProps<{
  category: PresetCategory;
}>();

const emit = defineEmits<{
  (e: 'apply', preset: Preset): void;
  (e: 'save', name: string): void;
}>();

const presetsStore = usePresetsStore();
const uiStore = useUiStore();

const showSaveDialog = ref(false);
const saveName = ref('');
const renamingId = ref<string | null>(null);
const renameValue = ref('');

const presets = computed(() => {
  let filtered = presetsStore.allPresets.filter(p => p.category === props.category);

  if (presetsStore.searchQuery.trim()) {
    const q = presetsStore.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
  }

  const sorted = [...filtered];
  switch (presetsStore.sortMode) {
    case 'usage':
      sorted.sort((a, b) => b.usageCount - a.usageCount);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
      break;
    case 'date':
    default:
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  sorted.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  return sorted;
});

const categoryIcon: Record<PresetCategory, string> = {
  appearance: '🎨',
  powers: '⚡',
  story: '📖',
  effects: '✨',
  card: '🎴',
  full: '🎁'
};

const categoryTitle: Record<PresetCategory, string> = {
  appearance: '外观预设',
  powers: '能力预设',
  story: '故事预设',
  effects: '特效预设',
  card: '卡片预设',
  full: '我的套装'
};

const sortOptions: { mode: SortMode; label: string; icon: any }[] = [
  { mode: 'date', label: '按时间', icon: Clock },
  { mode: 'usage', label: '按热度', icon: Flame },
  { mode: 'name', label: '按名称', icon: Type }
];

function openSaveDialog() {
  saveName.value = '';
  showSaveDialog.value = true;
  setTimeout(() => {
    const input = document.getElementById('preset-save-input') as HTMLInputElement;
    input?.focus();
  }, 100);
}

function confirmSave() {
  const name = saveName.value.trim();
  if (!name) {
    uiStore.showWarning('请输入预设名称');
    return;
  }
  emit('save', name);
  showSaveDialog.value = false;
}

function handleApply(preset: Preset) {
  presetsStore.applyPreset(preset.id);
  emit('apply', preset);
  uiStore.showSuccess(`已套用「${preset.name}」`);
}

function handleDelete(preset: Preset) {
  if (!confirm(`确定要删除预设「${preset.name}」吗？此操作不可恢复。`)) return;
  if (presetsStore.deletePreset(preset.id)) {
    uiStore.showSuccess('预设已删除');
  }
}

function startRename(preset: Preset) {
  renamingId.value = preset.id;
  renameValue.value = preset.name;
}

function confirmRename(presetId: string) {
  const name = renameValue.value.trim();
  if (!name) {
    uiStore.showWarning('预设名称不能为空');
    return;
  }
  if (presetsStore.renamePreset(presetId, name)) {
    uiStore.showSuccess('预设已重命名');
  }
  renamingId.value = null;
}

function cancelRename() {
  renamingId.value = null;
}

function handleTogglePin(preset: Preset) {
  presetsStore.togglePinPreset(preset.id);
  uiStore.showSuccess(preset.isPinned ? '已取消置顶' : '已置顶');
}

function parseThumbnail(thumbnail?: string) {
  if (!thumbnail) return { emoji: categoryIcon[props.category], color: '#e53935' };
  if (thumbnail.includes('|')) {
    const [emoji, color] = thumbnail.split('|');
    return { emoji, color: color || '#e53935' };
  }
  return { emoji: thumbnail, color: '#e53935' };
}

function selectSort(mode: SortMode) {
  presetsStore.setSortMode(mode);
}
</script>

<template>
  <div class="presets-panel">
    <div class="panel-header">
      <div class="header-title">
        <span class="title-icon">{{ categoryIcon[category] }}</span>
        <span>{{ categoryTitle[category] }}</span>
        <span class="count-badge">{{ presets.length }}</span>
      </div>
      <button class="save-btn" @click="openSaveDialog">
        <Save :size="16" />
        <span>💾 保存为预设</span>
      </button>
    </div>

    <div class="panel-toolbar">
      <div class="search-box">
        <Search :size="14" />
        <input
          type="text"
          placeholder="搜索预设..."
          :value="presetsStore.searchQuery"
          @input="presetsStore.setSearchQuery(($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="sort-group">
        <button
          v-for="opt in sortOptions"
          :key="opt.mode"
          class="sort-btn"
          :class="{ active: presetsStore.sortMode === opt.mode }"
          @click="selectSort(opt.mode)"
          :title="opt.label"
        >
          <component :is="opt.icon" :size="14" />
          <span class="sort-label">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <div class="presets-grid" v-if="presets.length > 0">
      <div
        v-for="preset in presets"
        :key="preset.id"
        class="preset-card"
        :class="{ pinned: preset.isPinned }"
      >
        <div
          class="preset-thumbnail"
          :style="{ background: `linear-gradient(135deg, ${parseThumbnail(preset.thumbnail).color}, ${parseThumbnail(preset.thumbnail).color}99)` }"
        >
          <span class="thumbnail-emoji">{{ parseThumbnail(preset.thumbnail).emoji }}</span>
          <div v-if="preset.isPinned" class="pinned-badge" title="已置顶">
            <Pin :size="10" />
          </div>
          <div class="usage-badge" v-if="preset.usageCount > 0" :title="`已使用 ${preset.usageCount} 次`">
            <Flame :size="10" />
            <span>{{ preset.usageCount }}</span>
          </div>
        </div>

        <div class="preset-body">
          <div v-if="renamingId === preset.id" class="rename-input-wrapper">
            <input
              type="text"
              class="rename-input"
              v-model="renameValue"
              @keyup.enter="confirmRename(preset.id)"
              @keyup.escape="cancelRename"
              ref="renameInputRef"
            />
            <div class="rename-actions">
              <button class="rename-confirm" @click="confirmRename(preset.id)" title="确认">
                <Check :size="12" />
              </button>
              <button class="rename-cancel" @click="cancelRename" title="取消">
                <X :size="12" />
              </button>
            </div>
          </div>
          <div v-else class="preset-name" @click="handleApply(preset)">
            {{ preset.name }}
          </div>

          <div class="preset-meta">
            <span class="meta-date">
              {{ new Date(preset.updatedAt).toLocaleDateString('zh-CN') }}
            </span>
          </div>

          <div class="preset-actions">
            <button class="action-btn apply" @click="handleApply(preset)" title="套用">
              <Package :size="14" />
              <span>套用</span>
            </button>
            <button
              class="action-btn pin"
              :class="{ active: preset.isPinned }"
              @click="handleTogglePin(preset)"
              :title="preset.isPinned ? '取消置顶' : '置顶'"
            >
              <PinOff v-if="preset.isPinned" :size="14" />
              <Pin v-else :size="14" />
            </button>
            <button class="action-btn rename" @click="startRename(preset)" title="重命名">
              <Pencil :size="14" />
            </button>
            <button class="action-btn delete" @click="handleDelete(preset)" title="删除">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-presets">
      <div class="empty-icon">{{ categoryIcon[category] }}</div>
      <p>暂无预设，点击上方「保存为预设」创建第一个吧！</p>
    </div>

    <Teleport to="body">
      <div v-if="showSaveDialog" class="dialog-overlay" @click.self="showSaveDialog = false">
        <div class="save-dialog">
          <div class="dialog-header">
            <Save :size="20" />
            <span>保存为{{ categoryTitle[category] }}</span>
            <button class="dialog-close" @click="showSaveDialog = false">
              <X :size="18" />
            </button>
          </div>
          <div class="dialog-body">
            <label class="input-label">预设名称</label>
            <input
              id="preset-save-input"
              type="text"
              class="name-input"
              v-model="saveName"
              placeholder="给预设起个名字..."
              @keyup.enter="confirmSave"
              @keyup.escape="showSaveDialog = false"
            />
          </div>
          <div class="dialog-footer">
            <button class="dialog-btn cancel" @click="showSaveDialog = false">取消</button>
            <button class="dialog-btn confirm" @click="confirmSave">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.presets-panel {
  margin-top: 24px;
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 4px 4px 0 #212121;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 3px dashed #bdbdbd;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Bangers', cursive;
  font-size: 20px;
  color: #1565c0;
  text-shadow: 1px 1px 0 #212121;
  letter-spacing: 1px;
}

.title-icon {
  font-size: 24px;
}

.count-badge {
  background: #1565c0;
  color: #fafafa;
  border: 2px solid #212121;
  border-radius: 12px;
  padding: 2px 10px;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  text-shadow: none;
  box-shadow: 2px 2px 0 #212121;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border: 3px solid #212121;
  border-radius: 6px;
  color: #fafafa;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.save-btn:active {
  transform: translateY(1px);
  box-shadow: 2px 2px 0 #212121;
}

.panel-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 6px;
  box-shadow: 2px 2px 0 #212121;
}

.search-box svg {
  color: #757575;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
}

.sort-group {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #212121;
  border: 3px solid #212121;
  border-radius: 6px;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #bdbdbd;
  font-family: 'Roboto Slab', serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  color: #fafafa;
  background: rgba(255, 255, 255, 0.1);
}

.sort-btn.active {
  background: #fdd835;
  color: #212121;
}

.sort-label {
  white-space: nowrap;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 480px;
  overflow-y: auto;
  padding: 4px;
}

.preset-card {
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
  cursor: pointer;
}

.preset-card:hover {
  transform: translateY(-3px);
  box-shadow: 5px 6px 0 #212121;
}

.preset-card.pinned {
  border-color: #fdd835;
  box-shadow: 3px 3px 0 #212121, 0 0 0 2px #fdd835 inset;
}

.preset-thumbnail {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 3px solid #212121;
}

.thumbnail-emoji {
  font-size: 40px;
  filter: drop-shadow(2px 2px 0 #212121);
}

.pinned-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 22px;
  height: 22px;
  background: #fdd835;
  border: 2px solid #212121;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #212121;
  box-shadow: 1px 1px 0 #212121;
}

.usage-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: rgba(33, 33, 33, 0.85);
  border: 2px solid #212121;
  border-radius: 10px;
  color: #fdd835;
  font-family: 'Bangers', cursive;
  font-size: 12px;
}

.preset-body {
  padding: 12px;
}

.preset-name {
  font-family: 'Roboto Slab', serif;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preset-name:hover {
  color: #1565c0;
}

.rename-input-wrapper {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.rename-input {
  flex: 1;
  padding: 4px 8px;
  border: 2px solid #1565c0;
  border-radius: 4px;
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  outline: none;
  min-width: 0;
}

.rename-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.rename-confirm,
.rename-cancel {
  width: 24px;
  height: 24px;
  border: 2px solid #212121;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rename-confirm {
  background: #4caf50;
  color: #fafafa;
}

.rename-cancel {
  background: #c62828;
  color: #fafafa;
}

.preset-meta {
  margin-bottom: 10px;
}

.meta-date {
  font-family: 'Roboto Slab', serif;
  font-size: 11px;
  color: #757575;
}

.preset-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  border: 2px solid #212121;
  border-radius: 4px;
  font-family: 'Roboto Slab', serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  background: #fafafa;
  color: #212121;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.apply {
  background: #1565c0;
  color: #fafafa;
  flex: 2;
}

.action-btn.pin {
  background: #fafafa;
  color: #757575;
  flex: none;
  width: 32px;
}

.action-btn.pin.active {
  background: #fdd835;
  color: #212121;
}

.action-btn.rename {
  flex: none;
  width: 32px;
}

.action-btn.rename:hover {
  background: #fdd835;
}

.action-btn.delete {
  flex: none;
  width: 32px;
}

.action-btn.delete:hover {
  background: #c62828;
  color: #fafafa;
}

.empty-presets {
  padding: 40px 20px;
  text-align: center;
  color: #757575;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-presets p {
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  margin: 0;
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

.save-dialog {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  box-shadow: 8px 8px 0 #212121;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #1565c0, #0d47a1);
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
  border-color: #1565c0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 3px dashed #bdbdbd;
}

.dialog-btn {
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
  background: #4caf50;
  color: #fafafa;
}

.dialog-btn:hover {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

@media (max-width: 640px) {
  .presets-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .sort-label {
    display: none;
  }
}
</style>
