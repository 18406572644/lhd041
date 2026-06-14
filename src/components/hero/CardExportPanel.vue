<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Download, Image, FileImage, FileType, X } from 'lucide-vue-next';
import { useCardExport, type ExportFormat, type Resolution, type PdfPageSize } from '../../composables/useCardExport';

const props = defineProps<{
  cardElement: HTMLElement | null;
  heroName?: string;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', format: string): void;
  (e: 'error', message: string): void;
}>();

const { isExporting, exportProgress, exportAndDownload, estimateFileSize, copyToClipboard } = useCardExport();

const selectedFormat = ref<ExportFormat>('png');
const resolution = ref<Resolution>(2);
const jpgQuality = ref(90);
const webpQuality = ref(80);
const pdfPageSize = ref<PdfPageSize>('a4');
const pdfShowBleed = ref(true);

const formats = [
  { id: 'png' as ExportFormat, label: 'PNG', icon: Image, desc: '无损透明，通用格式' },
  { id: 'jpg' as ExportFormat, label: 'JPG', icon: FileImage, desc: '体积小，适合分享' },
  { id: 'webp' as ExportFormat, label: 'WEBP', icon: FileType, desc: '同质量下最小体积' },
  { id: 'pdf' as ExportFormat, label: 'PDF', icon: FileType, desc: '印刷级，支持出血线' }
];

const resolutions = [
  { value: 1 as Resolution, label: '1x', desc: '标准' },
  { value: 2 as Resolution, label: '2x', desc: '高清' },
  { value: 3 as Resolution, label: '3x', desc: '超清' },
  { value: 4 as Resolution, label: '4x', desc: '印刷级' }
];

const pdfSizes = [
  { value: 'a4' as PdfPageSize, label: 'A4', desc: '210 × 297 mm' },
  { value: 'business-card' as PdfPageSize, label: '名片', desc: '85.6 × 54 mm' }
];

const estimatedSize = computed(() => {
  if (selectedFormat.value === 'pdf') return '—';
  const baseWidth = 320 * resolution.value;
  const baseHeight = 480 * resolution.value;
  const quality = selectedFormat.value === 'jpg'
    ? jpgQuality.value / 100
    : selectedFormat.value === 'webp'
    ? webpQuality.value / 100
    : 0.92;
  return estimateFileSize(baseWidth, baseHeight, selectedFormat.value as 'png' | 'jpg' | 'webp', quality);
});

async function handleExport() {
  if (!props.cardElement) {
    emit('error', '卡片元素未找到');
    return;
  }

  const filename = props.heroName || 'hero-card';
  const result = await exportAndDownload(props.cardElement, filename, {
    format: selectedFormat.value,
    quality: selectedFormat.value === 'jpg'
      ? jpgQuality.value / 100
      : selectedFormat.value === 'webp'
      ? webpQuality.value / 100
      : 0.92,
    scale: resolution.value,
    pdfPageSize: pdfPageSize.value,
    showBleed: pdfShowBleed.value
  });

  if (result) {
    emit('success', selectedFormat.value);
  } else {
    emit('error', '导出失败，请重试');
  }
}

async function handleCopy() {
  if (!props.cardElement) {
    emit('error', '卡片元素未找到');
    return;
  }
  const ok = await copyToClipboard(props.cardElement, resolution.value);
  if (ok) {
    emit('success', 'clipboard');
  } else {
    emit('error', '复制失败，请重试');
  }
}
</script>

