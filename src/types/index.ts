export interface Appearance {
  avatar: string;
  costume: string;
  colorScheme: string;
  accessories: string[];
  bodyType: string;
  hairStyle: string;
  eyeStyle: string;
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
  createdAt: string;
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
