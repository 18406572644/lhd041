<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { ImageFilterSettings } from '../../types';
import { DEFAULT_FILTER, FILTER_PRESETS } from '../../data/portraitAssets';

const props = withDefaults(defineProps<{
  modelValue?: string;
  initialFilter?: ImageFilterSettings;
}>(), {
  modelValue: undefined,
  initialFilter: undefined
});

const emit = defineEmits<{
  'update:modelValue': [base64?: string];
  'update:filter': [filter: ImageFilterSettings];
  'confirm': [data: { image?: string; filter: ImageFilterSettings }];
}>();

const file = ref<HTMLInputElement | null>(null);
const imageSrc = ref<string>('');
const previewCanvas = ref<HTMLCanvasElement | null>(null);
const cropCanvas = ref<HTMLCanvasElement | null>(null);
const filter = ref<ImageFilterSettings>({ ...DEFAULT_FILTER });
const cropInfo = ref({ x: 0, y: 0, w: 0, h: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const loadedImage = ref<HTMLImageElement | null>(null);

const filterStyle = computed(() => {
  const f = filter.value;
  const filters: string[] = [];
  if (f.grayscale > 0) filters.push(`grayscale(${f.grayscale}%)`);
  if (f.sepia > 0) filters.push(`sepia(${f.sepia}%)`);
  if (f.brightness !== 100) filters.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) filters.push(`contrast(${f.contrast}%)`);
  if (f.saturation !== 100) filters.push(`saturate(${f.saturation}%)`);
  if (f.blur > 0) filters.push(`blur(${f.blur}px)`);
  return filters.join(' ');
});

watch(() => props.initialFilter, (val) => {
  if (val) {
    filter.value = { ...val };
  }
}, { immediate: true });

watch(() => props.modelValue, (val) => {
  if (val && val !== imageSrc.value) {
    imageSrc.value = val;
    loadImageFromSrc(val);
  }
}, { immediate: true });

function loadImageFromSrc(src: string) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    loadedImage.value = img;
    initCropInfo(img.width, img.height);
    nextTick(() => drawPreview());
  };
  img.src = src;
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const selectedFile = target.files?.[0];
  if (!selectedFile) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const result = ev.target?.result as string;
    imageSrc.value = result;
    loadImageFromSrc(result);
  };
  reader.readAsDataURL(selectedFile);
}

function initCropInfo(imgWidth: number, imgHeight: number) {
  const size = Math.min(imgWidth, imgHeight);
  cropInfo.value = {
    x: (imgWidth - size) / 2,
    y: (imgHeight - size) / 2,
    w: size,
    h: size
  };
}

function drawPreview() {
  const canvas = previewCanvas.value;
  const img = loadedImage.value;
  if (!canvas || !img) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const canvasSize = 300;
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const scale = canvasSize / Math.max(img.width, img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const offsetX = (canvasSize - drawW) / 2;
  const offsetY = (canvasSize - drawH) / 2;

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

  const cropX = offsetX + cropInfo.value.x * scale;
  const cropY = offsetY + cropInfo.value.y * scale;
  const cropW = cropInfo.value.w * scale;
  const cropH = cropInfo.value.h * scale;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  ctx.clearRect(cropX, cropY, cropW, cropH);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  ctx.restore();

  ctx.strokeStyle = '#FFD54F';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(cropX, cropY, cropW, cropH);
  ctx.setLineDash([]);

  ctx.strokeStyle = '#212121';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cropX + cropW / 3, cropY);
  ctx.lineTo(cropX + cropW / 3, cropY + cropH);
  ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
  ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
  ctx.moveTo(cropX, cropY + cropH / 3);
  ctx.lineTo(cropX + cropW, cropY + cropH / 3);
  ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
  ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
  ctx.stroke();
}

