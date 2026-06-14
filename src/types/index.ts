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
