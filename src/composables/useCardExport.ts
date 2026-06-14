import { ref, computed } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Hero } from '../types';

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'pdf';
export type PdfPageSize = 'a4' | 'business-card';
export type Resolution = 1 | 2 | 3 | 4;

export interface ImageExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality: number;
  scale: Resolution;
}

export interface PdfExportOptions {
  pageSize: PdfPageSize;
  scale: Resolution;
  showBleed: boolean;
}

export interface ExportProgress {
  current: number;
  total: number;
  currentName: string;
  estimatedRemaining: number;
}

export interface ExportResult {
  success: boolean;
  heroId?: string;
  heroName?: string;
  fileName?: string;
  blob?: Blob;
  dataUrl?: string;
  error?: string;
}

export function useCardExport() {
  const isExporting = ref(false);
  const exportProgress = ref(0);

  const PDF_SIZES: Record<PdfPageSize, { width: number; height: number; unit: 'mm' | 'px' }> = {
    a4: { width: 210, height: 297, unit: 'mm' },
    'business-card': { width: 85.6, height: 53.98, unit: 'mm' }
  };

  const BLEED_SIZE_MM = 3;

  async function elementToCanvas(
    element: HTMLElement,
    scale: Resolution = 2,
    onProgress?: (percent: number) => void
  ): Promise<HTMLCanvasElement | null> {
    if (!element) return null;

    try {
      onProgress?.(20);

      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          onProgress?.(50);
          const clonedElement = clonedDoc.querySelector('#comic-card') || clonedDoc.querySelector('.comic-card') as HTMLElement;
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'none';
            (clonedElement as HTMLElement).style.animation = 'none';
          }
        }
      });

      onProgress?.(80);
      return canvas;
    } catch (error) {
      console.error('Canvas conversion failed:', error);
      return null;
    }
  }

  function canvasToImageDataUrl(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpg' | 'webp' = 'png',
    quality: number = 0.92
  ): string {
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      webp: 'image/webp'
    };
    return canvas.toDataURL(mimeMap[format], quality);
  }

  function canvasToBlob(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpg' | 'webp' = 'png',
    quality: number = 0.92
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      const mimeMap: Record<string, string> = {
        png: 'image/png',
        jpg: 'image/jpeg',
        webp: 'image/webp'
      };
      canvas.toBlob((blob) => resolve(blob), mimeMap[format], quality);
    });
  }

  function estimateFileSize(
    width: number,
    height: number,
    format: 'png' | 'jpg' | 'webp',
    quality: number = 0.92
  ): string {
    const pixelCount = width * height;
    let bytesPerPixel = 4;
    let compressionFactor = 1;

    switch (format) {
      case 'png':
        compressionFactor = 0.4;
        bytesPerPixel = 4;
        break;
      case 'jpg':
        compressionFactor = 0.1 + (quality * 0.2);
        bytesPerPixel = 3;
        break;
      case 'webp':
        compressionFactor = 0.05 + (quality * 0.15);
        bytesPerPixel = 3;
        break;
    }

    const bytes = pixelCount * bytesPerPixel * compressionFactor;
    return formatFileSize(bytes);
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  function sanitizeFilename(name: string): string {
    return name.replace(/[\\/:*?"<>|\s]/g, '_').replace(/_{2,}/g, '_');
  }

  async function exportAsImage(
    element: HTMLElement,
    options: Partial<ImageExportOptions> = {}
  ): Promise<{ dataUrl: string; blob: Blob | null } | null> {
    const { format = 'png', quality = 0.92, scale = 2 } = options;

    isExporting.value = true;
    exportProgress.value = 0;

    try {
      const canvas = await elementToCanvas(element, scale, (p) => {
        exportProgress.value = p;
      });

      if (!canvas) {
        return null;
      }

      const dataUrl = canvasToImageDataUrl(canvas, format, quality);
      const blob = await canvasToBlob(canvas, format, quality);

      exportProgress.value = 100;
      return { dataUrl, blob };
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    } finally {
      isExporting.value = false;
    }
  }

  async function exportAsPdf(
    element: HTMLElement,
    options: Partial<PdfExportOptions> = {}
  ): Promise<Blob | null> {
    const { pageSize = 'a4', scale = 2, showBleed = true } = options;
    const size = PDF_SIZES[pageSize];

    isExporting.value = true;
    exportProgress.value = 0;

    try {
      const canvas = await elementToCanvas(element, scale, (p) => {
        exportProgress.value = Math.floor(p * 0.7);
      });

      if (!canvas) return null;

      exportProgress.value = 75;

      const bleed = showBleed ? BLEED_SIZE_MM : 0;
      const pdfWidth = size.width + bleed * 2;
      const pdfHeight = size.height + bleed * 2;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: size.unit,
        format: [pdfWidth, pdfHeight]
      });

      const imgData = canvas.toDataURL('image/png');

      const imgWidthMm = size.width;
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

      let x = bleed;
      let y = bleed;

      if (imgHeightMm > size.height) {
        const scaledHeight = size.height;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        x = (pdfWidth - scaledWidth) / 2;
        y = bleed;
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      } else {
        y = (pdfHeight - imgHeightMm) / 2;
        pdf.addImage(imgData, 'PNG', x, y, imgWidthMm, imgHeightMm);
      }

      if (showBleed) {
        pdf.setDrawColor(255, 0, 0);
        pdf.setLineWidth(0.1);
        pdf.setLineDashPattern([1, 1], 0);
        pdf.rect(bleed, bleed, size.width, size.height, 'S');
        pdf.setLineDashPattern([], 0);

        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.05);
        const tickLength = 5;
        const positions = [0, pdfWidth / 2, pdfWidth];
        positions.forEach((px) => {
          pdf.line(px, 0, px, tickLength);
          pdf.line(px, pdfHeight - tickLength, px, pdfHeight);
        });
        const yPositions = [0, pdfHeight / 2, pdfHeight];
        yPositions.forEach((py) => {
          pdf.line(0, py, tickLength, py);
          pdf.line(pdfWidth - tickLength, py, pdfWidth, py);
        });
      }

      exportProgress.value = 100;
      return pdf.output('blob');
    } catch (error) {
      console.error('PDF export failed:', error);
      return null;
    } finally {
      isExporting.value = false;
    }
  }

  async function exportAndDownload(
    element: HTMLElement,
    filename: string,
    options: { format?: ExportFormat; quality?: number; scale?: Resolution; pdfPageSize?: PdfPageSize; showBleed?: boolean } = {}
  ) {
    const { format = 'png', quality = 0.92, scale = 2, pdfPageSize = 'a4', showBleed = true } = options;
    const safeName = sanitizeFilename(filename);

    if (format === 'pdf') {
      const blob = await exportAsPdf(element, { pageSize: pdfPageSize, scale, showBleed });
      if (blob) {
        downloadBlob(blob, `${safeName}.pdf`);
        return { blob };
      }
      return null;
    } else {
      const result = await exportAsImage(element, { format, quality, scale });
      if (result) {
        const ext = format;
        if (result.blob) {
          downloadBlob(result.blob, `${safeName}.${ext}`);
        } else {
          downloadDataUrl(result.dataUrl, `${safeName}.${ext}`);
        }
        return result;
      }
      return null;
    }
  }

  async function copyToClipboard(element: HTMLElement, scale: Resolution = 2): Promise<boolean> {
    const result = await exportAsImage(element, { format: 'png', scale });
    if (!result) return false;
    try {
      const blob = result.blob || dataUrlToBlob(result.dataUrl);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  }

  async function heroToCanvas(
    hero: Hero,
    scale: Resolution = 2
  ): Promise<HTMLCanvasElement | null> {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '-10000px';
    container.style.zIndex = '-1';
    container.style.opacity = '0';
    document.body.appendChild(container);

    const wrapper = document.createElement('div');
    wrapper.id = 'comic-card';
    wrapper.className = 'comic-card';
    wrapper.style.width = '320px';
    wrapper.innerHTML = renderHeroCardHtml(hero);
    container.appendChild(wrapper);

    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await elementToCanvas(wrapper, scale);

    document.body.removeChild(container);
    return canvas;
  }

  function renderHeroCardHtml(hero: Hero): string {
    const schemeId = hero.appearance.colorScheme || 'classic';
    const schemes: Record<string, { primary: string; secondary: string }> = {
      classic: { primary: '#e53935', secondary: '#1565c0' },
      cyber: { primary: '#00bcd4', secondary: '#7b1fa2' },
      vintage: { primary: '#795548', secondary: '#ffc107' },
      cosmic: { primary: '#3f51b5', secondary: '#e91e63' },
      nature: { primary: '#4caf50', secondary: '#8bc34a' }
    };
    const scheme = schemes[schemeId] || schemes.classic;

    const avatarEmojis: Record<string, string> = {
      hero: '🦸',
      robot: '🤖',
      alien: '👽',
      wizard: '🧙',
      warrior: '⚔️'
    };
    const emoji = avatarEmojis[hero.appearance.avatar] || '🦸';

    const stats = hero.stats;
    const powerChips = hero.powers.slice(0, 4).map(p => `
      <div class="power-chip" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:${scheme.primary};border:2px solid #212121;border-radius:12px;margin:3px;">
        <span class="chip-icon">${p.icon || '⚡'}</span>
        <span class="chip-name" style="font-family:serif;font-size:11px;font-weight:700;color:#fafafa;">${p.name}</span>
        <span class="chip-level" style="font-family:'Bangers',cursive;font-size:11px;color:#fdd835;text-shadow:1px 1px 0 #212121;">${p.level}%</span>
      </div>
    `).join('');

    const effects = hero.effects.slice(0, 3).map(e => {
      const colors: Record<string, string> = {
        boom: '#e53935',
        zap: '#fdd835',
        pow: '#7b1fa2',
        bam: '#f57c00',
        explosion: '#ff5722'
      };
      const bg = colors[e.type] || '#e53935';
      return `<span class="effect-tag" style="font-family:'Bangers',cursive;font-size:12px;padding:4px 10px;border:2px solid #212121;border-radius:4px;background:${bg};color:${e.type === 'zap' ? '#212121' : '#fafafa'};box-shadow:2px 2px 0 #212121;margin:3px;display:inline-block;">${e.text || e.type.toUpperCase() + '!'}</span>`;
    }).join('');

    const statBars = [
      { label: '💪', value: stats.strength, color: '#e53935' },
      { label: '⚡', value: stats.speed, color: '#fdd835' },
      { label: '🧠', value: stats.intelligence, color: '#1565c0' },
      { label: '🛡️', value: stats.durability, color: '#2e7d32' }
    ].map(s => `
      <div class="stat-item" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span class="stat-label" style="font-size:16px;width:24px;">${s.label}</span>
        <div class="stat-bar" style="flex:1;height:12px;background:#e0e0e0;border:2px solid #212121;border-radius:6px;overflow:hidden;">
          <div class="stat-fill" style="height:100%;width:${s.value}%;background:${s.color};"></div>
        </div>
        <span class="stat-num" style="font-family:'Bangers',cursive;font-size:14px;color:#212121;width:30px;text-align:right;">${s.value}</span>
      </div>
    `).join('');

    return `
      <div style="width:320px;background:linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%);border:5px solid #212121;border-radius:12px;overflow:hidden;box-shadow:8px 8px 0 #212121;position:relative;font-family:sans-serif;">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px);background-size:6px 6px;pointer-events:none;"></div>
        <div style="background:${scheme.primary};padding:16px;text-align:center;border-bottom:4px solid #212121;position:relative;">
          <div style="position:absolute;top:8px;right:8px;width:36px;height:36px;background:#fdd835;border:3px solid #212121;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:2px 2px 0 #212121;">🎴</div>
          <h2 style="font-family:'Bangers',cursive;font-size:32px;color:#fafafa;margin:0;text-shadow:3px 3px 0 #212121;letter-spacing:2px;">${hero.name}</h2>
          <div style="font-family:'Comic Neue',cursive;font-size:14px;color:#fafafa;opacity:0.9;font-weight:700;">「${hero.alias}」</div>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;align-items:center;gap:12px;background:${scheme.secondary};border-bottom:4px solid #212121;">
          <div style="width:100px;height:100px;background:#fafafa;border:5px solid #212121;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:4px 4px 0 #212121;">
            <span style="font-size:56px;">${emoji}</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">${effects}</div>
        </div>
        <div style="padding:12px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;background:#fafafa;border-bottom:3px solid #212121;">${powerChips}</div>
        <div style="padding:12px 16px;background:#fafafa;display:flex;flex-direction:column;gap:8px;border-bottom:3px solid #212121;">${statBars}</div>
        <div style="padding:12px;background:${scheme.primary};text-align:center;">
          <div style="font-family:'Comic Neue',cursive;font-size:14px;font-weight:700;color:#fafafa;font-style:italic;margin-bottom:8px;">"${hero.catchphrase}"</div>
          <div style="font-family:serif;font-size:12px;color:#fdd835;font-weight:600;">⚠️ 弱点: ${hero.weakness}</div>
        </div>
      </div>
    `;
  }

  return {
    isExporting,
    exportProgress,
    PDF_SIZES,
    elementToCanvas,
    canvasToImageDataUrl,
    canvasToBlob,
    estimateFileSize,
    formatFileSize,
    dataUrlToBlob,
    downloadBlob,
    downloadDataUrl,
    sanitizeFilename,
    exportAsImage,
    exportAsPdf,
    exportAndDownload,
    copyToClipboard,
    heroToCanvas,
    renderHeroCardHtml
  };
}