<template>
  <div v-if="visible" class="export-panel">
    <div class="panel-header">
      <span class="panel-title">
        <Download :size="18" />
        导出卡片
      </span>
      <button class="close-btn" @click="emit('close')">
        <X :size="16" />
      </button>
    </div>

    <div class="panel-body">
      <div class="section">
        <label class="section-label">选择格式</label>
        <div class="format-grid">
          <button
            v-for="f in formats"
            :key="f.id"
            class="format-option"
            :class="{ active: selectedFormat === f.id }"
            @click="selectedFormat = f.id"
          >
            <component :is="f.icon" :size="20" />
            <span class="format-name">{{ f.label }}</span>
            <span class="format-desc">{{ f.desc }}</span>
          </button>
        </div>
      </div>

      <div class="section">
        <label class="section-label">分辨率</label>
        <div class="resolution-row">
          <button
            v-for="r in resolutions"
            :key="r.value"
            class="res-btn"
            :class="{ active: resolution === r.value }"
            @click="resolution = r.value"
          >
            <span class="res-label">{{ r.label }}</span>
            <span class="res-desc">{{ r.desc }}</span>
          </button>
        </div>
      </div>

      <div v-if="selectedFormat === 'jpg'" class="section">
        <div class="quality-header">
          <label class="section-label">JPG 压缩质量</label>
          <span class="quality-value">{{ jpgQuality }}%</span>
        </div>
        <input
          type="range"
          v-model.number="jpgQuality"
          min="10"
          max="100"
          step="1"
          class="quality-slider"
        />
        <div class="size-hint">预估文件大小：<strong>{{ estimatedSize }}</strong></div>
      </div>

      <div v-if="selectedFormat === 'webp'" class="section">
        <div class="quality-header">
          <label class="section-label">WEBP 质量</label>
          <span class="quality-value">{{ webpQuality }}%</span>
        </div>
        <input
          type="range"
          v-model.number="webpQuality"
          min="10"
          max="100"
          step="1"
          class="quality-slider"
        />
        <div class="size-hint">预估文件大小：<strong>{{ estimatedSize }}</strong></div>
      </div>

      <div v-if="selectedFormat !== 'jpg' && selectedFormat !== 'webp' && selectedFormat !== 'pdf'" class="section">
        <div class="size-hint">预估文件大小：<strong>{{ estimatedSize }}</strong></div>
      </div>

      <div v-if="selectedFormat === 'pdf'" class="section">
        <label class="section-label">页面规格</label>
        <div class="pdf-size-row">
          <button
            v-for="s in pdfSizes"
            :key="s.value"
            class="pdf-size-btn"
            :class="{ active: pdfPageSize === s.value }"
            @click="pdfPageSize = s.value"
          >
            <span class="pdf-size-label">{{ s.label }}</span>
            <span class="pdf-size-desc">{{ s.desc }}</span>
          </button>
        </div>
        <label class="checkbox-row">
          <input type="checkbox" v-model="pdfShowBleed" />
          <span>显示出血线和裁切标记（3mm）</span>
        </label>
      </div>

      <div v-if="isExporting" class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: exportProgress + '%' }" />
        </div>
        <div class="progress-text">{{ exportProgress }}%</div>
      </div>
    </div>

    <div class="panel-footer">
      <button
        class="footer-btn copy"
        :disabled="isExporting || selectedFormat === 'pdf'"
        @click="handleCopy"
      >
        复制到剪贴板
      </button>
      <button
        class="footer-btn download"
        :disabled="isExporting"
        @click="handleExport"
      >
        <Download :size="16" />
        {{ isExporting ? '导出中...' : `下载 ${selectedFormat.toUpperCase()}` }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.export-panel {
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 4px 4px 0 #212121;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border-bottom: 3px solid #212121;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Bangers', cursive;
  font-size: 18px;
  color: #fafafa;
  letter-spacing: 1px;
  text-shadow: 2px 2px 0 #212121;
}

.close-btn {
  width: 28px;
  height: 28px;
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

.close-btn:hover {
  background: #c62828;
}

.panel-body {
  padding: 16px;
  max-height: 480px;
  overflow-y: auto;
}

.section {
  margin-bottom: 16px;
}

.section-label {
  display: block;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  color: #212121;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.format-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #fafafa;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.format-option:hover {
  border-color: #2196f3;
  transform: translateY(-2px);
}

.format-option.active {
  border-color: #2196f3;
  background: #e3f2fd;
  box-shadow: 0 0 0 3px #2196f333;
}

.format-name {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  color: #212121;
  letter-spacing: 1px;
}

.format-desc {
  font-family: 'Comic Neue', cursive;
  font-size: 11px;
  color: #757575;
  font-weight: 700;
  text-align: center;
}

.resolution-row {
  display: flex;
  gap: 8px;
}

.res-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.res-btn:hover {
  border-color: #ff9800;
}

.res-btn.active {
  border-color: #ff9800;
  background: #fff3e0;
}

.res-label {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  color: #212121;
}

.res-desc {
  font-family: 'Comic Neue', cursive;
  font-size: 10px;
  color: #757575;
  font-weight: 700;
}

.quality-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.quality-value {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  color: #ff5722;
}

.quality-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #e0e0e0;
  border: 2px solid #212121;
  border-radius: 4px;
  outline: none;
}

.quality-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #ff9800;
  border: 2px solid #212121;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 2px 2px 0 #212121;
}

.quality-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #ff9800;
  border: 2px solid #212121;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 2px 2px 0 #212121;
}

.size-hint {
  margin-top: 8px;
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  color: #424242;
  font-weight: 700;
}

.size-hint strong {
  color: #2196f3;
}

.pdf-size-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.pdf-size-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.pdf-size-btn:hover {
  border-color: #9c27b0;
}

.pdf-size-btn.active {
  border-color: #9c27b0;
  background: #f3e5f5;
}

.pdf-size-label {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  color: #212121;
}

.pdf-size-desc {
  font-family: 'Comic Neue', cursive;
  font-size: 10px;
  color: #757575;
  font-weight: 700;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
  cursor: pointer;
}

.checkbox-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.progress-section {
  margin-top: 12px;
}

.progress-bar {
  height: 12px;
  background: #e0e0e0;
  border: 2px solid #212121;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 4px;
  text-align: center;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  color: #424242;
}

.panel-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-top: 3px solid #e0e0e0;
}

.footer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  font-family: 'Bangers', cursive;
  font-size: 15px;
  letter-spacing: 1px;
  border: 3px solid #212121;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.footer-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.footer-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer-btn.copy {
  background: #fdd835;
  color: #212121;
}

.footer-btn.download {
  background: #4caf50;
  color: #fafafa;
}
</style>
