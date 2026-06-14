<script setup lang="ts">
import { computed } from 'vue';
import type { PortraitConfig, ArtStyle, ImageFilterSettings } from '../../types';
import { SKIN_COLORS, getSkinToneForGender } from '../../data/portraitAssets';

const props = withDefaults(defineProps<{
  config: PortraitConfig;
  size?: 'small' | 'medium' | 'large';
  showBackground?: boolean;
}>(), {
  size: 'medium',
  showBackground: true
});

const sizeMap = {
  small: { w: 80, h: 100 },
  medium: { w: 160, h: 200 },
  large: { w: 320, h: 400 }
};

const viewBoxSize = 200;
const displaySize = computed(() => sizeMap[props.size]);

const skinColor = computed(() => getSkinToneForGender(props.config.genderBias));

const filterStyle = computed(() => {
  const f = props.config.imageFilter;
  if (!f) return '';
  const filters: string[] = [];
  if (f.grayscale > 0) filters.push(`grayscale(${f.grayscale}%)`);
  if (f.sepia > 0) filters.push(`sepia(${f.sepia}%)`);
  if (f.brightness !== 100) filters.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) filters.push(`contrast(${f.contrast}%)`);
  if (f.saturation !== 100) filters.push(`saturate(${f.saturation}%)`);
  if (f.blur > 0) filters.push(`blur(${f.blur}px)`);
  return filters.join(' ');
});

const strokeWidth = computed(() => {
  switch (props.config.artStyle) {
    case 'pixel': return 0;
    case 'comic': return 3;
    case 'anime': return 2;
    case 'cyberpunk': return 2;
    case 'realistic': return 1;
    default: return 2;
  }
});

const bgGradient = computed(() => ({
  primary: props.config.costume.primaryColor,
  secondary: props.config.costume.secondaryColor
}));

function getHeadShape() {
  const cx = 100;
  const cy = 60;
  const r = props.config.genderBias === 'feminine' ? 32 : 34;
  switch (props.config.artStyle) {
    case 'pixel':
      return `M ${cx - r} ${cy} L ${cx - r + 5} ${cy - r + 5} L ${cx + r - 5} ${cy - r + 5} L ${cx + r} ${cy} L ${cx + r - 5} ${cy + r - 5} L ${cx - r + 5} ${cy + r - 5} Z`;
    case 'comic':
      return `M ${cx - r} ${cy - 5} Q ${cx - r} ${cy - r} ${cx} ${cy - r} Q ${cx + r} ${cy - r} ${cx + r} ${cy - 5} Q ${cx + r} ${cy + r * 0.8} ${cx} ${cy + r - 5} Q ${cx - r} ${cy + r * 0.8} ${cx - r} ${cy - 5} Z`;
    case 'anime':
      return `M ${cx - r + 3} ${cy - r + 8} Q ${cx - r - 2} ${cy + r - 10} ${cx} ${cy + r - 2} Q ${cx + r + 2} ${cy + r - 10} ${cx + r - 3} ${cy - r + 8} Q ${cx} ${cy - r - 5} ${cx - r + 3} ${cy - r + 8} Z`;
    case 'cyberpunk':
      return `M ${cx - r + 2} ${cy - r + 3} L ${cx + r - 2} ${cy - r + 3} L ${cx + r - 4} ${cy - 5} L ${cx + r - 2} ${cy + 8} L ${cx + r - 6} ${cy + r - 3} L ${cx - r + 6} ${cy + r - 3} L ${cx - r + 2} ${cy + 8} L ${cx - r + 4} ${cy - 5} Z`;
    case 'realistic':
      return `M ${cx - r} ${cy} Q ${cx - r} ${cy - r} ${cx} ${cy - r} Q ${cx + r} ${cy - r} ${cx + r} ${cy} Q ${cx + r} ${cy + r} ${cx} ${cy + r} Q ${cx - r} ${cy + r} ${cx - r} ${cy} Z`;
    default:
      return '';
  }
}

