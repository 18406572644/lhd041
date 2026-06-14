<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  Heart, Plus, Trash2, Share2, Settings, X, Check,
  FolderPlus, Edit3, GripVertical, ChevronDown, ChevronRight,
  Move, CheckSquare, Square, Download
} from 'lucide-vue-next';
import { useHeroStore } from '../stores/hero';
import { useUiStore } from '../stores/ui';
import HeroCard from '../components/hero/HeroCard.vue';
import BatchExportDialog from '../components/hero/BatchExportDialog.vue';
import type { FavoriteFolder, Hero } from '../types';

const router = useRouter();
const heroStore = useHeroStore();
const uiStore = useUiStore();

const savedHeroes = computed(() => heroStore.savedHeroes);
const storageStats = computed(() => heroStore.getStorageStats());
const folders = computed(() => heroStore.folders);

const activeFolderId = ref<string>('all');
const expandedFolders = ref<Set<string>>(new Set());
const showManageDialog = ref(false);
const showCreateDialog = ref(false);
const showMoveDialog = ref(false);
const showBatchExportDialog = ref(false);
const batchMode = ref(false);
const selectedHeroIds = ref<Set<string>>(new Set());

const newFolderName = ref('');
const newFolderIcon = ref('📁');
const newFolderColor = ref('#2196f3');
const editingFolderId = ref<string | null>(null);
const editFolderName = ref('');
const editFolderIcon = ref('');
const editFolderColor = ref('');
const moveTargetFolderId = ref('');

const dragState = ref<{
  heroId: string | null;
  fromFolderId: string | null;
}>({ heroId: null, fromFolderId: null });
const dragOverFolderId = ref<string | null>(null);

const folderIcons = ['📁', '🗡️', '🦸', '😈', '😂', '🤖', '🌟', '🔥', '💎', '🎯', '⚡', '🎭'];
const folderColors = ['#2196f3', '#4caf50', '#ff9800', '#e53935', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];

const viewMode = computed(() => activeFolderId.value === 'all' ? 'all' : 'folder');

function getHeroesForFolder(folderId: string) {
  return heroStore.getHeroesByFolder(folderId);
}

function toggleFolderExpand(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId);
  } else {
    expandedFolders.value.add(folderId);
  }
}

function isFolderExpanded(folderId: string) {
  return expandedFolders.value.has(folderId);
}

function setActiveFolder(folderId: string) {
  activeFolderId.value = folderId;
  if (folderId !== 'all' && !expandedFolders.value.has(folderId)) {
    expandedFolders.value.add(folderId);
  }
}

watch(activeFolderId, (newVal) => {
  if (newVal === 'all') {
    folders.value.forEach(folder => {
      if (heroStore.getHeroesByFolder(folder.id).length > 0) {
        expandedFolders.value.add(folder.id);
      }
    });
  }
}, { immediate: true });

function getFolderHeroCount(folderId: string) {
  return heroStore.getHeroesByFolder(folderId).length;
}

function openCreateDialog() {
  newFolderName.value = '';
  newFolderIcon.value = '📁';
  newFolderColor.value = '#2196f3';
  showCreateDialog.value = true;
  setTimeout(() => {
    const input = document.getElementById('create-folder-input') as HTMLInputElement;
    input?.focus();
  }, 100);
}

function createFolder() {
  const name = newFolderName.value.trim();
  if (!name) {
    uiStore.showWarning('请输入收藏夹名称');
    return;
  }
  heroStore.createFolder(name, newFolderIcon.value, newFolderColor.value);
  showCreateDialog.value = false;
  uiStore.showSuccess(`收藏夹「${name}」已创建`);
}

function startEditFolder(folder: FavoriteFolder) {
  editingFolderId.value = folder.id;
  editFolderName.value = folder.name;
  editFolderIcon.value = folder.icon;
  editFolderColor.value = folder.color;
}

function confirmEditFolder() {
  if (!editingFolderId.value) return;
  const name = editFolderName.value.trim();
  if (!name) {
    uiStore.showWarning('收藏夹名称不能为空');
    return;
  }
  heroStore.updateFolder(editingFolderId.value, {
    name,
    icon: editFolderIcon.value,
    color: editFolderColor.value
  });
  editingFolderId.value = null;
  uiStore.showSuccess('收藏夹已更新');
}

