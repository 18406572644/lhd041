import { ref } from 'vue';
import html2canvas from 'html2canvas';
import type { Hero } from '../types';

export function useCardExport() {
  const isExporting = ref(false);
  const exportProgress = ref(0);

  async function exportAsImage(element: HTMLElement, scale = 2): Promise<string | null> {
    if (!element) return null;
    
    isExporting.value = true;
    exportProgress.value = 0;
    
    try {
      exportProgress.value = 20;
      
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          exportProgress.value = 50;
          const clonedElement = clonedDoc.querySelector('#comic-card') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.animation = 'none';
          }
        }
      });
      
      exportProgress.value = 80;
      
      const dataUrl = canvas.toDataURL('image/png');
      
      exportProgress.value = 100;
      
      return dataUrl;
    } catch (error) {
      console.error('导出失败:', error);
      return null;
    } finally {
      isExporting.value = false;
    }
  }

  function downloadImage(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  async function exportAndDownload(element: HTMLElement, filename: string) {
    const dataUrl = await exportAsImage(element);
    if (dataUrl) {
      const safeName = filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, '_');
      downloadImage(dataUrl, `${safeName}.png`);
    }
    return dataUrl;
  }

  async function copyToClipboard(element: HTMLElement): Promise<boolean> {
    const dataUrl = await exportAsImage(element);
    if (!dataUrl) return false;
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      return false;
    }
  }

  return {
    isExporting,
    exportProgress,
    exportAsImage,
    downloadImage,
    exportAndDownload,
    copyToClipboard
  };
}
