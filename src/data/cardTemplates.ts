import type { CardTemplate } from '../types';

export const cardTemplates: CardTemplate[] = [
  {
    id: 'classic',
    name: '经典漫画',
    thumbnail: '📰',
    icon: '📰',
    primaryColor: '#E53935',
    secondaryColor: '#1565C0',
    layout: 'classic',
    borderStyle: 'border-4 border-black rounded-none',
    backgroundColor: '#FAFAFA',
    titlePosition: 'top'
  },
  {
    id: 'vintage',
    name: '复古怀旧',
    thumbnail: '📜',
    icon: '📜',
    primaryColor: '#8D6E63',
    secondaryColor: '#FF8F00',
    layout: 'vintage',
    borderStyle: 'border-8 border-amber-800 rounded-lg',
    backgroundColor: '#FFF8E1',
    titlePosition: 'bottom'
  },
  {
    id: 'modern',
    name: '现代简约',
    thumbnail: '🎨',
    icon: '🎨',
    primaryColor: '#7B1FA2',
    secondaryColor: '#00BCD4',
    layout: 'modern',
    borderStyle: 'border-2 border-gray-800 rounded-2xl',
    backgroundColor: '#1A1A2E',
    titlePosition: 'overlay'
  },
  {
    id: 'action',
    name: '动感爆炸',
    thumbnail: '💥',
    icon: '💥',
    primaryColor: '#FF5722',
    secondaryColor: '#FFC107',
    layout: 'action',
    borderStyle: 'border-6 border-red-600 rounded-none transform rotate-1',
    backgroundColor: '#FFF59D',
    titlePosition: 'top'
  },
  {
    id: 'noir',
    name: '黑色电影',
    thumbnail: '🎬',
    icon: '🎬',
    primaryColor: '#424242',
    secondaryColor: '#FFD700',
    layout: 'vintage',
    borderStyle: 'border-4 border-white rounded-none',
    backgroundColor: '#212121',
    titlePosition: 'bottom'
  },
  {
    id: 'pop-art',
    name: '波普艺术',
    thumbnail: '🌈',
    icon: '🌈',
    primaryColor: '#E91E63',
    secondaryColor: '#00E5FF',
    layout: 'modern',
    borderStyle: 'border-6 border-pink-500 rounded-full',
    backgroundColor: '#E1F5FE',
    titlePosition: 'overlay'
  },
  {
    id: 'japanese',
    name: '日式漫画',
    thumbnail: '🏯',
    icon: '🏯',
    primaryColor: '#D32F2F',
    secondaryColor: '#FF9800',
    layout: 'classic',
    borderStyle: 'border-4 border-red-700 rounded-none',
    backgroundColor: '#FFEBEE',
    titlePosition: 'top'
  },
  {
    id: 'space',
    name: '太空科幻',
    thumbnail: '🚀',
    icon: '🚀',
    primaryColor: '#2196F3',
    secondaryColor: '#9C27B0',
    layout: 'action',
    borderStyle: 'border-4 border-blue-400 rounded-xl',
    backgroundColor: '#0D1B2A',
    titlePosition: 'overlay'
  }
];

export const soundEffects = [
  'POW!',
  'BAM!',
  'WHAM!',
  'BOOM!',
  'KAPOW!',
  'CRASH!',
  'ZOOM!',
  'BANG!',
  'ZAP!',
  'SLAM!',
  'THWACK!',
  'CRUNCH!',
  'WHOOSH!',
  'SPLAT!',
  'KABOOM!'
];

export const speechBubbleStyles = [
  { id: 'rounded', name: '圆角对话框', shape: 'rounded-3xl' },
  { id: 'spiky', name: '爆炸对话框', shape: 'rounded-none' },
  { id: 'thought', name: '思想泡泡', shape: 'rounded-full' },
  { id: 'shout', name: '喊叫框', shape: 'rounded-lg' }
];
