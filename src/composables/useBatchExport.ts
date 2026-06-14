import { ref, computed } from 'vue';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import type { Hero } from '../types';
import {
  useCardExport,
  type ExportFormat,
  type Resolution,
  type PdfPageSize,
  type ExportResult
} from './useCardExport';

export type PackMethod = 'zip' | 'multipage-pdf';
export type GridColumns = 2 | 3 | 4;

export interface BatchExportConfig {
  format: ExportFormat;
  resolution: Resolution;
  packMethod: PackMethod;
  filenameTemplate: string;
  includeMetadata: boolean;
  jpgQuality: number;
  webpQuality: number;
  pdfPageSize: PdfPageSize;
  pdfShowBleed: boolean;
}

export interface LongImageConfig {
  columns: GridColumns;
  backgroundColor: string;
  cardGap: number;
  resolution: Resolution;
  format: 'png' | 'jpg' | 'webp';
  quality: number;
}

export interface BatchProgress {
  processed: number;
  total: number;
  currentName: string;
  percent: number;
  estimatedRemaining: number;
  startTime: number;
}

export interface BatchExportSummary {
  success: ExportResult[];
  failed: ExportResult[];
  total: number;
}

export function useBatchExport() {
  const cardExport = useCardExport();

  const isExporting = ref(false);
  const isCancelled = ref(false);
  const progress = ref<BatchProgress>({
    processed: 0,
    total: 0,
    currentName: '',
    percent: 0,
    estimatedRemaining: 0,
    startTime: 0
  });

  const defaultConfig: BatchExportConfig = {
    format: 'png',
    resolution: 2,
    packMethod: 'zip',
    filenameTemplate: '{{序号}}_{{英雄名}}',
    includeMetadata: false,
    jpgQuality: 90,
    webpQuality: 80,
    pdfPageSize: 'a4',
    pdfShowBleed: true
  };

  function formatFilename(
    template: string,
    hero: Hero,
    index: number
  ): string {
    const date = new Date(hero.createdAt || Date.now());
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const tagStr = hero.powers.slice(0, 2).map(p => p.name).join('-') || 'hero';

    const replacements: Record<string, string> = {
      '{{序号}}': String(index + 1).padStart(3, '0'),
      '{{英雄名}}': hero.name || 'hero',
      '{{真实姓名}}': hero.alias || hero.name || 'hero',
      '{{创建日期}}': dateStr,
      '{{标签}}': tagStr
    };

    let result = template;
    Object.entries(replacements).forEach(([key, value]) => {
      result = result.split(key).join(cardExport.sanitizeFilename(value));
    });

    return cardExport.sanitizeFilename(result) || `hero_${index + 1}`;
  }

  function generateManifest(heroes: Hero[]): string {
    const manifest = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      total: heroes.length,
      heroes: heroes.map(hero => ({
        id: hero.id,
        name: hero.name,
        alias: hero.alias,
        catchphrase: hero.catchphrase,
        appearance: hero.appearance,
        powers: hero.powers,
        stats: hero.stats,
        weakness: hero.weakness,
        backstory: hero.backstory,
        cardTemplate: hero.cardTemplate,
        effects: hero.effects,
        folderId: hero.folderId,
        createdAt: hero.createdAt
      }))
    };
    return JSON.stringify(manifest, null, 2);
  }

  function updateProgress(
    processed: number,
    total: number,
    currentName: string
  ) {
    const elapsed = Date.now() - progress.value.startTime;
    const perItem = processed > 0 ? elapsed / processed : 0;
    const remaining = Math.max(0, (total - processed) * perItem);

    progress.value = {
      processed,
      total,
      currentName,
      percent: total > 0 ? Math.round((processed / total) * 100) : 0,
      estimatedRemaining: remaining,
      startTime: progress.value.startTime
    };
  }

  function formatTime(ms: number): string {
    if (ms < 1000) return '即将完成';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `约 ${seconds} 秒`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `约 ${minutes} 分 ${secs} 秒`;
  }

  async function exportHeroImage(
    hero: Hero,
    config: BatchExportConfig,
    index: number
  ): Promise<ExportResult> {
    const filename = formatFilename(config.filenameTemplate, hero, index);
    const format = config.format;

    try {
      if (format === 'pdf') {
        const canvas = await cardExport.heroToCanvas(hero, config.resolution);
        if (!canvas) {
          return { success: false, heroId: hero.id, heroName: hero.name, fileName: filename, error: 'Canvas generation failed' };
        }

        const size = cardExport.PDF_SIZES[config.pdfPageSize];
        const bleed = config.pdfShowBleed ? 3 : 0;
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
          pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
        } else {
          y = (pdfHeight - imgHeightMm) / 2;
          pdf.addImage(imgData, 'PNG', x, y, imgWidthMm, imgHeightMm);
        }

        if (config.pdfShowBleed) {
          pdf.setDrawColor(255, 0, 0);
          pdf.setLineWidth(0.1);
          pdf.setLineDashPattern([1, 1], 0);
          pdf.rect(bleed, bleed, size.width, size.height, 'S');
          pdf.setLineDashPattern([], 0);
        }

        const blob = pdf.output('blob');
        return { success: true, heroId: hero.id, heroName: hero.name, fileName: `${filename}.pdf`, blob };
      } else {
        const canvas = await cardExport.heroToCanvas(hero, config.resolution);
        if (!canvas) {
          return { success: false, heroId: hero.id, heroName: hero.name, fileName: filename, error: 'Canvas generation failed' };
        }

        const quality = format === 'jpg' ? config.jpgQuality / 100 : format === 'webp' ? config.webpQuality / 100 : undefined;
        const blob = await cardExport.canvasToBlob(canvas, format, quality);
        const dataUrl = cardExport.canvasToImageDataUrl(canvas, format, quality);

        return {
          success: true,
          heroId: hero.id,
          heroName: hero.name,
          fileName: `${filename}.${format}`,
          blob: blob || undefined,
          dataUrl
        };
      }
    } catch (error) {
      return {
        success: false,
        heroId: hero.id,
        heroName: hero.name,
        fileName: filename,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async function batchExportZip(
    heroes: Hero[],
    config: BatchExportConfig
  ): Promise<BatchExportSummary> {
    const zip = new JSZip();
    const success: ExportResult[] = [];
    const failed: ExportResult[] = [];

    for (let i = 0; i < heroes.length; i++) {
      if (isCancelled.value) break;

      const hero = heroes[i];
      updateProgress(i, heroes.length, hero.name || `Hero ${i + 1}`);

      const result = await exportHeroImage(hero, config, i);

      if (result.success && result.blob) {
        zip.file(result.fileName!, result.blob);
        success.push(result);
      } else {
        failed.push(result);
      }

      await new Promise(r => setTimeout(r, 50));
    }

    if (config.includeMetadata && !isCancelled.value) {
      updateProgress(heroes.length, heroes.length + 1, '生成 manifest.json');
      zip.file('manifest.json', generateManifest(heroes));
    }

    if (success.length > 0 && !isCancelled.value) {
      updateProgress(heroes.length, heroes.length + 1, '打包 ZIP...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 10);
      cardExport.downloadBlob(zipBlob, `hero-cards-${timestamp}.zip`);
    }

    updateProgress(heroes.length, heroes.length, '完成');

    return { success, failed, total: heroes.length };
  }

  async function batchExportMultiPagePdf(
    heroes: Hero[],
    config: BatchExportConfig
  ): Promise<BatchExportSummary> {
    const size = cardExport.PDF_SIZES[config.pdfPageSize];
    const bleed = config.pdfShowBleed ? 3 : 0;
    const pdfWidth = size.width + bleed * 2;
    const pdfHeight = size.height + bleed * 2;

    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: size.unit,
      format: [pdfWidth, pdfHeight]
    });

    const success: ExportResult[] = [];
    const failed: ExportResult[] = [];

    for (let i = 0; i < heroes.length; i++) {
      if (isCancelled.value) break;

      const hero = heroes[i];
      updateProgress(i, heroes.length, hero.name || `Hero ${i + 1}`);

      try {
        const canvas = await cardExport.heroToCanvas(hero, config.resolution);
        if (!canvas) {
          failed.push({ success: false, heroId: hero.id, heroName: hero.name, error: 'Canvas generation failed' });
          continue;
        }

        if (i > 0) pdf.addPage();

        const imgData = canvas.toDataURL('image/png');
        const imgWidthMm = size.width;
        const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

        let x = bleed;
        let y = bleed;

        if (imgHeightMm > size.height) {
          const scaledHeight = size.height;
          const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
          x = (pdfWidth - scaledWidth) / 2;
          pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
        } else {
          y = (pdfHeight - imgHeightMm) / 2;
          pdf.addImage(imgData, 'PNG', x, y, imgWidthMm, imgHeightMm);
        }

        if (config.pdfShowBleed) {
          pdf.setDrawColor(255, 0, 0);
          pdf.setLineWidth(0.1);
          pdf.setLineDashPattern([1, 1], 0);
          pdf.rect(bleed, bleed, size.width, size.height, 'S');
          pdf.setLineDashPattern([], 0);
        }

        success.push({ success: true, heroId: hero.id, heroName: hero.name });
      } catch (error) {
        failed.push({
          success: false,
          heroId: hero.id,
          heroName: hero.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      await new Promise(r => setTimeout(r, 50));
    }

    if (success.length > 0 && !isCancelled.value) {
      updateProgress(heroes.length, heroes.length, '生成 PDF...');
      const pdfBlob = pdf.output('blob');
      const timestamp = new Date().toISOString().slice(0, 10);
      cardExport.downloadBlob(pdfBlob, `hero-cards-${timestamp}.pdf`);
    }

    updateProgress(heroes.length, heroes.length, '完成');

    return { success, failed, total: heroes.length };
  }

  async function batchExport(
    heroes: Hero[],
    config: Partial<BatchExportConfig> = {}
  ): Promise<BatchExportSummary> {
    const fullConfig: BatchExportConfig = { ...defaultConfig, ...config };

    isExporting.value = true;
    isCancelled.value = false;
    progress.value = {
      processed: 0,
      total: heroes.length,
      currentName: '',
      percent: 0,
      estimatedRemaining: 0,
      startTime: Date.now()
    };

    try {
      if (fullConfig.packMethod === 'multipage-pdf' || fullConfig.format === 'pdf') {
        return await batchExportMultiPagePdf(heroes, { ...fullConfig, format: 'pdf' });
      } else {
        return await batchExportZip(heroes, fullConfig);
      }
    } finally {
      isExporting.value = false;
    }
  }

  function cancelExport() {
    isCancelled.value = true;
  }

  async function exportLongImage(
    heroes: Hero[],
    config: Partial<LongImageConfig> = {}
  ): Promise<Blob | null> {
    const fullConfig: LongImageConfig = {
      columns: 3,
      backgroundColor: '#f5f5f5',
      cardGap: 20,
      resolution: 2,
      format: 'png',
      quality: 0.92,
      ...config
    };

    if (heroes.length === 0) return null;

    isExporting.value = true;
    progress.value = {
      processed: 0,
      total: heroes.length,
      currentName: '生成长图...',
      percent: 0,
      estimatedRemaining: 0,
      startTime: Date.now()
    };

    try {
      const canvases: HTMLCanvasElement[] = [];
      for (let i = 0; i < heroes.length; i++) {
        updateProgress(i, heroes.length + 2, heroes[i].name || `Hero ${i + 1}`);
        const canvas = await cardExport.heroToCanvas(heroes[i], fullConfig.resolution);
        if (canvas) canvases.push(canvas);
      }

      if (canvases.length === 0) return null;

      updateProgress(heroes.length, heroes.length + 2, '拼接中...');

      const cardWidth = canvases[0].width;
      const cardHeight = canvases[0].height;
      const gap = fullConfig.cardGap * fullConfig.resolution;
      const columns = fullConfig.columns;
      const rows = Math.ceil(canvases.length / columns);

      const totalWidth = cardWidth * columns + gap * (columns + 1);
      const totalHeight = cardHeight * rows + gap * (rows + 1);

      const composite = document.createElement('canvas');
      composite.width = totalWidth;
      composite.height = totalHeight;
      const ctx = composite.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = fullConfig.backgroundColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      canvases.forEach((canvas, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = gap + col * (cardWidth + gap);
        const y = gap + row * (cardHeight + gap);
        ctx.drawImage(canvas, x, y);
      });

      updateProgress(heroes.length + 1, heroes.length + 2, '导出中...');

      const blob = await cardExport.canvasToBlob(composite, fullConfig.format, fullConfig.quality / 100);

      if (blob) {
        const timestamp = new Date().toISOString().slice(0, 10);
        cardExport.downloadBlob(blob, `hero-grid-${timestamp}.${fullConfig.format}`);
      }

      updateProgress(heroes.length + 2, heroes.length + 2, '完成');
      return blob;
    } catch (error) {
      console.error('Long image export failed:', error);
      return null;
    } finally {
      isExporting.value = false;
    }
  }

  return {
    isExporting,
    isCancelled,
    progress,
    defaultConfig,
    formatTime,
    formatFilename,
    generateManifest,
    batchExport,
    cancelExport,
    exportLongImage
  };
}
