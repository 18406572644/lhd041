export type ArtStyle = 'pixel' | 'comic' | 'anime' | 'cyberpunk' | 'realistic';

export interface PortraitColors {
  skin: string;
  hair: string;
  eyes: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface PortraitConfig {
  artStyle: ArtStyle;
  bodyShape: 'slim' | 'athletic' | 'muscular' | 'large' | 'robotic';
  genderBias: 'masculine' | 'feminine' | 'neutral';
  hair: {
    styleId: string;
    color: string;
  };
  eyes: {
    styleId: string;
    color: string;
  };
  costume: {
    styleId: string;
    primaryColor: string;
    secondaryColor: string;
  };
  accessories: string[];
  customImage?: string;
  imageFilter?: ImageFilterSettings;
}

export interface ImageFilterSettings {
  grayscale: number;
  sepia: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PortraitTemplate {
  id: string;
  name: string;
  thumbnail?: string;
  config: PortraitConfig;
  usageCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortraitTemplateStorage {
  version: string;
  templates: PortraitTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface Appearance {
  avatar: string;
  costume: string;
  colorScheme: string;
  accessories: string[];
  bodyType: string;
  hairStyle: string;
  eyeStyle: string;
  portrait: PortraitConfig;
}

export interface Power {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
}

export interface Stats {
  strength: number;
  speed: number;
  intelligence: number;
  durability: number;
  combat: number;
  charisma: number;
}

export type EffectType = 'explosion' | 'speech_bubble' | 'sound_effect' | 'speed_lines' | 'halftone' | 'boom' | 'zap' | 'pow' | 'bam' | 'wham' | 'swoosh' | 'smash' | 'crash';

export interface ComicEffect {
  id: string;
  type: EffectType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  content?: string;
  text?: string;
  style?: string;
}

export interface Hero {
  id: string;
  name: string;
  alias: string;
  catchphrase: string;
  appearance: Appearance;
  powers: Power[];
  stats: Stats;
  weakness: string;
  backstory: string;
  cardTemplate: string;
  effects: ComicEffect[];
  likes: number;
  folderId: string;
  createdAt: string;
}

export interface FavoriteFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  heroIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  thumbnail: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  layout: 'classic' | 'modern' | 'vintage' | 'action';
  borderStyle: string;
  backgroundColor: string;
  titlePosition: 'top' | 'bottom' | 'overlay';
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type HeroWithRank = Hero & { rank: number };

export type PresetCategory = 'appearance' | 'powers' | 'story' | 'effects' | 'card' | 'full';

export interface BasePreset {
  id: string;
  name: string;
  category: PresetCategory;
  thumbnail?: string;
  usageCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppearancePreset extends BasePreset {
  category: 'appearance';
  data: Appearance;
}

export interface PowersPreset extends BasePreset {
  category: 'powers';
  data: {
    powers: Power[];
    stats: Stats;
    weakness: string;
  };
}

export interface StoryPreset extends BasePreset {
  category: 'story';
  data: {
    catchphrase: string;
    backstoryTemplate: string;
  };
}

export interface EffectsPreset extends BasePreset {
  category: 'effects';
  data: ComicEffect[];
}

export interface CardPreset extends BasePreset {
  category: 'card';
  data: {
    cardTemplate: string;
  };
}

export interface FullPreset extends BasePreset {
  category: 'full';
  data: {
    appearance: Appearance;
    powers: Power[];
    stats: Stats;
    weakness: string;
    catchphrase: string;
    backstory: string;
    cardTemplate: string;
    effects: ComicEffect[];
  };
}

export type Preset = AppearancePreset | PowersPreset | StoryPreset | EffectsPreset | CardPreset | FullPreset;

export interface PresetsStorageData {
  version: string;
  presets: Preset[];
  createdAt: string;
  updatedAt: string;
}

export type SortMode = 'date' | 'usage' | 'name';

export type RelationType = 'ally' | 'enemy' | 'mentor' | 'family' | 'lover' | 'rival';

export interface RelationTypeConfig {
  id: RelationType;
  label: string;
  icon: string;
  color: string;
  dashPattern?: string;
}

export interface HeroRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface UniverseStorageData {
  version: string;
  relations: HeroRelation[];
  createdAt: string;
  updatedAt: string;
}

export type LayoutMode = 'force' | 'circle' | 'tree';

export interface GraphNode {
  id: string;
  hero: Hero;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  id: string;
  source: GraphNode;
  target: GraphNode;
  sourceId: string;
  targetId: string;
  type: RelationType;
  description: string;
}
