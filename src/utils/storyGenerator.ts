import { storyTemplates, storyFillers } from '../data/backstories';
import { randomPick, randomPickN } from './random';
import type { Hero } from '../types';

export function generateBackstory(hero: Partial<Hero>): string {
  const template = randomPick(storyTemplates);
  
  const fillerMap: Record<string, string | number> = {
    name: hero.name || '无名英雄',
    alias: hero.alias || '神秘人',
    occupation: randomPick(storyFillers.occupations),
    tragedy: randomPick(storyFillers.tragedies),
    event: randomPick(storyFillers.events),
    power: hero.powers?.[0]?.name || '未知',
    goal: randomPick(storyFillers.goals),
    weakness: hero.weakness || '未知',
    catchphrase: hero.catchphrase || '我是英雄！',
    experiment: randomPick(storyFillers.experiments),
    radiation: randomPick(storyFillers.radiation),
    planet: randomPick(storyFillers.planets),
    reason: randomPick(storyFillers.reasons),
    day: storyFillers.day,
    mysticalFigure: randomPick(storyFillers.mysticalFigure),
    prophecy: randomPick(storyFillers.prophecy),
    crime: randomPick(storyFillers.crime),
    training: randomPick(storyFillers.training),
    age: randomPick(storyFillers.age),
    mutation: randomPick(storyFillers.mutation),
    discrimination: randomPick(storyFillers.discrimination),
    era: randomPick(storyFillers.era),
    ancientOrder: randomPick(storyFillers.ancientOrder),
    ancientTraining: randomPick(storyFillers.ancientTraining),
    sleep: randomPick(storyFillers.sleep),
    incident: randomPick(storyFillers.incident),
    intelligence: storyFillers.intelligence,
    resource: storyFillers.resource,
    technology: randomPick(storyFillers.technology),
    base: randomPick(storyFillers.base)
  };

  let story = template.template;
  
  for (const [key, value] of Object.entries(fillerMap)) {
    story = story.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  
  return story;
}

export function regenerateBackstory(hero: Hero): string {
  return generateBackstory(hero);
}
