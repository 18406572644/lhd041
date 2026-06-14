<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  Network, Plus, Trash2, Download, Filter, Layout, Circle, GitBranch,
  Atom, Search, X, Check, Edit3, Eye, ZoomIn, ZoomOut, Maximize, UserPlus,
  Users, Link2
} from 'lucide-vue-next';
import { useHeroStore, RELATION_TYPES } from '../stores/hero';
import { useUiStore } from '../stores/ui';
import type { Hero, RelationType, HeroRelation, LayoutMode, GraphNode, GraphEdge } from '../types';

const router = useRouter();
const heroStore = useHeroStore();
const uiStore = useUiStore();

const savedHeroes = computed(() => heroStore.savedHeroes);
const allRelations = computed(() => heroStore.relations);

const svgContainerRef = ref<HTMLDivElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);
const exportCanvasRef = ref<HTMLCanvasElement | null>(null);

const containerSize = ref({ width: 800, height: 600 });

const transform = ref({ x: 0, y: 0, scale: 1 });
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });

const nodes = ref<GraphNode[]>([]);
const edges = ref<GraphEdge[]>([]);

const selectedNodeId = ref<string | null>(null);
const selectedEdgeId = ref<string | null>(null);
const highlightedNodeIds = ref<Set<string>>(new Set());
const highlightedEdgeIds = ref<Set<string>>(new Set());

const activeFilterTypes = ref<Set<RelationType>>(new Set(RELATION_TYPES.map(r => r.id)));
const layoutMode = ref<LayoutMode>('force');
const forceRunning = ref(false);

const showRelationDialog = ref(false);
const relationDialogMode = ref<'create' | 'edit'>('create');
const editingRelationId = ref<string | null>(null);
const dialogSourceId = ref('');
const dialogTargetId = ref('');
const dialogRelationType = ref<RelationType>('ally');
const dialogDescription = ref('');

const showEdgeDetailDialog = ref(false);
const detailEdge = ref<GraphEdge | null>(null);

const searchQuery = ref('');

const searchFilteredHeroes = computed(() => {
  if (!searchQuery.value.trim()) return savedHeroes.value;
  const q = searchQuery.value.toLowerCase();
  return savedHeroes.value.filter(h =>
    h.name.toLowerCase().includes(q) ||
    h.alias.toLowerCase().includes(q)
  );
});

const availableHeroesForTarget = computed(() => {
  if (!dialogSourceId.value) return [];
  return searchFilteredHeroes.value.filter(h => h.id !== dialogSourceId.value);
});

const getRelationConfig = (type: RelationType) => {
  return RELATION_TYPES.find(r => r.id === type) || RELATION_TYPES[0];
};

const filteredEdges = computed(() => {
  return edges.value.filter(e => activeFilterTypes.value.has(e.type));
});

function initNodesAndEdges() {
  const heroes = savedHeroes.value;
  const width = containerSize.value.width;
  const height = containerSize.value.height;

  const nodeMap = new Map<string, GraphNode>();
  heroes.forEach((hero, i) => {
    const existing = nodes.value.find(n => n.id === hero.id);
    const angle = (i / Math.max(heroes.length, 1)) * 2 * Math.PI;
    const radius = Math.min(width, height) * 0.35;
    nodeMap.set(hero.id, {
      id: hero.id,
      hero: hero,
      x: existing?.x ?? (width / 2 + Math.cos(angle) * radius),
      y: existing?.y ?? (height / 2 + Math.sin(angle) * radius),
      vx: 0,
      vy: 0,
      fx: existing?.fx ?? null,
      fy: existing?.fy ?? null
    });
  });
  nodes.value = Array.from(nodeMap.values());

  const validNodeIds = new Set(nodes.value.map(n => n.id));
  const edgeMap = new Map<string, GraphEdge>();
  allRelations.value.forEach((rel: HeroRelation) => {
    if (!validNodeIds.has(rel.sourceId) || !validNodeIds.has(rel.targetId)) return;
    const edgeId = rel.id;
    if (!edgeMap.has(edgeId)) {
      const source = nodeMap.get(rel.sourceId)!;
      const target = nodeMap.get(rel.targetId)!;
      edgeMap.set(edgeId, {
        id: edgeId,
        source,
        target,
        sourceId: rel.sourceId,
        targetId: rel.targetId,
        type: rel.type,
        description: rel.description
      });
    }
  });
  edges.value = Array.from(edgeMap.values());
}

function applyCircleLayout() {
  const width = containerSize.value.width;
  const height = containerSize.value.height;
  const n = nodes.value.length;
  if (n === 0) return;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  nodes.value.forEach((node, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    node.x = centerX + Math.cos(angle) * radius;
    node.y = centerY + Math.sin(angle) * radius;
    node.vx = 0;
    node.vy = 0;
    node.fx = null;
    node.fy = null;
  });
}

