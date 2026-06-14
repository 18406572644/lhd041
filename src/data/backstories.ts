export const storyTemplates = [
  {
    id: 'tragedy-hero',
    template: `{name}，原名{alias}，曾是一位平凡的{occupation}。在那个命运的夜晚，{tragedy}彻底改变了一切。{name}在{event}中获得了{power}的能力。从那天起，{name}发誓要用这份力量{goal}，永远不再让悲剧重演。尽管{weakness}始终是{name}最大的弱点，但{catchphrase}！`
  },
  {
    id: 'scientific-accident',
    template: `著名科学家{alias}在一次{experiment}实验中遭遇了意外。{radiation}穿透了{name}的身体，赋予了{name}超乎想象的{power}能力。{name}决定用这份能力{goal}，成为了城市的守护者。每当危险降临，{name}总会喊出：{catchphrase}！但{name}也深知，{weakness}可能会让{name}失去一切。`
  },
  {
    id: 'alien-origin',
    template: `来自{planet}星球的{name}，在{reason}后来到了地球。{name}以{alias}的身份隐藏在人类之中，默默地守护着这个星球。拥有{power}能力的{name}，发誓要{goal}。{name}的弱点是{weakness}，但这不会阻止{name}。{catchphrase}！`
  },
  {
    id: 'chosen-one',
    template: `{name}，也就是{alias}，从小就做着奇怪的梦。直到{day}，{mysticalFigure}出现在{name}面前，告诉{name}是被选中的人，{prophecy}。从那天起，{name}觉醒了{power}的能力，踏上了{goal}的道路。{weakness}是{name}的致命弱点，但{name}无所畏惧：{catchphrase}！`
  },
  {
    id: 'vigilante',
    template: `在{crime}发生后，{alias}决定不再袖手旁观。{name}开始了{training}，磨练自己的{power}能力。{name}戴上了面具，以{name}的身份在夜间巡逻，{goal}。警方不认可{name}的方式，犯罪组织更是悬赏追杀{name}。而{weakness}更是让{name}时刻处于危险之中。但{name}只会说：{catchphrase}！`
  },
  {
    id: 'mutant-hero',
    template: `{alias}在{age}岁时发现自己与众不同。{mutation}让{name}拥有了{power}的能力。在经历了{discrimination}后，{name}决定站出来，{goal}。{name}以{name}为名，成为了变种人的希望。尽管{weakness}时刻困扰着{name}，但{name}相信：{catchphrase}！`
  },
  {
    id: 'ancient-warrior',
    template: `{name}诞生于{era}，是{ancientOrder}最后的传人。{name}在{ancientTraining}中获得了{power}的力量。经过{sleep}年的沉睡，{name}在现代苏醒，发现世界已经天翻地覆。{name}以{alias}的身份适应这个时代，继续{goal}的使命。{weakness}是{name}时代的印记，但{name}的信念从未改变：{catchphrase}！`
  },
  {
    id: 'tech-genius',
    template: `亿万富翁{alias}在{incident}中失去了一切。凭借着{intelligence}的智慧和{resource}的资源，{name}创造了{technology}，获得了{power}的能力。{name}建造了{base}，以{name}的身份{goal}。{name}的弱点是{weakness}，但{name}的智慧总能找到解决方案。{catchphrase}！`
  }
];

export const storyFillers = {
  occupations: ['医生', '记者', '警察', '科学家', '教师', '工程师', '律师', '消防员', '运动员', '艺术家'],
  tragedies: ['家人被罪犯杀害', '一场可怕的车祸', '实验室爆炸', '被神秘组织绑架', '目睹了一场谋杀', '失去了最爱的人'],
  events: ['一场化学爆炸', '被闪电击中', '被神秘生物咬伤', '发现了远古神器', '被选为实验对象', '获得了外星科技'],
  goals: ['保护这座城市', '寻找真相', '为家人复仇', '保护无辜的人', '打击犯罪组织', '维护世界和平', '拯救所有变种人'],
  experiments: ['量子物理', '基因工程', '核能研究', '太空探索', '化学武器', '人工智能'],
  radiation: ['伽马射线', '宇宙辐射', '化学物质', '未知能量', '量子波动', '纳米机器人'],
  planets: ['氪星', '火星', '仙女座', '遥远的未来', '平行宇宙', '神秘维度'],
  reasons: ['逃避战争', '寻找新家', '执行任务', '被流放', '飞船坠毁', '探索宇宙'],
  day: '18岁生日那天',
  mysticalFigure: ['古老的巫师', '来自未来的自己', '外星先知', '守护神', '神秘的隐士', '前世的自己'],
  prophecy: ['将在末日到来时拯救世界', '是千年一遇的天选之人', '将战胜黑暗之王', '将统一两个世界'],
  crime: ['最好的朋友被杀害', '家园被犯罪组织摧毁', '妹妹被绑架', '父亲被腐败官员陷害'],
  training: ['地狱式的格斗训练', '周游世界学习各种武术', '在雪山之巅苦修', '接受前特工的秘密训练'],
  age: [12, 15, 18, 21, 25],
  mutation: ['青春期的觉醒', '基因的自然进化', '父母的遗传', '一次高烧后的觉醒'],
  discrimination: ['被家人抛弃', '被社会排斥', '被科研机构追捕', '被当成怪物'],
  era: ['春秋战国', '中世纪', '古埃及', '恐龙时代', '两千年后', '平行宇宙的二战时期'],
  ancientOrder: ['暗影刺客联盟', '圣殿骑士团', '昆仑修仙者', '亚特兰蒂斯卫士', '星际守望者'],
  ancientTraining: ['与龙搏斗的试炼', '穿越时空的修行', '封印远古恶魔的仪式', '融合神兽血脉'],
  sleep: [100, 500, 1000, 5000, 10000],
  incident: ['公司被恶意收购，家人被谋杀', '被商业对手绑架折磨', '战争中失去了双腿', '恐怖袭击中失去了一切'],
  intelligence: '超越爱因斯坦的超级',
  resource: '富可敌国的',
  technology: ['钢铁战甲', '人工智能辅助系统', '超级血清', '量子隐身装置'],
  base: ['海底秘密基地', '高空浮空母舰', '地下堡垒', '月球指挥中心']
};
