import type { ArtStyle, PortraitColors, PortraitConfig, ImageFilterSettings } from '../types';

export const ART_STYLES: { id: ArtStyle; name: string; emoji: string; description: string }[] = [
  { id: 'pixel', name: '复古像素风', emoji: '🎮', description: '8-bit 经典像素艺术风格' },
  { id: 'comic', name: '美式漫画风', emoji: '💥', description: '美漫风格，粗线条鲜艳色彩' },
  { id: 'anime', name: '日系动漫风', emoji: '🌸', description: '日系动漫萌系风格' },
  { id: 'cyberpunk', name: '赛博朋克风', emoji: '🌆', description: '霓虹科技感未来风格' },
  { id: 'realistic', name: '写实风', emoji: '📷', description: '接近真实的绘画风格' }
];

export const HAIR_STYLES: Record<ArtStyle, { id: string; name: string }[]> = {
  pixel: [
    { id: 'pixel-short', name: '像素短发' },
    { id: 'pixel-long', name: '像素长发' },
    { id: 'pixel-spiky', name: '像素刺猬头' },
    { id: 'pixel-mohawk', name: '像素莫霍克' },
    { id: 'pixel-bald', name: '像素光头' },
    { id: 'pixel-curly', name: '像素卷发' }
  ],
  comic: [
    { id: 'comic-classic', name: '经典漫画头' },
    { id: 'comic-spiky', name: '超级英雄头' },
    { id: 'comic-long', name: '长发飘逸' },
    { id: 'comic-buzz', name: '寸头' },
    { id: 'comic-mullet', name: '鲻鱼头' }
  ],
  anime: [
    { id: 'anime-spiky', name: '热血少年头' },
    { id: 'anime-long', name: '飘逸长发' },
    { id: 'anime-twintail', name: '双马尾' },
    { id: 'anime-ponytail', name: '单马尾' },
    { id: 'anime-bob', name: '齐耳短发' },
    { id: 'anime-messy', name: '慵懒蓬松' }
  ],
  cyberpunk: [
    { id: 'cyber-neon', name: '霓虹荧光头' },
    { id: 'cyber-mohawk', name: '赛博莫霍克' },
    { id: 'cyber-shaved', name: '剃边发型' },
    { id: 'cyber-data', name: '数据流发' },
    { id: 'cyber-bald', name: '光头植入' }
  ],
  realistic: [
    { id: 'real-short', name: '短发' },
    { id: 'real-long', name: '长发' },
    { id: 'real-curly', name: '卷发' },
    { id: 'real-wavy', name: '波浪发' },
    { id: 'real-crew', name: '平头' },
    { id: 'real-bald', name: '光头' }
  ]
};

export const EYE_STYLES: Record<ArtStyle, { id: string; name: string }[]> = {
  pixel: [
    { id: 'pixel-dot', name: '像素点眼' },
    { id: 'pixel-square', name: '像素方眼' },
    { id: 'pixel-glow', name: '像素发光' }
  ],
  comic: [
    { id: 'comic-bold', name: '粗犷漫画眼' },
    { id: 'comic-squint', name: '眯眼英雄' },
    { id: 'comic-mask', name: '面具眼罩' },
    { id: 'comic-glow', name: '能量发光眼' }
  ],
  anime: [
    { id: 'anime-big', name: '大动漫眼' },
    { id: 'anime-sharp', name: '锐利眼神' },
    { id: 'anime-soft', name: '温柔眼神' },
    { id: 'anime-hetero', name: '异色瞳' },
    { id: 'anime-glow', name: '发光眼' }
  ],
  cyberpunk: [
    { id: 'cyber-implant', name: '义眼植入' },
    { id: 'cyber-scanner', name: '扫描眼' },
    { id: 'cyber-neon', name: '霓虹眼' },
    { id: 'cyber-data', name: '数据眼' }
  ],
  realistic: [
    { id: 'real-normal', name: '普通眼' },
    { id: 'real-narrow', name: '细长眼' },
    { id: 'real-round', name: '圆眼' },
    { id: 'real-glasses', name: '眼镜' }
  ]
};