function applyTreeLayout() {
  const width = containerSize.value.width;
  const height = containerSize.value.height;
  const n = nodes.value.length;
  if (n === 0) return;

  if (n <= 1) {
    nodes.value[0].x = width / 2;
    nodes.value[0].y = height / 2;
    return;
  }

  const nodeDegree = new Map<string, number>();
  nodes.value.forEach(n => nodeDegree.set(n.id, 0));
  filteredEdges.value.forEach(e => {
    nodeDegree.set(e.sourceId, (nodeDegree.get(e.sourceId) || 0) + 1);
    nodeDegree.set(e.targetId, (nodeDegree.get(e.targetId) || 0) + 1);
  });

  let rootId = nodes.value[0].id;
  let maxDeg = -1;
  nodeDegree.forEach((deg, id) => {
    if (deg > maxDeg) {
      maxDeg = deg;
      rootId = id;
    }
  });

  const visited = new Set<string>();
  const levels: string[][] = [[rootId]];
  visited.add(rootId);
  const parentMap = new Map<string, string>();

  let currentLevel = [rootId];
  while (currentLevel.length > 0) {
    const nextLevel: string[] = [];
    currentLevel.forEach(nodeId => {
      const neighbors: string[] = [];
      filteredEdges.value.forEach(e => {
        if (e.sourceId === nodeId && !visited.has(e.targetId)) {
          neighbors.push(e.targetId);
        } else if (e.targetId === nodeId && !visited.has(e.sourceId)) {
          neighbors.push(e.sourceId);
        }
      });
      neighbors.forEach(nid => {
        if (!visited.has(nid)) {
          visited.add(nid);
          parentMap.set(nid, nodeId);
          nextLevel.push(nid);
        }
      });
    });
    if (nextLevel.length > 0) {
      levels.push(nextLevel);
    }
    currentLevel = nextLevel;
  }

  const remaining = nodes.value.filter(n => !visited.has(n.id));
  if (remaining.length > 0) {
    levels.push(remaining.map(n => n.id));
    remaining.forEach(n => visited.add(n.id));
  }

  const levelGap = height / (levels.length + 1);
  const leftPadding = width * 0.1;
  const usableWidth = width * 0.8;

  levels.forEach((levelNodes, levelIdx) => {
    const y = levelGap * (levelIdx + 1);
    const xStep = usableWidth / Math.max(levelNodes.length, 1);
    levelNodes.forEach((nodeId, i) => {
      const node = nodes.value.find(n => n.id === nodeId);
      if (node) {
        const parentId = parentMap.get(nodeId);
        if (parentId) {
          const parent = nodes.value.find(n => n.id === parentId);
          if (parent) {
            node.x = parent.x + (i - (levelNodes.length - 1) / 2) * 80;
            node.x = Math.max(leftPadding + 40, Math.min(width - leftPadding - 40, node.x));
          } else {
            node.x = leftPadding + xStep * (i + 0.5);
          }
        } else {
          node.x = leftPadding + xStep * (i + 0.5);
        }
        node.y = y;
        node.vx = 0;
        node.vy = 0;
        node.fx = null;
        node.fy = null;
      }
    });
  });
}

let forceAnimationId: number | null = null;

