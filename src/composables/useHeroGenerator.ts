import { ref, computed } from 'vue';
import type { Hero, Appearance, Stats, Power } from '../types';
import { generateId, randomPick, randomPickN, randomInt } from '../utils/random';
import { generateBackstory } from '../utils/storyGenerator';
import { heroNames, realNames, catchphrases, weaknesses } from '../data/powers';
import { avatars, costumes, colorSchemes, accessories, bodyTypes, hairStyles, eyeStyles } from '../data/appearance';

const defaultStats: Stats = {
  strength: 50,
  speed: 50,
  intelligence: 50,
  durability: 50,
  combat: 50,
  charisma: 50
};

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

export function useHeroGenerator() {
  const currentHero = ref<Hero | null>(null);
  const isGenerating = ref(false);

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

  async function generateRandomHero(): Promise<Hero> {
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

  function resetHero() {
    currentHero.value = createEmptyHero();
  }

  function updateHero(updates: Partial<Hero>) {
    if (currentHero.value) {
      currentHero.value = { ...currentHero.value, ...updates };
    }
  }

  function regenerateBackstoryForHero() {
    if (currentHero.value) {
      currentHero.value.backstory = generateBackstory(currentHero.value);
    }
  }

  return {
    currentHero,
    isGenerating,
    createEmptyHero,
    generateRandomHero,
    resetHero,
    updateHero,
    regenerateBackstoryForHero
  };
}