export const COSTUME_STYLES: Record<ArtStyle, { id: string; name: string }[]> = {
  pixel: [
    { id: 'pixel-tights', name: '像素紧身衣' },
    { id: 'pixel-armor', name: '像素盔甲' },
    { id: 'pixel-robe', name: '像素法袍' },
    { id: 'pixel-leather', name: '像素皮衣' },
    { id: 'pixel-ninja', name: '像素忍者' }
  ],
  comic: [
    { id: 'comic-tights', name: '经典紧身衣' },
    { id: 'comic-cape', name: '披风套装' },
    { id: 'comic-armor', name: '高科技战甲' },
    { id: 'comic-leather', name: '皮革战衣' },
    { id: 'comic-street', name: '街头英雄装' }
  ],
  anime: [
    { id: 'anime-sailor', name: '水手服' },
    { id: 'anime-uniform', name: '战斗制服' },
    { id: 'anime-robe', name: '法师长袍' },
    { id: 'anime-armor', name: '幻想铠甲' },
    { id: 'anime-kimono', name: '和风战衣' }
  ],
  cyberpunk: [
    { id: 'cyber-jacket', name: '霓虹夹克' },
    { id: 'cyber-armor', name: '外骨骼装甲' },
    { id: 'cyber-tactical', name: '战术作战服' },
    { id: 'cyber-corp', name: '企业西装' },
    { id: 'cyber-nomad', name: '流浪者装' }
  ],
  realistic: [
    { id: 'real-military', name: '军装' },
    { id: 'real-suit', name: '西装' },
    { id: 'real-sport', name: '运动服' },
    { id: 'real-casual', name: '休闲装' },
    { id: 'real-trench', name: '风衣' }
  ]
};

export const ACCESSORIES: { id: string; name: string; emoji: string }[] = [
  { id: 'mask', name: '面具', emoji: '🎭' },
  { id: 'glasses', name: '眼镜', emoji: '👓' },
  { id: 'helmet', name: '头盔', emoji: '⛑️' },
  { id: 'cape', name: '披风', emoji: '🧥' },
  { id: 'belt', name: '腰带', emoji: '🎗️' },
  { id: 'gloves', name: '手套', emoji: '🧤' },
  { id: 'boots', name: '战靴', emoji: '🥾' },
  { id: 'necklace', name: '项链', emoji: '📿' },
  { id: 'ring', name: '戒指', emoji: '💍' },
  { id: 'earring', name: '耳环', emoji: '💎' },
  { id: 'scarf', name: '围巾', emoji: '🧣' },
  { id: 'hat', name: '帽子', emoji: '🎩' },
  { id: 'crown', name: '王冠', emoji: '👑' },
  { id: 'eyepatch', name: '眼罩', emoji: '🦯' },
  { id: 'headphone', name: '耳机', emoji: '🎧' }
];

export const HAIR_COLORS: string[] = [
  '#212121', '#4E342E', '#795548', '#A1887F', '#FFD54F',
  '#FF8F00', '#E53935', '#8E24AA', '#1976D2', '#00897B',
  '#F48FB1', '#FFFFFF', '#607D8B', '#FF1744', '#D500F9',
  '#00E5FF', '#76FF03', '#FFEA00'
];

export const EYE_COLORS: string[] = [
  '#212121', '#4E342E', '#1565C0', '#2E7D32', '#00838F',
  '#6A1B9A', '#B71C1C', '#F57F17', '#4527A0', '#006064',
  '#FF1744', '#00E5FF', '#D500F9'
];

export const SKIN_COLORS: string[] = [
  '#FFCCBC', '#FFAB91', '#FF8A65', '#D7CCC8', '#A1887F',
  '#8D6E63', '#6D4C41', '#5D4037', '#4E342E', '#3E2723'
];