function startForceSimulation() {
  if (nodes.value.length < 2) return;
  forceRunning.value = true;

  const width = containerSize.value.width;
  const height = containerSize.value.height;
  const nodeMap = new Map(nodes.value.map(n => [n.id, n]));

  const iterations = 200;
  let iter = 0;

  const tick = () => {
    if (iter >= iterations) {
      forceRunning.value = false;
      forceAnimationId = null;
      return;
    }
    iter++;

    const repulsionStrength = 6000;
    const attractionStrength = 0.008;
    const centerStrength = 0.01;
    const damping = 0.85;

    nodes.value.forEach(n => {
      n.vx = 0;
      n.vy = 0;
    });

    for (let i = 0; i < nodes.value.length; i++) {
      for (let j = i + 1; j < nodes.value.length; j++) {
        const a = nodes.value[i];
        const b = nodes.value[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) {
          dist = 1;
          dx = Math.random() * 2 - 1;
          dy = Math.random() * 2 - 1;
        }
        const force = repulsionStrength / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    filteredEdges.value.forEach(edge => {
      const a = edge.source;
      const b = edge.target;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const targetDist = 160;
      const diff = dist - targetDist;
      if (dist > 0) {
        const fx = (dx / dist) * diff * attractionStrength;
        const fy = (dy / dist) * diff * attractionStrength;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    });

    const centerX = width / 2;
    const centerY = height / 2;
    nodes.value.forEach(n => {
      n.vx += (centerX - n.x) * centerStrength;
      n.vy += (centerY - n.y) * centerStrength;
    });

    const padding = 60;
    nodes.value.forEach(n => {
      if (n.fx !== null && n.fy !== null) {
        n.x = n.fx;
        n.y = n.fy;
        return;
      }
      n.vx *= damping;
      n.vy *= damping;
      const maxVel = 50;
      const vel = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (vel > maxVel) {
        n.vx = (n.vx / vel) * maxVel;
        n.vy = (n.vy / vel) * maxVel;
      }
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(padding, Math.min(width - padding, n.x));
      n.y = Math.max(padding, Math.min(height - padding, n.y));
    });

    forceAnimationId = requestAnimationFrame(tick);
  };

  if (forceAnimationId !== null) {
    cancelAnimationFrame(forceAnimationId);
  }
  tick();
}

function applyLayout(mode: LayoutMode) {
  layoutMode.value = mode;
  if (forceAnimationId !== null) {
    cancelAnimationFrame(forceAnimationId);
    forceAnimationId = null;
    forceRunning.value = false;
  }
  if (mode === 'circle') {
    applyCircleLayout();
  } else if (mode === 'tree') {
    applyTreeLayout();
  } else if (mode === 'force') {
    startForceSimulation();
  }
}

function toggleFilter(type: RelationType) {
  if (activeFilterTypes.value.has(type)) {
    activeFilterTypes.value.delete(type);
  } else {
    activeFilterTypes.value.add(type);
  }
  activeFilterTypes.value = new Set(activeFilterTypes.value);
}

function setAllFilter(enabled: boolean) {
  if (enabled) {
    activeFilterTypes.value = new Set(RELATION_TYPES.map(r => r.id));
  } else {
    activeFilterTypes.value = new Set();
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  const delta = -e.deltaY * 0.001;
  const newScale = Math.max(0.3, Math.min(3, transform.value.scale * (1 + delta)));
  const rect = svgContainerRef.value?.getBoundingClientRect();
  if (rect) {
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleRatio = newScale / transform.value.scale;
    transform.value.x = mouseX - (mouseX - transform.value.x) * scaleRatio;
    transform.value.y = mouseY - (mouseY - transform.value.y) * scaleRatio;
  }
  transform.value.scale = newScale;
}

function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return;
  const target = e.target as HTMLElement;
  if (target.closest('[data-node]') || target.closest('[data-edge]')) return;
  isPanning.value = true;
  panStart.value = { x: e.clientX - transform.value.x, y: e.clientY - transform.value.y };
}

function onMouseMove(e: MouseEvent) {
  if (!isPanning.value) return;
  transform.value.x = e.clientX - panStart.value.x;
  transform.value.y = e.clientY - panStart.value.y;
}

function onMouseUp() {
  isPanning.value = false;
}

let dragNode: GraphNode | null = null;
let dragOffset = { x: 0, y: 0 };

function onNodeMouseDown(e: MouseEvent, node: GraphNode) {
  e.stopPropagation();
  dragNode = node;
  const worldX = (e.clientX - (svgContainerRef.value?.getBoundingClientRect().left || 0) - transform.value.x) / transform.value.scale;
  const worldY = (e.clientY - (svgContainerRef.value?.getBoundingClientRect().top || 0) - transform.value.y) / transform.value.scale;
  dragOffset.x = worldX - node.x;
  dragOffset.y = worldY - node.y;
  node.fx = node.x;
  node.fy = node.y;
  window.addEventListener('mousemove', onNodeDragMove);
  window.addEventListener('mouseup', onNodeDragEnd);
}

function onNodeDragMove(e: MouseEvent) {
  if (!dragNode) return;
  const worldX = (e.clientX - (svgContainerRef.value?.getBoundingClientRect().left || 0) - transform.value.x) / transform.value.scale;
  const worldY = (e.clientY - (svgContainerRef.value?.getBoundingClientRect().top || 0) - transform.value.y) / transform.value.scale;
  dragNode.x = worldX - dragOffset.x;
  dragNode.y = worldY - dragOffset.y;
  dragNode.fx = dragNode.x;
  dragNode.fy = dragNode.y;
}

function onNodeDragEnd() {
  if (dragNode) {
    dragNode.fx = null;
    dragNode.fy = null;
  }
  dragNode = null;
  window.removeEventListener('mousemove', onNodeDragMove);
  window.removeEventListener('mouseup', onNodeDragEnd);
}

function onNodeClick(node: GraphNode) {
  if (selectedNodeId.value === node.id) {
    selectedNodeId.value = null;
    highlightedNodeIds.value = new Set();
    highlightedEdgeIds.value = new Set();
    return;
  }
  selectedNodeId.value = node.id;
  selectedEdgeId.value = null;

  const neighbors = new Set<string>([node.id]);
  const neighborEdges = new Set<string>();
  filteredEdges.value.forEach(e => {
    if (e.sourceId === node.id || e.targetId === node.id) {
      neighbors.add(e.sourceId);
      neighbors.add(e.targetId);
      neighborEdges.add(e.id);
    }
  });
  highlightedNodeIds.value = neighbors;
  highlightedEdgeIds.value = neighborEdges;
}

function onEdgeClick(edge: GraphEdge) {
  selectedEdgeId.value = edge.id;
  detailEdge.value = edge;
  showEdgeDetailDialog.value = true;
  selectedNodeId.value = null;
  highlightedNodeIds.value = new Set([edge.sourceId, edge.targetId]);
  highlightedEdgeIds.value = new Set([edge.id]);
}

function resetView() {
  transform.value = { x: 0, y: 0, scale: 1 };
}

function zoomIn() {
  transform.value.scale = Math.min(3, transform.value.scale * 1.2);
}

function zoomOut() {
  transform.value.scale = Math.max(0.3, transform.value.scale / 1.2);
}

function openCreateRelationDialog(sourceId?: string, targetId?: string) {
  if (savedHeroes.value.length < 2) {
    uiStore.showWarning('至少需要2个角色才能创建关系');
    return;
  }
  relationDialogMode.value = 'create';
  editingRelationId.value = null;
  dialogSourceId.value = sourceId || savedHeroes.value[0]?.id || '';
  dialogTargetId.value = targetId || (savedHeroes.value.find(h => h.id !== dialogSourceId.value)?.id || '');
  dialogRelationType.value = 'ally';
  dialogDescription.value = '';
  searchQuery.value = '';
  showRelationDialog.value = true;
}

function openEditRelationDialog(edge: GraphEdge) {
  const rel = heroStore.getRelationById(edge.id);
  if (!rel) return;
  relationDialogMode.value = 'edit';
  editingRelationId.value = rel.id;
  dialogSourceId.value = rel.sourceId;
  dialogTargetId.value = rel.targetId;
  dialogRelationType.value = rel.type;
  dialogDescription.value = rel.description;
  searchQuery.value = '';
  showRelationDialog.value = true;
  showEdgeDetailDialog.value = false;
}

function submitRelationDialog() {
  if (!dialogSourceId.value || !dialogTargetId.value) {
    uiStore.showWarning('请选择两个角色');
    return;
  }
  if (dialogSourceId.value === dialogTargetId.value) {
    uiStore.showWarning('不能选择同一个角色');
    return;
  }

  if (relationDialogMode.value === 'create') {
    const existing = heroStore.getRelationBetween(dialogSourceId.value, dialogTargetId.value);
    if (existing) {
      uiStore.showWarning('这两个角色之间已存在关系，请先删除现有关系');
      return;
    }
    const result = heroStore.addRelation(dialogSourceId.value, dialogTargetId.value, dialogRelationType.value, dialogDescription.value);
    if (result) {
      uiStore.showSuccess('关系已创建');
      initNodesAndEdges();
      applyLayout(layoutMode.value);
    } else {
      uiStore.showError('创建失败');
    }
  } else if (editingRelationId.value) {
    const result = heroStore.updateRelation(editingRelationId.value, {
      type: dialogRelationType.value,
      description: dialogDescription.value
    });
    if (result) {
      uiStore.showSuccess('关系已更新');
      initNodesAndEdges();
    } else {
      uiStore.showError('更新失败');
    }
  }

  showRelationDialog.value = false;
}

function deleteEdgeRelation(edgeId: string) {
  const sourceHero = heroStore.getSavedHeroById(edges.value.find(e => e.id === edgeId)?.sourceId || '');
  const targetHero = heroStore.getSavedHeroById(edges.value.find(e => e.id === edgeId)?.targetId || '');
  if (confirm(`确定要删除「${sourceHero?.name || ''}」和「${targetHero?.name || ''}」之间的关系吗？`)) {
    if (heroStore.removeRelation(edgeId)) {
      uiStore.showSuccess('关系已删除');
      initNodesAndEdges();
      showEdgeDetailDialog.value = false;
      detailEdge.value = null;
      selectedEdgeId.value = null;
    }
  }
}

function exportAsImage() {
  const svg = svgRef.value;
  if (!svg) {
    uiStore.showError('图谱未就绪');
    return;
  }
  if (nodes.value.length === 0) {
    uiStore.showWarning('没有可导出的内容');
    return;
  }

  try {
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      const rect = svg.getBoundingClientRect();
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `hero-universe-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        uiStore.showSuccess('图谱已导出为图片');
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      uiStore.showError('导出失败，请重试');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  } catch (e) {
    console.error('Export error:', e);
    uiStore.showError('导出失败');
  }
}

function goToGenerator() {
  router.push('/generator');
}

function resizeObserver() {
  if (!svgContainerRef.value) return;
  const rect = svgContainerRef.value.getBoundingClientRect();
  containerSize.value = { width: rect.width, height: rect.height };
}

onMounted(() => {
  resizeObserver();
  window.addEventListener('resize', resizeObserver);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  nextTick(() => {
    initNodesAndEdges();
    applyLayout(layoutMode.value);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeObserver);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  if (forceAnimationId !== null) {
    cancelAnimationFrame(forceAnimationId);
  }
});

watch([savedHeroes, allRelations], () => {
  initNodesAndEdges();
  if (!forceRunning.value) {
    if (layoutMode.value === 'circle') applyCircleLayout();
    else if (layoutMode.value === 'tree') applyTreeLayout();
  }
}, { deep: true });

function getHeroPortrait(hero: Hero) {
  const colors = hero.appearance.portrait;
  const primary = colors?.costume?.primaryColor || '#2196f3';
  return primary;
}
</script>

<template>
  <div class="universe-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <Network :size="32" fill="#fdd835" />
          <span>角色宇宙</span>
        </h1>
        <p class="page-subtitle">探索你创造的超级英雄之间的关系网络</p>
      </div>
      <div class="header-right">
        <div class="stats-badge">
          <span class="stat-icon">🦸</span>
          <span class="stat-text">{{ savedHeroes.length }} 个角色</span>
        </div>
        <div class="stats-badge edge">
          <span class="stat-icon">🔗</span>
          <span class="stat-text">{{ allRelations.length }} 条关系</span>
        </div>
        <button class="action-btn create" @click="() => openCreateRelationDialog()">
          <Link2 :size="18" />
          <span>创建关系</span>
        </button>
      </div>
    </div>

    <div class="universe-content">
      <div class="toolbar">
        <div class="toolbar-section">
          <span class="toolbar-label">
            <Layout :size="16" />
            布局
          </span>
          <div class="layout-btns">
            <button
              class="tool-btn"
              :class="{ active: layoutMode === 'force' }"
              :disabled="nodes.length < 2"
              @click="applyLayout('force')"
              title="力导向布局"
            >
              <Atom :size="16" />
              <span>力导向</span>
            </button>
            <button
              class="tool-btn"
              :class="{ active: layoutMode === 'circle' }"
              @click="applyLayout('circle')"
              title="圆形布局"
            >
              <Circle :size="16" />
              <span>圆形</span>
            </button>
            <button
              class="tool-btn"
              :class="{ active: layoutMode === 'tree' }"
              @click="applyLayout('tree')"
              title="树形布局"
            >
              <GitBranch :size="16" />
              <span>树形</span>
            </button>
          </div>
        </div>

        <div class="toolbar-divider" />

        <div class="toolbar-section">
          <span class="toolbar-label">
            <Filter :size="16" />
            关系类型
          </span>
          <div class="filter-all-btns">
            <button class="mini-btn" @click="setAllFilter(true)">全选</button>
            <button class="mini-btn" @click="setAllFilter(false)">清空</button>
          </div>
          <div class="filter-chips">
            <button
              v-for="rt in RELATION_TYPES"
              :key="rt.id"
              class="filter-chip"
              :class="{ active: activeFilterTypes.has(rt.id) }"
              :style="{ '--chip-color': rt.color }"
              @click="toggleFilter(rt.id)"
            >
              <span class="chip-icon">{{ rt.icon }}</span>
              <span class="chip-label">{{ rt.label }}</span>
            </button>
          </div>
        </div>

        <div class="toolbar-divider" />

        <div class="toolbar-section">
          <span class="toolbar-label">视图</span>
          <div class="view-btns">
            <button class="tool-btn view" @click="zoomIn" title="放大">
              <ZoomIn :size="16" />
            </button>
            <button class="tool-btn view" @click="zoomOut" title="缩小">
              <ZoomOut :size="16" />
            </button>
            <button class="tool-btn view" @click="resetView" title="重置视图">
              <Maximize :size="16" />
            </button>
          </div>
        </div>

        <div class="toolbar-divider" />

        <div class="toolbar-section">
          <button class="tool-btn export" @click="exportAsImage" title="导出为图片">
            <Download :size="16" />
            <span>导出图片</span>
          </button>
        </div>
      </div>

      <div v-if="savedHeroes.length === 0" class="empty-state">
        <div class="empty-icon">
          <Users :size="80" />
        </div>
        <h2 class="empty-title">还没有角色</h2>
        <p class="empty-desc">先创建一些超级英雄，然后回来构建你的角色宇宙！</p>
        <button class="cta-btn primary" @click="goToGenerator">
          <Plus :size="24" />
          <span>开始创建</span>
        </button>
      </div>

      <div v-else-if="nodes.length === 1 && allRelations.length === 0" class="empty-state">
        <div class="empty-icon">
          <UserPlus :size="80" />
        </div>
        <h2 class="empty-title">只有一个角色</h2>
        <p class="empty-desc">创建更多角色，然后为他们之间设定关系吧！</p>
        <div class="empty-actions">
          <button class="cta-btn primary" @click="goToGenerator">
            <Plus :size="20" />
            <span>创建更多角色</span>
          </button>
          <button class="cta-btn secondary" @click="() => openCreateRelationDialog()" :disabled="savedHeroes.length < 2">
            <Link2 :size="20" />
            <span>创建关系</span>
          </button>
        </div>
      </div>

      <div v-else class="graph-container" ref="svgContainerRef">
        <svg
          ref="svgRef"
          class="graph-svg"
          :viewBox="`0 0 ${containerSize.width} ${containerSize.height}`"
          :preserveAspectRatio="'xMidYMid meet'"
          @wheel.passive="onWheel"
          @mousedown="onMouseDown"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" stroke-width="0.5" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3" />
            </filter>
            <marker
              v-for="rt in RELATION_TYPES"
              :key="'marker-' + rt.id"
              :id="'arrow-' + rt.id"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" :fill="rt.color" />
            </marker>
          </defs>

          <g
            :transform="`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`"
            :class="{ 'cursor-grabbing': isPanning, 'cursor-grab': !isPanning }"
          >
            <rect
              :x="-10000"
              :y="-10000"
              :width="20000"
              :height="20000"
              fill="url(#grid)"
            />

            <g class="edges-layer">
              <g
                v-for="edge in filteredEdges"
                :key="'edge-group-' + edge.id"
                data-edge
                class="edge-group"
                :class="{
                  highlighted: highlightedEdgeIds.has(edge.id),
                  dimmed: highlightedEdgeIds.size > 0 && !highlightedEdgeIds.has(edge.id),
                  selected: selectedEdgeId === edge.id
                }"
                @click="onEdgeClick(edge)"
              >
                <line
                  :x1="edge.source.x"
                  :y1="edge.source.y"
                  :x2="edge.target.x"
                  :y2="edge.target.y"
                  :stroke="getRelationConfig(edge.type).color"
                  :stroke-width="selectedEdgeId === edge.id ? 5 : 3"
                  :stroke-opacity="highlightedEdgeIds.size > 0 && !highlightedEdgeIds.has(edge.id) ? 0.15 : (selectedEdgeId === edge.id ? 1 : 0.7)"
                  stroke-linecap="round"
                  class="edge-line"
                  :marker-end="`url(#arrow-${edge.type})`"
                />
                <line
                  :x1="edge.source.x"
                  :y1="edge.source.y"
                  :x2="edge.target.x"
                  :y2="edge.target.y"
                  stroke="transparent"
                  stroke-width="20"
                  class="edge-hit-area"
                />
                <g
                  class="edge-label-group"
                  :transform="`translate(${(edge.source.x + edge.target.x) / 2}, ${(edge.source.y + edge.target.y) / 2})`"
                >
                  <circle
                    r="18"
                    fill="#fafafa"
                    :stroke="getRelationConfig(edge.type).color"
                    stroke-width="2"
                    :opacity="highlightedEdgeIds.size > 0 && !highlightedEdgeIds.has(edge.id) ? 0.3 : 1"
                  />
                  <text
                    text-anchor="middle"
                    dominant-baseline="central"
                    font-size="16"
                    class="edge-icon"
                  >{{ getRelationConfig(edge.type).icon }}</text>
                </g>
              </g>
            </g>

            <g class="nodes-layer">
              <g
                v-for="node in nodes"
                :key="'node-group-' + node.id"
                data-node
                class="node-group"
                :transform="`translate(${node.x}, ${node.y})`"
                :class="{
                  highlighted: highlightedNodeIds.has(node.id),
                  dimmed: highlightedNodeIds.size > 0 && !highlightedNodeIds.has(node.id),
                  selected: selectedNodeId === node.id
                }"
                @mousedown="onNodeMouseDown($event, node)"
                @click="onNodeClick(node)"
              >
                <circle
                  r="42"
                  :fill="selectedNodeId === node.id ? '#fdd835' : '#212121'"
                  :stroke="getHeroPortrait(node.hero)"
                  stroke-width="4"
                  :opacity="highlightedNodeIds.size > 0 && !highlightedNodeIds.has(node.id) ? 0.25 : 1"
                  :filter="selectedNodeId === node.id ? 'url(#glow)' : 'url(#shadow)'"
                  class="node-outer-ring"
                />
                <circle
                  r="34"
                  :fill="getHeroPortrait(node.hero)"
                  stroke="#fafafa"
                  stroke-width="3"
                  :opacity="highlightedNodeIds.size > 0 && !highlightedNodeIds.has(node.id) ? 0.25 : 1"
                  class="node-portrait"
                />
                <text
                  text-anchor="middle"
                  dominant-baseline="central"
                  font-size="22"
                  :opacity="highlightedNodeIds.size > 0 && !highlightedNodeIds.has(node.id) ? 0.25 : 1"
                  class="node-emoji"
                >🦸</text>
                <g class="node-label-group">
                  <rect
                    x="-70"
                    y="50"
                    width="140"
                    height="28"
                    rx="6"
                    :fill="highlightedNodeIds.size > 0 && !highlightedNodeIds.has(node.id) ? 'rgba(33,33,33,0.15)' : 'rgba(33,33,33,0.9)'"
                  />
                  <text
                    x="0"
                    y="68"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size="12"
                    font-weight="700"
                    fill="#fafafa"
                    :opacity="highlightedNodeIds.size > 0 && !highlightedNodeIds.has(node.id) ? 0.3 : 1"
                    class="node-label"
                  >{{ node.hero.name.length > 10 ? node.hero.name.slice(0, 9) + '…' : node.hero.name }}</text>
                </g>
                <circle
                  v-if="selectedNodeId === node.id"
                  r="48"
                  fill="none"
                  stroke="#fdd835"
                  stroke-width="3"
                  stroke-dasharray="6 4"
                  class="node-selection-ring"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </g>
          </g>
        </svg>

        <div v-if="forceRunning" class="force-indicator">
          <Atom :size="16" class="spin-icon" />
          <span>力导向布局计算中...</span>
        </div>

        <div class="zoom-indicator">
          缩放: {{ Math.round(transform.scale * 100) }}%
        </div>

        <div class="graph-hint">
          <span>💡 拖拽平移 · 滚轮缩放 · 拖拽节点可固定位置 · 点击节点/连线查看详情</span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showRelationDialog" class="dialog-overlay" @click.self="showRelationDialog = false">
        <div class="relation-dialog">
          <div class="dialog-header relation-header">
            <Link2 :size="20" />
            <span>{{ relationDialogMode === 'create' ? '创建角色关系' : '编辑角色关系' }}</span>
            <button class="dialog-close" @click="showRelationDialog = false">
              <X :size="18" />
            </button>
          </div>

          <div class="dialog-body">
            <div class="relation-form-grid">
              <div class="form-col">
                <label class="input-label">
                  <span class="label-badge">A</span>
                  角色 A
                </label>
                <div class="hero-select-wrapper">
                  <div class="search-box">
                    <Search :size="16" class="search-icon" />
                    <input
                      type="text"
                      v-model="searchQuery"
                      placeholder="搜索角色名称..."
                      class="search-input"
                    />
                  </div>
                  <div class="hero-options">
                    <div
                      v-for="h in searchFilteredHeroes"
                      :key="h.id"
                      class="hero-option"
                      :class="{ selected: dialogSourceId === h.id, disabled: h.id === dialogTargetId && relationDialogMode === 'create' }"
                      @click="!dialogTargetId || h.id !== dialogTargetId ? (dialogSourceId = h.id) : null"
                    >
                      <span class="hero-avatar-mini" :style="{ background: getHeroPortrait(h) }">🦸</span>
                      <div class="hero-info">
                        <div class="hero-name">{{ h.name }}</div>
                        <div class="hero-alias">{{ h.alias }}</div>
                      </div>
                      <div v-if="dialogSourceId === h.id" class="option-check">
                        <Check :size="16" />
                      </div>
                    </div>
                    <div v-if="searchFilteredHeroes.length === 0" class="empty-options">
                      没有找到匹配的角色
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-col divider-col">
                <div class="relation-type-picker-section">
                  <label class="input-label">关系类型</label>
                  <div class="relation-type-grid">
                    <button
                      v-for="rt in RELATION_TYPES"
                      :key="rt.id"
                      class="relation-type-btn"
                      :class="{ active: dialogRelationType === rt.id }"
                      :style="{ '--type-color': rt.color }"
                      @click="dialogRelationType = rt.id"
                    >
                      <span class="type-icon">{{ rt.icon }}</span>
                      <span class="type-label">{{ rt.label }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="form-col">
                <label class="input-label">
                  <span class="label-badge">B</span>
                  角色 B
                </label>
                <div class="hero-select-wrapper">
                  <div class="hero-options target-options">
                    <div
                      v-for="h in availableHeroesForTarget"
                      :key="h.id"
                      class="hero-option"
                      :class="{ selected: dialogTargetId === h.id }"
                      @click="dialogTargetId = h.id"
                    >
                      <span class="hero-avatar-mini" :style="{ background: getHeroPortrait(h) }">🦸</span>
                      <div class="hero-info">
                        <div class="hero-name">{{ h.name }}</div>
                        <div class="hero-alias">{{ h.alias }}</div>
                      </div>
                      <div v-if="dialogTargetId === h.id" class="option-check">
                        <Check :size="16" />
                      </div>
                    </div>
                    <div v-if="!dialogSourceId" class="empty-options">
                      请先选择角色 A
                    </div>
                    <div v-else-if="availableHeroesForTarget.length === 0" class="empty-options">
                      没有其他可选角色
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="description-section">
              <label class="input-label">关系描述（可选）</label>
              <textarea
                v-model="dialogDescription"
                class="description-input"
                placeholder="例如：曾在终极之战中联手对抗灭星者..."
                rows="3"
                maxlength="500"
              />
              <div class="char-count">{{ dialogDescription.length }}/500</div>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="dialog-btn cancel" @click="showRelationDialog = false">取消</button>
            <button class="dialog-btn confirm" @click="submitRelationDialog">
              <Check :size="16" />
              <span>{{ relationDialogMode === 'create' ? '创建关系' : '保存修改' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showEdgeDetailDialog && detailEdge" class="dialog-overlay" @click.self="showEdgeDetailDialog = false">
        <div class="edge-detail-dialog">
          <div class="dialog-header edge-header" :style="{ background: `linear-gradient(135deg, ${getRelationConfig(detailEdge.type).color}, ${getRelationConfig(detailEdge.type).color}dd)` }">
            <span class="detail-type-icon">{{ getRelationConfig(detailEdge.type).icon }}</span>
            <span>{{ getRelationConfig(detailEdge.type).label }} 关系</span>
            <button class="dialog-close" @click="showEdgeDetailDialog = false">
              <X :size="18" />
            </button>
          </div>

          <div class="dialog-body">
            <div class="edge-heroes-row">
              <div class="edge-hero-card">
                <div class="edge-hero-portrait" :style="{ background: getHeroPortrait(detailEdge.source.hero) }">🦸</div>
                <div class="edge-hero-info">
                  <div class="edge-hero-name">{{ detailEdge.source.hero.name }}</div>
                  <div class="edge-hero-alias">{{ detailEdge.source.hero.alias }}</div>
                </div>
              </div>
              <div class="edge-connector">
                <span class="connector-line"></span>
                <span class="connector-icon">{{ getRelationConfig(detailEdge.type).icon }}</span>
                <span class="connector-line"></span>
              </div>
              <div class="edge-hero-card right">
                <div class="edge-hero-portrait" :style="{ background: getHeroPortrait(detailEdge.target.hero) }">🦸</div>
                <div class="edge-hero-info">
                  <div class="edge-hero-name">{{ detailEdge.target.hero.name }}</div>
                  <div class="edge-hero-alias">{{ detailEdge.target.hero.alias }}</div>
                </div>
              </div>
            </div>

            <div v-if="detailEdge.description" class="detail-description-section">
              <div class="detail-section-label">
                <Eye :size="14" />
                关系描述
              </div>
              <div class="detail-description">
                {{ detailEdge.description }}
              </div>
            </div>

            <div class="detail-meta">
              <span>创建于: {{ new Date(heroStore.getRelationById(detailEdge.id)?.createdAt || '').toLocaleString('zh-CN') }}</span>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="dialog-btn danger" @click="deleteEdgeRelation(detailEdge.id)">
              <Trash2 :size="16" />
              <span>删除关系</span>
            </button>
            <button class="dialog-btn cancel" @click="showEdgeDetailDialog = false">关闭</button>
            <button class="dialog-btn confirm" @click="openEditRelationDialog(detailEdge)">
              <Edit3 :size="16" />
              <span>编辑</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <canvas ref="exportCanvasRef" style="display: none;" />
  </div>
</template>

<style scoped>
.universe-page {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
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
  top: 0; left: 0; right: 0; bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 80% 50%, rgba(229, 57, 53, 0.15) 0%, transparent 40%);
}

.header-left { position: relative; z-index: 1; }

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
  color: #bdbdbd;
  margin: 0;
  font-weight: 700;
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
  background: #424242;
  border: 3px solid #616161;
  border-radius: 20px;
  box-shadow: 3px 3px 0 #212121;
}

.stats-badge.edge {
  background: #2196f3;
  border-color: #1976d2;
}

.stat-icon { font-size: 20px; }

.stat-text {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  color: #fafafa;
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
  background: linear-gradient(135deg, #fdd835, #f9a825);
  color: #212121;
}

.universe-content {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 8px 8px 0 #212121;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  background: #212121;
  border-bottom: 4px solid #424242;
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  color: #9e9e9e;
}

.layout-btns, .view-btns {
  display: flex;
  gap: 4px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #424242;
  border: 2px solid #616161;
  border-radius: 6px;
  color: #e0e0e0;
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover:not(:disabled) {
  background: #616161;
  border-color: #9e9e9e;
  transform: translateY(-1px);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn.active {
  background: linear-gradient(135deg, #fdd835, #f9a825);
  color: #212121;
  border-color: #fdd835;
  box-shadow: 0 0 0 2px rgba(253, 216, 53, 0.3);
}

.tool-btn.view {
  padding: 8px 10px;
  background: #37474f;
}

.tool-btn.export {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: #fafafa;
  border-color: #4caf50;
}

.toolbar-divider {
  width: 1px;
  height: 32px;
  background: #616161;
}

.filter-all-btns {
  display: flex;
  gap: 4px;
}

.mini-btn {
  padding: 4px 10px;
  background: #37474f;
  border: 2px solid #546e7a;
  border-radius: 4px;
  color: #e0e0e0;
  font-family: 'Comic Neue', cursive;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.mini-btn:hover {
  background: #546e7a;
  border-color: #78909c;
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #424242;
  border: 2px solid #616161;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.5;
}

.filter-chip.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--chip-color);
  opacity: 1;
  box-shadow: 0 0 8px var(--chip-color);
}

.chip-icon { font-size: 14px; }

.chip-label {
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  font-weight: 700;
  color: #fafafa;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fafafa;
}

.empty-icon {
  color: #e0e0e0;
  margin-bottom: 24px;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
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

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
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

.cta-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 8px 8px 0 #212121;
}

.cta-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cta-btn.primary {
  background: linear-gradient(135deg, #fdd835, #f9a825);
  color: #212121;
}

.cta-btn.secondary {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: #fafafa;
}

.graph-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 360px);
  min-height: 500px;
  background: #fafafa;
  overflow: hidden;
  user-select: none;
}

.graph-svg {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
}

.graph-svg:active { cursor: grabbing; }

.cursor-grab { cursor: grab !important; }
.cursor-grabbing { cursor: grabbing !important; }

.edge-group { cursor: pointer; }

.edge-hit-area { cursor: pointer; }

.edge-line { transition: all 0.25s ease; }

.edge-group.highlighted .edge-line {
  stroke-width: 5 !important;
  stroke-opacity: 1 !important;
}

.edge-group.selected .edge-line {
  filter: url(#glow);
}

.edge-group:hover:not(.dimmed) .edge-line {
  stroke-width: 5;
  stroke-opacity: 1;
}

.node-group { cursor: pointer; }

.node-group:hover:not(.dimmed) .node-outer-ring {
  r: 45;
}

.node-group.highlighted .node-outer-ring {
  stroke-width: 6;
}

.node-selection-ring {
  transform-origin: center;
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.node-emoji { pointer-events: none; }
.node-label { pointer-events: none; }

.force-indicator {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(33, 33, 33, 0.9);
  border: 2px solid #fdd835;
  border-radius: 20px;
  color: #fdd835;
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  font-weight: 700;
  z-index: 10;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.zoom-indicator {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 6px 12px;
  background: rgba(33, 33, 33, 0.85);
  border: 2px solid #616161;
  border-radius: 6px;
  color: #e0e0e0;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
}

.graph-hint {
  position: absolute;
  bottom: 16px;
  left: 16px;
  padding: 8px 14px;
  background: rgba(250, 250, 250, 0.95);
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  color: #616161;
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  font-weight: 700;
  z-index: 10;
}

.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
  width: 32px; height: 32px;
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

.dialog-close:hover { background: #c62828; }

.dialog-body { padding: 20px; }

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

.dialog-btn:hover { transform: translateY(-2px); box-shadow: 5px 5px 0 #212121; }

.dialog-btn.cancel { background: #fafafa; color: #212121; }

.dialog-btn.confirm {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: #fafafa;
}

.dialog-btn.danger {
  background: linear-gradient(135deg, #e53935, #c62828);
  color: #fafafa;
}

.relation-dialog {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  width: 95%;
  max-width: 900px;
  box-shadow: 8px 8px 0 #212121;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.relation-header {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
}

.relation-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.divider-col {
  border-left: 3px dashed #e0e0e0;
  border-right: 3px dashed #e0e0e0;
  padding: 0 16px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
  margin-bottom: 4px;
}

.label-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fdd835, #f9a825);
  color: #212121;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  border: 2px solid #212121;
}

.hero-select-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.search-box {
  position: relative;
  padding: 10px;
  border-bottom: 2px solid #e0e0e0;
  background: #fafafa;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #9e9e9e;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  font-weight: 700;
  color: #212121;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #2196f3;
}

.hero-options {
  flex: 1;
  overflow-y: auto;
  max-height: 260px;
  padding: 4px;
}

.target-options {
  max-height: 310px;
}

.hero-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.hero-option:hover:not(.disabled) {
  background: #f5f5f5;
}

.hero-option.selected {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border: 2px solid #2196f3;
}

.hero-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hero-avatar-mini {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #212121;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-alias {
  font-family: 'Roboto Slab', serif;
  font-size: 11px;
  color: #757575;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-check {
  color: #2196f3;
  flex-shrink: 0;
}

.empty-options {
  padding: 24px;
  text-align: center;
  color: #9e9e9e;
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  font-weight: 700;
}

.relation-type-picker-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.relation-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.relation-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: #fafafa;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.relation-type-btn:hover {
  border-color: var(--type-color);
  transform: translateY(-2px);
  box-shadow: 2px 2px 0 var(--type-color);
}

.relation-type-btn.active {
  background: var(--type-color);
  border-color: var(--type-color);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.relation-type-btn.active .type-label {
  color: #fff;
}

.type-icon {
  font-size: 24px;
}

.type-label {
  font-family: 'Bangers', cursive;
  font-size: 13px;
  letter-spacing: 1px;
  color: #424242;
}

.description-section {
  position: relative;
}

.description-input {
  width: 100%;
  padding: 12px 14px;
  border: 3px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;
}

.description-input:focus {
  border-color: #9c27b0;
}

.char-count {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  color: #9e9e9e;
  background: rgba(250, 250, 250, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
}

.edge-detail-dialog {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  width: 90%;
  max-width: 520px;
  box-shadow: 8px 8px 0 #212121;
  overflow: hidden;
}

.edge-header {
  background: linear-gradient(135deg, #2196f3, #1565c0);
}

.detail-type-icon {
  font-size: 22px;
}

.edge-heroes-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
}

.edge-hero-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.edge-hero-card.right {
  flex-direction: row-reverse;
  text-align: right;
}

.edge-hero-portrait {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid #212121;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.edge-hero-info {
  min-width: 0;
}

.edge-hero-name {
  font-family: 'Bangers', cursive;
  font-size: 18px;
  letter-spacing: 1px;
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edge-hero-alias {
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  color: #757575;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edge-connector {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.connector-line {
  width: 20px;
  height: 3px;
  background: linear-gradient(90deg, #e0e0e0, #9e9e9e);
  border-radius: 2px;
}

.connector-icon {
  font-size: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.detail-description-section {
  margin-bottom: 12px;
}

.detail-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  color: #616161;
  margin-bottom: 8px;
}

.detail-description {
  padding: 14px;
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  border: 3px dashed #f9a825;
  border-radius: 8px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #5d4037;
  line-height: 1.6;
}

.detail-meta {
  padding-top: 8px;
  border-top: 2px dashed #e0e0e0;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  color: #9e9e9e;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .page-title {
    font-size: 32px;
  }

  .relation-form-grid {
    grid-template-columns: 1fr;
  }

  .divider-col {
    border-left: none;
    border-right: none;
    border-top: 3px dashed #e0e0e0;
    border-bottom: 3px dashed #e0e0e0;
    padding: 16px 0;
  }

  .relation-type-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .universe-page {
    padding: 12px;
  }

  .page-header {
    padding: 16px;
  }

  .toolbar {
    padding: 12px;
    gap: 12px;
  }

  .toolbar-section {
    width: 100%;
    justify-content: space-between;
  }

  .graph-container {
    height: 60vh;
    min-height: 400px;
  }

  .empty-title {
    font-size: 24px;
  }

  .relation-type-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .edge-heroes-row {
    flex-direction: column;
    gap: 8px;
  }

  .edge-hero-card.right {
    flex-direction: row;
    text-align: left;
  }

  .edge-connector {
    transform: rotate(90deg);
  }
}
</style>