import type { Hero, HeroWithRank, Power, CardTemplate, ApiResponse } from '../types';
import { heroTemplates, hotHeroes } from '../data/heroTemplates';
import { powers as allPowers } from '../data/powers';
import { cardTemplates } from '../data/cardTemplates';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getHeroTemplates(): Promise<ApiResponse<Hero[]>> {
  await delay(500 + Math.random() * 500);
  return {
    code: 200,
    message: 'success',
    data: heroTemplates
  };
}

export async function getHotHeroes(): Promise<ApiResponse<HeroWithRank[]>> {
  await delay(600 + Math.random() * 400);
  return {
    code: 200,
    message: 'success',
    data: hotHeroes
  };
}

export async function likeHero(heroId: string): Promise<ApiResponse<{ likes: number }>> {
  await delay(300 + Math.random() * 200);
  
  const hero = [...heroTemplates, ...hotHeroes].find(h => h.id === heroId);
  const currentLikes = hero?.likes || 0;
  const newLikes = currentLikes + Math.floor(Math.random() * 3) + 1;
  
  return {
    code: 200,
    message: 'success',
    data: { likes: newLikes }
  };
}

export async function getPowers(): Promise<ApiResponse<Power[]>> {
  await delay(300 + Math.random() * 200);
  return {
    code: 200,
    message: 'success',
    data: allPowers
  };
}

export async function getCardTemplates(): Promise<ApiResponse<CardTemplate[]>> {
  await delay(300 + Math.random() * 200);
  return {
    code: 200,
    message: 'success',
    data: cardTemplates
  };
}

export async function getHeroById(id: string): Promise<ApiResponse<Hero | null>> {
  await delay(200 + Math.random() * 300);
  
  const hero = [...heroTemplates, ...hotHeroes].find(h => h.id === id);
  
  return {
    code: 200,
    message: 'success',
    data: hero || null
  };
}

export async function shareHero(hero: Hero): Promise<ApiResponse<{ shareUrl: string }>> {
  await delay(800 + Math.random() * 400);
  
  const shareId = btoa(encodeURIComponent(hero.id + '-' + Date.now()));
  
  return {
    code: 200,
    message: 'success',
    data: {
      shareUrl: `https://comic-hero.app/share/${shareId}`
    }
  };
}
