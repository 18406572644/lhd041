import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const isMobileMenuOpen = ref(false);
  const activeTab = ref('appearance');
  const isGeneratingAnimation = ref(false);
  const showHeroModal = ref(false);
  const selectedHeroForModal = ref<string | null>(null);
  const notification = ref<{
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({
    show: false,
    type: 'info',
    message: ''
  });

  const isNotificationVisible = computed(() => notification.value.show);

  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  }

  function closeMobileMenu() {
    isMobileMenuOpen.value = false;
  }

  function setActiveTab(tab: string) {
    activeTab.value = tab;
  }

  function startGeneratingAnimation() {
    isGeneratingAnimation.value = true;
  }

  function stopGeneratingAnimation() {
    isGeneratingAnimation.value = false;
  }

  function openHeroModal(heroId: string) {
    selectedHeroForModal.value = heroId;
    showHeroModal.value = true;
  }

  function closeHeroModal() {
    showHeroModal.value = false;
    selectedHeroForModal.value = null;
  }

  function showNotification(type: 'success' | 'error' | 'info' | 'warning', message: string, duration = 3000) {
    notification.value = {
      show: true,
      type,
      message
    };
    
    if (duration > 0) {
      setTimeout(() => {
        hideNotification();
      }, duration);
    }
  }

  function hideNotification() {
    notification.value.show = false;
  }

  function showSuccess(message: string) {
    showNotification('success', message);
  }

  function showError(message: string) {
    showNotification('error', message);
  }

  function showInfo(message: string) {
    showNotification('info', message);
  }

  function showWarning(message: string) {
    showNotification('warning', message);
  }

  return {
    isMobileMenuOpen,
    activeTab,
    isGeneratingAnimation,
    showHeroModal,
    selectedHeroForModal,
    notification,
    isNotificationVisible,
    toggleMobileMenu,
    closeMobileMenu,
    setActiveTab,
    startGeneratingAnimation,
    stopGeneratingAnimation,
    openHeroModal,
    closeHeroModal,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
});
