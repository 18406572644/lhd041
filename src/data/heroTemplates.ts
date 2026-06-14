import type { Hero } from '../types';
import { createDefaultPortraitConfig } from './portraitAssets';

export const heroTemplates: Hero[] = [
  {
    id: 'template-1',
    name: '雷霆战士',
    alias: '雷明',
    catchphrase: '雷电将至，邪恶必败！',
    appearance: {
      avatar: '🦸',
      costume: '经典紧身衣',
      colorScheme: 'blue-yellow',
      accessories: ['mask', 'cape', 'belt'],
      bodyType: 'muscular',
      hairStyle: 'spiky',
      eyeStyle: 'glowing',
      portrait: createDefaultPortraitConfig()
    },
    powers: [
      { id: 'lightning', name: '雷电操控', icon: '⚡', description: '可以操控雷电进行攻击', level: 85 },
      { id: 'flight', name: '飞行能力', icon: '🦅', description: '利用电场飞行', level: 70 },
      { id: 'super-speed', name: '超级速度', icon: '💨', description: '闪电般的速度', level: 90 }
    ],
    stats: {
      strength: 75,
      speed: 95,
      intelligence: 70,
      durability: 80,
      combat: 85,
      charisma: 65
    },
    weakness: '绝缘体',
    backstory: '雷明本是一名普通的电力工程师，在一次雷击事故中获得了操控雷电的能力。他决定用这份力量保护城市，成为了人们口中的"雷霆战士"。每当暴风雨来临，人们就知道，他来了！',
    cardTemplate: 'classic',
    effects: [],
    likes: 2847,
    folderId: 'default',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'template-2',
    name: '暗夜守护者',
    alias: '夜影',
    catchphrase: '我是黑夜中的利剑！',
    appearance: {
      avatar: '🥷',
      costume: 'leather',
      colorScheme: 'black-gold',
      accessories: ['mask', 'belt', 'gloves', 'boots'],
      bodyType: 'athletic',
      hairStyle: 'short',
      eyeStyle: 'masked',
      portrait: createDefaultPortraitConfig()
    },
    powers: [
      { id: 'martial-arts', name: '武术大师', icon: '🥋', description: '精通世界各国武术', level: 95 },
      { id: 'stealth', name: '潜行专家', icon: '👤', description: '可以融入黑暗', level: 90 },
      { id: 'detective', name: '侦探能力', icon: '🔍', description: '超凡的推理能力', level: 85 },
      { id: 'gadgets', name: '高科技装备', icon: '🛠️', description: '各种实用道具', level: 80 }
    ],
    stats: {
      strength: 70,
      speed: 80,
      intelligence: 95,
      durability: 75,
      combat: 95,
      charisma: 70
    },
    weakness: '家人',
    backstory: '童年时目睹父母被杀害，夜影发誓要消灭城市中的犯罪。他游历世界，学习了各种武术和侦探技巧。凭借着过人的智慧和坚定的意志，他成为了这座城市最令人畏惧的黑暗骑士。',
    cardTemplate: 'noir',
    effects: [],
    likes: 3521,
    folderId: 'default',
    createdAt: '2024-01-10T14:20:00Z'
  },
  {
    id: 'template-3',
    name: '钢铁之心',
    alias: '托尼·张',
    catchphrase: '我就是未来！',
    appearance: {
      avatar: '🤖',
      costume: 'armor',
      colorScheme: 'red-gold',
      accessories: ['helmet', 'gloves', 'boots', 'watch'],
      bodyType: 'robotic',
      hairStyle: 'short',
      eyeStyle: 'robotic',
      portrait: createDefaultPortraitConfig()
    },
    powers: [
      { id: 'repulsor', name: '脉冲炮', icon: '💥', description: '手掌发射能量脉冲', level: 85 },
      { id: 'flight-armor', name: '装甲飞行', icon: '🚀', description: '推进器高速飞行', level: 80 },
      { id: 'missiles', name: '智能导弹', icon: '🚀', description: '各种制导武器', level: 75 },
      { id: 'ai-assist', name: 'AI辅助', icon: '🤖', description: '人工智能战斗辅助', level: 90 }
    ],
    stats: {
      strength: 90,
      speed: 75,
      intelligence: 95,
      durability: 90,
      combat: 80,
      charisma: 85
    },
    weakness: '能量耗尽',
    backstory: '天才发明家托尼·张在一次恐怖袭击中受了重伤，被迫使用自己发明的方舟反应炉维持生命。他创造了一套高科技装甲，成为了钢铁之心。从武器商人到超级英雄，他用行动证明了自己的改变。',
    cardTemplate: 'modern',
    effects: [],
    likes: 4128,
    folderId: 'default',
    createdAt: '2024-01-08T09:15:00Z'
  },
  {
    id: 'template-4',
    name: '幻影女王',
    alias: '苏菲',
    catchphrase: '你永远抓不到幻影！',
    appearance: {
      avatar: '👻',
      costume: 'stealth',
      colorScheme: 'purple-black',
      accessories: ['cape', 'mask', 'necklace'],
      bodyType: 'slim',
      hairStyle: 'long',
      eyeStyle: 'glowing',
      portrait: createDefaultPortraitConfig()
    },
    powers: [
      { id: 'invisibility', name: '隐身', icon: '👻', description: '可以完全隐形', level: 95 },
      { id: 'intangibility', name: '虚化', icon: '🌀', description: '可以穿透物体', level: 85 },
      { id: 'teleportation', name: '瞬移', icon: '✨', description: '短距离瞬间移动', level: 75 },
      { id: 'energy-blast', name: '能量冲击', icon: '💫', description: '发射精神能量', level: 70 }
    ],
    stats: {
      strength: 50,
      speed: 85,
      intelligence: 80,
      durability: 60,
      combat: 70,
      charisma: 90
    },
    weakness: '高强度电磁波',
    backstory: '苏菲是一位顶尖的量子物理学家，在一次实验事故中，她的身体与暗物质发生了融合，获得了不可思议的能力。她可以隐身、穿墙、瞬移...她用这些能力打击犯罪，成为了传说中的幻影女王。',
    cardTemplate: 'vintage',
    effects: [],
    likes: 2654,
    folderId: 'default',
    createdAt: '2024-01-12T16:45:00Z'
  },
  {
    id: 'template-5',
    name: '烈焰骑士',
    alias: '炎龙',
    catchphrase: '燃烧吧，正义之火！',
    appearance: {
      avatar: '🔥',
      costume: 'armor',
      colorScheme: 'red-orange',
      accessories: ['helmet', 'cape', 'shield', 'sword'],
      bodyType: 'muscular',
      hairStyle: 'spiky',
      eyeStyle: 'glowing',
      portrait: createDefaultPortraitConfig()
    },
    powers: [
      { id: 'pyrokinesis', name: '控火术', icon: '🔥', description: '操控火焰', level: 95 },
      { id: 'fire-immunity', name: '火焰免疫', icon: '🛡️', description: '完全免疫高温', level: 100 },
      { id: 'flight-fire', name: '火焰飞行', icon: '✈️', description: '用火焰推进飞行', level: 75 },
      { id: 'sword-fire', name: '烈焰之剑', icon: '⚔️', description: '燃烧的神剑', level: 90 }
    ],
    stats: {
      strength: 85,
      speed: 70,
      intelligence: 65,
      durability: 90,
      combat: 95,
      charisma: 80
    },
    weakness: '水',
    backstory: '炎龙曾是古代炎龙骑士团的团长，在与黑暗魔王的战斗中牺牲。但他的灵魂与神器烈焰之剑融合，在现代重生。他发誓要继续守护这个世界，燃烧的怒火永远不会熄灭！',
    cardTemplate: 'action',
    effects: [],
    likes: 3892,
    folderId: 'default',
    createdAt: '2024-01-05T11:30:00Z'
  },
  {
    id: 'template-6',
    name: '光速侠',
    alias: '巴里·王',
    catchphrase: '我是最快的人！',
    appearance: {
      avatar: '⚡',
      costume: 'classic',
      colorScheme: 'red-yellow',
      accessories: ['mask', 'boots', 'belt'],
      bodyType: 'athletic',
      hairStyle: 'short',
      eyeStyle: 'normal',
      portrait: createDefaultPortraitConfig()
    },
    powers: [
      { id: 'super-speed', name: '超级速度', icon: '💨', description: '接近光速', level: 95 },
      { id: 'time-travel', name: '时间穿越', icon: '⏰', description: '高速穿越时间', level: 70 },
      { id: 'phasing', name: '振动穿墙', icon: '🌀', description: '高速振动穿透物体', level: 80 },
      { id: 'speed-force', name: '神速力', icon: '⚡', description: '来自速度维度的能量', level: 85 }
    ],
    stats: {
      strength: 65,
      speed: 100,
      intelligence: 75,
      durability: 70,
      combat: 75,
      charisma: 85
    },
    weakness: '低温',
    backstory: '巴里·王在一次粒子加速器爆炸事故中被闪电击中，获得了不可思议的超级速度。他用这份能力保护城市，成为了光速侠。他可以在几秒内环游世界，但他永远不会忘记，能力越大，责任越大。',
    cardTemplate: 'classic',
    effects: [],
    likes: 4567,
    folderId: 'default',
    createdAt: '2024-01-03T08:20:00Z'
  },
  {
    id: 'template-7',
    name: '海洋霸主',
    alias: '海王·陈',
    catchphrase: '七海之王，君临天下！',
    appearance: {
      avatar: '🧜',
      costume: 'royal',
      colorScheme: 'green-gold',
      accessories: ['necklace', 'boots'],
      bodyType: 'muscular',
      hairStyle: 'long',
      eyeStyle: 'normal',
      portrait: createDefaultPortraitConfig()
    },
    powers: [
      { id: 'aquatic', name: '海洋能力', icon: '🌊', description: '在水中自由呼吸', level: 100 },
      { id: 'super-strength', name: '超级力量', icon: '💪', description: '可以举起万吨巨轮', level: 90 },
      { id: 'marine-life', name: '海洋生物沟通', icon: '🐬', description: '与所有海洋生物沟通', level: 95 },
      { id: 'trident', name: '海神三叉戟', icon: '🔱', description: '操控海洋的神器', level: 85 }
    ],
    stats: {
      strength: 95,
      speed: 80,
      intelligence: 70,
      durability: 95,
      combat: 85,
      charisma: 90
    },
    weakness: '长时间离开水',
    backstory: '海王·陈是亚特兰蒂斯女王与人类的混血儿，肩负着连接陆地与海洋的使命。他可以在深海中自由来去，与所有海洋生物沟通。当海洋受到威胁时，他会手持三叉戟，以七海之王的身份挺身而出！',
    cardTemplate: 'japanese',
    effects: [],
    likes: 2987,
    folderId: 'default',
    createdAt: '2024-01-18T13:50:00Z'
  },
  {
    id: 'template-8',
    name: '魔法少女·星',
    alias: '李小星',
    catchphrase: '代表月亮消灭你！',
    appearance: {
      avatar: '✨',
      costume: 'magic',
      colorScheme: 'pink-white',
      accessories: ['wand', 'necklace', 'cape'],
      bodyType: 'slim',
      hairStyle: 'ponytail',
      eyeStyle: 'normal',
      portrait: createDefaultPortraitConfig()
    },
    powers: [
      { id: 'magic', name: '魔法能量', icon: '💫', description: '使用星光魔法', level: 85 },
      { id: 'transformation', name: '变身', icon: '🌟', description: '变身成魔法少女', level: 90 },
      { id: 'healing', name: '治愈魔法', icon: '💚', description: '治愈伤口', level: 75 },
      { id: 'starlight', name: '星光之力', icon: '⭐', description: '召唤星辰之力', level: 80 }
    ],
    stats: {
      strength: 50,
      speed: 70,
      intelligence: 80,
      durability: 60,
      combat: 75,
      charisma: 95
    },
    weakness: '黑魔法',
    backstory: '李小星本是一个普通的中学女生，在一个流星雨之夜，她获得了来自星星的魔法力量。她可以变身成魔法少女·星，用星光魔法对抗邪恶的黑暗势力。虽然她还在学习如何使用这份力量，但她的勇气和善良是她最强大的武器！',
    cardTemplate: 'pop-art',
    effects: [],
    likes: 5234,
    folderId: 'default',
    createdAt: '2024-01-20T15:30:00Z'
  }
];

export const hotHeroes = heroTemplates
  .map((hero, index) => ({
    ...hero,
    rank: index + 1,
    id: `hot-${hero.id}`
  }))
  .sort((a, b) => b.likes - a.likes)
  .map((hero, index) => ({ ...hero, rank: index + 1 }));
