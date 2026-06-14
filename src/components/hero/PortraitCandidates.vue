<script setup lang="ts">
import CharacterPortrait from './CharacterPortrait.vue';
import type { PortraitConfig } from '../../types';

const props = withDefaults(defineProps<{
  candidates: PortraitConfig[];
  selectedIndex: number;
  size?: 'sm' | 'md';
}>(), {
  size: 'md'
});

const emit = defineEmits<{
  (e: 'select', index: number): void;
  (e: 'reshuffle'): void;
}>();

const portraitSize = props.size === 'sm' ? 'small' : 'medium';
</script>

<template>
  <div class="portrait-candidates">
    <div class="candidates-grid">
      <div
        v-for="(candidate, index) in candidates"
        :key="index"
        class="candidate-card"
        :class="{ selected: index === selectedIndex }"
        @click="emit('select', index)"
      >
        <CharacterPortrait
          :config="candidate"
          :size="portraitSize"
          :show-background="true"
        />
      </div>
    </div>
    <button class="reshuffle-btn" @click="emit('reshuffle')">
      🎲 再随机生成一批
    </button>
  </div>
</template>

<style scoped>
.portrait-candidates {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.candidate-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 4px;
  border: 3px solid transparent;
  box-shadow: none;
}

.candidate-card:hover {
  transform: translateY(-4px);
}

.candidate-card.selected {
  border: 4px solid #FF6B35;
  box-shadow: 0 0 0 2px #FF6B35, 6px 6px 0 #212121;
  background: rgba(255, 107, 53, 0.1);
}

.reshuffle-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, #FF6B35, #E64A19);
  border: 3px solid #212121;
  border-radius: 8px;
  color: #fafafa;
  font-family: 'Bangers', cursive;
  font-size: 16px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 4px 4px 0 #212121;
}

.reshuffle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0 #212121;
}

.reshuffle-btn:active {
  transform: translateY(1px);
  box-shadow: 2px 2px 0 #212121;
}

@media (max-width: 480px) {
  .candidates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
