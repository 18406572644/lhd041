<script setup lang="ts">
import { computed } from 'vue';
import type { PortraitConfig, ArtStyle, ImageFilterSettings } from '../../types';
import { ART_STYLES, HAIR_STYLES, EYE_STYLES, COSTUME_STYLES, ACCESSORIES, HAIR_COLORS, EYE_COLORS, COSTUME_COLORS } from '../../data/portraitAssets';

const props = defineProps<{
  modelValue: PortraitConfig;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', config: PortraitConfig): void;
}>();

function update<K extends keyof PortraitConfig>(key: K, value: PortraitConfig[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}

function updateNested(group: string, key: string, value: any) {
  const groupData = (props.modelValue as any)[group];
  emit('update:modelValue', {
    ...props.modelValue,
    [group]: { ...groupData, [key]: value }
  });
}

function setArtStyle(style: ArtStyle) {
  const hairOptions = HAIR_STYLES[style];
  const eyeOptions = EYE_STYLES[style];
  const costumeOptions = COSTUME_STYLES[style];
  emit('update:modelValue', {
    ...props.modelValue,
    artStyle: style,
    hair: { ...props.modelValue.hair, styleId: hairOptions[0]?.id || '' },
    eyes: { ...props.modelValue.eyes, styleId: eyeOptions[0]?.id || '' },
    costume: { ...props.modelValue.costume, styleId: costumeOptions[0]?.id || '' }
  });
}

function toggleAccessory(accId: string) {
  const current = props.modelValue.accessories;
  if (current.includes(accId)) {
    update('accessories', current.filter(id => id !== accId));
  } else {
    update('accessories', [...current, accId]);
  }
}

const hairOptions = computed(() => HAIR_STYLES[props.modelValue.artStyle] || []);
const eyeOptions = computed(() => EYE_STYLES[props.modelValue.artStyle] || []);
const costumeOptions = computed(() => COSTUME_STYLES[props.modelValue.artStyle] || []);

const bodyShapes = [
  { id: 'slim', name: '纤细', emoji: '🦴' },
  { id: 'athletic', name: '运动', emoji: '💪' },
  { id: 'muscular', name: '肌肉', emoji: '🏋️' },
  { id: 'large', name: '魁梧', emoji: '🐻' },
  { id: 'robotic', name: '机械', emoji: '🤖' }
];

const genderBiases = [
  { id: 'masculine', name: '阳刚', emoji: '♂️' },
  { id: 'feminine', name: '阴柔', emoji: '♀️' },
  { id: 'neutral', name: '中性', emoji: '⚧️' }
];
</script>

<template>
  <div class="portrait-editor">
    <div class="section-title">
      <span>🎨</span>
      <span>立绘元素编辑</span>
    </div>

    <div class="editor-section">
      <div class="section-label">画风选择</div>
      <div class="art-style-grid">
        <button
          v-for="style in ART_STYLES"
          :key="style.id"
          class="art-style-btn"
          :class="{ active: modelValue.artStyle === style.id }"
          :title="style.description"
          @click="setArtStyle(style.id)"
        >
          <span class="style-emoji">{{ style.emoji }}</span>
          <span class="style-name">{{ style.name }}</span>
        </button>
      </div>
    </div>

    <div class="editor-row">
      <div class="editor-section half">
        <div class="section-label">体型</div>
        <div class="btn-group">
          <button
            v-for="shape in bodyShapes"
            :key="shape.id"
            class="option-btn"
            :class="{ active: modelValue.bodyShape === shape.id }"
            :title="shape.name"
            @click="update('bodyShape', shape.id as any)"
          >
            <span>{{ shape.emoji }}</span>
            <span class="btn-label">{{ shape.name }}</span>
          </button>
        </div>
      </div>

      <div class="editor-section half">
        <div class="section-label">性别倾向</div>
        <div class="btn-group">
          <button
            v-for="gb in genderBiases"
            :key="gb.id"
            class="option-btn"
            :class="{ active: modelValue.genderBias === gb.id }"
            :title="gb.name"
            @click="update('genderBias', gb.id as any)"
          >
            <span>{{ gb.emoji }}</span>
            <span class="btn-label">{{ gb.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="editor-section">
      <div class="section-label">发型</div>
      <div class="style-grid">
        <button
          v-for="hair in hairOptions"
          :key="hair.id"
          class="style-card"
          :class="{ active: modelValue.hair.styleId === hair.id }"
          @click="updateNested('hair', 'styleId', hair.id)"
        >
          <span class="card-label">{{ hair.name }}</span>
        </button>
      </div>
    </div>

    <div class="editor-section">
      <div class="section-label">发色</div>
      <div class="color-grid">
        <button
          v-for="color in HAIR_COLORS"
          :key="color"
          class="color-swatch"
          :class="{ active: modelValue.hair.color === color }"
          :style="{ background: color }"
          :title="color"
          @click="updateNested('hair', 'color', color)"
        />
      </div>
    </div>

    <div class="editor-section">
      <div class="section-label">眼睛风格</div>
      <div class="style-grid">
        <button
          v-for="eye in eyeOptions"
          :key="eye.id"
          class="style-card"
          :class="{ active: modelValue.eyes.styleId === eye.id }"
          @click="updateNested('eyes', 'styleId', eye.id)"
        >
          <span class="card-label">{{ eye.name }}</span>
        </button>
      </div>
    </div>

    <div class="editor-section">
      <div class="section-label">眼睛颜色</div>
      <div class="color-grid">
        <button
          v-for="color in EYE_COLORS"
          :key="color"
          class="color-swatch"
          :class="{ active: modelValue.eyes.color === color }"
          :style="{ background: color }"
          :title="color"
          @click="updateNested('eyes', 'color', color)"
        />
      </div>
    </div>

    <div class="editor-section">
      <div class="section-label">服装风格</div>
      <div class="style-grid">
        <button
          v-for="costume in costumeOptions"
          :key="costume.id"
          class="style-card"
          :class="{ active: modelValue.costume.styleId === costume.id }"
          @click="updateNested('costume', 'styleId', costume.id)"
        >
          <span class="card-label">{{ costume.name }}</span>
        </button>
      </div>
    </div>

    <div class="editor-section">
      <div class="section-label">服装配色</div>
      <div class="costume-color-grid">
        <button
          v-for="(cc, idx) in COSTUME_COLORS"
          :key="idx"
          class="costume-color-swatch"
          :class="{
            active: modelValue.costume.primaryColor === cc.primary &&
                   modelValue.costume.secondaryColor === cc.secondary
          }"
          @click="() => {
            updateNested('costume', 'primaryColor', cc.primary);
            updateNested('costume', 'secondaryColor', cc.secondary);
          }"
        >
          <span class="primary" :style="{ background: cc.primary }" />
          <span class="secondary" :style="{ background: cc.secondary }" />
        </button>
      </div>
    </div>

    <div class="editor-section">
      <div class="section-label">
        <span>配饰</span>
        <span class="count">({{ modelValue.accessories.length }})</span>
      </div>
      <div class="accessories-grid">
        <button
          v-for="acc in ACCESSORIES"
          :key="acc.id"
          class="accessory-chip"
          :class="{ active: modelValue.accessories.includes(acc.id) }"
          :title="acc.name"
          @click="toggleAccessory(acc.id)"
        >
          <span class="chip-emoji">{{ acc.emoji }}</span>
          <span class="chip-label">{{ acc.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portrait-editor {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 4px 4px 0 #212121;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Bangers', cursive;
  font-size: 24px;
  color: #e53935;
  text-shadow: 2px 2px 0 #212121;
  letter-spacing: 1px;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.editor-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.editor-section.half {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto Slab', serif;
  font-size: 14px;
  font-weight: 700;
  color: #424242;
}

.section-label .count {
  font-weight: 400;
  color: #757575;
  font-size: 12px;
}

.art-style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
}

.art-style-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 10px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  color: #212121;
}

.art-style-btn:hover {
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.art-style-btn.active {
  background: #e53935;
  border-color: #fdd835;
  color: #fafafa;
}

.style-emoji {
  font-size: 28px;
}

.style-name {
  font-size: 12px;
  text-align: center;
}

.btn-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 6px;
}

.option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  color: #212121;
}

.option-btn:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.option-btn.active {
  background: #fdd835;
  border-color: #212121;
}

.btn-label {
  font-size: 11px;
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 8px;
}

.style-card {
  padding: 12px 10px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
  text-align: center;
}

.style-card:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.style-card.active {
  background: #1565c0;
  border-color: #fdd835;
  color: #fafafa;
}

.card-label {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 13px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 8px;
}

.color-swatch {
  aspect-ratio: 1;
  border: 3px solid #212121;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
  padding: 0;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch.active {
  border-color: #fdd835;
  box-shadow: 0 0 0 3px #e53935, 3px 3px 0 #212121;
}

.costume-color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 10px;
}

.costume-color-swatch {
  display: flex;
  overflow: hidden;
  aspect-ratio: 2 / 1;
  border: 3px solid #212121;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
  padding: 0;
}

.costume-color-swatch:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 4px 4px 0 #212121;
}

.costume-color-swatch.active {
  border-color: #fdd835;
  box-shadow: 0 0 0 3px #e53935, 3px 3px 0 #212121;
}

.costume-color-swatch .primary,
.costume-color-swatch .secondary {
  flex: 1;
  display: block;
}

.accessories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.accessory-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  color: #212121;
}

.accessory-chip:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.accessory-chip.active {
  background: #7b1fa2;
  border-color: #fdd835;
  color: #fafafa;
}

.chip-emoji {
  font-size: 18px;
}

.chip-label {
  font-size: 11px;
  text-align: center;
}

@media (max-width: 768px) {
  .editor-row {
    grid-template-columns: 1fr;
  }

  .art-style-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .style-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .accessories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
