<script setup lang="ts">
import { computed } from 'vue';
import { Zap, Plus, Minus, Info } from 'lucide-vue-next';
import type { Hero, Power } from '../../types';
import { useHeroStore } from '../../stores/hero';
import { useUiStore } from '../../stores/ui';

const props = defineProps<{
  hero: Hero;
}>();

const heroStore = useHeroStore();
const uiStore = useUiStore();

const availablePowers = computed(() => heroStore.powers);

const statLabels = [
  { key: 'strength', label: '力量', icon: '💪', color: '#e53935' },
  { key: 'speed', label: '速度', icon: '⚡', color: '#fdd835' },
  { key: 'intelligence', label: '智力', icon: '🧠', color: '#1565c0' },
  { key: 'durability', label: '耐力', icon: '🛡️', color: '#2e7d32' },
  { key: 'combat', label: '战斗', icon: '⚔️', color: '#7b1fa2' },
  { key: 'charisma', label: '魅力', icon: '⭐', color: '#f57c00' }
];

function updateStat(key: keyof typeof props.hero.stats, delta: number) {
  const current = props.hero.stats[key];
  const newValue = Math.max(10, Math.min(100, current + delta));
  heroStore.updateCurrentHero({
    stats: {
      ...props.hero.stats,
      [key]: newValue
    }
  });
}

function togglePower(power: Power) {
  const current = props.hero.powers;
  const hasPower = current.some(p => p.id === power.id);
  
  if (hasPower) {
    heroStore.updateCurrentHero({
      powers: current.filter(p => p.id !== power.id)
    });
  } else {
    if (current.length < 4) {
      heroStore.updateCurrentHero({
        powers: [...current, { ...power, level: 70 + Math.floor(Math.random() * 30) }]
      });
    } else {
      uiStore.showWarning('最多只能选择4个超能力');
    }
  }
}

function updatePowerLevel(powerId: string, level: number) {
  heroStore.updateCurrentHero({
    powers: props.hero.powers.map(p => 
      p.id === powerId ? { ...p, level } : p
    )
  });
}

const totalStats = computed(() => {
  const s = props.hero.stats;
  return s.strength + s.speed + s.intelligence + s.durability + s.combat + s.charisma;
});
</script>

<template>
  <div class="power-editor">
    <div class="section-title">
      <Zap :size="20" />
      <span>能力配置</span>
    </div>
    
    <div class="editor-content">
      <div class="stats-section">
        <div class="stats-header">
          <h4>能力值分配</h4>
          <span class="total-points">总计: {{ totalStats }}/600</span>
        </div>
        
        <div class="stats-grid">
          <div v-for="stat in statLabels" :key="stat.key" class="stat-row">
            <div class="stat-info">
              <span class="stat-icon">{{ stat.icon }}</span>
              <span class="stat-name">{{ stat.label }}</span>
            </div>
            <div class="stat-control">
              <button class="stat-btn minus" @click="updateStat(stat.key as any, -5)">
                <Minus :size="14" />
              </button>
              <div class="stat-bar-container">
                <div 
                  class="stat-bar" 
                  :style="{ 
                    width: hero.stats[stat.key as keyof typeof hero.stats] + '%',
                    background: stat.color
                  }"
                />
                <span class="stat-value">{{ hero.stats[stat.key as keyof typeof hero.stats] }}</span>
              </div>
              <button class="stat-btn plus" @click="updateStat(stat.key as any, 5)">
                <Plus :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="powers-section">
        <div class="stats-header">
          <h4>超能力选择 ({{ hero.powers.length }}/4)</h4>
        </div>
        
        <div class="selected-powers">
          <div
            v-for="power in hero.powers"
            :key="power.id"
            class="selected-power"
          >
            <span class="power-icon">{{ power.icon }}</span>
            <div class="power-info">
              <span class="power-name">{{ power.name }}</span>
              <div class="power-level-container">
                <input
                  type="range"
                  min="1"
                  max="100"
                  :value="power.level"
                  @input="updatePowerLevel(power.id, Number(($event.target as HTMLInputElement).value))"
                  class="power-slider"
                />
                <span class="power-level">{{ power.level }}%</span>
              </div>
            </div>
            <button class="remove-power" @click="togglePower(power)">×</button>
          </div>
          <div v-if="hero.powers.length === 0" class="empty-powers">
            <Info :size="20" />
            <span>请从下方选择超能力</span>
          </div>
        </div>
        
        <div class="available-powers">
          <button
            v-for="power in availablePowers"
            :key="power.id"
            class="power-option"
            :class="{ active: hero.powers.some(p => p.id === power.id), disabled: !hero.powers.some(p => p.id === power.id) && hero.powers.length >= 4 }"
            :disabled="!hero.powers.some(p => p.id === power.id) && hero.powers.length >= 4"
            @click="togglePower(power)"
          >
            <span class="power-icon">{{ power.icon }}</span>
            <span class="power-name">{{ power.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.power-editor {
  background: #fafafa;
  border: 4px solid #212121;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 4px 4px 0 #212121;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Bangers', cursive;
  font-size: 24px;
  color: #e53935;
  text-shadow: 2px 2px 0 #212121;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.editor-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stats-header h4 {
  font-family: 'Bangers', cursive;
  font-size: 18px;
  color: #212121;
  margin: 0;
  letter-spacing: 1px;
}

.total-points {
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
  font-weight: 700;
  color: #1565c0;
  background: #e3f2fd;
  padding: 4px 12px;
  border-radius: 12px;
  border: 2px solid #1565c0;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 18px;
}

.stat-name {
  font-family: 'Roboto Slab', serif;
  font-size: 13px;
  font-weight: 700;
  color: #424242;
}

.stat-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s;
  box-shadow: 2px 2px 0 #212121;
}

.stat-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.stat-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 1px 1px 0 #212121;
}