function startDrag(e: MouseEvent) {
  if (!loadedImage.value) return;
  isDragging.value = true;
  dragStart.value = { x: e.clientX, y: e.clientY };
  drawPreview();
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || !loadedImage.value) return;

  const canvas = previewCanvas.value;
  if (!canvas) return;

  const canvasSize = 300;
  const scale = canvasSize / Math.max(loadedImage.value.width, loadedImage.value.height);

  const dx = (e.clientX - dragStart.value.x) / scale;
  const dy = (e.clientY - dragStart.value.y) / scale;

  dragStart.value = { x: e.clientX, y: e.clientY };

  let newX = cropInfo.value.x + dx;
  let newY = cropInfo.value.y + dy;

  newX = Math.max(0, Math.min(newX, loadedImage.value.width - cropInfo.value.w));
  newY = Math.max(0, Math.min(newY, loadedImage.value.height - cropInfo.value.h));

  cropInfo.value.x = newX;
  cropInfo.value.y = newY;

  drawPreview();
}

function endDrag() {
  isDragging.value = false;
}

function applyFilter(): string | undefined {
  const canvas = cropCanvas.value;
  const img = loadedImage.value;
  if (!canvas || !img) return undefined;

  const size = 512;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  ctx.filter = filterStyle.value;
  ctx.drawImage(
    img,
    cropInfo.value.x,
    cropInfo.value.y,
    cropInfo.value.w,
    cropInfo.value.h,
    0,
    0,
    size,
    size
  );
  ctx.filter = 'none';

  return canvas.toDataURL('image/png');
}

function setPreset(presetKey: number) {
  const preset = FILTER_PRESETS[presetKey];
  if (preset) {
    filter.value = { ...preset.filter };
    emit('update:filter', filter.value);
  }
}

function resetFilter() {
  filter.value = { ...DEFAULT_FILTER };
  emit('update:filter', filter.value);
}

function confirmImage() {
  const result = applyFilter();
  emit('update:modelValue', result);
  emit('confirm', { image: result, filter: { ...filter.value } });
}

function clearImage() {
  imageSrc.value = '';
  loadedImage.value = null;
  cropInfo.value = { x: 0, y: 0, w: 0, h: 0 };
  emit('update:modelValue', undefined);
}

watch(filter, (val) => {
  emit('update:filter', { ...val });
}, { deep: true });

onMounted(() => {
  if (props.modelValue) {
    loadImageFromSrc(props.modelValue);
  }
});
</script>

<template>
  <div class="custom-image-uploader">
    <div v-if="!imageSrc" class="upload-area" @click="file?.click()">
      <input
        ref="file"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="upload-icon">📷</div>
      <div class="upload-text">点击上传图片</div>
      <div class="upload-hint">支持 JPG、PNG、GIF 等格式</div>
    </div>

    <template v-else>
      <div class="preview-wrapper">
        <canvas
          ref="previewCanvas"
          class="preview-canvas"
          width="300"
          height="300"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        ></canvas>
      </div>

      <canvas ref="cropCanvas" style="display: none"></canvas>

      <div class="filter-section">
        <div class="section-title">滤镜调整</div>

        <div class="filter-slider">
          <label>灰度</label>
          <input
            type="range"
            v-model.number="filter.grayscale"
            min="0"
            max="100"
            step="1"
          />
          <span>{{ filter.grayscale }}%</span>
        </div>

        <div class="filter-slider">
          <label>复古</label>
          <input
            type="range"
            v-model.number="filter.sepia"
            min="0"
            max="100"
            step="1"
          />
          <span>{{ filter.sepia }}%</span>
        </div>

        <div class="filter-slider">
          <label>亮度</label>
          <input
            type="range"
            v-model.number="filter.brightness"
            min="50"
            max="200"
            step="1"
          />
          <span>{{ filter.brightness }}%</span>
        </div>

        <div class="filter-slider">
          <label>对比度</label>
          <input
            type="range"
            v-model.number="filter.contrast"
            min="50"
            max="200"
            step="1"
          />
          <span>{{ filter.contrast }}%</span>
        </div>

        <div class="filter-slider">
          <label>饱和度</label>
          <input
            type="range"
            v-model.number="filter.saturation"
            min="0"
            max="200"
            step="1"
          />
          <span>{{ filter.saturation }}%</span>
        </div>

        <div class="filter-slider">
          <label>模糊</label>
          <input
            type="range"
            v-model.number="filter.blur"
            min="0"
            max="10"
            step="0.1"
          />
          <span>{{ filter.blur }}px</span>
        </div>
      </div>

      <div class="preset-section">
        <div class="section-title">预设滤镜</div>
        <div class="preset-buttons">
          <button
            v-for="(preset, index) in FILTER_PRESETS"
            :key="index"
            class="preset-btn"
            @click="setPreset(index)"
          >
            {{ preset.name }}
          </button>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn reset-btn" @click="resetFilter">
          重置滤镜
        </button>
        <button class="action-btn confirm-btn" @click="confirmImage">
          确认使用
        </button>
        <button class="action-btn clear-btn" @click="clearImage">
          清除图片
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.custom-image-uploader {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #FAFAFA;
  border: 3px solid #212121;
  box-shadow: 4px 4px 0 #212121;
  border-radius: 4px;
  font-family: inherit;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  background: #FFFFFF;
  border: 3px dashed #212121;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.upload-area:hover {
  background: #FFF8E1;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #212121;
}

