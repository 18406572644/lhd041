<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  X, Download, Image, FileImage, FileText, Package, Grid3x3, Clock, CheckCircle, XCircle, RotateCcw, StopCircle, LayoutGrid
} from 'lucide-vue-next';
import type { Hero } from '../../types';
import {
  useBatchExport,
  type BatchExportConfig,
  type BatchExportSummary,
  type LongImageConfig,
  type GridColumns
} from '../../composables/useBatchExport';
import type { ExportFormat, Resolution, PdfPageSize } from '../../composables/useCardExport';

const props = defineProps<{
  visible: boolean;
  heroes: Hero[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { isExporting, progress, formatTime, batchExport, cancelExport, exportLongImage } = useBatchExport();

type TabType = 'export' | 'longimage';
type Config = BatchExportConfig & { tab: TabType };

const currentTab = ref<TabType>('export');
const summary = ref<BatchExportSummary | null>(null);
const showSummary = ref(false);

const format = ref<ExportFormat>('png');
const resolution = ref<Resolution>(2);
const packMethod = ref<'zip' | 'multipage-pdf'>('zip');
const filenameTemplate = ref('{{序号}}_{{英雄名}}');
const includeMetadata = ref(false);
const jpgQuality = ref(90);
const webpQuality = ref(80);
const pdfPageSize = ref<PdfPageSize>('a4');
const pdfShowBleed = ref(true);

const longImageColumns = ref<GridColumns>(3);
const longImageBgColor = ref('#f5f5f5');
const longImageGap = ref(20);
const longImageFormat = ref<'png' | 'jpg' | 'webp'>('png');
const longImageQuality = ref(90);

const templateVariables = [
  { key: '{{序号}}', label: '序号', desc: '如 001' },
  { key: '{{英雄名}}', label: '英雄名', desc: '英雄名称' },
  { key: '{{真实姓名}}', label: '真实姓名', desc: '英雄别名' },
  { key: '{{创建日期}}', label: '创建日期', desc: 'YYYYMMDD' },
  { key: '{{标签}}', label: '标签', desc: '超能力标签' }
];

watch(() => props.visible, (v) => {
  if (v) {
    summary.value = null;
    showSummary.value = false;
  }
});

const canStartExport = computed(() => {
  return props.heroes.length > 0 && !isExporting.value;
});

const canStartLongImage = computed(() => {
  return props.heroes.length >= 1 && !isExporting.value;
});

function insertTemplateVar(v: string) {
  const input = document.getElementById('filename-input') as HTMLInputElement;
  if (!input) {
    filenameTemplate.value += v;
    return;
  }
  const start = input.selectionStart || filenameTemplate.value.length;
  const end = input.selectionEnd || filenameTemplate.value.length;
  filenameTemplate.value =
    filenameTemplate.value.slice(0, start) + v + filenameTemplate.value.slice(end);
  setTimeout(() => {
    input.focus();
    input.setSelectionRange(start + v.length, start + v.length);
  }, 0);
}

async function startBatchExport() {
  const config: BatchExportConfig = {
    format: format.value,
    resolution: resolution.value,
    packMethod: packMethod.value,
    filenameTemplate: filenameTemplate.value,
    includeMetadata: includeMetadata.value,
    jpgQuality: jpgQuality.value,
    webpQuality: webpQuality.value,
    pdfPageSize: pdfPageSize.value,
    pdfShowBleed: pdfShowBleed.value
  };
  summary.value = await batchExport(props.heroes, config);
  showSummary.value = true;
}

async function startLongImageExport() {
  const config: LongImageConfig = {
    columns: longImageColumns.value,
    backgroundColor: longImageBgColor.value,
    cardGap: longImageGap.value,
    resolution: resolution.value,
    format: longImageFormat.value,
    quality: longImageQuality.value
  };
  const blob = await exportLongImage(props.heroes, config);
  if (blob) {
    summary.value = {
      success: props.heroes.map(h => ({ success: true, heroId: h.id, heroName: h.name })),
      failed: [],
      total: props.heroes.length
    };
    showSummary.value = true;
  }
}

function handleCancel() {
  cancelExport();
}

function closeDialog() {
  if (isExporting.value) {
    if (confirm('导出正在进行中，确定要关闭吗？')) {
      cancelExport();
      emit('close');
    }
  } else {
    emit('close');
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
      <div class="batch-dialog">
        <div class="dialog-header">
          <span class="dialog-title">
            <Download :size="20" />
            批量导出卡片
          </span>
          <button class="dialog-close" @click="closeDialog">
            <X :size="18" />
          </button>
        </div>

        <div class="dialog-tabs">
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'export' }"
            @click="currentTab = 'export'"
          >
            <Package :size="16" />
            批量导出
          </button>
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'longimage' }"
            @click="currentTab = 'longimage'"
          >
            <LayoutGrid :size="16" />
            长图拼接
          </button>
        </div>

        <div class="dialog-body">

          <div v-if="!isExporting && !showSummary">

            <div v-if="currentTab === 'export'" class="config-sections">

              <div class="section">
                <label class="section-label">导出格式</label>
                <div class="format-grid">
                  <button
                    class="format-btn"
                    :class="{ active: format === 'png' }"
                    @click="format = 'png'"
                  >
                    <Image :size="18" />
                    <span>PNG</span>
                  </button>
                  <button
                    class="format-btn"
                    :class="{ active: format === 'jpg' }"
                    @click="format = 'jpg'"
                  >
                    <FileImage :size="18" />
                    <span>JPG</span>
                  </button>
                  <button
                    class="format-btn"
                    :class="{ active: format === 'webp' }"
                    @click="format = 'webp'"
                  >
                    <FileImage :size="18" />
                    <span>WEBP</span>
                  </button>
                  <button
                    class="format-btn"
                    :class="{ active: format === 'pdf' }"
                    @click="format = 'pdf'"
                  >
                    <FileText :size="18" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              <div class="section">
                <label class="section-label">分辨率</label>
                <div class="resolution-row">
                  <button
                    v-for="r in [1,2,3,4]"
                    :key="r"
                    class="res-btn"
                    :class="{ active: resolution === r }"
                    @click="resolution = r as 1|2|3|4"
                  >{{ r }}x</button>
                </div>
              </div>

              <div class="section">
                <label class="section-label">打包方式</label>
                <div class="pack-row">
                  <button
                    class="pack-btn"
                    :class="{ active: packMethod === 'zip' }"
                    @click="packMethod = 'zip'"
                    :disabled="format === 'pdf'"
                  >
                    <Package :size="16" />
                    ZIP 压缩包
                  </button>
                  <button
                    class="pack-btn"
                    :class="{ active: packMethod === 'multipage-pdf' }"
                    @click="packMethod = 'multipage-pdf'"
                  >
                    <FileText :size="16" />
                    多页 PDF
                  </button>
                </div>
              </div>

              <div v-if="format === 'jpg'" class="section">
                <div class="quality-header">
                  <label class="section-label">JPG 压缩质量</label>
                  <span class="quality-value">{{ jpgQuality }}%</span>
                </div>
                <input type="range" v-model.number="jpgQuality" min="10" max="100" step="1" class="slider" />
              </div>

              <div v-if="format === 'webp'" class="section">
                <div class="quality-header">
                  <label class="section-label">WEBP 质量</label>
                  <span class="quality-value">{{ webpQuality }}%</span>
                </div>
                <input type="range" v-model.number="webpQuality" min="10" max="100" step="1" class="slider" />
              </div>

              <div v-if="format === 'pdf' || packMethod === 'multipage-pdf'" class="section">
                <label class="section-label">PDF 页面规格</label>
                <div class="pdf-row">
                  <button
                    class="pdf-btn"
                    :class="{ active: pdfPageSize === 'a4' }"
                    @click="pdfPageSize = 'a4'"
                  >A4 (210×297mm</button>
                  <button
                    class="pdf-btn"
                    :class="{ active: pdfPageSize === 'business-card' }"
                    @click="pdfPageSize = 'business-card'"
                  >名片 (86×54mm)</button>
                </div>
                <label class="checkbox-row">
                  <input type="checkbox" v-model="pdfShowBleed" />
                  <span>显示出血线和裁切标记（3mm）</span>
                </label>
              </div>

              <div v-if="packMethod === 'zip'" class="section">
                <label class="section-label">文件命名规则</label>
                <input
                  id="filename-input"
                  type="text"
                  v-model="filenameTemplate"
                  class="name-input"
                  placeholder="如：{{序号}}_{{英雄名}}"
                />
                <div class="template-tags">
                  <button
                    v-for="v in templateVariables"
                    :key="v.key"
                    class="template-tag"
                    type="button"
                    @click="insertTemplateVar(v.key)"
                    :title="v.desc"
                  >
                    {{ v.label }}
                  </button>
                </div>
              </div>

              <div v-if="packMethod === 'zip'" class="section">
                <label class="checkbox-row">
                  <input type="checkbox" v-model="includeMetadata" />
                  <span>附带元数据 manifest.json（包含角色完整结构化数据，便于他人导入）</span>
                </label>
              </div>

            </div>

            <div v-else class="config-sections">

              <div class="section">
                <label class="section-label">拼接列数</label>
                <div class="columns-row">
                  <button
                    v-for="c in [2, 3, 4]"
                    :key="c"
                    class="col-btn"
                    :class="{ active: longImageColumns === c }"
                    @click="longImageColumns = c as 2|3|4"
                  >{{ c }} 列</button>
                </div>
              </div>

              <div class="section">
                <label class="section-label">
                  <Grid3x3 :size="14" />
                  卡片间距：{{ longImageGap }}px
                </label>
                <input
                  type="range"
                  v-model.number="longImageGap"
                  min="0"
                  max="60"
                  step="2"
                  class="slider"
                />
              </div>

              <div class="section">
                <label class="section-label">背景颜色</label>
                <div class="color-row">
                  <button
                    v-for="c in ['#f5f5f5', '#ffffff', '#212121', '#e53935', '#2196f3', '#4caf50']"
                    :key="c"
                    class="color-dot"
                    :class="{ active: longImageBgColor === c }"
                    :style="{ background: c }"
                    @click="longImageBgColor = c"
                  />
                  <input
                    type="color"
                    v-model="longImageBgColor"
                    class="color-picker"
                  />
                </div>
              </div>

              <div class="section">
                <label class="section-label">导出格式</label>
                <div class="format-grid">
                  <button class="format-btn" :class="{ active: longImageFormat === 'png' }" @click="longImageFormat = 'png'">
                    <Image :size="16" /> PNG
                  </button>
                  <button class="format-btn" :class="{ active: longImageFormat === 'jpg' }" @click="longImageFormat = 'jpg'">
                    <FileImage :size="16" /> JPG
                  </button>
                  <button class="format-btn" :class="{ active: longImageFormat === 'webp' }" @click="longImageFormat = 'webp'">
                    <FileImage :size="16" /> WEBP
                  </button>
                </div>
              </div>

              <div v-if="longImageFormat !== 'png'" class="section">
                <div class="quality-header">
                  <label class="section-label">质量</label>
                  <span class="quality-value">{{ longImageQuality }}%</span>
                </div>
                <input type="range" v-model.number="longImageQuality" min="10" max="100" step="1" class="slider" />
              </div>

              <div class="section">
                <label class="section-label">分辨率</label>
                <div class="resolution-row">
                  <button
                    v-for="r in [1,2,3,4]"
                    :key="r"
                    class="res-btn"
                    :class="{ active: resolution === r }"
                    @click="resolution = r as 1|2|3|4"
                  >{{ r }}x</button>
                </div>
              </div>

            </div>

            <div class="hero-count-hint">
              已选择 <strong>{{ heroes.length }}</strong> 个英雄卡片
            </div>

          </div>

          <div v-else-if="isExporting" class="progress-area">
            <div class="progress-info">
              <div class="progress-big">
                <div class="progress-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#e0e0e0" stroke-width="8" fill="none" />
                    <circle
                      cx="50" cy="50" r="42"
                      stroke="#4caf50"
                      stroke-width="8"
                      fill="none"
                      stroke-linecap="round"
                      :stroke-dasharray="264"
                      :stroke-dashoffset="264 - (264 * progress.percent / 100)"
                      transform="rotate(-90 50 50)"
                      style="transition: stroke-dashoffset 0.3s"
                    />
                  </svg>
                  <div class="progress-percent">{{ progress.percent }}%</div>
                </div>
              </div>
              <div class="progress-details">
                <div class="detail-row">
                  <span class="detail-label">进度</span>
                  <span class="detail-value">{{ progress.processed }} / {{ progress.total }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">当前</span>
                  <span class="detail-value current-name">{{ progress.currentName || '准备中...' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">
                    <Clock :size="14" />
                    剩余时间
                  </span>
                  <span class="detail-value">{{ formatTime(progress.estimatedRemaining) }}</span>
                </div>
              </div>
            </div>
            <div class="progress-bar-linear">
              <div class="progress-fill" :style="{ width: progress.percent + '%' }" />
            </div>
            <button class="cancel-btn" @click="handleCancel">
              <StopCircle :size="16" />
              取消导出
            </button>
          </div>

          <div v-else-if="showSummary && summary" class="summary-area">
            <div class="summary-stats">
              <div class="stat success">
                <CheckCircle :size="32" />
                <div>
                  <div class="stat-num">{{ summary.success.length }}</div>
                  <div class="stat-label">成功</div>
                </div>
              </div>
              <div class="stat failed" :class="{ zero: summary.failed.length === 0 }">
                <XCircle :size="32" />
                <div>
                  <div class="stat-num">{{ summary.failed.length }}</div>
                  <div class="stat-label">失败</div>
                </div>
              </div>
            </div>
            <div v-if="summary.failed.length > 0" class="failed-list">
              <div class="failed-title">失败项</div>
              <div v-for="f in summary.failed" :key="f.heroId" class="failed-item">
                <span class="failed-name">{{ f.heroName }}</span>
                <span class="failed-error">{{ f.error }}</span>
              </div>
            </div>
          </div>

        </div>

        <div class="dialog-footer">
          <button class="dialog-btn cancel" @click="closeDialog">
            {{ showSummary ? '关闭' : '取消' }}
          </button>
          <template v-if="!isExporting && !showSummary">
            <button
              v-if="currentTab === 'export'"
              class="dialog-btn confirm"
              :disabled="!canStartExport"
              @click="startBatchExport"
            >
              <Download :size="16" />
              开始导出
            </button>
            <button
              v-else
              class="dialog-btn confirm"
              :disabled="!canStartLongImage"
              @click="startLongImageExport"
            >
              <LayoutGrid :size="16" />
              生成长图
            </button>
          </template>
          <button v-if="showSummary && summary && summary.failed.length > 0" class="dialog-btn retry" @click="() => { showSummary = false; }">
            <RotateCcw :size="16" />
            重新配置
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; backdrop-filter: blur(2px);
}

.batch-dialog {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  box-shadow: 8px 8px 0 #212121;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ff9800, #e65100);
  color: #fafafa;
  font-family: 'Bangers', cursive;
  font-size: 20px;
  letter-spacing: 1px;
  text-shadow: 2px 2px 0 #212121;
}

.dialog-title {
  display: flex; align-items: center; gap: 8px;
}

.dialog-close {
  margin-left: auto;
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.2);
  border: 2px solid #fafafa;
  border-radius: 50%;
  color: #fafafa;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.dialog-close:hover { background: #c62828; }

.dialog-tabs {
  display: flex;
  background: #212121;
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 6px;
  padding: 10px;
  background: transparent;
  border: none;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  color: #bdbdbd;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.tab-btn:hover { color: #fafafa; background: #424242; }
.tab-btn.active { background: #ff9800; color: #212121; }

.dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
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
  display: flex; align-items: center; gap: 6px;
}

.format-grid {
  display: flex;
  gap: 8px;
}

.format-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #fafafa;
  border: 3px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  color: #212121;
  transition: all 0.2s;
}
.format-btn:hover:not(:disabled) { border-color: #2196f3; transform: translateY(-1px); }
.format-btn.active {
  border-color: #2196f3; background: #e3f2fd;
  box-shadow: 0 0 0 3px rgba(33,150,243,0.2);
}
.format-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.resolution-row {
  display: flex; gap: 8px;
}

.res-btn {
  flex: 1;
  padding: 10px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Bangers', cursive;
  font-size: 16px;
  color: #212121;
  letter-spacing: 1px;
  transition: all 0.2s;
}
.res-btn:hover { border-color: #ff9800; }
.res-btn.active { border-color: #ff9800; background: #fff3e0; }

.pack-row {
  display: flex; gap: 8px;
}

.pack-btn {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  font-weight: 700;
  color: #212121;
  transition: all 0.2s;
}
.pack-btn:hover:not(:disabled) { border-color: #9c27b0; }
.pack-btn.active { border-color: #9c27b0; background: #f3e5f5; }
.pack-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.quality-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 6px;
}
.quality-value {
  font-family: 'Bangers', cursive;
  font-size: 16px; color: #ff5722;
}

.slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #e0e0e0;
  border: 2px solid #212121;
  border-radius: 4px;
  outline: none;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 20px; height: 20px;
  background: #ff9800;
  border: 2px solid #212121;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 2px 2px 0 #212121;
}
.slider::-moz-range-thumb {
  width: 20px; height: 20px;
  background: #ff9800;
  border: 2px solid #212121;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 2px 2px 0 #212121;
}

.pdf-row {
  display: flex; gap: 8px;
}

.pdf-btn {
  flex: 1;
  padding: 10px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  font-weight: 700;
  color: #212121;
  transition: all 0.2s;
}
.pdf-btn:hover { border-color: #9c27b0; }
.pdf-btn.active { border-color: #9c27b0; background: #f3e5f5; }

.checkbox-row {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
  cursor: pointer;
  margin-top: 8px;
}
.checkbox-row input[type="checkbox"] {
  width: 18px; height: 18px; cursor: pointer;
}

.name-input {
  width: 100%;
  padding: 10px 12px;
  border: 3px solid #212121;
  border-radius: 6px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  background: #fafafa;
  box-sizing: border-box;
  outline: none;
  margin-bottom: 8px;
}
.name-input:focus { border-color: #2196f3; }

.template-tags {
  display: flex; flex-wrap: wrap; gap: 6px;
}

.template-tag {
  padding: 4px 10px;
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
.template-tag:hover { background: #bbdefb; }

.columns-row {
  display: flex; gap: 8px;
}

.col-btn {
  flex: 1;
  padding: 10px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  color: #212121;
  transition: all 0.2s;
}
.col-btn:hover { border-color: #00bcd4; }
.col-btn.active { border-color: #00bcd4; background: #e0f7fa; }

.color-row {
  display: flex; gap: 8px; align-items: center;
}

.color-dot {
  width: 32px; height: 32px;
  border: 3px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}
.color-dot:hover { transform: scale(1.1); }
.color-dot.active {
  border-color: #212121;
  box-shadow: 0 0 0 3px #2196f3;
}

.color-picker {
  width: 32px; height: 32px;
  border: 2px solid #212121;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.hero-count-hint {
  padding: 12px;
  background: #fff3e0;
  border: 2px dashed #ff9800;
  border-radius: 6px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #e65100;
  text-align: center;
  margin-top: 16px;
}
.hero-count-hint strong {
  font-family: 'Bangers', cursive;
  font-size: 18px;
  color: #e53935;
}

.progress-area {
  padding: 20px 0;
}

.progress-info {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 20px;
}

.progress-big {
  flex-shrink: 0;
}

.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
}
.progress-ring svg {
  width: 100%;
  height: 100%;
}
.progress-percent {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Bangers', cursive;
  font-size: 28px;
  color: #212121;
}

.progress-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.detail-label {
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  font-weight: 700;
  color: #757575;
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-value {
  font-family: 'Bangers', cursive;
  font-size: 16px;
  color: #212121;
  letter-spacing: 1px;
}

.current-name {
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-bar-linear {
  height: 12px;
  background: #e0e0e0;
  border: 2px solid #212121;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}

.cancel-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #fafafa;
  border: 3px solid #e53935;
  border-radius: 6px;
  font-family: 'Bangers', cursive;
  font-size: 15px;
  letter-spacing: 1px;
  color: #e53935;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}
.cancel-btn:hover {
  background: #e53935;
  color: #fafafa;
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.summary-area {
  padding: 10px 0;
}

.summary-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 3px solid;
  border-radius: 8px;
}

.stat.success {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

.stat.failed {
  background: #ffebee;
  border-color: #e53935;
  color: #c62828;
}
.stat.failed.zero {
  opacity: 0.5;
}

.stat-num {
  font-family: 'Bangers', cursive;
  font-size: 32px;
  letter-spacing: 1px;
}

.stat-label {
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
}

.failed-list {
  background: #fff;
  border: 2px solid #e53935;
  border-radius: 6px;
  overflow: hidden;
}

.failed-title {
  padding: 8px 12px;
  background: #ffebee;
  font-family: 'Bangers', cursive;
  font-size: 14px;
  letter-spacing: 1px;
  color: #c62828;
}

.failed-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #ffcdd2;
  font-family: 'Comic Neue', cursive;
  font-size: 13px;
  font-weight: 700;
}

.failed-name { color: #212121;
}
.failed-error {
  color: #c62828;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 3px dashed #bdbdbd;
  background: #f5f5f5;
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
.dialog-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}
.dialog-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dialog-btn.cancel {
  background: #fafafa;
  color: #212121;
}
.dialog-btn.confirm {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: #fafafa;
}
.dialog-btn.retry {
  background: #ff9800;
  color: #212121;
}
</style>