function cancelEditFolder() {
  editingFolderId.value = null;
}

function deleteFolder(folderId: string) {
  const folder = heroStore.getFolderById(folderId);
  if (!folder) return;
  const count = getFolderHeroCount(folderId);
  const msg = count > 0
    ? `收藏夹「${folder.name}」中有 ${count} 个英雄，删除后英雄将移至「未分组」。确定删除？`
    : `确定删除收藏夹「${folder.name}」吗？`;
  if (confirm(msg)) {
    heroStore.deleteFolder(folderId);
    if (activeFolderId.value === folderId) {
      activeFolderId.value = 'all';
    }
    uiStore.showSuccess('收藏夹已删除');
  }
}

function onDragStartHero(e: DragEvent, heroId: string, folderId: string) {
  dragState.value = { heroId, fromFolderId: folderId };
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', heroId);
  }
  const target = e.target as HTMLElement;
  target.style.opacity = '0.5';
}

function onDragEndHero(e: DragEvent) {
  dragState.value = { heroId: null, fromFolderId: null };
  dragOverFolderId.value = null;
  const target = e.target as HTMLElement;
  target.style.opacity = '1';
}

function onDragOverFolder(e: DragEvent, folderId: string) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
  dragOverFolderId.value = folderId;
}

function onDragLeaveFolder() {
  dragOverFolderId.value = null;
}

function onDropOnFolder(e: DragEvent, targetFolderId: string) {
  e.preventDefault();
  dragOverFolderId.value = null;
  const heroId = dragState.value.heroId;
  if (!heroId) return;
  if (dragState.value.fromFolderId === targetFolderId) return;
  heroStore.moveHeroToFolder(heroId, targetFolderId);
  const folder = heroStore.getFolderById(targetFolderId);
  uiStore.showSuccess(`英雄已移动到「${folder?.name || '未分组'}」`);
}

function toggleBatchMode() {
  batchMode.value = !batchMode.value;
  selectedHeroIds.value = new Set();
}

function toggleHeroSelection(heroId: string) {
  if (selectedHeroIds.value.has(heroId)) {
    selectedHeroIds.value.delete(heroId);
  } else {
    selectedHeroIds.value.add(heroId);
  }
}

function selectAllInFolder(folderId: string) {
  const heroes = getHeroesForFolder(folderId);
  const allSelected = heroes.every(h => selectedHeroIds.value.has(h.id));
  heroes.forEach(h => {
    if (allSelected) {
      selectedHeroIds.value.delete(h.id);
    } else {
      selectedHeroIds.value.add(h.id);
    }
  });
}

function openMoveDialog() {
  if (selectedHeroIds.value.size === 0) {
    uiStore.showWarning('请先选择要移动的英雄');
    return;
  }
  moveTargetFolderId.value = heroStore.defaultFolder?.id || 'default';
  showMoveDialog.value = true;
}

function batchMove() {
  if (!moveTargetFolderId.value || selectedHeroIds.value.size === 0) return;
  const count = heroStore.moveHeroesToFolder(
    Array.from(selectedHeroIds.value),
    moveTargetFolderId.value
  );
  const folder = heroStore.getFolderById(moveTargetFolderId.value);
  uiStore.showSuccess(`已将 ${count} 个英雄移动到「${folder?.name || '未分组'}」`);
  showMoveDialog.value = false;
  selectedHeroIds.value = new Set();
  batchMode.value = false;
}

const selectedHeroesForExport = computed<Hero[]>(() => {
  return savedHeroes.value.filter(h => selectedHeroIds.value.has(h.id));
});

function openBatchExport() {
  if (selectedHeroIds.value.size === 0) {
    uiStore.showWarning('请先选择要导出的英雄');
    return;
  }
  showBatchExportDialog.value = true;
}

function batchDelete() {
  if (selectedHeroIds.value.size === 0) {
    uiStore.showWarning('请先选择要删除的英雄');
    return;
  }
  if (confirm(`确定要删除选中的 ${selectedHeroIds.value.size} 个英雄吗？`)) {
    let count = 0;
    selectedHeroIds.value.forEach(id => {
      if (heroStore.removeHero(id)) count++;
    });
    uiStore.showSuccess(`已删除 ${count} 个英雄`);
    selectedHeroIds.value = new Set();
    batchMode.value = false;
  }
}