.upload-area:active {
  transform: translate(0, 0);
  box-shadow: 2px 2px 0 #212121;
}

.upload-icon {
  font-size: 48px;
  line-height: 1;
}

.upload-text {
  font-size: 18px;
  font-weight: 700;
  color: #212121;
}

.upload-hint {
  font-size: 13px;
  color: #757575;
}

.preview-wrapper {
  display: flex;
  justify-content: center;
}

.preview-canvas {
  width: 300px;
  height: 300px;
  border: 3px solid #212121;
  box-shadow: 4px 4px 0 #212121;
  border-radius: 4px;
  cursor: move;
  background: #FFFFFF;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-section {
  background: #FFFFFF;
  border: 2px solid #212121;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 3px 3px 0 #212121;
}

.filter-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.filter-slider:last-child {
  margin-bottom: 0;
}

.filter-slider label {
  width: 60px;
  font-size: 13px;
  font-weight: 600;
  color: #212121;
}

.filter-slider input[type="range"] {
  flex: 1;
  height: 6px;
  appearance: none;
  background: #E0E0E0;
  border: 2px solid #212121;
  border-radius: 3px;
  cursor: pointer;
}

.filter-slider input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #FFD54F;
  border: 2px solid #212121;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 2px 2px 0 #212121;
}

.filter-slider input[type="range"]::-webkit-slider-thumb:hover {
  background: #FFC107;
}

.filter-slider span {
  width: 55px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: #424242;
  font-variant-numeric: tabular-nums;
}

.preset-section {
  background: #FFFFFF;
  border: 2px solid #212121;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 3px 3px 0 #212121;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-btn {
  padding: 6px 14px;
  background: #FAFAFA;
  border: 2px solid #212121;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #212121;
  cursor: pointer;
  box-shadow: 2px 2px 0 #212121;
  transition: all 0.1s ease;
}

.preset-btn:hover {
  background: #FFD54F;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #212121;
}

.preset-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #212121;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border: 3px solid #212121;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 3px 3px 0 #212121;
  transition: all 0.1s ease;
}

.action-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 #212121;
}

.action-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #212121;
}

.reset-btn {
  background: #FAFAFA;
  color: #212121;
}

.reset-btn:hover {
  background: #E0E0E0;
}

.confirm-btn {
  background: #FFD54F;
  color: #212121;
}

.confirm-btn:hover {
  background: #FFC107;
}

.clear-btn {
  background: #EF5350;
  color: #FFFFFF;
}

.clear-btn:hover {
  background: #E53935;
}
</style>