.stat-btn.minus {
  background: #ffebee;
  border-color: #c62828;
}

.stat-btn.plus {
  background: #e8f5e9;
  border-color: #2e7d32;
}

.stat-bar-container {
  flex: 1;
  height: 24px;
  background: #e0e0e0;
  border: 2px solid #212121;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.stat-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.stat-value {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Bangers', cursive;
  font-size: 14px;
  color: #fafafa;
  text-shadow: 1px 1px 0 #212121;
}

.selected-powers {
  margin-bottom: 16px;
}

.selected-power {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff3e0;
  border: 3px solid #f57c00;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 3px 3px 0 #212121;
}

.power-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.power-info {
  flex: 1;
  min-width: 0;
}

.power-name {
  font-family: 'Roboto Slab', serif;
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  display: block;
  margin-bottom: 4px;
}

.power-level-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.power-slider {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #e0e0e0;
  border-radius: 4px;
  outline: none;
}

.power-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #f57c00;
  border: 3px solid #212121;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 2px 2px 0 #212121;
}

.power-level {
  font-family: 'Bangers', cursive;
  font-size: 14px;
  color: #f57c00;
  min-width: 40px;
  text-align: right;
}

.remove-power {
  width: 32px;
  height: 32px;
  background: #c62828;
  border: 3px solid #212121;
  border-radius: 50%;
  color: #fafafa;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 0 #212121;
  flex-shrink: 0;
  transition: all 0.1s;
}

.remove-power:hover {
  transform: scale(1.1);
}

.empty-powers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  background: #f5f5f5;
  border: 3px dashed #bdbdbd;
  border-radius: 8px;
  color: #757575;
  font-family: 'Comic Neue', cursive;
  font-size: 14px;
}

.available-powers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
}

.power-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fafafa;
  border: 3px solid #212121;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #212121;
}

.power-option:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #212121;
}

.power-option.active {
  background: #4caf50;
  border-color: #2e7d32;
  color: #fafafa;
}

.power-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.power-option .power-icon {
  font-size: 20px;
}

.power-option .power-name {
  font-family: 'Roboto Slab', serif;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .editor-content {
    grid-template-columns: 1fr;
  }
  
  .available-powers {
    grid-template-columns: 1fr;
  }
}
</style>