async function handleEdit(hero: { id: string }) {
  await heroStore.editHero(hero.id);
  router.push('/generator');
}

async function handleDelete(heroId: string) {
  const hero = savedHeroes.value.find(h => h.id === heroId);
  if (confirm(`确定要删除英雄「${hero?.name}」吗？`)) {
    try {
      await heroStore.deleteSavedHero(heroId);
      uiStore.showSuccess('英雄已删除');
    } catch (e) {
      uiStore.showError('删除失败');
    }
  }
}

async function handleShare(heroId: string) {
  try {
    await heroStore.shareHero(heroId);
    uiStore.showSuccess('分享链接已复制到剪贴板！');
  } catch (e) {
    uiStore.showError('分享失败');
  }
}

function goToGenerator() {
  router.push('/generator');
}

async function clearAll() {
  if (savedHeroes.value.length === 0) return;
  if (confirm('确定要清空所有收藏的英雄吗？此操作不可恢复！')) {
    try {
      await heroStore.clearAllHeroes();
      uiStore.showSuccess('已清空所有收藏');
    } catch (e) {
      uiStore.showError('清空失败');
    }
  }
}

function getFolderName(folderId: string) {
  const folder = heroStore.getFolderById(folderId);
  return folder?.name || '未分组';
}

function onDragStartFolder(e: DragEvent, index: number) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('folderIndex', String(index));
  }
}

function onDropFolder(e: DragEvent, toIndex: number) {
  e.preventDefault();
  const fromIndexStr = e.dataTransfer?.getData('folderIndex');
  if (fromIndexStr === undefined || fromIndexStr === null) return;
  const fromIndex = parseInt(fromIndexStr, 10);
  if (fromIndex === toIndex) return;
  heroStore.reorderFolders(fromIndex, toIndex);
}
</script>

