import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Hero, HeroWithRank, Power, CardTemplate, ComicEffect, Appearance, Stats, FavoriteFolder, ArtStyle, PortraitConfig, HeroRelation, RelationType, UniverseStorageData, RelationTypeConfig } from '../types';
import { getHeroTemplates, getHotHeroes, getPowers, getCardTemplates, likeHero as apiLikeHero, shareHero as apiShareHero } from '../utils/mockApi';
import { generateId, randomPick, randomPickN, randomInt } from '../utils/random';
import { generateBackstory } from '../utils/storyGenerator';
import { heroNames, realNames, catchphrases, weaknesses } from '../data/powers';
import { avatars, costumes, colorSchemes, accessories, bodyTypes, hairStyles, eyeStyles } from '../data/appearance';
import { ART_STYLES, createDefaultPortraitConfig } from '../data/portraitAssets';

const STORAGE_KEY = 'comic-hero-collection';
const DATA_VERSION = '2.0';
const DEFAULT_FOLDER_ID = 'default';

const UNIVERSE_STORAGE_KEY = 'comic-hero-universe';
const UNIVERSE_DATA_VERSION = '1.0';

export const RELATION_TYPES: RelationTypeConfig[] = [
  { id: 'ally', label: '盟友', icon: '🤝', color: '#4caf50' },
  { id: 'enemy', label: '敌人', icon: '⚔️', color: '#e53935' },
  { id: 'mentor', label: '师徒', icon: '📚', color: '#2196f3' },
  { id: 'family', label: '家人', icon: '👨‍👩‍👧', color: '#ff9800' },
  { id: 'lover', label: '恋人', icon: '💘', color: '#e91e63' },
  { id: 'rival', label: '竞争对手', icon: '🏆', color: '#9c27b0' }
];

interface StorageData {
  version: string;
  heroes: Hero[];
  folders: FavoriteFolder[];
  createdAt: string;
  updatedAt: string;
}

