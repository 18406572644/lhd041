import { ref, watch } from 'vue';
import type { Hero } from '../types';

const STORAGE_KEY = 'comic-hero-collection';
const DATA_VERSION = '1.0';

interface StorageData {
  version: string;
  heroes: Hero[];
  createdAt: string;
  updatedAt: string;
}

function initializeStorage(): StorageData {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed.version === DATA_VERSION) {
        return parsed;
      }
      return migrateData(parsed);
    } catch {
      return createEmptyStorage();
    }
  }
  return createEmptyStorage();
}

function createEmptyStorage(): StorageData {
  return {
    version: DATA_VERSION,
    heroes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function migrateData(oldData: any): StorageData {
  console.log('Migrating storage data...');
  return {
    version: DATA_VERSION,
    heroes: oldData.heroes || [],
    createdAt: oldData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function useLocalStorage() {
  const storageData = ref<StorageData>(initializeStorage());
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  function saveToStorage() {
    try {
      isSaving.value = true;
      storageData.value.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData.value));
      error.value = null;
    } catch (e) {
      error.value = '保存失败，存储空间可能已满';
      console.error('Storage error:', e);
    } finally {
      isSaving.value = false;
    }
  }

  function addHero(hero: Hero): boolean {
    const exists = storageData.value.heroes.some(h => h.id === hero.id);
    if (exists) {
      return false;
    }
    storageData.value.heroes.unshift(hero);
    saveToStorage();
    return true;
  }

  function updateHero(hero: Hero): boolean {
    const index = storageData.value.heroes.findIndex(h => h.id === hero.id);
    if (index === -1) {
      return false;
    }
    storageData.value.heroes[index] = hero;
    saveToStorage();
    return true;
  }

  function deleteHero(heroId: string): boolean {
    const initialLength = storageData.value.heroes.length;
    storageData.value.heroes = storageData.value.heroes.filter(h => h.id !== heroId);
    if (storageData.value.heroes.length < initialLength) {
      saveToStorage();
      return true;
    }
    return false;
  }

  function getHeroById(heroId: string): Hero | undefined {
    return storageData.value.heroes.find(h => h.id === heroId);
  }

  function clearAllHeroes() {
    if (confirm('确定要删除所有已保存的角色吗？此操作不可恢复。')) {
      storageData.value.heroes = [];
      saveToStorage();
    }
  }

  function getStorageStats() {
    const used = new Blob([JSON.stringify(storageData.value)]).size;
    const max = 5 * 1024 * 1024;
    return {
      used,
      max,
      percentage: (used / max) * 100,
      heroCount: storageData.value.heroes.length
    };
  }

  const heroes = ref<Hero[]>([...storageData.value.heroes]);

  watch(() => storageData.value.heroes, (newHeroes) => {
    heroes.value = [...newHeroes];
  }, { deep: true });

  return {
    heroes,
    isSaving,
    error,
    addHero,
    updateHero,
    deleteHero,
    getHeroById,
    clearAllHeroes,
    getStorageStats
  };
}
