import { ref, computed } from 'vue';
import type { PortraitConfig, ArtStyle, ImageFilterSettings } from '../types';
import { 
  createDefaultPortraitConfig, 
  HAIR_STYLES, 
  EYE_STYLES, 
  COSTUME_STYLES, 
  ACCESSORIES, 
  HAIR_COLORS, 
  EYE_COLORS, 
  COSTUME_COLORS,
  DEFAULT_FILTER,
  ART_STYLES
} from '../data/portraitAssets';
import { randomInt, randomPick, randomPickN } from '../utils/random';

export function useCharacterGenerator(initialConfig?: PortraitConfig) {
  const config = ref<PortraitConfig>(initialConfig ?? createDefaultPortraitConfig());
  const candidates = ref<PortraitConfig[]>([]);
  const selectedIndex = ref<number>(0);

  const currentConfig = computed<PortraitConfig>(() => {
    return candidates.value.length > 0
      ? candidates.value[selectedIndex.value]
      : config.value;
  });

  function setArtStyle(style: ArtStyle): void {
    applyConfigToCurrent({ artStyle: style });
  }

  function setBodyShape(shape: PortraitConfig['bodyShape']): void {
    applyConfigToCurrent({ bodyShape: shape });
  }

  function setGenderBias(gender: PortraitConfig['genderBias']): void {
    applyConfigToCurrent({ genderBias: gender });
  }

  function setHairStyle(styleId: string): void {
    applyConfigToCurrent({ hair: { ...currentConfig.value.hair, styleId } });
  }

  function setHairColor(color: string): void {
    applyConfigToCurrent({ hair: { ...currentConfig.value.hair, color } });
  }

  function setEyeStyle(styleId: string): void {
    applyConfigToCurrent({ eyes: { ...currentConfig.value.eyes, styleId } });
  }

  function setEyeColor(color: string): void {
    applyConfigToCurrent({ eyes: { ...currentConfig.value.eyes, color } });
  }

  function setCostumeStyle(styleId: string): void {
    applyConfigToCurrent({ costume: { ...currentConfig.value.costume, styleId } });
  }

  function setCostumeColors(primary: string, secondary: string): void {
    applyConfigToCurrent({
      costume: { ...currentConfig.value.costume, primaryColor: primary, secondaryColor: secondary }
    });
  }

  function toggleAccessory(id: string): void {
    const accessories = [...currentConfig.value.accessories];
    const idx = accessories.indexOf(id);
    if (idx >= 0) {
      accessories.splice(idx, 1);
    } else {
      accessories.push(id);
    }
    applyConfigToCurrent({ accessories });
  }

  function setCustomImage(base64?: string, filter?: ImageFilterSettings): void {
    applyConfigToCurrent({
      customImage: base64,
      imageFilter: filter ?? { ...DEFAULT_FILTER }
    });
  }

  function generateCandidate(artStyle?: ArtStyle): PortraitConfig {
    const style = artStyle ?? randomPick(ART_STYLES).id;
    const costumeColor = randomPick(COSTUME_COLORS);
    const accessoryCount = randomInt(0, 3);
    const selectedAccessories = accessoryCount > 0
      ? randomPickN(ACCESSORIES, accessoryCount).map(a => a.id)
      : [];

    return {
      artStyle: style,
      bodyShape: randomPick(['slim', 'athletic', 'muscular', 'large', 'robotic']),
      genderBias: randomPick(['masculine', 'feminine', 'neutral']),
      hair: {
        styleId: randomPick(HAIR_STYLES[style]).id,
        color: randomPick(HAIR_COLORS)
      },
      eyes: {
        styleId: randomPick(EYE_STYLES[style]).id,
        color: randomPick(EYE_COLORS)
      },
      costume: {
        styleId: randomPick(COSTUME_STYLES[style]).id,
        primaryColor: costumeColor.primary,
        secondaryColor: costumeColor.secondary
      },
      accessories: selectedAccessories,
      imageFilter: { ...DEFAULT_FILTER }
    };
  }

  function isCandidateDifferent(a: PortraitConfig, existing: PortraitConfig[]): boolean {
    for (const other of existing) {
      if (a.artStyle === other.artStyle &&
          a.hair.styleId === other.hair.styleId &&
          a.costume.styleId === other.costume.styleId &&
          a.hair.color === other.hair.color) {
        return false;
      }
    }
    return true;
  }

  function generateCandidates(count = 4): void {
    const result: PortraitConfig[] = [];
    let attempts = 0;
    const maxAttempts = count * 10;

    while (result.length < count && attempts < maxAttempts) {
      const candidate = generateCandidate();
      if (isCandidateDifferent(candidate, result)) {
        result.push(candidate);
      }
      attempts++;
    }

    while (result.length < count) {
      result.push(generateCandidate());
    }

    candidates.value = result;
    selectedIndex.value = 0;
  }

  function reshuffleCandidates(): void {
    generateCandidates(candidates.value.length || 4);
  }

  function selectCandidate(index: number): void {
    if (index >= 0 && index < candidates.value.length) {
      selectedIndex.value = index;
    }
  }

  function applyConfigToCurrent(cfg: Partial<PortraitConfig>): void {
    if (candidates.value.length > 0) {
      candidates.value[selectedIndex.value] = { ...candidates.value[selectedIndex.value], ...cfg };
    } else {
      config.value = { ...config.value, ...cfg };
    }
  }

  function resetConfig(): void {
    config.value = createDefaultPortraitConfig();
    candidates.value = [];
    selectedIndex.value = 0;
  }

  return {
    config,
    candidates,
    selectedIndex,
    currentConfig,
    setArtStyle,
    setBodyShape,
    setGenderBias,
    setHairStyle,
    setHairColor,
    setEyeStyle,
    setEyeColor,
    setCostumeStyle,
    setCostumeColors,
    toggleAccessory,
    setCustomImage,
    generateCandidate,
    generateCandidates,
    reshuffleCandidates,
    selectCandidate,
    applyConfigToCurrent,
    resetConfig
  };
}