export const COSTUME_COLORS: { primary: string; secondary: string }[] = [
  { primary: '#E53935', secondary: '#1565C0' },
  { primary: '#212121', secondary: '#FDD835' },
  { primary: '#2E7D32', secondary: '#7B1FA2' },
  { primary: '#EF6C00', secondary: '#0288D1' },
  { primary: '#C2185B', secondary: '#FAFAFA' },
  { primary: '#FF8F00', secondary: '#C62828' },
  { primary: '#607D8B', secondary: '#2962FF' },
  { primary: '#33691E', secondary: '#D84315' },
  { primary: '#1A237E', secondary: '#00BCD4' },
  { primary: '#F57C00', secondary: '#AD1457' },
  { primary: '#00695C', secondary: '#0277BD' },
  { primary: '#D500F9', secondary: '#00E5FF' },
  { primary: '#212121', secondary: '#FF1744' },
  { primary: '#FAFAFA', secondary: '#212121' },
  { primary: '#00BCD4', secondary: '#FF4081' }
];

export const DEFAULT_FILTER: ImageFilterSettings = {
  grayscale: 0,
  sepia: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0
};

export const FILTER_PRESETS: { name: string; filter: ImageFilterSettings }[] = [
  { name: '原图', filter: { grayscale: 0, sepia: 0, brightness: 100, contrast: 100, saturation: 100, blur: 0 } },
  { name: '复古', filter: { grayscale: 0, sepia: 60, brightness: 95, contrast: 90, saturation: 80, blur: 0 } },
  { name: '黑白', filter: { grayscale: 100, sepia: 0, brightness: 100, contrast: 110, saturation: 0, blur: 0 } },
  { name: '赛博朋克', filter: { grayscale: 0, sepia: 0, brightness: 105, contrast: 130, saturation: 140, blur: 0 } },
  { name: '日系', filter: { grayscale: 0, sepia: 10, brightness: 115, contrast: 85, saturation: 90, blur: 0 } },
  { name: '高对比', filter: { grayscale: 0, sepia: 0, brightness: 100, contrast: 140, saturation: 110, blur: 0 } },
  { name: '低饱和', filter: { grayscale: 0, sepia: 0, brightness: 105, contrast: 95, saturation: 50, blur: 0 } },
  { name: '梦幻', filter: { grayscale: 0, sepia: 20, brightness: 120, contrast: 80, saturation: 70, blur: 2 } }
];

export function createDefaultPortraitConfig(): PortraitConfig {
  return {
    artStyle: 'comic',
    bodyShape: 'athletic',
    genderBias: 'neutral',
    hair: {
      styleId: HAIR_STYLES.comic[0].id,
      color: HAIR_COLORS[0]
    },
    eyes: {
      styleId: EYE_STYLES.comic[0].id,
      color: EYE_COLORS[0]
    },
    costume: {
      styleId: COSTUME_STYLES.comic[0].id,
      primaryColor: COSTUME_COLORS[0].primary,
      secondaryColor: COSTUME_COLORS[0].secondary
    },
    accessories: [],
    imageFilter: { ...DEFAULT_FILTER }
  };
}

export function getArtStyleForTheme(theme: string): ArtStyle {
  if (theme.includes('像素') || theme === 'pixel') return 'pixel';
  if (theme.includes('动漫') || theme.includes('日本') || theme === 'anime') return 'anime';
  if (theme.includes('赛博') || theme === 'cyberpunk') return 'cyberpunk';
  if (theme.includes('写实') || theme === 'realistic') return 'realistic';
  return 'comic';
}

export function getSkinToneForGender(gender: string): string {
  const idx = gender === 'feminine' ? 0 : gender === 'masculine' ? 2 : 1;
  return SKIN_COLORS[idx] || SKIN_COLORS[1];
}
