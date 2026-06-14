import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Preset,
  PresetCategory,
  PresetsStorageData,
  SortMode,
  Appearance,
  Power,
  Stats,
  ComicEffect,
  Hero,
  AppearancePreset,
  PowersPreset,
  StoryPreset,
  EffectsPreset,
  CardPreset,
  FullPreset
} from '../types';
import { generateId } from '../utils/random';
import { avatars, colorSchemes } from '../data/appearance';

const PRESETS_STORAGE_KEY = 'comic-hero-presets';
const PRESETS_DATA_VERSION = '1.0';

const categoryLabels: Record<PresetCategory, string> = {
  appearance: '外观',
  powers: '能力',
  story: '故事',
  effects: '特效',
  card: '卡片',
  full: '套装'
};

function initializePresetsStorage(): PresetsStorageData {
  try {
    const existing = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.version === PRESETS_DATA_VERSION) {
        return parsed;
      }
      return migratePresetsData(parsed);
    }
  } catch (e) {
    console.error('Presets storage init error:', e);
  }
  return {
    version: PRESETS_DATA_VERSION,
    presets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function migratePresetsData(oldData: any): PresetsStorageData {
  console.log('Migrating presets storage data...');
  return {
    version: PRESETS_DATA_VERSION,
    presets: oldData.presets || [],
    createdAt: oldData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function generateThumbnailForPreset(preset: Preset): string | undefined {
  if (preset.category === 'appearance') {
    const avatar = avatars.find(a => a.id === preset.data.avatar);
    const scheme = colorSchemes.find(c => c.id === preset.data.colorScheme);
    if (avatar && scheme) {
      return `${avatar.emoji}|${scheme.primary}`;
    }
  }
  if (preset.category === 'full') {
    const avatar = avatars.find(a => a.id === preset.data.appearance.avatar);
    const scheme = colorSchemes.find(c => c.id === preset.data.appearance.colorScheme);
    if (avatar && scheme) {
      return `${avatar.emoji}|${scheme.primary}`;
    }
  }
  return undefined;
}

export const usePresetsStore = defineStore('presets', () => {
  const storageData = ref<PresetsStorageData>(initializePresetsStorage());
  const searchQuery = ref('');
  const sortMode = ref<SortMode>('date');
  const isSaving = ref(false);

  function saveToStorage() {
    try {
      isSaving.value = true;
      storageData.value.updatedAt = new Date().toISOString();
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(storageData.value));
    } catch (e) {
      console.error('Presets storage save error:', e);
      throw new Error('存储空间可能已满');
    } finally {
      isSaving.value = false;
    }
  }

  const allPresets = computed(() => storageData.value.presets);

  function getPresetsByCategory(category: PresetCategory) {
    return computed(() => {
      let filtered = storageData.value.presets.filter(p => p.category === category);

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
      }

      switch (sortMode.value) {
        case 'usage':
          filtered.sort((a, b) => b.usageCount - a.usageCount);
          break;
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
          break;
        case 'date':
        default:
          filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }

      filtered.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

      return filtered;
    });
  }

  function createBasePreset(name: string, category: PresetCategory, thumbnail?: string): Omit<Preset, 'data' | 'category'> {
    const now = new Date().toISOString();
    return {
      id: `preset-${generateId()}`,
      name,
      thumbnail,
      usageCount: 0,
      isPinned: false,
      createdAt: now,
      updatedAt: now
    };
  }

  function saveAppearancePreset(name: string, appearance: Appearance): AppearancePreset {
    const base = createBasePreset(name, 'appearance');
    const preset: AppearancePreset = {
      ...base,
      category: 'appearance',
      data: { ...appearance }
    };
    preset.thumbnail = generateThumbnailForPreset(preset);
    storageData.value.presets.unshift(preset);
    saveToStorage();
    return preset;
  }

  function savePowersPreset(
    name: string,
    powers: Power[],
    stats: Stats,
    weakness: string
  ): PowersPreset {
    const base = createBasePreset(name, 'powers');
    const preset: PowersPreset = {
      ...base,
      category: 'powers',
      data: {
        powers: powers.map(p => ({ ...p })),
        stats: { ...stats },
        weakness
      }
    };
    if (powers.length > 0) {
      preset.thumbnail = powers.slice(0, 3).map(p => p.icon).join('');
    }
    storageData.value.presets.unshift(preset);
    saveToStorage();
    return preset;
  }

  function saveStoryPreset(
    name: string,
    catchphrase: string,
    backstoryTemplate: string
  ): StoryPreset {
    const base = createBasePreset(name, 'story');
    const preset: StoryPreset = {
      ...base,
      category: 'story',
      data: {
        catchphrase,
        backstoryTemplate
      }
    };
    preset.thumbnail = '📖';
    storageData.value.presets.unshift(preset);
    saveToStorage();
    return preset;
  }

  function saveEffectsPreset(name: string, effects: ComicEffect[]): EffectsPreset {
    const base = createBasePreset(name, 'effects');
    const preset: EffectsPreset = {
      ...base,
      category: 'effects',
      data: effects.map(e => ({ ...e }))
    };
    if (effects.length > 0) {
      preset.thumbnail = effects.slice(0, 3).map(e => {
        const typeEmojis: Record<string, string> = {
          boom: '💥', zap: '⚡', pow: '💪', bam: '💥', wham: '🔨',
          swoosh: '💨', smash: '💎', crash: '💫'
        };
        return typeEmojis[e.type] || '✨';
      }).join('');
    }
    storageData.value.presets.unshift(preset);
    saveToStorage();
    return preset;
  }

  function saveCardPreset(name: string, cardTemplate: string): CardPreset {
    const base = createBasePreset(name, 'card');
    const preset: CardPreset = {
      ...base,
      category: 'card',
      data: { cardTemplate }
    };
    preset.thumbnail = '🎴';
    storageData.value.presets.unshift(preset);
    saveToStorage();
    return preset;
  }

  function saveFullPreset(name: string, hero: Hero): FullPreset {
    const base = createBasePreset(name, 'full');
    const preset: FullPreset = {
      ...base,
      category: 'full',
      data: {
        appearance: { ...hero.appearance },
        powers: hero.powers.map(p => ({ ...p })),
        stats: { ...hero.stats },
        weakness: hero.weakness,
        catchphrase: hero.catchphrase,
        backstory: hero.backstory,
        cardTemplate: hero.cardTemplate,
        effects: hero.effects.map(e => ({ ...e }))
      }
    };
    preset.thumbnail = generateThumbnailForPreset(preset);
    storageData.value.presets.unshift(preset);
    saveToStorage();
    return preset;
  }

  function applyPreset(presetId: string): Preset | null {
    const preset = storageData.value.presets.find(p => p.id === presetId);
    if (!preset) return null;
    preset.usageCount += 1;
    preset.updatedAt = new Date().toISOString();
    saveToStorage();
    return preset;
  }

  function deletePreset(presetId: string): boolean {
    const initialLength = storageData.value.presets.length;
    storageData.value.presets = storageData.value.presets.filter(p => p.id !== presetId);
    if (storageData.value.presets.length < initialLength) {
      saveToStorage();
      return true;
    }
    return false;
  }

  function renamePreset(presetId: string, newName: string): boolean {
    const preset = storageData.value.presets.find(p => p.id === presetId);
    if (!preset) return false;
    preset.name = newName;
    preset.updatedAt = new Date().toISOString();
    saveToStorage();
    return true;
  }

  function togglePinPreset(presetId: string): boolean {
    const preset = storageData.value.presets.find(p => p.id === presetId);
    if (!preset) return false;
    preset.isPinned = !preset.isPinned;
    preset.updatedAt = new Date().toISOString();
    saveToStorage();
    return true;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function setSortMode(mode: SortMode) {
    sortMode.value = mode;
  }

  function getCategoryLabel(category: PresetCategory): string {
    return categoryLabels[category];
  }

  function getStorageStats() {
    const used = new Blob([JSON.stringify(storageData.value)]).size;
    const max = 5 * 1024 * 1024;
    const categoryCounts: Record<PresetCategory, number> = {
      appearance: 0, powers: 0, story: 0, effects: 0, card: 0, full: 0
    };
    storageData.value.presets.forEach(p => {
      categoryCounts[p.category] += 1;
    });
    return {
      totalSize: used,
      used,
      max,
      percentage: (used / max) * 100,
      totalCount: storageData.value.presets.length,
      categoryCounts
    };
  }

  function clearAllPresets(): boolean {
    if (storageData.value.presets.length === 0) return false;
    storageData.value.presets = [];
    saveToStorage();
    return true;
  }

  return {
    allPresets,
    searchQuery,
    sortMode,
    isSaving,
    getPresetsByCategory,
    saveAppearancePreset,
    savePowersPreset,
    saveStoryPreset,
    saveEffectsPreset,
    saveCardPreset,
    saveFullPreset,
    applyPreset,
    deletePreset,
    renamePreset,
    togglePinPreset,
    setSearchQuery,
    setSortMode,
    getCategoryLabel,
    getStorageStats,
    clearAllPresets
  };
});