<template>
  <div class="favorites-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <Heart :size="32" fill="#e53935" />
          <span>我的收藏</span>
        </h1>
        <p class="page-subtitle">你收藏的超级英雄们</p>
      </div>
      <div class="header-right">
        <div class="stats-badge">
          <span class="stat-icon">🦸</span>
          <span class="stat-text">{{ savedHeroes.length }} 个英雄</span>
        </div>
        <button class="action-btn create" @click="goToGenerator">
          <Plus :size="20" />
          <span>创建新英雄</span>
        </button>
        <button
          v-if="savedHeroes.length > 0"
          class="action-btn manage"
          @click="showManageDialog = true"
        >
          <Settings :size="18" />
          <span>管理收藏夹</span>
        </button>
        <button
          v-if="savedHeroes.length > 0"
          class="action-btn batch"
          :class="{ active: batchMode }"
          @click="toggleBatchMode"
        >
          <CheckSquare :size="18" />
          <span>{{ batchMode ? '退出批量' : '批量操作' }}</span>
        </button>
        <button
          v-if="savedHeroes.length > 0 && !batchMode"
          class="action-btn clear"
          @click="clearAll"
        >
          <Trash2 :size="18" />
          <span>清空</span>
        </button>
      </div>
    </div>

    <div v-if="batchMode && selectedHeroIds.size > 0" class="batch-bar">
      <span class="batch-info">已选择 {{ selectedHeroIds.size }} 个英雄</span>
      <button class="batch-btn move" @click="openMoveDialog">
        <Move :size="16" />
        <span>移动到...</span>
      </button>
      <button class="batch-btn export" @click="openBatchExport">
        <Download :size="16" />
        <span>批量导出</span>
      </button>
      <button class="batch-btn delete" @click="batchDelete">
        <Trash2 :size="16" />
        <span>删除</span>
      </button>
    </div>

    <div v-if="savedHeroes.length > 0" class="storage-info">
      <div class="storage-bar">
        <div
          class="storage-fill"
          :style="{ width: `${Math.min(100, (storageStats.totalSize / (5 * 1024 * 1024)) * 100)}%` }"
        />
      </div>
      <span class="storage-text">
        已使用 {{ (storageStats.totalSize / 1024).toFixed(1) }} KB / 5 MB
      </span>
    </div>

    <div v-if="savedHeroes.length === 0" class="empty-state">
      <div class="empty-icon">
        <Heart :size="80" />
      </div>
      <h2 class="empty-title">还没有收藏的英雄</h2>
      <p class="empty-desc">创建你的第一个超级英雄，保存到收藏夹吧！</p>
      <button class="cta-btn primary" @click="goToGenerator">
        <Plus :size="24" />
        <span>开始创建</span>
      </button>
    </div>

    <div v-else class="favorites-content">
      <div class="folder-tabs">
        <button
          class="folder-tab"
          :class="{ active: activeFolderId === 'all' }"
          @click="setActiveFolder('all')"
        >
          <span class="tab-icon">🌐</span>
          <span class="tab-label">全部</span>
          <span class="tab-count">{{ savedHeroes.length }}</span>
        </button>
        <button
          v-for="folder in folders"
          :key="folder.id"
          class="folder-tab"
          :class="{ active: activeFolderId === folder.id }"
          :style="{ '--folder-color': folder.color }"
          @click="setActiveFolder(folder.id)"
          @dragover="onDragOverFolder($event, folder.id)"
          @dragleave="onDragLeaveFolder"
          @drop="onDropOnFolder($event, folder.id)"
        >
          <span class="tab-icon">{{ folder.icon }}</span>
          <span class="tab-label">{{ folder.name }}</span>
          <span class="tab-count">{{ getFolderHeroCount(folder.id) }}</span>
          <span v-if="dragOverFolderId === folder.id && dragState.heroId" class="drop-indicator">↓</span>
        </button>
        <button class="folder-tab add-tab" @click="openCreateDialog">
          <FolderPlus :size="18" />
        </button>
      </div>

      <div v-if="viewMode === 'all'" class="folder-groups">
        <div
          v-for="folder in folders"
          :key="folder.id"
          class="folder-section"
        >
          <div
            class="folder-header-bar"
            :style="{ borderLeftColor: folder.color }"
            @click="toggleFolderExpand(folder.id)"
          >
            <component :is="isFolderExpanded(folder.id) ? ChevronDown : ChevronRight" :size="18" class="expand-icon" />
            <span class="folder-section-icon">{{ folder.icon }}</span>
            <span class="folder-section-name">{{ folder.name }}</span>
            <span class="folder-section-count">{{ getFolderHeroCount(folder.id) }}</span>
            <div
              v-if="batchMode"
              class="select-all-btn"
              @click.stop="selectAllInFolder(folder.id)"
            >
              全选
            </div>
          </div>
          <div v-if="isFolderExpanded(folder.id)" class="folder-heroes">
            <div
              v-for="hero in getHeroesForFolder(folder.id)"
              :key="hero.id"
              class="hero-card-wrapper"
              :class="{ 'batch-selected': selectedHeroIds.has(hero.id), 'drag-over': dragOverFolderId === folder.id && dragState.heroId === hero.id }"
              draggable="true"
              @dragstart="onDragStartHero($event, hero.id, folder.id)"
              @dragend="onDragEndHero"
            >
              <div v-if="batchMode" class="batch-checkbox" @click.stop="toggleHeroSelection(hero.id)">
                <CheckSquare v-if="selectedHeroIds.has(hero.id)" :size="20" />
                <Square v-else :size="20" />
              </div>
              <div v-if="!batchMode" class="drag-handle" title="拖拽移动到其他收藏夹">
                <GripVertical :size="16" />
              </div>
              <HeroCard
                :hero="hero"
                showActions
                @edit="handleEdit"
                @delete="handleDelete"
                @share="handleShare"
              />
            </div>
            <div v-if="getHeroesForFolder(folder.id).length === 0" class="folder-empty">
              <span>暂无英雄，拖拽英雄到此处或保存新英雄到此收藏夹</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="single-folder-view">
        <div
          class="folder-drop-zone"
          :class="{ 'drag-active': dragOverFolderId === activeFolderId && dragState.heroId }"
          @dragover="onDragOverFolder($event, activeFolderId)"
          @dragleave="onDragLeaveFolder"
          @drop="onDropOnFolder($event, activeFolderId)"
        >
          <div v-if="batchMode && getHeroesForFolder(activeFolderId).length > 0" class="folder-batch-bar">
            <button class="select-all-btn" @click="selectAllInFolder(activeFolderId)">全选/取消</button>
          </div>
          <div class="heroes-grid">
            <div
              v-for="hero in getHeroesForFolder(activeFolderId)"
              :key="hero.id"
              class="hero-card-wrapper"
              :class="{ 'batch-selected': selectedHeroIds.has(hero.id) }"
              draggable="true"
              @dragstart="onDragStartHero($event, hero.id, activeFolderId)"
              @dragend="onDragEndHero"
            >
              <div v-if="batchMode" class="batch-checkbox" @click.stop="toggleHeroSelection(hero.id)">
                <CheckSquare v-if="selectedHeroIds.has(hero.id)" :size="20" />
                <Square v-else :size="20" />
              </div>
              <div v-if="!batchMode" class="drag-handle" title="拖拽移动到其他收藏夹">
                <GripVertical :size="16" />
              </div>
              <HeroCard
                :hero="hero"
                showActions
                @edit="handleEdit"
                @delete="handleDelete"
                @share="handleShare"
              />
            </div>
          </div>
          <div v-if="getHeroesForFolder(activeFolderId).length === 0" class="folder-empty-big">
            <span class="empty-folder-icon">{{ heroStore.getFolderById(activeFolderId)?.icon || '📁' }}</span>
            <p>此收藏夹暂无英雄</p>
            <p class="empty-hint">拖拽英雄到标签页上的此收藏夹，或在生成器中保存英雄到此收藏夹</p>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showManageDialog" class="dialog-overlay" @click.self="showManageDialog = false">
        <div class="manage-dialog">
          <div class="dialog-header manage-header">
            <Settings :size="20" />
            <span>收藏夹管理</span>
            <button class="dialog-close" @click="showManageDialog = false">
              <X :size="18" />
            </button>
          </div>
          <div class="dialog-body">
            <div class="manage-folder-list">
              <div
                v-for="(folder, index) in folders"
                :key="folder.id"
                class="manage-folder-item"
                :style="{ borderLeftColor: folder.color }"
                draggable="true"
                @dragstart="onDragStartFolder($event, index)"
                @dragover.prevent
                @drop="onDropFolder($event, index)"
              >
                <div class="manage-folder-drag">
                  <GripVertical :size="16" />
                </div>

                <template v-if="editingFolderId === folder.id">
                  <div class="edit-folder-form">
                    <div class="edit-form-row">
                      <div class="icon-picker-sm">
                        <button
                          v-for="icon in folderIcons"
                          :key="icon"
                          class="icon-btn-sm"
                          :class="{ active: editFolderIcon === icon }"
                          @click="editFolderIcon = icon"
                        >{{ icon }}</button>
                      </div>
                    </div>
                    <div class="edit-form-row">
                      <input
                        type="text"
                        class="edit-name-input"
                        v-model="editFolderName"
                        @keyup.enter="confirmEditFolder"
                        @keyup.escape="cancelEditFolder"
                      />
                    </div>
                    <div class="edit-form-row">
                      <div class="color-picker-sm">
                        <button
                          v-for="color in folderColors"
                          :key="color"
                          class="color-btn-sm"
                          :class="{ active: editFolderColor === color }"
                          :style="{ background: color }"
                          @click="editFolderColor = color"
                        />
                      </div>
                    </div>
                    <div class="edit-form-actions">
                      <button class="edit-btn cancel" @click="cancelEditFolder">取消</button>
                      <button class="edit-btn save" @click="confirmEditFolder">
                        <Check :size="14" />
                        保存
                      </button>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <span class="manage-folder-icon">{{ folder.icon }}</span>
                  <span class="manage-folder-name">{{ folder.name }}</span>
                  <span class="manage-folder-count">{{ getFolderHeroCount(folder.id) }} 个英雄</span>
                  <div class="manage-folder-actions">
                    <button
                      v-if="folder.id !== 'default'"
                      class="manage-action edit"
                      @click="startEditFolder(folder)"
                      title="重命名"
                    >
                      <Edit3 :size="14" />
                    </button>
                    <button
                      v-if="folder.id !== 'default'"
                      class="manage-action delete"
                      @click="deleteFolder(folder.id)"
                      title="删除"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </template>
              </div>
            </div>

            <button class="add-folder-btn" @click="openCreateDialog(); showManageDialog = false">
              <FolderPlus :size="16" />
              <span>新建收藏夹</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
        <div class="create-dialog">
          <div class="dialog-header create-header">
            <FolderPlus :size="20" />
            <span>新建收藏夹</span>
            <button class="dialog-close" @click="showCreateDialog = false">
              <X :size="18" />
            </button>
          </div>
          <div class="dialog-body">
            <label class="input-label">名称</label>
            <input
              id="create-folder-input"
              type="text"
              class="name-input"
              v-model="newFolderName"
              placeholder="如：正义联盟、反派档案..."
              @keyup.enter="createFolder"
              @keyup.escape="showCreateDialog = false"
            />
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
          <div class="dialog-footer">
            <button class="dialog-btn cancel" @click="showCreateDialog = false">取消</button>
            <button class="dialog-btn confirm" @click="createFolder">
              <Check :size="16" />
              <span>创建</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showMoveDialog" class="dialog-overlay" @click.self="showMoveDialog = false">
        <div class="move-dialog">
          <div class="dialog-header move-header">
            <Move :size="20" />
            <span>移动到收藏夹</span>
            <button class="dialog-close" @click="showMoveDialog = false">
              <X :size="18" />
            </button>
          </div>
          <div class="dialog-body">
            <p class="move-info">将 {{ selectedHeroIds.size }} 个英雄移动到：</p>
            <div class="move-folder-list">
              <div
                v-for="folder in folders"
                :key="folder.id"
                class="move-folder-option"
                :class="{ selected: moveTargetFolderId === folder.id }"
                @click="moveTargetFolderId = folder.id"
              >
                <span class="move-folder-icon">{{ folder.icon }}</span>
                <span class="move-folder-name">{{ folder.name }}</span>
                <span v-if="moveTargetFolderId === folder.id" class="move-check">✓</span>
              </div>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="dialog-btn cancel" @click="showMoveDialog = false">取消</button>
            <button class="dialog-btn confirm" @click="batchMove">
              <Move :size="16" />
              <span>移动</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <BatchExportDialog
      :visible="showBatchExportDialog"
      :heroes="selectedHeroesForExport"
      @close="showBatchExportDialog = false"
    />
  </div>