function renderHair() {
  const cx = 100;
  const cy = 60;
  const r = 34;
  const color = props.config.hair.color;
  const styleId = props.config.hair.styleId;
  const sw = strokeWidth.value;
  if (styleId.includes('bald')) return '';
  switch (props.config.artStyle) {
    case 'pixel':
      if (styleId.includes('short')) {
        return `<rect x="${cx - r - 2}" y="${cy - r - 2}" width="${(r + 2) * 2}" height="18" fill="${color}"/><rect x="${cx - r - 6}" y="${cy - r + 4}" width="8" height="22" fill="${color}"/><rect x="${cx + r - 2}" y="${cy - r + 4}" width="8" height="22" fill="${color}"/>`;
      }
      if (styleId.includes('long')) {
        return `<rect x="${cx - r - 2}" y="${cy - r - 2}" width="${(r + 2) * 2}" height="20" fill="${color}"/><rect x="${cx - r - 8}" y="${cy - r + 8}" width="10" height="55" fill="${color}"/><rect x="${cx + r - 2}" y="${cy - r + 8}" width="10" height="55" fill="${color}"/><rect x="${cx - r + 4}" y="${cy + r - 10}" width="${r * 2 - 8}" height="12" fill="${color}"/>`;
      }
      if (styleId.includes('spiky')) {
        return `<polygon points="${cx - r - 2},${cy - r + 10} ${cx - r + 5},${cy - r - 15} ${cx - 8},${cy - r + 5}" fill="${color}"/><polygon points="${cx - 5},${cy - r + 3} ${cx},${cy - r - 18} ${cx + 5},${cy - r + 3}" fill="${color}"/><polygon points="${cx + 8},${cy - r + 5} ${cx + r - 5},${cy - r - 15} ${cx + r + 2},${cy - r + 10}" fill="${color}"/><rect x="${cx - r - 2}" y="${cy - r + 8}" width="${(r + 2) * 2}" height="14" fill="${color}"/>`;
      }
      if (styleId.includes('mohawk')) {
        return `<rect x="${cx - 6}" y="${cy - r - 20}" width="12" height="45" fill="${color}"/><polygon points="${cx - 6},${cy - r - 20} ${cx},${cy - r - 28} ${cx + 6},${cy - r - 20}" fill="${color}"/>`;
      }
      if (styleId.includes('curly')) {
        return `<circle cx="${cx - 20}" cy="${cy - 20}" r="12" fill="${color}"/><circle cx="${cx}" cy="${cy - 28}" r="14" fill="${color}"/><circle cx="${cx + 20}" cy="${cy - 20}" r="12" fill="${color}"/><circle cx="${cx - 28}" cy="${cy - 5}" r="10" fill="${color}"/><circle cx="${cx + 28}" cy="${cy - 5}" r="10" fill="${color}"/>`;
      }
      return `<rect x="${cx - r - 2}" y="${cy - r - 2}" width="${(r + 2) * 2}" height="18" fill="${color}"/>`;
    case 'comic':
      if (styleId.includes('spiky')) {
        return `<polygon points="${cx - r - 5},${cy - 5} ${cx - r - 8},${cy - r - 5} ${cx - 20},${cy - r - 15} ${cx - 10},${cy - r + 5}" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><polygon points="${cx - 10},${cy - r + 5} ${cx - 5},${cy - r - 25} ${cx + 5},${cy - r - 25} ${cx + 10},${cy - r + 5}" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><polygon points="${cx + 10},${cy - r + 5} ${cx + 20},${cy - r - 15} ${cx + r + 8},${cy - r - 5} ${cx + r + 5},${cy - 5}" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - r - 5} ${cy - 5} Q ${cx} ${cy + 5} ${cx + r + 5} ${cy - 5} L ${cx + r} ${cy + 15} L ${cx - r} ${cy + 15} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }
      if (styleId.includes('long')) {
        return `<path d="M ${cx - r} ${cy} Q ${cx - r - 10} ${cy - r - 5} ${cx} ${cy - r - 8} Q ${cx + r + 10} ${cy - r - 5} ${cx + r} ${cy} L ${cx + r + 5} ${cy + r + 30} Q ${cx} ${cy + r + 40} ${cx - r - 5} ${cy + r + 30} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }
      if (styleId.includes('buzz')) {
        return `<ellipse cx="${cx}" cy="${cy - 10}" rx="${r}" ry="20" fill="${color}" stroke="#212121" stroke-width="${sw}"/>`;
      }
      if (styleId.includes('mullet')) {
        return `<path d="M ${cx - r} ${cy - 5} Q ${cx} ${cy - r - 8} ${cx + r} ${cy - 5} L ${cx + r - 10} ${cy + 10} L ${cx + r - 5} ${cy + r + 15} Q ${cx} ${cy + r + 20} ${cx - r + 5} ${cy + r + 15} L ${cx - r + 10} ${cy + 10} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }
      return `<path d="M ${cx - r} ${cy} Q ${cx - r - 5} ${cy - r - 5} ${cx} ${cy - r - 5} Q ${cx + r + 5} ${cy - r - 5} ${cx + r} ${cy} L ${cx + r - 5} ${cy + 15} L ${cx - r + 5} ${cy + 15} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
    case 'anime':
      if (styleId.includes('spiky')) {
        return `<polygon points="${cx - r - 3},${cy - 10} ${cx - 22},${cy - r - 20} ${cx - 15},${cy - r + 5}" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><polygon points="${cx - 15},${cy - r + 5} ${cx - 8},${cy - r - 30} ${cx},${cy - r + 5}" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><polygon points="${cx},${cy - r + 5} ${cx + 8},${cy - r - 30} ${cx + 15},${cy - r + 5}" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><polygon points="${cx + 15},${cy - r + 5} ${cx + 22},${cy - r - 20} ${cx + r + 3},${cy - 10}" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - r - 3} ${cy - 10} Q ${cx} ${cy + 8} ${cx + r + 3} ${cy - 10} L ${cx + r - 5} ${cy + 20} L ${cx - r + 5} ${cy + 20} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }
      if (styleId.includes('long')) {
        return `<path d="M ${cx - r + 5} ${cy} Q ${cx - r - 15} ${cy - r - 10} ${cx} ${cy - r - 15} Q ${cx + r + 15} ${cy - r - 10} ${cx + r - 5} ${cy} L ${cx + r + 8} ${cy + r + 55} Q ${cx} ${cy + r + 60} ${cx - r - 8} ${cy + r + 55} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }
      if (styleId.includes('twintail')) {
        return `<path d="M ${cx - r + 5} ${cy - 5} Q ${cx} ${cy - r - 12} ${cx + r - 5} ${cy - 5} L ${cx + r - 10} ${cy + 20} L ${cx - r + 10} ${cy + 20} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><ellipse cx="${cx - r - 10}" cy="${cy + 40}" rx="18" ry="40" fill="${color}" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${cx + r + 10}" cy="${cy + 40}" rx="18" ry="40" fill="${color}" stroke="#212121" stroke-width="${sw}"/>`;
      }
      if (styleId.includes('ponytail')) {
        return `<path d="M ${cx - r + 5} ${cy - 5} Q ${cx} ${cy - r - 12} ${cx + r - 5} ${cy - 5} L ${cx + r - 10} ${cy + 20} L ${cx - r + 10} ${cy + 20} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><ellipse cx="${cx + 20}" cy="${cy + 45}" rx="12" ry="45" fill="${color}" stroke="#212121" stroke-width="${sw}" transform="rotate(20 ${cx + 20} ${cy + 45})"/>`;
      }
      if (styleId.includes('bob')) {
        return `<path d="M ${cx - r + 5} ${cy - 5} Q ${cx} ${cy - r - 10} ${cx + r - 5} ${cy - 5} L ${cx + r} ${cy + r + 3} L ${cx - r} ${cy + r + 3} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }
      if (styleId.includes('messy')) {
        return `<ellipse cx="${cx - 15}" cy="${cy - 15}" rx="15" ry="18" fill="${color}" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${cx}" cy="${cy - 25}" rx="20" ry="22" fill="${color}" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${cx + 15}" cy="${cy - 15}" rx="15" ry="18" fill="${color}" stroke="#212121" stroke-width="${sw}"/><path d="M ${cx - r - 2} ${cy - 5} L ${cx - r + 8} ${cy + 15} L ${cx + r - 8} ${cy + 15} L ${cx + r + 2} ${cy - 5} Z" fill="${color}" stroke="#212121" stroke-width="${sw}"/>`;
      }
      return `<path d="M ${cx - r + 5} ${cy - 5} Q ${cx} ${cy - r - 10} ${cx + r - 5} ${cy - 5} L ${cx + r - 8} ${cy + 18} L ${cx - r + 8} ${cy + 18} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
    case 'cyberpunk':
      if (styleId.includes('neon') || styleId.includes('data')) {
        return `<path d="M ${cx - r} ${cy - 5} L ${cx - r - 8} ${cy - r - 10} L ${cx - 10} ${cy - r - 20} L ${cx} ${cy - r - 25} L ${cx + 10} ${cy - r - 20} L ${cx + r + 8} ${cy - r - 10} L ${cx + r} ${cy - 5} L ${cx + r - 5} ${cy + 20} L ${cx - r + 5} ${cy + 20} Z" fill="${color}" stroke="#00E5FF" stroke-width="${sw}" stroke-linejoin="round"/><line x1="${cx - 20}" y1="${cy - 20}" x2="${cx - 15}" y2="${cy}" stroke="#00E5FF" stroke-width="1" opacity="0.7"/><line x1="${cx}" y1="${cy - 25}" x2="${cx}" y2="${cy}" stroke="#D500F9" stroke-width="1" opacity="0.7"/><line x1="${cx + 20}" y1="${cy - 20}" x2="${cx + 15}" y2="${cy}" stroke="#00E5FF" stroke-width="1" opacity="0.7"/>`;
      }
      if (styleId.includes('mohawk')) {
        return `<rect x="${cx - 8}" y="${cy - r - 30}" width="16" height="55" fill="${color}" stroke="#00E5FF" stroke-width="${sw}"/><polygon points="${cx - 8},${cy - r - 30} ${cx},${cy - r - 45} ${cx + 8},${cy - r - 30}" fill="${color}" stroke="#D500F9" stroke-width="${sw}"/><rect x="${cx - 4}" y="${cy - r - 5}" width="8" height="40" fill="#00E5FF" opacity="0.6"/>`;
      }
      if (styleId.includes('shaved')) {
        return `<path d="M ${cx - r + 10} ${cy - 5} Q ${cx} ${cy - r - 8} ${cx + r - 10} ${cy - 5} L ${cx + r - 5} ${cy + 18} L ${cx - r + 5} ${cy + 18} Z" fill="${color}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><line x1="${cx - r + 12}" y1="${cy - 8}" x2="${cx - r + 5}" y2="${cy + 8}" stroke="#00E5FF" stroke-width="2"/><line x1="${cx + r - 12}" y1="${cy - 8}" x2="${cx + r - 5}" y2="${cy + 8}" stroke="#00E5FF" stroke-width="2"/>`;
      }
      return `<path d="M ${cx - r} ${cy - 5} L ${cx - r - 5} ${cy - r - 8} L ${cx} ${cy - r - 15} L ${cx + r + 5} ${cy - r - 8} L ${cx + r} ${cy - 5} L ${cx + r - 5} ${cy + 18} L ${cx - r + 5} ${cy + 18} Z" fill="${color}" stroke="#00E5FF" stroke-width="${sw}" stroke-linejoin="round"/>`;
    case 'realistic':
      if (styleId.includes('short')) {
        return `<path d="M ${cx - r + 3} ${cy - 3} Q ${cx - r - 2} ${cy - r + 3} ${cx} ${cy - r - 2} Q ${cx + r + 2} ${cy - r + 3} ${cx + r - 3} ${cy - 3} Q ${cx + r} ${cy + 5} ${cx} ${cy + 8} Q ${cx - r} ${cy + 5} ${cx - r + 3} ${cy - 3} Z" fill="${color}"/>`;
      }
      if (styleId.includes('long')) {
        return `<path d="M ${cx - r + 3} ${cy - 5} Q ${cx - r - 8} ${cy - r} ${cx} ${cy - r - 5} Q ${cx + r + 8} ${cy - r} ${cx + r - 3} ${cy - 5} L ${cx + r + 3} ${cy + r + 25} Q ${cx} ${cy + r + 30} ${cx - r - 3} ${cy + r + 25} Z" fill="${color}"/>`;
      }
      if (styleId.includes('curly')) {
        return `<circle cx="${cx - 18}" cy="${cy - 15}" r="14" fill="${color}"/><circle cx="${cx}" cy="${cy - 22}" r="16" fill="${color}"/><circle cx="${cx + 18}" cy="${cy - 15}" r="14" fill="${color}"/><circle cx="${cx - 25}" cy="${cy + 5}" r="11" fill="${color}"/><circle cx="${cx + 25}" cy="${cy + 5}" r="11" fill="${color}"/><circle cx="${cx - 15}" cy="${cy + r + 5}" r="10" fill="${color}"/><circle cx="${cx + 15}" cy="${cy + r + 5}" r="10" fill="${color}"/>`;
      }
      if (styleId.includes('wavy')) {
        return `<path d="M ${cx - r + 3} ${cy - 5} Q ${cx - r - 5} ${cy - r + 5} ${cx - 10} ${cy - r - 2} Q ${cx} ${cy - r - 10} ${cx + 10} ${cy - r - 2} Q ${cx + r + 5} ${cy - r + 5} ${cx + r - 3} ${cy - 5} Q ${cx + r} ${cy + 8} ${cx} ${cy + 10} Q ${cx - r} ${cy + 8} ${cx - r + 3} ${cy - 5} Z" fill="${color}"/>`;
      }
      if (styleId.includes('crew')) {
        return `<ellipse cx="${cx}" cy="${cy - 12}" rx="${r - 2}" ry="15" fill="${color}"/>`;
      }
      return `<ellipse cx="${cx}" cy="${cy - 15}" rx="${r}" ry="22" fill="${color}"/>`;
    default:
      return '';
  }
}

function renderEyes() {
  const color = props.config.eyes.color;
  const styleId = props.config.eyes.styleId;
  const leftEyeX = 87;
  const rightEyeX = 113;
  const eyeY = 60;
  const sw = strokeWidth.value;
  switch (props.config.artStyle) {
    case 'pixel':
      if (styleId.includes('glow')) {
        return `<rect x="${leftEyeX - 3}" y="${eyeY - 2}" width="6" height="6" fill="${color}" opacity="0.5"/><rect x="${rightEyeX - 3}" y="${eyeY - 2}" width="6" height="6" fill="${color}" opacity="0.5"/><rect x="${leftEyeX - 2}" y="${eyeY - 1}" width="4" height="4" fill="${color}"/><rect x="${rightEyeX - 2}" y="${eyeY - 1}" width="4" height="4" fill="${color}"/><rect x="${leftEyeX - 1}" y="${eyeY}" width="2" height="2" fill="#FFFFFF"/><rect x="${rightEyeX - 1}" y="${eyeY}" width="2" height="2" fill="#FFFFFF"/>`;
      }
      if (styleId.includes('square')) {
        return `<rect x="${leftEyeX - 3}" y="${eyeY - 2}" width="6" height="5" fill="${color}" stroke="#212121" stroke-width="1"/><rect x="${rightEyeX - 3}" y="${eyeY - 2}" width="6" height="5" fill="${color}" stroke="#212121" stroke-width="1"/><rect x="${leftEyeX - 1}" y="${eyeY - 1}" width="2" height="2" fill="#FFFFFF"/><rect x="${rightEyeX - 1}" y="${eyeY - 1}" width="2" height="2" fill="#FFFFFF"/>`;
      }
      return `<rect x="${leftEyeX - 2}" y="${eyeY - 1}" width="4" height="4" fill="${color}"/><rect x="${rightEyeX - 2}" y="${eyeY - 1}" width="4" height="4" fill="${color}"/><rect x="${leftEyeX}" y="${eyeY}" width="1" height="1" fill="#FFFFFF"/><rect x="${rightEyeX}" y="${eyeY}" width="1" height="1" fill="#FFFFFF"/>`;
    case 'comic':
      if (styleId.includes('squint')) {
        return `<path d="M ${leftEyeX - 7} ${eyeY + 2} L ${leftEyeX + 7} ${eyeY - 2}" stroke="#212121" stroke-width="${sw}" stroke-linecap="round"/><path d="M ${rightEyeX - 7} ${eyeY + 2} L ${rightEyeX + 7} ${eyeY - 2}" stroke="#212121" stroke-width="${sw}" stroke-linecap="round"/>`;
      }
      if (styleId.includes('mask')) {
        return `<path d="M ${leftEyeX - 12} ${eyeY - 10} L ${leftEyeX + 12} ${eyeY - 10} L ${leftEyeX + 8} ${eyeY + 8} L ${leftEyeX - 8} ${eyeY + 8} Z" fill="#212121" stroke="#212121" stroke-width="${sw}"/><path d="M ${rightEyeX - 12} ${eyeY - 10} L ${rightEyeX + 12} ${eyeY - 10} L ${rightEyeX + 8} ${eyeY + 8} L ${rightEyeX - 8} ${eyeY + 8} Z" fill="#212121" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${leftEyeX}" cy="${eyeY}" rx="3" ry="2" fill="${color}"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="3" ry="2" fill="${color}"/>`;
      }
      if (styleId.includes('glow')) {
        return `<circle cx="${leftEyeX}" cy="${eyeY}" r="9" fill="${color}" opacity="0.3"/><circle cx="${rightEyeX}" cy="${eyeY}" r="9" fill="${color}" opacity="0.3"/><ellipse cx="${leftEyeX}" cy="${eyeY}" rx="6" ry="5" fill="${color}" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="6" ry="5" fill="${color}" stroke="#212121" stroke-width="${sw}"/><circle cx="${leftEyeX + 1}" cy="${eyeY - 1}" r="2" fill="#FFFFFF"/><circle cx="${rightEyeX + 1}" cy="${eyeY - 1}" r="2" fill="#FFFFFF"/>`;
      }
      return `<ellipse cx="${leftEyeX}" cy="${eyeY}" rx="7" ry="5" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="7" ry="5" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${leftEyeX}" cy="${eyeY}" rx="4" ry="3" fill="${color}"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="4" ry="3" fill="${color}"/><circle cx="${leftEyeX + 1}" cy="${eyeY - 1}" r="1.5" fill="#FFFFFF"/><circle cx="${rightEyeX + 1}" cy="${eyeY - 1}" r="1.5" fill="#FFFFFF"/>`;
    case 'anime':
      if (styleId.includes('big')) {
        return `<ellipse cx="${leftEyeX}" cy="${eyeY}" rx="10" ry="12" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="10" ry="12" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${leftEyeX}" cy="${eyeY + 2}" rx="6" ry="8" fill="${color}"/><ellipse cx="${rightEyeX}" cy="${eyeY + 2}" rx="6" ry="8" fill="${color}"/><ellipse cx="${leftEyeX}" cy="${eyeY + 4}" rx="4" ry="5" fill="#212121" opacity="0.4"/><ellipse cx="${rightEyeX}" cy="${eyeY + 4}" rx="4" ry="5" fill="#212121" opacity="0.4"/><circle cx="${leftEyeX - 2}" cy="${eyeY - 4}" r="2.5" fill="#FFFFFF"/><circle cx="${rightEyeX - 2}" cy="${eyeY - 4}" r="2.5" fill="#FFFFFF"/><circle cx="${leftEyeX + 3}" cy="${eyeY - 2}" r="1.2" fill="#FFFFFF"/><circle cx="${rightEyeX + 3}" cy="${eyeY - 2}" r="1.2" fill="#FFFFFF"/><path d="M ${leftEyeX - 10} ${eyeY - 10} L ${leftEyeX - 6} ${eyeY - 12} L ${leftEyeX - 2} ${eyeY - 11}" stroke="#212121" stroke-width="${sw}" stroke-linecap="round" fill="none"/><path d="M ${rightEyeX + 2} ${eyeY - 11} L ${rightEyeX + 6} ${eyeY - 12} L ${rightEyeX + 10} ${eyeY - 10}" stroke="#212121" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
      }
      if (styleId.includes('sharp')) {
        return `<path d="M ${leftEyeX - 10} ${eyeY + 3} L ${leftEyeX - 10} ${eyeY - 5} L ${leftEyeX + 8} ${eyeY - 5} L ${leftEyeX + 10} ${eyeY + 3} Z" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${rightEyeX - 10} ${eyeY + 3} L ${rightEyeX - 10} ${eyeY - 5} L ${rightEyeX + 8} ${eyeY - 5} L ${rightEyeX + 10} ${eyeY + 3} Z" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><polygon points="${leftEyeX - 4},${eyeY - 4} ${leftEyeX + 6},${eyeY - 4} ${leftEyeX + 5},${eyeY + 3} ${leftEyeX - 5},${eyeY + 3}" fill="${color}"/><polygon points="${rightEyeX - 4},${eyeY - 4} ${rightEyeX + 6},${eyeY - 4} ${rightEyeX + 5},${eyeY + 3} ${rightEyeX - 5},${eyeY + 3}" fill="${color}"/><circle cx="${leftEyeX + 2}" cy="${eyeY - 2}" r="2" fill="#FFFFFF"/><circle cx="${rightEyeX + 2}" cy="${eyeY - 2}" r="2" fill="#FFFFFF"/>`;
      }
      if (styleId.includes('soft')) {
        return `<ellipse cx="${leftEyeX}" cy="${eyeY}" rx="9" ry="8" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="9" ry="8" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><circle cx="${leftEyeX}" cy="${eyeY}" r="5" fill="${color}"/><circle cx="${rightEyeX}" cy="${eyeY}" r="5" fill="${color}"/><circle cx="${leftEyeX - 2}" cy="${eyeY - 2}" r="2.5" fill="#FFFFFF"/><circle cx="${rightEyeX - 2}" cy="${eyeY - 2}" r="2.5" fill="#FFFFFF"/>`;
      }
      if (styleId.includes('hetero')) {
        return `<ellipse cx="${leftEyeX}" cy="${eyeY}" rx="10" ry="11" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="10" ry="11" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${leftEyeX}" cy="${eyeY + 2}" rx="6" ry="7" fill="${color}"/><ellipse cx="${rightEyeX}" cy="${eyeY + 2}" rx="6" ry="7" fill="#B71C1C"/><circle cx="${leftEyeX - 2}" cy="${eyeY - 3}" r="2" fill="#FFFFFF"/><circle cx="${rightEyeX - 2}" cy="${eyeY - 3}" r="2" fill="#FFFFFF"/>`;
      }
      if (styleId.includes('glow')) {
        return `<circle cx="${leftEyeX}" cy="${eyeY}" r="12" fill="${color}" opacity="0.3"/><circle cx="${rightEyeX}" cy="${eyeY}" r="12" fill="${color}" opacity="0.3"/><ellipse cx="${leftEyeX}" cy="${eyeY}" rx="8" ry="9" fill="${color}" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="8" ry="9" fill="${color}" stroke="#212121" stroke-width="${sw}"/><circle cx="${leftEyeX - 2}" cy="${eyeY - 3}" r="2" fill="#FFFFFF"/><circle cx="${rightEyeX - 2}" cy="${eyeY - 3}" r="2" fill="#FFFFFF"/>`;
      }
      return `<ellipse cx="${leftEyeX}" cy="${eyeY}" rx="8" ry="9" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="8" ry="9" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><ellipse cx="${leftEyeX}" cy="${eyeY + 1}" rx="5" ry="6" fill="${color}"/><ellipse cx="${rightEyeX}" cy="${eyeY + 1}" rx="5" ry="6" fill="${color}"/><circle cx="${leftEyeX - 1}" cy="${eyeY - 2}" r="2" fill="#FFFFFF"/><circle cx="${rightEyeX - 1}" cy="${eyeY - 2}" r="2" fill="#FFFFFF"/>`;
    case 'cyberpunk':
      if (styleId.includes('implant') || styleId.includes('scanner') || styleId.includes('data')) {
        return `<rect x="${leftEyeX - 10}" y="${eyeY - 6}" width="20" height="12" rx="2" fill="#212121" stroke="#00E5FF" stroke-width="2"/><rect x="${rightEyeX - 10}" y="${eyeY - 6}" width="20" height="12" rx="2" fill="#212121" stroke="#00E5FF" stroke-width="2"/><rect x="${leftEyeX - 8}" y="${eyeY - 4}" width="16" height="8" fill="${color}" opacity="0.8"/><rect x="${rightEyeX - 8}" y="${eyeY - 4}" width="16" height="8" fill="${color}" opacity="0.8"/><line x1="${leftEyeX - 6}" y1="${eyeY}" x2="${leftEyeX + 6}" y2="${eyeY}" stroke="#00E5FF" stroke-width="1"/><line x1="${rightEyeX - 6}" y1="${eyeY}" x2="${rightEyeX + 6}" y2="${eyeY}" stroke="#00E5FF" stroke-width="1"/><line x1="${leftEyeX}" y1="${eyeY - 4}" x2="${leftEyeX}" y2="${eyeY + 4}" stroke="#00E5FF" stroke-width="1"/><line x1="${rightEyeX}" y1="${eyeY - 4}" x2="${rightEyeX}" y2="${eyeY + 4}" stroke="#00E5FF" stroke-width="1"/>`;
      }
      if (styleId.includes('neon')) {
        return `<ellipse cx="${leftEyeX}" cy="${eyeY}" rx="8" ry="6" fill="${color}" opacity="0.4"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="8" ry="6" fill="${color}" opacity="0.4"/><ellipse cx="${leftEyeX}" cy="${eyeY}" rx="6" ry="4" fill="${color}" stroke="#00E5FF" stroke-width="2"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="6" ry="4" fill="${color}" stroke="#00E5FF" stroke-width="2"/><circle cx="${leftEyeX}" cy="${eyeY}" r="2" fill="#D500F9"/><circle cx="${rightEyeX}" cy="${eyeY}" r="2" fill="#D500F9"/>`;
      }
      return `<rect x="${leftEyeX - 8}" y="${eyeY - 4}" width="16" height="8" rx="1" fill="#212121" stroke="#00E5FF" stroke-width="2"/><rect x="${rightEyeX - 8}" y="${eyeY - 4}" width="16" height="8" rx="1" fill="#212121" stroke="#00E5FF" stroke-width="2"/><rect x="${leftEyeX - 6}" y="${eyeY - 2}" width="12" height="4" fill="${color}"/><rect x="${rightEyeX - 6}" y="${eyeY - 2}" width="12" height="4" fill="${color}"/>`;
    case 'realistic':
      if (styleId.includes('narrow')) {
        return `<path d="M ${leftEyeX - 8} ${eyeY} Q ${leftEyeX} ${eyeY - 3} ${leftEyeX + 8} ${eyeY}" stroke="#212121" stroke-width="2" fill="none"/><path d="M ${rightEyeX - 8} ${eyeY} Q ${rightEyeX} ${eyeY - 3} ${rightEyeX + 8} ${eyeY}" stroke="#212121" stroke-width="2" fill="none"/><circle cx="${leftEyeX}" cy="${eyeY}" r="2.5" fill="${color}"/><circle cx="${rightEyeX}" cy="${eyeY}" r="2.5" fill="${color}"/>`;
      }
      if (styleId.includes('round')) {
        return `<circle cx="${leftEyeX}" cy="${eyeY}" r="6" fill="#FFFFFF" stroke="#212121" stroke-width="1"/><circle cx="${rightEyeX}" cy="${eyeY}" r="6" fill="#FFFFFF" stroke="#212121" stroke-width="1"/><circle cx="${leftEyeX}" cy="${eyeY}" r="4" fill="${color}"/><circle cx="${rightEyeX}" cy="${eyeY}" r="4" fill="${color}"/><circle cx="${leftEyeX}" cy="${eyeY}" r="2" fill="#212121"/><circle cx="${rightEyeX}" cy="${eyeY}" r="2" fill="#212121"/><circle cx="${leftEyeX + 1}" cy="${eyeY - 1}" r="1" fill="#FFFFFF"/><circle cx="${rightEyeX + 1}" cy="${eyeY - 1}" r="1" fill="#FFFFFF"/>`;
      }
      if (styleId.includes('glasses')) {
        return `<circle cx="${leftEyeX}" cy="${eyeY}" r="5" fill="#FFFFFF" stroke="#212121" stroke-width="1"/><circle cx="${rightEyeX}" cy="${eyeY}" r="5" fill="#FFFFFF" stroke="#212121" stroke-width="1"/><circle cx="${leftEyeX}" cy="${eyeY}" r="3" fill="${color}"/><circle cx="${rightEyeX}" cy="${eyeY}" r="3" fill="${color}"/><circle cx="${leftEyeX}" cy="${eyeY}" r="11" fill="none" stroke="#212121" stroke-width="2"/><circle cx="${rightEyeX}" cy="${eyeY}" r="11" fill="none" stroke="#212121" stroke-width="2"/><line x1="${leftEyeX + 11}" y1="${eyeY}" x2="${rightEyeX - 11}" y2="${eyeY}" stroke="#212121" stroke-width="2"/>`;
      }
      return `<ellipse cx="${leftEyeX}" cy="${eyeY}" rx="5" ry="4" fill="#FFFFFF" stroke="#212121" stroke-width="1"/><ellipse cx="${rightEyeX}" cy="${eyeY}" rx="5" ry="4" fill="#FFFFFF" stroke="#212121" stroke-width="1"/><circle cx="${leftEyeX}" cy="${eyeY}" r="3" fill="${color}"/><circle cx="${rightEyeX}" cy="${eyeY}" r="3" fill="${color}"/><circle cx="${leftEyeX}" cy="${eyeY}" r="1.5" fill="#212121"/><circle cx="${rightEyeX}" cy="${eyeY}" r="1.5" fill="#212121"/><circle cx="${leftEyeX + 1}" cy="${eyeY - 1}" r="0.8" fill="#FFFFFF"/><circle cx="${rightEyeX + 1}" cy="${eyeY - 1}" r="0.8" fill="#FFFFFF"/>`;
    default:
      return '';
  }
}

function renderCostume() {
  const cx = 100;
  const topY = 95;
  const bottomY = 200;
  const primary = props.config.costume.primaryColor;
  const secondary = props.config.costume.secondaryColor;
  const styleId = props.config.costume.styleId;
  const sw = strokeWidth.value;
  switch (props.config.artStyle) {
    case 'pixel':
      if (styleId.includes('armor')) {
        return `<rect x="${cx - 45}" y="${topY}" width="90" height="${bottomY - topY}" fill="${primary}" stroke="#212121" stroke-width="2"/><rect x="${cx - 35}" y="${topY + 10}" width="70" height="30" fill="${secondary}" stroke="#212121" stroke-width="2"/><rect x="${cx - 15}" y="${topY + 50}" width="30" height="25" fill="${secondary}" stroke="#212121" stroke-width="2"/><rect x="${cx - 40}" y="${topY + 80}" width="20" height="${bottomY - topY - 85}" fill="${primary}" stroke="#212121" stroke-width="2"/><rect x="${cx + 20}" y="${topY + 80}" width="20" height="${bottomY - topY - 85}" fill="${primary}" stroke="#212121" stroke-width="2"/>`;
      }
      if (styleId.includes('robe')) {
        return `<polygon points="${cx - 50},${topY} ${cx + 50},${topY} ${cx + 55},${bottomY} ${cx - 55},${bottomY}" fill="${primary}" stroke="#212121" stroke-width="2"/><polygon points="${cx - 8},${topY} ${cx + 8},${topY} ${cx + 15},${bottomY} ${cx - 15},${bottomY}" fill="${secondary}" stroke="#212121" stroke-width="2"/><rect x="${cx - 5}" y="${topY + 30}" width="10" height="10" fill="#FFD54F" stroke="#212121" stroke-width="1"/>`;
      }
      if (styleId.includes('leather')) {
        return `<rect x="${cx - 42}" y="${topY}" width="84" height="${bottomY - topY}" fill="${primary}" stroke="#212121" stroke-width="2"/><line x1="${cx - 42}" y1="${topY + 25}" x2="${cx + 42}" y2="${topY + 25}" stroke="${secondary}" stroke-width="4"/><rect x="${cx - 10}" y="${topY + 40}" width="20" height="30" fill="${secondary}" stroke="#212121" stroke-width="2"/>`;
      }
      if (styleId.includes('ninja')) {
        return `<rect x="${cx - 40}" y="${topY - 10}" width="80" height="${bottomY - topY + 10}" fill="${primary}" stroke="#212121" stroke-width="2"/><rect x="${cx - 35}" y="${topY + 20}" width="70" height="8" fill="${secondary}"/><rect x="${cx - 8}" y="${topY + 45}" width="16" height="35" fill="${secondary}"/>`;
      }
      return `<rect x="${cx - 40}" y="${topY}" width="80" height="${bottomY - topY}" fill="${primary}" stroke="#212121" stroke-width="2"/><rect x="${cx - 30}" y="${topY + 15}" width="60" height="35" fill="${secondary}" stroke="#212121" stroke-width="2"/><polygon points="${cx - 5},${topY + 60} ${cx + 5},${topY + 60} ${cx + 8},${bottomY} ${cx - 8},${bottomY}" fill="${secondary}" stroke="#212121" stroke-width="2"/>`;
    case 'comic':
      if (styleId.includes('cape')) {
        return `<path d="M ${cx - 55} ${topY} Q ${cx - 65} ${topY + 60} ${cx - 50} ${bottomY} L ${cx + 50} ${bottomY} Q ${cx + 65} ${topY + 60} ${cx + 55} ${topY} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 40} ${topY} L ${cx + 40} ${topY} L ${cx + 48} ${bottomY} L ${cx - 48} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 25} ${topY + 15} L ${cx + 25} ${topY + 15} L ${cx + 20} ${topY + 55} L ${cx - 20} ${topY + 55} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${topY + 75}" rx="18" ry="10" fill="${secondary}" stroke="#212121" stroke-width="${sw}"/>`;
      }
      if (styleId.includes('armor')) {
        return `<path d="M ${cx - 45} ${topY} L ${cx + 45} ${topY} L ${cx + 52} ${bottomY} L ${cx - 52} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 38} ${topY + 10} L ${cx + 38} ${topY + 10} L ${cx + 42} ${topY + 50} L ${cx - 42} ${topY + 50} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${cx}" cy="${topY + 75}" r="15" fill="${secondary}" stroke="#212121" stroke-width="${sw}"/><path d="M ${cx - 15} ${topY + 95} L ${cx + 15} ${topY + 95} L ${cx + 18} ${bottomY} L ${cx - 18} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><line x1="${cx - 45}" y1="${topY + 30}" x2="${cx + 45}" y2="${topY + 30}" stroke="#212121" stroke-width="${sw}"/><line x1="${cx - 42}" y1="${topY + 50}" x2="${cx + 42}" y2="${topY + 50}" stroke="#212121" stroke-width="${sw}"/>`;
      }
      if (styleId.includes('leather')) {
        return `<path d="M ${cx - 42} ${topY} L ${cx + 42} ${topY} L ${cx + 48} ${bottomY} L ${cx - 48} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 35} ${topY + 30} L ${cx + 35} ${topY + 30}" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/><path d="M ${cx - 10} ${topY + 5} L ${cx + 10} ${topY + 5} L ${cx + 8} ${topY + 45} L ${cx - 8} ${topY + 45} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${cx - 20}" cy="${topY + 40}" r="4" fill="${secondary}" stroke="#212121" stroke-width="2"/><circle cx="${cx + 20}" cy="${topY + 40}" r="4" fill="${secondary}" stroke="#212121" stroke-width="2"/>`;
      }
      if (styleId.includes('street')) {
        return `<path d="M ${cx - 40} ${topY} L ${cx + 40} ${topY} L ${cx + 46} ${bottomY} L ${cx - 46} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><rect x="${cx - 30}" y="${topY + 15}" width="60" height="40" fill="${secondary}" stroke="#212121" stroke-width="${sw}" rx="4"/><path d="M ${cx - 10} ${topY + 60} L ${cx + 10} ${topY + 60} L ${cx + 14} ${bottomY} L ${cx - 14} ${bottomY} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }
      return `<path d="M ${cx - 40} ${topY} L ${cx + 40} ${topY} L ${cx + 46} ${bottomY} L ${cx - 46} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 28} ${topY + 15} L ${cx + 28} ${topY + 15} L ${cx + 24} ${topY + 55} L ${cx - 24} ${topY + 55} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 5} ${topY + 65} L ${cx + 5} ${topY + 65} L ${cx + 8} ${bottomY} L ${cx - 8} ${bottomY} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${topY + 75}" rx="20" ry="8" fill="${secondary}" stroke="#212121" stroke-width="${sw}"/>`;
    case 'anime':
      if (styleId.includes('sailor')) {
        return `<path d="M ${cx - 38} ${topY} L ${cx + 38} ${topY} L ${cx + 44} ${bottomY} L ${cx - 44} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 42} ${topY} L ${cx} ${topY + 25} L ${cx + 42} ${topY} L ${cx + 35} ${topY + 15} L ${cx} ${topY + 40} L ${cx - 35} ${topY + 15} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${topY + 65}" rx="18" ry="8" fill="${secondary}" stroke="#212121" stroke-width="${sw}"/><path d="M ${cx - 15} ${topY + 55} L ${cx + 15} ${topY + 55} L ${cx + 20} ${topY + 75} L ${cx - 20} ${topY + 75} Z" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${cx}" cy="${topY + 55}" r="8" fill="#FF1744" stroke="#212121" stroke-width="2"/>`;
      }
      if (styleId.includes('uniform')) {
        return `<path d="M ${cx - 40} ${topY} L ${cx + 40} ${topY} L ${cx + 46} ${bottomY} L ${cx - 46} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 30} ${topY + 10} L ${cx + 30} ${topY + 10} L ${cx + 25} ${topY + 50} L ${cx - 25} ${topY + 50} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 5} ${topY + 10} L ${cx} ${topY + 35} L ${cx + 5} ${topY + 10}" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 12} ${topY + 65} L ${cx + 12} ${topY + 65} L ${cx + 16} ${bottomY} L ${cx - 16} ${bottomY} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }
      if (styleId.includes('robe')) {
        return `<path d="M ${cx - 55} ${topY} Q ${cx - 60} ${topY + 50} ${cx - 50} ${bottomY} L ${cx + 50} ${bottomY} Q ${cx + 60} ${topY + 50} ${cx + 55} ${topY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 10} ${topY} L ${cx + 10} ${topY} L ${cx + 15} ${bottomY} L ${cx - 15} ${bottomY} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><polygon points="${cx - 5},${topY + 30} ${cx + 5},${topY + 30} ${cx},${topY + 45}" fill="#FFD54F" stroke="#212121" stroke-width="2"/>`;
      }
      if (styleId.includes('armor')) {
        return `<path d="M ${cx - 45} ${topY} L ${cx + 45} ${topY} L ${cx + 52} ${bottomY} L ${cx - 52} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${topY + 30}" rx="30" ry="22" fill="${secondary}" stroke="#212121" stroke-width="${sw}"/><circle cx="${cx}" cy="${topY + 30}" r="10" fill="${primary}" stroke="#212121" stroke-width="2"/><path d="M ${cx - 10} ${topY + 55} L ${cx + 10} ${topY + 55} L ${cx + 14} ${bottomY} L ${cx - 14} ${bottomY} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }
      if (styleId.includes('kimono')) {
        return `<path d="M ${cx - 52} ${topY} L ${cx + 52} ${topY} L ${cx + 55} ${bottomY} L ${cx - 55} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 8} ${topY} L ${cx + 8} ${topY} L ${cx + 25} ${bottomY} L ${cx - 25} ${bottomY} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 55} ${topY + 40} Q ${cx} ${topY + 35} ${cx + 55} ${topY + 40}" stroke="${secondary}" stroke-width="8" fill="none"/><circle cx="${cx - 20}" cy="${topY + 60}" r="6" fill="#FFD54F" stroke="#212121" stroke-width="2"/><circle cx="${cx + 20}" cy="${topY + 60}" r="6" fill="#FFD54F" stroke="#212121" stroke-width="2"/>`;
      }
      return `<path d="M ${cx - 42} ${topY} L ${cx + 42} ${topY} L ${cx + 48} ${bottomY} L ${cx - 48} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 25} ${topY + 12} L ${cx + 25} ${topY + 12} L ${cx + 22} ${topY + 52} L ${cx - 22} ${topY + 52} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 12} ${topY + 65} L ${cx + 12} ${topY + 65} L ${cx + 16} ${bottomY} L ${cx - 16} ${bottomY} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
    case 'cyberpunk':
      return `<path d="M ${cx - 48} ${topY} L ${cx + 48} ${topY} L ${cx + 54} ${bottomY} L ${cx - 54} ${bottomY} Z" fill="${primary}" stroke="#00E5FF" stroke-width="${sw}" stroke-linejoin="round"/><rect x="${cx - 30}" y="${topY + 15}" width="60" height="35" fill="${secondary}" stroke="#D500F9" stroke-width="2"/><path d="M ${cx - 10} ${topY + 55} L ${cx + 10} ${topY + 55} L ${cx + 14} ${bottomY} L ${cx - 14} ${bottomY} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${cx}" cy="${topY + 35}" r="8" fill="#00E5FF" opacity="0.6"/>`;
    case 'realistic':
      if (styleId.includes('military')) {
        return `<path d="M ${cx - 44} ${topY} L ${cx + 44} ${topY} L ${cx + 50} ${bottomY} L ${cx - 50} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><rect x="${cx - 30}" y="${topY + 15}" width="60" height="35" fill="${secondary}" stroke="#212121" stroke-width="${sw}"/><rect x="${cx - 10}" y="${topY + 55}" width="20" height="35" fill="${secondary}" stroke="#212121" stroke-width="${sw}"/>`;
      }
      if (styleId.includes('suit')) {
        return `<path d="M ${cx - 40} ${topY} L ${cx + 40} ${topY} L ${cx + 46} ${bottomY} L ${cx - 46} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 8} ${topY} L ${cx} ${topY + 80} L ${cx + 8} ${topY}" fill="#FFFFFF" stroke="#212121" stroke-width="${sw}"/><rect x="${cx - 5}" y="${topY + 30}" width="10" height="4" fill="${secondary}"/>`;
      }
      if (styleId.includes('sport')) {
        return `<path d="M ${cx - 42} ${topY} L ${cx + 42} ${topY} L ${cx + 48} ${bottomY} L ${cx - 48} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 25} ${topY + 15} L ${cx + 25} ${topY + 15} L ${cx + 22} ${topY + 55} L ${cx - 22} ${topY + 55} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><rect x="${cx - 12}" y="${topY + 65}" width="24" height="30" fill="${secondary}" stroke="#212121" stroke-width="${sw}"/>`;
      }
      if (styleId.includes('trench')) {
        return `<path d="M ${cx - 50} ${topY} L ${cx + 50} ${topY} L ${cx + 55} ${bottomY} L ${cx - 55} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 5} ${topY} L ${cx} ${topY + 85} L ${cx + 5} ${topY}" fill="${secondary}" stroke="#212121" stroke-width="${sw}"/>`;
      }
      return `<path d="M ${cx - 40} ${topY} L ${cx + 40} ${topY} L ${cx + 46} ${bottomY} L ${cx - 46} ${bottomY} Z" fill="${primary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/><path d="M ${cx - 25} ${topY + 15} L ${cx + 25} ${topY + 15} L ${cx + 22} ${topY + 55} L ${cx - 22} ${topY + 55} Z" fill="${secondary}" stroke="#212121" stroke-width="${sw}" stroke-linejoin="round"/>`;
    default:
      return '';
  }
}

function renderAccessorySVG(id: string) {
  const cx = 100;
  switch (id) {
    case 'mask':
      return `<path d="M ${cx - 35} 48 Q ${cx} 35 ${cx + 35} 48 L ${cx + 28} 68 Q ${cx} 58 ${cx - 28} 68 Z" fill="#212121" stroke="#212121" stroke-width="2"/>`;
    case 'glasses':
      return `<circle cx="${cx - 15}" cy="60" r="12" fill="none" stroke="#212121" stroke-width="2"/><circle cx="${cx + 15}" cy="60" r="12" fill="none" stroke="#212121" stroke-width="2"/><line x1="${cx - 3}" y1="60" x2="${cx + 3}" y2="60" stroke="#212121" stroke-width="2"/>`;
    case 'helmet':
      return `<path d="M ${cx - 38} 55 Q ${cx - 40} 15 ${cx} 10 Q ${cx + 40} 15 ${cx + 38} 55 L ${cx + 32} 65 L ${cx - 32} 65 Z" fill="#616161" stroke="#212121" stroke-width="2" stroke-linejoin="round"/>`;
    case 'cape':
      return `<path d="M ${cx - 55} 95 Q ${cx - 65} 150 ${cx - 50} 195 L ${cx + 50} 195 Q ${cx + 65} 150 ${cx + 55} 95 Z" fill="#C62828" stroke="#212121" stroke-width="2" stroke-linejoin="round" opacity="0.85"/>`;
    case 'belt':
      return `<rect x="55" y="160" width="90" height="12" fill="#FFD54F" stroke="#212121" stroke-width="2"/><rect x="${cx - 8}" y="158" width="16" height="16" fill="#FF8F00" stroke="#212121" stroke-width="2"/>`;
    case 'gloves':
      return `<rect x="40" y="115" width="18" height="30" rx="4" fill="#E53935" stroke="#212121" stroke-width="2"/><rect x="142" y="115" width="18" height="30" rx="4" fill="#E53935" stroke="#212121" stroke-width="2"/>`;
    case 'boots':
      return `<rect x="65" y="180" width="25" height="20" rx="3" fill="#424242" stroke="#212121" stroke-width="2"/><rect x="110" y="180" width="25" height="20" rx="3" fill="#424242" stroke="#212121" stroke-width="2"/>`;
    case 'necklace':
      return `<path d="M ${cx - 18} 95 Q ${cx} 108 ${cx + 18} 95" fill="none" stroke="#FFD54F" stroke-width="2"/><circle cx="${cx}" cy="108" r="5" fill="#FF1744" stroke="#212121" stroke-width="1.5"/>`;
    case 'ring':
      return `<circle cx="52" cy="135" r="4" fill="#FFD54F" stroke="#212121" stroke-width="1"/>`;
    case 'earring':
      return `<circle cx="${cx - 33}" cy="70" r="3" fill="#00BCD4" stroke="#212121" stroke-width="1"/><circle cx="${cx + 33}" cy="70" r="3" fill="#00BCD4" stroke="#212121" stroke-width="1"/>`;
    case 'scarf':
      return `<path d="M ${cx - 22} 92 L ${cx + 22} 92 L ${cx + 28} 115 L ${cx - 28} 115 Z" fill="#E53935" stroke="#212121" stroke-width="2" stroke-linejoin="round"/><rect x="${cx - 5}" y="108" width="10" height="25" fill="#E53935" stroke="#212121" stroke-width="2"/>`;
    case 'hat':
      return `<ellipse cx="${cx}" cy="28" rx="40" ry="8" fill="#212121" stroke="#212121" stroke-width="2"/><path d="M ${cx - 25} 28 Q ${cx - 25} 5 ${cx} 5 Q ${cx + 25} 5 ${cx + 25} 28 Z" fill="#212121" stroke="#212121" stroke-width="2" stroke-linejoin="round"/>`;
    case 'crown':
      return `<polygon points="${cx - 30},25 ${cx - 22},8 ${cx - 15},22 ${cx - 8},5 ${cx},20 ${cx + 8},5 ${cx + 15},22 ${cx + 22},8 ${cx + 30},25" fill="#FFD54F" stroke="#212121" stroke-width="2" stroke-linejoin="round"/><rect x="${cx - 30}" y="25" width="60" height="8" fill="#FFD54F" stroke="#212121" stroke-width="2"/>`;
    case 'eyepatch':
      return `<circle cx="${cx - 15}" cy="60" r="14" fill="#212121" stroke="#212121" stroke-width="2"/><line x1="${cx - 29}" y1="55" x2="${cx + 25}" y2="48" stroke="#212121" stroke-width="2"/>`;
    case 'headphone':
      return `<path d="M ${cx - 32} 50 Q ${cx - 35} 20 ${cx} 18 Q ${cx + 35} 20 ${cx + 32} 50" fill="none" stroke="#212121" stroke-width="4"/><rect x="${cx - 42}" y="48" width="14" height="24" rx="4" fill="#424242" stroke="#212121" stroke-width="2"/><rect x="${cx + 28}" y="48" width="14" height="24" rx="4" fill="#424242" stroke="#212121" stroke-width="2"/>`;
    default:
      return '';
  }
}

function renderMouth() {
  const cx = 100;
  const cy = 80;
  const sw = strokeWidth.value;
  switch (props.config.artStyle) {
    case 'pixel':
      return `<rect x="${cx - 6}" y="${cy}" width="12" height="3" fill="#212121"/><rect x="${cx - 4}" y="${cy - 1}" width="8" height="1" fill="#E53935"/>`;
    case 'comic':
      return `<path d="M ${cx - 10} ${cy} Q ${cx} ${cy + 6} ${cx + 10} ${cy}" stroke="#212121" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
    case 'anime':
      return `<path d="M ${cx - 8} ${cy + 2} Q ${cx} ${cy + 5} ${cx + 8} ${cy + 2}" stroke="#E53935" stroke-width="2" stroke-linecap="round" fill="none"/>`;
    case 'cyberpunk':
      return `<path d="M ${cx - 8} ${cy} L ${cx + 8} ${cy}" stroke="#00E5FF" stroke-width="2" stroke-linecap="round"/>`;
    case 'realistic':
      return `<path d="M ${cx - 8} ${cy + 1} Q ${cx} ${cy + 4} ${cx + 8} ${cy + 1}" stroke="#8D6E63" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
    default:
      return '';
  }
}

const portraitSVG = computed(() => {
  if (props.config.customImage) return '';
  const head = `<path d="${getHeadShape()}" fill="${skinColor.value}" stroke="#212121" stroke-width="${strokeWidth.value}" stroke-linejoin="round"/>`;
  const neck = `<rect x="90" y="88" width="20" height="12" fill="${skinColor.value}" stroke="#212121" stroke-width="${strokeWidth.value}"/>`;
  const hair = renderHair();
  const eyes = renderEyes();
  const mouth = renderMouth();
  const costume = renderCostume();
  const accessories = props.config.accessories.map(id => renderAccessorySVG(id)).join('');
  return `${costume}${neck}${head}${hair}${eyes}${mouth}${accessories}`;
});

const bgDefs = computed(() => {
  const id = `bg-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    gradient: `
      <defs>
        <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgGradient.value.primary};stop-opacity:0.25"/>
          <stop offset="100%" style="stop-color:${bgGradient.value.secondary};stop-opacity:0.35"/>
        </linearGradient>
      </defs>
    `,
    fill: `url(#${id})`
  };
});
</script>

<template>
  <div
    class="character-portrait"
    :style="{
      width: displaySize.w + 'px',
      height: displaySize.h + 'px',
      filter: filterStyle
    }"
  >
    <svg
      v-if="!config.customImage"
      :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <template v-if="showBackground">
        <g v-html="bgDefs.gradient" />
        <rect :width="viewBoxSize" :height="viewBoxSize" :fill="bgDefs.fill" />
        <rect
          v-if="config.artStyle === 'cyberpunk'"
          :width="viewBoxSize"
          :height="viewBoxSize"
          fill="url(#cyber-grid)"
          opacity="0.15"
        />
        <defs>
          <pattern id="cyber-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00E5FF" stroke-width="0.5"/>
          </pattern>
          <pattern id="halftone" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1" fill="#000" opacity="0.08"/>
          </pattern>
        </defs>
        <rect
          v-if="config.artStyle === 'comic' || config.artStyle === 'pixel'"
          :width="viewBoxSize"
          :height="viewBoxSize"
          fill="url(#halftone)"
        />
      </template>
      <g v-html="portraitSVG" />
    </svg>
    <img
      v-else
      :src="config.customImage"
      alt="portrait"
      class="custom-image"
    />
  </div>
</template>

<style scoped>
.character-portrait {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  border: 3px solid #212121;
  box-shadow: 4px 4px 0 #212121;
}

.custom-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>

