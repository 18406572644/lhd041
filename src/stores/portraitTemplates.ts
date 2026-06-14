import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { PortraitTemplate, PortraitConfig } from '../types';
import { generateId } from '../utils/random';

const STORAGE_KEY = 'comic-hero-portrait-templates';
const DATA_VERSION = '1.0';

export const usePortraitTemplatesStore = defineStore('portraitTemplates', () => {
  const templates = ref<PortraitTemplate[]>([]);
  const isSaving = ref(false);

  function loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.version === DATA_VERSION && Array.isArray(parsed.templates)) {
          templates.value = parsed.templates;
        }
      }
    } catch (e) {
      console.error('Portrait templates load error:', e);
      templates.value = [];
    }
  }

  function saveToStorage(): void {
    try {
      isSaving.value = true;
      const data = {
        version: DATA_VERSION,
        templates: templates.value,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Portrait templates save error:', e);
    } finally {
      isSaving.value = false;
    }
  }

  function saveTemplate(name: string, config: PortraitConfig, thumbnail?: string): PortraitTemplate {
    const now = new Date().toISOString();
    const newTemplate: PortraitTemplate = {
      id: `tpl-${Date.now()}-${generateId().slice(0, 6)}`,
      name: name.trim(),
      thumbnail,
      config: JSON.parse(JSON.stringify(config)),
      usageCount: 0,
      isPinned: false,
      createdAt: now,
      updatedAt: now
    };
    templates.value.unshift(newTemplate);
    saveToStorage();
    return newTemplate;
  }

  function updateTemplate(id: string, updates: Partial<Omit<PortraitTemplate, 'id' | 'createdAt'>>): boolean {
    const template = templates.value.find(t => t.id === id);
    if (!template) return false;
    Object.assign(template, updates);
    template.updatedAt = new Date().toISOString();
    saveToStorage();
    return true;
  }

  function deleteTemplate(id: string): boolean {
    const initialLength = templates.value.length;
    templates.value = templates.value.filter(t => t.id !== id);
    if (templates.value.length < initialLength) {
      saveToStorage();
      return true;
    }
    return false;
  }

  function getTemplateById(id: string): PortraitTemplate | undefined {
    return templates.value.find(t => t.id === id);
  }

  function applyTemplateToConfig(id: string): PortraitConfig | null {
    const template = getTemplateById(id);
    if (!template) return null;
    template.usageCount += 1;
    template.updatedAt = new Date().toISOString();
    saveToStorage();
    return JSON.parse(JSON.stringify(template.config));
  }

  loadFromStorage();

  watch(templates, saveToStorage, { deep: true });

  return {
    templates,
    isSaving,
    loadFromStorage,
    saveToStorage,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    applyTemplateToConfig
  };
});