</template>

<style scoped>
.favorites-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 24px;
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  border: 5px solid #212121;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 8px 8px 0 #212121;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.header-left {
  position: relative;
  z-index: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Bangers', cursive;
  font-size: 42px;
  color: #fafafa;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
  text-shadow: 3px 3px 0 #212121;
}

.page-subtitle {
  font-family: 'Comic Neue', cursive;
  font-size: 16px;
  color: #fafafa;
  margin: 0;
  font-weight: 700;
  opacity: 0.9;
}

.header-right {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.stats-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #fdd835;
  border: 3px solid #212121;
  border-radius: 20px;
  box-shadow: 3px 3px 0 #212121;
}

.stat-icon {
  font-size: 20px;
}

.stat-text {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  color: #212121;
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
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.action-btn.create {
  background: #4caf50;
  color: #fafafa;
}

.action-btn.manage {
  background: #2196f3;
  color: #fafafa;
}

.action-btn.batch {
  background: #ff9800;
  color: #212121;
}

.action-btn.batch.active {
  background: #f57c00;
  color: #fafafa;
}

.action-btn.clear {
  background: #fafafa;
  color: #c62828;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #fff3e0;
  border: 3px solid #ff9800;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 3px 3px 0 #212121;
}

.batch-info {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  color: #e65100;
  letter-spacing: 1px;
}

.batch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  border: 2px solid #212121;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
}