function createDefaultFolder(): FavoriteFolder {
  return {
    id: DEFAULT_FOLDER_ID,
    name: '未分组',
    icon: '📁',
    color: '#9e9e9e',
    order: 0,
    heroIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function migrateData(data: any): StorageData {
  if (data.version === '2.0') {
    return data;
  }

  const heroes: Hero[] = (data.heroes || []).map((hero: Hero) => ({
    ...hero,
    folderId: DEFAULT_FOLDER_ID
  }));

  const defaultFolder = createDefaultFolder();
  defaultFolder.heroIds = heroes.map(h => h.id);

  return {
    version: DATA_VERSION,
    heroes,
    folders: [defaultFolder],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function initializeStorage(): StorageData {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      return migrateData(parsed);
    }
  } catch (e) {
    console.error('Storage init error:', e);
  }
  return {
    version: DATA_VERSION,
    heroes: [],
    folders: [createDefaultFolder()],
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
      eyeStyle: eyeStyles[0].id,
      portrait: createDefaultPortraitConfig()
    },
    powers: [],
    stats: { ...defaultStats },
    weakness: '',
    backstory: '',
    cardTemplate: 'classic',
    effects: [],
    likes: 0,
    folderId: DEFAULT_FOLDER_ID,
    createdAt: new Date().toISOString()
  };
}

function generateRandomAppearance(): Appearance {
  const artStyleIds = ART_STYLES.map(s => s.id);
  const randomStyle = randomPick(artStyleIds) as ArtStyle;
  const bodyShapeMap: Record<string, any> = {};
  bodyTypes.forEach((b: any) => { bodyShapeMap[b.id] = b.id === 'athletic' ? 'athletic' : b.id === 'muscular' ? 'muscular' : b.id === 'large' ? 'large' : b.id === 'robotic' ? 'robotic' : 'slim'; });
  const randomBodyType = randomPick(bodyTypes).id;
  const bodyShape = bodyShapeMap[randomBodyType] || 'athletic';

  const cfg: PortraitConfig = {
    ...createDefaultPortraitConfig(),
    artStyle: randomStyle,
    bodyShape: bodyShape as PortraitConfig['bodyShape'],
    genderBias: randomPick(['masculine', 'feminine', 'neutral']) as PortraitConfig['genderBias']
  };

  return {
    avatar: randomPick(avatars).id,
    costume: randomPick(costumes).id,
    colorScheme: randomPick(colorSchemes).id,
    accessories: randomPickN(accessories, randomInt(1, 4)).map(a => a.id),
    bodyType: randomBodyType,
    hairStyle: randomPick(hairStyles).id,
    eyeStyle: randomPick(eyeStyles).id,
    portrait: cfg
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

function initializeUniverseStorage(): UniverseStorageData {
  try {
    const existing = localStorage.getItem(UNIVERSE_STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.version === UNIVERSE_DATA_VERSION) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Universe storage init error:', e);
  }
  return {
    version: UNIVERSE_DATA_VERSION,
    relations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function saveUniverseToStorage(data: UniverseStorageData) {
  try {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(UNIVERSE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Universe storage save error:', e);
  }
}

export const useHeroStore = defineStore('hero', () => {
  const storageData = ref<StorageData>(initializeStorage());
  const universeData = ref<UniverseStorageData>(initializeUniverseStorage());
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
  const relations = computed(() => universeData.value.relations);
  const folders = computed(() => 
    [...storageData.value.folders].sort((a, b) => a.order - b.order)
  );
  const defaultFolder = computed(() => 
    storageData.value.folders.find(f => f.id === DEFAULT_FOLDER_ID)
  );

  function getFolderById(folderId: string): FavoriteFolder | undefined {
    return storageData.value.folders.find(f => f.id === folderId);
  }

  function getHeroesByFolder(folderId: string): Hero[] {
    const folder = getFolderById(folderId);
    if (!folder) return [];
    return folder.heroIds
      .map(id => storageData.value.heroes.find(h => h.id === id))
      .filter((h): h is Hero => h !== undefined);
  }

  function createFolder(name: string, icon: string = '📁', color: string = '#2196f3'): FavoriteFolder {
    const maxOrder = Math.max(...storageData.value.folders.map(f => f.order), 0);
    const newFolder: FavoriteFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      icon,
      color,
      order: maxOrder + 1,
      heroIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    storageData.value.folders.push(newFolder);
    saveToStorage();
    return newFolder;
  }

  function updateFolder(folderId: string, updates: Partial<Omit<FavoriteFolder, 'id' | 'heroIds' | 'createdAt'>>): boolean {
    const folder = getFolderById(folderId);
    if (!folder || folderId === DEFAULT_FOLDER_ID) return false;
    Object.assign(folder, updates, { updatedAt: new Date().toISOString() });
    saveToStorage();
    return true;
  }

  function deleteFolder(folderId: string): boolean {
    if (folderId === DEFAULT_FOLDER_ID) return false;
    const folder = getFolderById(folderId);
    if (!folder) return false;

    folder.heroIds.forEach(heroId => {
      const hero = storageData.value.heroes.find(h => h.id === heroId);
      if (hero) {
        hero.folderId = DEFAULT_FOLDER_ID;
        const defaultFolder = getFolderById(DEFAULT_FOLDER_ID);
        if (defaultFolder && !defaultFolder.heroIds.includes(heroId)) {
          defaultFolder.heroIds.push(heroId);
        }
      }
    });

    storageData.value.folders = storageData.value.folders.filter(f => f.id !== folderId);
    saveToStorage();
    return true;
  }

  function reorderFolders(fromIndex: number, toIndex: number): void {
    const folderList = [...storageData.value.folders].sort((a, b) => a.order - b.order);
    const [removed] = folderList.splice(fromIndex, 1);
    folderList.splice(toIndex, 0, removed);
    folderList.forEach((folder, index) => {
      folder.order = index;
      folder.updatedAt = new Date().toISOString();
    });
    saveToStorage();
  }

  function moveHeroToFolder(heroId: string, targetFolderId: string): boolean {
    const hero = storageData.value.heroes.find(h => h.id === heroId);
    if (!hero) return false;

    const currentFolder = getFolderById(hero.folderId);
    const targetFolder = getFolderById(targetFolderId);
    if (!targetFolder) return false;

    if (currentFolder) {
      currentFolder.heroIds = currentFolder.heroIds.filter(id => id !== heroId);
      currentFolder.updatedAt = new Date().toISOString();
    }

    if (!targetFolder.heroIds.includes(heroId)) {
      targetFolder.heroIds.push(heroId);
    }
    targetFolder.updatedAt = new Date().toISOString();
    hero.folderId = targetFolderId;

    saveToStorage();
    return true;
  }

  function moveHeroesToFolder(heroIds: string[], targetFolderId: string): number {
    let movedCount = 0;
    heroIds.forEach(heroId => {
      if (moveHeroToFolder(heroId, targetFolderId)) {
        movedCount++;
      }
    });
    return movedCount;
  }

  function reorderHeroesInFolder(folderId: string, fromIndex: number, toIndex: number): boolean {
    const folder = getFolderById(folderId);
    if (!folder) return false;

    const heroIds = [...folder.heroIds];
    const [removed] = heroIds.splice(fromIndex, 1);
    heroIds.splice(toIndex, 0, removed);
    folder.heroIds = heroIds;
    folder.updatedAt = new Date().toISOString();
    saveToStorage();
    return true;
  }

  function saveCurrentHero(folderId: string = DEFAULT_FOLDER_ID): boolean {
    if (!currentHero.value) return false;
    const exists = storageData.value.heroes.some(h => h.id === currentHero.value!.id);
    if (exists) return false;
    
    currentHero.value.folderId = folderId;
    storageData.value.heroes.unshift(currentHero.value);
    
    const folder = getFolderById(folderId);
    if (folder && !folder.heroIds.includes(currentHero.value.id)) {
      folder.heroIds.unshift(currentHero.value.id);
      folder.updatedAt = new Date().toISOString();
    }
    
    saveToStorage();
    return true;
  }

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
      folderId: DEFAULT_FOLDER_ID,
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
      storageData.value.folders.forEach(folder => {
        folder.heroIds = folder.heroIds.filter(id => id !== heroId);
        folder.updatedAt = new Date().toISOString();
      });
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
      folderId: DEFAULT_FOLDER_ID,
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
    storageData.value.folders = [createDefaultFolder()];
    saveToStorage();
    return true;
  }

  async function likeHero(heroId: string): Promise<number | null> {
    return likeHeroById(heroId);
  }

  function getRelationById(relationId: string): HeroRelation | undefined {
    return universeData.value.relations.find(r => r.id === relationId);
  }

  function getRelationsForHero(heroId: string): HeroRelation[] {
    return universeData.value.relations.filter(
      r => r.sourceId === heroId || r.targetId === heroId
    );
  }

  function getRelationBetween(sourceId: string, targetId: string): HeroRelation | undefined {
    return universeData.value.relations.find(
      r => (r.sourceId === sourceId && r.targetId === targetId) ||
           (r.sourceId === targetId && r.targetId === sourceId)
    );
  }

  function addRelation(sourceId: string, targetId: string, type: RelationType, description: string = ''): HeroRelation | null {
    if (sourceId === targetId) return null;
    if (getRelationBetween(sourceId, targetId)) return null;

    const newRelation: HeroRelation = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sourceId,
      targetId,
      type,
      description: description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    universeData.value.relations.push(newRelation);
    saveUniverseToStorage(universeData.value);
    return newRelation;
  }

  function updateRelation(relationId: string, updates: Partial<Omit<HeroRelation, 'id' | 'sourceId' | 'targetId' | 'createdAt'>>): boolean {
    const relation = getRelationById(relationId);
    if (!relation) return false;
    Object.assign(relation, updates, { updatedAt: new Date().toISOString() });
    saveUniverseToStorage(universeData.value);
    return true;
  }

  function removeRelation(relationId: string): boolean {
    const initialLength = universeData.value.relations.length;
    universeData.value.relations = universeData.value.relations.filter(r => r.id !== relationId);
    if (universeData.value.relations.length < initialLength) {
      saveUniverseToStorage(universeData.value);
      return true;
    }
    return false;
  }

  function removeRelationsForHero(heroId: string): number {
    const initialLength = universeData.value.relations.length;
    universeData.value.relations = universeData.value.relations.filter(
      r => r.sourceId !== heroId && r.targetId !== heroId
    );
    const removed = initialLength - universeData.value.relations.length;
    if (removed > 0) {
      saveUniverseToStorage(universeData.value);
    }
    return removed;
  }

  function clearAllRelations(): boolean {
    universeData.value.relations = [];
    saveUniverseToStorage(universeData.value);
    return true;
  }

  return {
    currentHero,
    isGenerating,
    templates,
    hotHeroes,
    powers,
    cardTemplates,
    savedHeroes,
    relations,
    folders,
    defaultFolder,
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
    likeHero,
    getFolderById,
    getHeroesByFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    reorderFolders,
    moveHeroToFolder,
    moveHeroesToFolder,
    reorderHeroesInFolder,
    getRelationById,
    getRelationsForHero,
    getRelationBetween,
    addRelation,
    updateRelation,
    removeRelation,
    removeRelationsForHero,
    clearAllRelations
  };
});
