<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Sparkles, Zap, Palette, Image, Heart, TrendingUp, ArrowRight } from 'lucide-vue-next';
import { useHeroStore } from '../stores/hero';
import HeroPreview from '../components/hero/HeroPreview.vue';

const router = useRouter();
const heroStore = useHeroStore();

const featuredTemplates = computed(() => heroStore.templates.slice(0, 4));
const hotHeroes = computed(() => heroStore.hotHeroes.slice(0, 6));

const features = [
  { icon: Sparkles, title: '随机生成', desc: '一键生成独特的超级英雄', color: '#e53935' },
  { icon: Palette, title: '自定义外观', desc: '自由搭配服装、配色和配饰', color: '#fdd835' },
  { icon: Zap, title: '能力配置', desc: '选择超能力并调整能力值', color: '#1565c0' },
  { icon: Image, title: '漫画卡片', desc: '制作专属的复古漫画风格卡片', color: '#7b1fa2' },
  { icon: Heart, title: '收藏保存', desc: '保存你的英雄收藏', color: '#c62828' },
  { icon: TrendingUp, title: '热门排行', desc: '看看最受欢迎的超级英雄', color: '#2e7d32' }
];

function navigateTo(route: string) {
  router.push(route);
}
</script>

<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <div class="comic-burst">
          <div class="burst-text">
            <span class="burst-label">新</span>
          </div>
        </div>
        <h1 class="main-title">
          <span class="title-line">超级英雄</span>
          <span class="title-line accent">角色生成器</span>
        </h1>
        <p class="subtitle">打造属于你的复古美式漫画风格超级英雄！</p>
        <div class="cta-buttons">
          <button class="cta-btn primary" @click="navigateTo('/generator')">
            <Sparkles :size="20" />
            <span>立即生成</span>
            <ArrowRight :size="20" />
          </button>
          <button class="cta-btn secondary" @click="navigateTo('/hot')">
            <TrendingUp :size="20" />
            <span>热门英雄</span>
          </button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="preview-stack">
          <div 
            v-for="(template, index) in featuredTemplates" 
            :key="template.id"
            class="stacked-preview"
            :style="{
              '--delay': `${index * 0.5}s`,
              '--rotate': `${(index - 1.5) * 8}deg`,
              '--offset': `${(index - 1.5) * 30}px`
            }"
          >
            <HeroPreview :hero="template" size="small" />
          </div>
        </div>
      </div>
    </section>
    
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">
          <Sparkles :size="28" />
          <span>核心功能</span>
        </h2>
      </div>
      <div class="features-grid">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="feature-card"
          :style="{ '--feature-color': feature.color }"
        >
          <div class="feature-icon">
            <component :is="feature.icon" :size="32" />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
        </div>
      </div>
    </section>
    
    <section class="templates-section">
      <div class="section-header">
        <h2 class="section-title">
          <Image :size="28" />
          <span>角色模板</span>
        </h2>
        <button class="view-all-btn" @click="navigateTo('/hot')">
          查看全部
          <ArrowRight :size="16" />
        </button>
      </div>
      <div class="templates-grid">
        <div
          v-for="template in featuredTemplates"
          :key="template.id"
          class="template-card"
          @click="navigateTo(`/generator?template=${template.id}`)"
        >
          <HeroPreview :hero="template" size="medium" />
          <div class="template-info">
            <h4 class="template-name">{{ template.name }}</h4>
            <p class="template-desc">{{ template.alias }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="hot-section">
      <div class="section-header">
        <h2 class="section-title">
          <TrendingUp :size="28" />
          <span>热门英雄</span>
        </h2>
        <button class="view-all-btn" @click="navigateTo('/hot')">
          查看排行榜
          <ArrowRight :size="16" />
        </button>
      </div>
      <div class="hot-grid">
        <div
          v-for="(hero, index) in hotHeroes"
          :key="hero.id"
          class="hot-card"
        >
          <div class="hot-rank" :class="{ top3: index < 3 }">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <HeroPreview :hero="hero" size="small" />
          <div class="hot-info">
            <h4 class="hot-name">{{ hero.name }}</h4>
            <div class="hot-likes">
              <Heart :size="14" fill="#e53935" />
              <span>{{ hero.likes }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">准备好创建你的英雄了吗？</h2>
        <p class="cta-subtitle">点击下方按钮，开始你的超级英雄之旅！</p>
        <button class="cta-btn large primary" @click="navigateTo('/generator')">
          <Sparkles :size="24" />
          <span>开始创建</span>
          <ArrowRight :size="24" />
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding: 60px 40px;
  background: linear-gradient(135deg, #e53935 0%, #1565c0 100%);
  border: 5px solid #212121;
  border-radius: 16px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 8px 8px 0 #212121;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px),
    radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 20px 20px, 30px 30px;
  background-position: 0 0, 10px 10px;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.comic-burst {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: #fdd835;
  border: 4px solid #212121;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(15deg);
  box-shadow: 4px 4px 0 #212121;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: rotate(15deg) scale(1); }
  50% { transform: rotate(15deg) scale(1.1); }
}

.burst-text {
  font-family: 'Bangers', cursive;
  font-size: 24px;
  color: #e53935;
  text-shadow: 2px 2px 0 #212121;
}

.main-title {
  font-family: 'Bangers', cursive;
  font-size: 64px;
  line-height: 1.1;
  margin: 0 0 16px 0;
  letter-spacing: 3px;
}

.title-line {
  display: block;
  color: #fafafa;
  text-shadow: 4px 4px 0 #212121;
}

.title-line.accent {
  color: #fdd835;
}

.subtitle {
  font-family: 'Comic Neue', cursive;
  font-size: 20px;
  color: #fafafa;
  margin: 0 0 32px 0;
  font-weight: 700;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.cta-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  font-family: 'Bangers', cursive;
  font-size: 20px;
  letter-spacing: 2px;
  border: 4px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 4px 4px 0 #212121;
}

.cta-btn:hover {
  transform: translateY(-4px);
  box-shadow: 8px 8px 0 #212121;
}

.cta-btn.primary {
  background: #fdd835;
  color: #212121;
}

.cta-btn.secondary {
  background: #fafafa;
  color: #212121;
}

.cta-btn.large {
  padding: 18px 40px;
  font-size: 24px;
}

.hero-visual {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-stack {
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stacked-preview {
  position: absolute;
  animation: float 3s ease-in-out infinite;
  animation-delay: var(--delay);
  transform: rotate(var(--rotate)) translateX(var(--offset));
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(var(--rotate)) translateX(var(--offset)); }
  50% { transform: translateY(-15px) rotate(var(--rotate)) translateX(var(--offset)); }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Bangers', cursive;
  font-size: 36px;
  color: #212121;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 2px 2px 0 #fdd835;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 4px;
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #212121;
}

.view-all-btn:hover {
  background: #fdd835;
  transform: translateY(-2px);
  box-shadow: 5px 5px 0 #212121;
}

.features-section {
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  padding: 28px 24px;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 4px 4px 0 #212121;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s;
}

.feature-card:hover {
  transform: translateY(-8px) rotate(-1deg);
  box-shadow: 8px 12px 0 #212121;
}

.feature-card:hover::before {
  left: 100%;
}

.feature-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: var(--feature-color);
  border: 4px solid #212121;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fafafa;
  box-shadow: 3px 3px 0 #212121;
}

.feature-title {
  font-family: 'Bangers', cursive;
  font-size: 22px;
  color: var(--feature-color);
  margin: 0 0 8px 0;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0 #212121;
}

.feature-desc {
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  color: #616161;
  margin: 0;
  font-weight: 700;
}

.templates-section, .hot-section {
  margin-bottom: 60px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.template-card {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 4px 4px 0 #212121;
}

.template-card:hover {
  transform: translateY(-6px) rotate(1deg);
  box-shadow: 8px 10px 0 #212121;
}

.template-info {
  padding: 12px 16px;
  background: #212121;
  text-align: center;
}

.template-name {
  font-family: 'Bangers', cursive;
  font-size: 18px;
  color: #fdd835;
  margin: 0 0 4px 0;
  letter-spacing: 1px;
}

.template-desc {
  font-family: 'Comic Neue', cursive;
  font-size: 12px;
  color: #bdbdbd;
  margin: 0;
  font-weight: 700;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.hot-card {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
  box-shadow: 4px 4px 0 #212121;
  position: relative;
}

.hot-card:hover {
  transform: translateX(8px);
  box-shadow: 8px 8px 0 #212121;
}

.hot-rank {
  width: 48px;
  height: 48px;
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bangers', cursive;
  font-size: 20px;
  color: #212121;
  box-shadow: 3px 3px 0 #212121;
  flex-shrink: 0;
}

.hot-rank.top3 {
  background: #fdd835;
  font-size: 24px;
}

.hot-info {
  flex: 1;
}

.hot-name {
  font-family: 'Bangers', cursive;
  font-size: 18px;
  color: #212121;
  margin: 0 0 6px 0;
  letter-spacing: 1px;
}

.hot-likes {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  color: #e53935;
  font-weight: 700;
}

.cta-section {
  background: linear-gradient(135deg, #fdd835 0%, #f57c00 100%);
  border: 5px solid #212121;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 8px 8px 0 #212121;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 15px 15px;
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-family: 'Bangers', cursive;
  font-size: 42px;
  color: #212121;
  margin: 0 0 12px 0;
  letter-spacing: 2px;
  text-shadow: 3px 3px 0 #fafafa;
}

.cta-subtitle {
  font-family: 'Comic Neue', cursive;
  font-size: 18px;
  color: #424242;
  margin: 0 0 32px 0;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    padding: 40px 24px;
  }
  
  .main-title {
    font-size: 48px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .templates-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hot-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .home-page {
    padding: 12px;
  }
  
  .main-title {
    font-size: 36px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .hot-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 28px;
  }
}
</style>