.batch-btn.move {
  background: #2196f3;
  color: #fafafa;
}

.batch-btn.export {
  background: #4caf50;
  color: #fafafa;
}

.batch-btn.delete {
  background: #e53935;
  color: #fafafa;
}

.batch-btn:hover {
  transform: translateY(-1px);
  box-shadow: 3px 3px 0 #212121;
}

.storage-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 3px 3px 0 #212121;
}

.storage-bar {
  flex: 1;
  height: 12px;
  background: #e0e0e0;
  border: 2px solid #212121;
  border-radius: 6px;
  overflow: hidden;
  max-width: 300px;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #fdd835, #e53935);
  transition: width 0.5s ease;
}

.storage-text {
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fafafa;
  border: 5px dashed #bdbdbd;
  border-radius: 16px;
}

.empty-icon {
  color: #e0e0e0;
  margin-bottom: 24px;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.empty-title {
  font-family: 'Bangers', cursive;
  font-size: 32px;
  color: #757575;
  margin: 0 0 12px 0;
  letter-spacing: 2px;
}

.empty-desc {
  font-family: 'Comic Neue', cursive;
  font-size: 18px;
  color: #9e9e9e;
  margin: 0 0 32px 0;
  font-weight: 700;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  font-family: 'Bangers', cursive;
  font-size: 20px;
  letter-spacing: 2px;
  border: 4px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 4px 4px 0 #212121;
}

.cta-btn:hover {
  transform: translateY(-4px);
  box-shadow: 8px 8px 0 #212121;
}

.cta-btn.primary {
  background: #fdd835;
  color: #212121;
}

.folder-tabs {
  display: flex;
  gap: 6px;
  padding: 8px;
  background: #212121;
  border: 4px solid #212121;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  flex-wrap: nowrap;
}

.folder-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #424242;
  border: 3px solid transparent;
  border-radius: 8px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #bdbdbd;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}

.folder-tab:hover {
  background: #616161;
  color: #fafafa;
}

.folder-tab.active {
  background: var(--folder-color, #fdd835);
  border-color: #fafafa;
  color: #212121;
  box-shadow: 0 0 0 2px #fafafa inset;
}

.tab-icon {
  font-size: 16px;
  line-height: 1;
}

.tab-count {
  padding: 1px 8px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
  font-family: 'Bangers', cursive;
  font-size: 12px;
  letter-spacing: 1px;
}

.folder-tab.active .tab-count {
  background: rgba(0,0,0,0.2);
}

.add-tab {
  background: transparent;
  border: 3px dashed #616161;
  color: #9e9e9e;
  padding: 10px 14px;
}

.add-tab:hover {
  border-color: #4caf50;
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.drop-indicator {
  position: absolute;
  right: 4px;
  top: -4px;
  font-size: 16px;
  color: #4caf50;
  animation: bounce-down 0.5s ease infinite;
}

@keyframes bounce-down {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

.folder-section {
  margin-bottom: 16px;
}

.folder-header-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fafafa;
  border: 3px solid #e0e0e0;
  border-left: 6px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.folder-header-bar:hover {
  background: #f5f5f5;
  border-color: #bdbdbd;
  border-left-color: inherit;
}

.expand-icon {
  color: #757575;
  flex-shrink: 0;
}

.folder-section-icon {
  font-size: 20px;
  line-height: 1;
}

.folder-section-name {
  font-family: 'Bangers', cursive;
  font-size: 18px;
  letter-spacing: 1px;
  color: #212121;
  flex: 1;
}

.folder-section-count {
  padding: 2px 10px;
  background: #e0e0e0;
  border-radius: 12px;
  font-family: 'Bangers', cursive;
  font-size: 13px;
  color: #616161;
}

.select-all-btn {
  padding: 4px 12px;
  background: #e3f2fd;
  border: 2px solid #2196f3;
  border-radius: 4px;
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  font-weight: 700;
  color: #1565c0;
  cursor: pointer;
  transition: all 0.2s;
}

.select-all-btn:hover {
  background: #bbdefb;
}

.folder-heroes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding-left: 24px;
}

.hero-card-wrapper {
  position: relative;
  border-radius: 12px;
  transition: all 0.2s;
}

.hero-card-wrapper.batch-selected {
  outline: 3px solid #ff9800;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #212121;
}

.batch-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  cursor: pointer;
  color: #ff9800;
  background: #fafafa;
  border-radius: 4px;
  padding: 2px;
}

.drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  cursor: grab;
  color: #9e9e9e;
  background: rgba(250, 250, 250, 0.8);
  border-radius: 4px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.hero-card-wrapper:hover .drag-handle {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.folder-empty {
  padding: 24px;
  text-align: center;
  color: #9e9e9e;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  grid-column: 1 / -1;
}

.folder-empty-big {
  padding: 60px 20px;
  text-align: center;
}

.empty-folder-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.folder-empty-big p {
  font-family: 'Bangers', cursive;
  font-size: 20px;
  color: #757575;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.empty-hint {
  font-family: 'Comic Neue', cursive !important;
  font-size: 14px !important;
  color: #9e9e9e !important;
  font-weight: 700;
}

.heroes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.folder-drop-zone {
  min-height: 200px;
  border: 3px dashed transparent;
  border-radius: 12px;
  padding: 8px;
  transition: all 0.2s;
}

.folder-drop-zone.drag-active {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.folder-batch-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
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

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
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
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: #fafafa;
}

.dialog-btn:hover {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
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
  margin-bottom: 16px;
}

.name-input:focus {
  border-color: #4caf50;
}

.manage-dialog {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  width: 90%;
  max-width: 560px;
  box-shadow: 8px 8px 0 #212121;
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.manage-header {
  background: linear-gradient(135deg, #2196f3, #1565c0);
}

.manage-dialog .dialog-body {
  overflow-y: auto;
  flex: 1;
}

.manage-folder-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.manage-folder-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fafafa;
  border: 3px solid #e0e0e0;
  border-left: 6px solid;
  border-radius: 8px;
  transition: all 0.2s;
}

.manage-folder-item:hover {
  border-color: #bdbdbd;
  border-left-color: inherit;
}

.manage-folder-drag {
  cursor: grab;
  color: #bdbdbd;
  display: flex;
  align-items: center;
}

.manage-folder-drag:active {
  cursor: grabbing;
}

.manage-folder-icon {
  font-size: 22px;
  line-height: 1;
}

.manage-folder-name {
  flex: 1;
  font-family: 'Comic Neue', cursive;
  font-size: 15px;
  font-weight: 700;
  color: #212121;
}

.manage-folder-count {
  font-family: 'Roboto Slab', serif;
  font-size: 12px;
  color: #9e9e9e;
  font-weight: 700;
}

.manage-folder-actions {
  display: flex;
  gap: 6px;
}

.manage-action {
  width: 30px;
  height: 30px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.manage-action.edit {
  color: #2196f3;
}

.manage-action.edit:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.manage-action.delete {
  color: #e53935;
}

.manage-action.delete:hover {
  background: #ffebee;
  border-color: #e53935;
}

.edit-folder-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-form-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.edit-name-input {
  flex: 1;
  padding: 8px 10px;
  border: 2px solid #2196f3;
  border-radius: 4px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  outline: none;
  min-width: 120px;
}

.icon-picker-sm, .color-picker-sm {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.icon-btn-sm {
  width: 28px;
  height: 28px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.icon-btn-sm.active {
  border-color: #2196f3;
  background: #e3f2fd;
}

.color-btn-sm {
  width: 24px;
  height: 24px;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s;
}

.color-btn-sm.active {
  border-color: #212121;
  box-shadow: 1px 1px 0 #212121;
}

.edit-form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 2px solid #212121;
  border-radius: 4px;
  font-family: 'Bangers', cursive;
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn.cancel {
  background: #fafafa;
  color: #424242;
}

.edit-btn.save {
  background: #4caf50;
  color: #fafafa;
}

.add-folder-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
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
}

.add-folder-btn:hover {
  border-color: #4caf50;
  color: #4caf50;
  background: #e8f5e9;
}

.create-dialog {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 8px 8px 0 #212121;
  overflow: hidden;
}

.create-header {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
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

.move-dialog {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 8px 8px 0 #212121;
  overflow: hidden;
}

.move-header {
  background: linear-gradient(135deg, #ff9800, #e65100);
}

.move-info {
  font-family: 'Comic Neue', cursive;
  font-size: 15px;
  font-weight: 700;
  color: #424242;
  margin: 0 0 12px 0;
}

.move-folder-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.move-folder-option {
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

.move-folder-option:hover {
  border-color: #ff9800;
  background: #fff3e0;
}

.move-folder-option.selected {
  border-color: #ff9800;
  background: #fff3e0;
  box-shadow: 2px 2px 0 #ff9800;
}

.move-folder-icon {
  font-size: 22px;
  line-height: 1;
}

.move-folder-name {
  flex: 1;
  font-family: 'Comic Neue', cursive;
  font-size: 15px;
  font-weight: 700;
  color: #212121;
}

.move-check {
  color: #ff9800;
  font-weight: 700;
  font-size: 18px;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .storage-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .storage-bar {
    width: 100%;
    max-width: none;
  }
  
  .folder-heroes {
    grid-template-columns: 1fr;
    padding-left: 12px;
  }
  
  .heroes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .favorites-page {
    padding: 12px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .folder-tabs {
    padding: 6px;
    gap: 4px;
  }
  
  .folder-tab {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .tab-label {
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
