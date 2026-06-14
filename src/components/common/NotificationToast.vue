<script setup lang="ts">
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next';
import { useUiStore } from '../../stores/ui';

const uiStore = useUiStore();

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle
};

const colorMap = {
  success: { bg: 'bg-green-500', border: 'border-green-700' },
  error: { bg: 'bg-red-500', border: 'border-red-700' },
  info: { bg: 'bg-blue-500', border: 'border-blue-700' },
  warning: { bg: 'bg-yellow-500', border: 'border-yellow-700' }
};
</script>

<template>
  <Transition name="notification">
    <div
      v-if="uiStore.isNotificationVisible"
      class="notification-toast"
      :class="[colorMap[uiStore.notification.type].bg, colorMap[uiStore.notification.type].border]"
    >
      <div class="notification-content">
        <component
          :is="iconMap[uiStore.notification.type]"
          class="notification-icon"
          :size="24"
        />
        <span class="notification-text">{{ uiStore.notification.message }}</span>
      </div>
      <button
        class="close-btn"
        @click="uiStore.hideNotification"
      >
        <X :size="18" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.notification-toast {
  position: fixed;
  top: 90px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 4px;
  border: 4px solid;
  color: white;
  font-family: 'Roboto Slab', serif;
  font-weight: 600;
  box-shadow: 4px 4px 0 #212121, 0 8px 20px rgba(0,0,0,0.3);
  min-width: 300px;
  max-width: 450px;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.notification-icon {
  flex-shrink: 0;
}

.notification-text {
  font-size: 14px;
  line-height: 1.4;
}

.close-btn {
  background: rgba(0,0,0,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 50%;
  padding: 4px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(0,0,0,0.4);
  transform: scale(1.1);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@media (max-width: 768px) {
  .notification-toast {
    top: 80px;
    left: 10px;
    right: 10px;
    min-width: auto;
  }
}
</style>
