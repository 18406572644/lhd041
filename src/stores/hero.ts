import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Hero, HeroWithRank, Power, CardTemplate, ComicEffect, Appearance, Stats } from '../types';
import { getHeroTemplates, getHotHeroes, getPowers, getCardTemplates, likeHero as apiLikeHero, shareHero as apiShareHero } from '../utils/mockApi';
import { generateId, randomPick, randomPickN, randomInt } from '../utils/random';
import { generateBackstory } from '../utils/storyGenerator';
import { heroNames, realNames, catchphrases, weaknesses } from '../data/powers';
import { avatars, costumes, colorSchemes, accessories, bodyTypes, hairStyles, eyeStyles } from '../data/appearance';

const STORAGE_KEY = 'comic-hero-collection';
const DATA_VERSION = '1.0';

interface StorageData {
  version: string;
  heroes: Hero[];
  createdAt: string;
  updatedAt: string;
}

function initializeStorage(): StorageData {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.version === DATA_VERSION) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Storage init error:', e);
  }
  return {
    version: DATA_VERSION,
    heroes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

const defaultStats: Stats = {
  strength: 50,
  speed: 50,
  intelligence: 50,
  durability: 50,
  combat: 50,
  charisma: 50
};

function createEmptyHero(): Hero {
  return {
    id: generateId(),
    name: '',
    alias: '',
    catchphrase: '',
    appearance: {
      avatar: avatars[0].id,
      costume: costumes[0].id,
      colorScheme: colorSchemes[0].id,
      accessories: [],
      bodyType: bodyTypes[0].id,
      hairStyle: hairStyles[0].id,
      eyeStyle: eyeStyles[0].id
    },
    powers: [],
    stats: { ...defaultStats },
    weakness: '',
    backstory: '',
    cardTemplate: 'classic',
    effects: [],
    likes: 0,
    createdAt: new Date().toISOString()
  };
}

function generateRandomAppearance(): Appearance {
  return {
    avatar: randomPick(avatars).id,
    costume: randomPick(costumes).id,
    colorScheme: randomPick(colorSchemes).id,
    accessories: randomPickN(accessories, randomInt(1, 4)).map(a => a.id),
    bodyType: randomPick(bodyTypes).id,
    hairStyle: randomPick(hairStyles).id,
    eyeStyle: randomPick(eyeStyles).id
  };
}

function generateRandomStats(): Stats {
  const totalPoints = 350 + randomInt(-30, 30);
  const stats: Stats = { ...defaultStats };
  const statKeys = Object.keys(stats) as (keyof Stats)[];
  
  let remainingPoints = totalPoints;
  
  for (let i = 0; i < statKeys.length; i++) {
    if (i === statKeys.length - 1) {
      stats[statKeys[i]] = Math.min(100, Math.max(10, remainingPoints));
    } else {
      const maxForThis = Math.min(100, remainingPoints - (statKeys.length - i - 1) * 10);
      const minForThis = Math.max(10, remainingPoints - (statKeys.length - i - 1) * 100);
      stats[statKeys[i]] = randomInt(minForThis, maxForThis);
      remainingPoints -= stats[statKeys[i]];
    }
  }
  
  return stats;
}

function generateRandomPowers(): Power[] {
  const availablePowers: Power[] = [
    { id: 'super-strength', name: '超级力量', icon: '💪', description: '拥有超越常人的力量', level: randomInt(60, 100) },
    { id: 'flight', name: '飞行能力', icon: '🦅', description: '可以在空中自由飞行', level: randomInt(60, 100) },
    { id: 'invulnerability', name: '刀枪不入', icon: '🛡️', description: '皮肤坚硬如钢铁', level: randomInt(60, 100) },
    { id: 'super-speed', name: '超级速度', icon: '⚡', description: '运动速度远超常人', level: randomInt(60, 100) },
    { id: 'telepathy', name: '心灵感应', icon: '🧠', description: '可以读取他人思想', level: randomInt(60, 100) },
    { id: 'telekinesis', name: '念力操控', icon: '🔮', description: '用意念移动物体', level: randomInt(60, 100) },
    { id: 'energy-blast', name: '能量射线', icon: '💥', description: '释放强大的能量攻击', level: randomInt(60, 100) },
    { id: 'invisibility', name: '隐身能力', icon: '👻', description: '可以让自己变得透明', level: randomInt(60, 100) },
    { id: 'shapeshifting', name: '变形能力', icon: '🦎', description: '可以改变自身形态', level: randomInt(60, 100) },
    { id: 'healing', name: '治愈能力', icon: '💚', description: '可以快速治愈伤口', level: randomInt(60, 100) },
    { id: 'time-manipulation', name: '时间操控', icon: '⏰', description: '可以操控时间的流逝', level: randomInt(60, 100) },
    { id: 'elemental-control', name: '元素操控', icon: '🔥', description: '可以操控自然元素', level: randomInt(60, 100) },
    { id: 'teleportation', name: '瞬间移动', icon: '✨', description: '可以瞬间移动位置', level: randomInt(60, 100) },
    { id: 'force-field', name: '能量护盾', icon: '🔵', description: '可以生成能量防护罩', level: randomInt(60, 100) },
    { id: 'super-intelligence', name: '超级智慧', icon: '🎓', description: '拥有远超常人的智商', level: randomInt(60, 100) }
  ];
  
  return randomPickN(availablePowers, randomInt(2, 4));
}

export const useHeroStore = defineStore('hero', () => {
  const storageData = ref<StorageData>(initializeStorage());
  const currentHero = ref<Hero | null>(null);
  const isGenerating = ref(false);

  const templates = ref<Hero[]>([]);
  const hotHeroes = ref<HeroWithRank[]>([]);
  const powers = ref<Power[]>([]);
  const cardTemplates = ref<CardTemplate[]>([]);
  
  const isLoadingTemplates = ref(false);
  const isLoadingHot = ref(false);
  const isLoadingPowers = ref(false);
  const isLoadingCardTemplates = ref(false);
  const selectedTemplateId = ref<string | null>(null);
  const isSaving = ref(false);

  const savedHeroes = computed(() => storageData.value.heroes);

  function saveToStorage() {
    try {
      isSaving.value = true;
      storageData.value.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData.value));
    } catch (e) {
      console.error('Storage save error:', e);
    } finally {
      isSaving.value = false;
    }
  }

  async function loadTemplates() {
    isLoadingTemplates.value = true;
    try {
      const response = await getHeroTemplates();
      if (response.code === 200) {
        templates.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      isLoadingTemplates.value = false;
    }
  }

  async function loadHotHeroes() {
    isLoadingHot.value = true;
    try {
      const response = await getHotHeroes();
      if (response.code === 200) {
        hotHeroes.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load hot heroes:', error);
    } finally {
      isLoadingHot.value = false;
    }
  }

  async function loadPowers() {
    isLoadingPowers.value = true;
    try {
      const response = await getPowers();
      if (response.code === 200) {
        powers.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load powers:', error);
    } finally {
      isLoadingPowers.value = false;
    }
  }

  async function loadCardTemplates() {
    isLoadingCardTemplates.value = true;
    try {
      const response = await getCardTemplates();
      if (response.code === 200) {
        cardTemplates.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load card templates:', error);
    } finally {
      isLoadingCardTemplates.value = false;
    }
  }

  async function loadAllData() {
    await Promise.all([
      loadTemplates(),
      loadHotHeroes(),
      loadPowers(),
      loadCardTemplates()
    ]);
  }

  async function createRandomHero(): Promise<Hero> {
    isGenerating.value = true;
    
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    const hero: Hero = {
      id: generateId(),
      name: randomPick(heroNames),
      alias: randomPick(realNames),
      catchphrase: randomPick(catchphrases),
      appearance: generateRandomAppearance(),
      powers: generateRandomPowers(),
      stats: generateRandomStats(),
      weakness: randomPick(weaknesses),
      backstory: '',
      cardTemplate: randomPick(['classic', 'vintage', 'modern', 'action', 'noir', 'pop-art', 'japanese', 'space']),
      effects: [],
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    hero.backstory = generateBackstory(hero);
    currentHero.value = hero;
    isGenerating.value = false;
    
    return hero;
  }

  function createNewHero() {
    currentHero.value = createEmptyHero();
  }

  function updateCurrentHero(updates: Partial<Hero>) {
    if (currentHero.value) {
      currentHero.value = { ...currentHero.value, ...updates };
    }
  }

  function regenerateBackstory() {
    if (currentHero.value) {
      currentHero.value.backstory = generateBackstory(currentHero.value);
    }
  }

  function saveCurrentHero(): boolean {
    if (!currentHero.value) return false;
    const exists = storageData.value.heroes.some(h => h.id === currentHero.value!.id);
    if (exists) return false;
    storageData.value.heroes.unshift(currentHero.value);
    saveToStorage();
    return true;
  }

  function updateExistingHero(hero: Hero): boolean {
    const index = storageData.value.heroes.findIndex(h => h.id === hero.id);
    if (index === -1) return false;
    storageData.value.heroes[index] = hero;
    saveToStorage();
    return true;
  }

  function removeHero(heroId: string): boolean {
    const initialLength = storageData.value.heroes.length;
    storageData.value.heroes = storageData.value.heroes.filter(h => h.id !== heroId);
    if (storageData.value.heroes.length < initialLength) {
      saveToStorage();
      return true;
    }
    return false;
  }

  function getSavedHeroById(heroId: string): Hero | undefined {
    return storageData.value.heroes.find(h => h.id === heroId);
  }

  function selectTemplate(templateId: string) {
    const template = templates.value.find(t => t.id === templateId);
    if (template) {
      currentHero.value = { ...template, id: generateId() };
      selectedTemplateId.value = templateId;
    }
  }

  function applyHeroAsTemplate(hero: Hero) {
    currentHero.value = { 
      ...hero, 
      id: generateId(), 
      likes: 0, 
      createdAt: new Date().toISOString(),
      effects: []
    };
  }

  async function likeHeroById(heroId: string): Promise<number | null> {
    try {
      const response = await apiLikeHero(heroId);
      if (response.code === 200) {
        const hotHero = hotHeroes.value.find(h => h.id === heroId);
        if (hotHero) hotHero.likes = response.data.likes;
        const template = templates.value.find(h => h.id === heroId);
        if (template) template.likes = response.data.likes;
        return response.data.likes;
      }
    } catch (error) {
      console.error('Failed to like hero:', error);
    }
    return null;
  }

  async function shareCurrentHero(): Promise<string | null> {
    if (!currentHero.value) return null;
    try {
      const response = await apiShareHero(currentHero.value);
      if (response.code === 200) {
        return response.data.shareUrl;
      }
    } catch (error) {
      console.error('Failed to share hero:', error);
    }
    return null;
  }

  function addEffect(effect: Omit<ComicEffect, 'id'>) {
    if (!currentHero.value) return;
    const newEffect: ComicEffect = {
      ...effect,
      id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    currentHero.value = {
      ...currentHero.value,
      effects: [...currentHero.value.effects, newEffect]
    };
  }

  function updateEffect(effectId: string, updates: Partial<ComicEffect>) {
    if (!currentHero.value) return;
    currentHero.value = {
      ...currentHero.value,
      effects: currentHero.value.effects.map(e => 
        e.id === effectId ? { ...e, ...updates } : e
      )
    };
  }

  function removeEffect(effectId: string) {
    if (!currentHero.value) return;
    currentHero.value = {
      ...currentHero.value,
      effects: currentHero.value.effects.filter(e => e.id !== effectId)
    };
  }

  function clearEffects() {
    if (!currentHero.value) return;
    currentHero.value = { ...currentHero.value, effects: [] };
  }

  function getStorageStats() {
    const used = new Blob([JSON.stringify(storageData.value)]).size;
    const max = 5 * 1024 * 1024;
    return {
      totalSize: used,
      used,
      max,
      percentage: (used / max) * 100,
      heroCount: storageData.value.heroes.length
    };
  }

  async function generateRandomHero(): Promise<Hero> {
    return createRandomHero();
  }

  async function loadFromTemplate(templateId: string): Promise<boolean> {
    const template = templates.value.find(t => t.id === templateId);
    if (template) {
      selectTemplate(templateId);
      return true;
    }
    return false;
  }

  async function regenerateCurrentBackstory(): Promise<void> {
    regenerateBackstory();
  }

  async function editHero(heroId: string): Promise<boolean> {
    const hero = getSavedHeroById(heroId);
    if (hero) {
      applyHeroAsTemplate(hero);
      return true;
    }
    return false;
  }

  async function deleteSavedHero(heroId: string): Promise<boolean> {
    return removeHero(heroId);
  }

  async function shareHero(heroId: string): Promise<string | null> {
    const hero = getSavedHeroById(heroId);
    if (!hero) return null;
    try {
      const response = await apiShareHero(hero);
      if (response.code === 200) {
        return response.data.shareUrl;
      }
    } catch (error) {
      console.error('Failed to share hero:', error);
    }
    return null;
  }

  async function clearAllHeroes(): Promise<boolean> {
    storageData.value.heroes = [];
    saveToStorage();
    return true;
  }

  async function likeHero(heroId: string): Promise<number | null> {
    return likeHeroById(heroId);
  }

  return {
    currentHero,
    isGenerating,
    templates,
    hotHeroes,
    powers,
    cardTemplates,
    savedHeroes,
    isLoadingTemplates,
    isLoadingHot,
    isLoadingPowers,
    isLoadingCardTemplates,
    selectedTemplateId,
    isSaving,
    loadTemplates,
    loadHotHeroes,
    loadPowers,
    loadCardTemplates,
    loadAllData,
    createRandomHero,
    createNewHero,
    updateCurrentHero,
    regenerateBackstory,
    saveCurrentHero,
    updateExistingHero,
    removeHero,
    getSavedHeroById,
    selectTemplate,
    applyHeroAsTemplate,
    likeHeroById,
    shareCurrentHero,
    addEffect,
    updateEffect,
    removeEffect,
    clearEffects,
    getStorageStats,
    generateRandomHero,
    loadFromTemplate,
    regenerateCurrentBackstory,
    editHero,
    deleteSavedHero,
    shareHero,
    clearAllHeroes,
    likeHero
  };
});
