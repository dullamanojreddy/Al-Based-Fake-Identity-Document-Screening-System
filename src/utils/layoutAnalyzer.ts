import { DocumentType, LayoutAnalysisResult, LayoutRegionComparison, TypographyAnalysisResult, BoundingBoxCoordinates } from '../types';

interface TemplateRegion extends BoundingBoxCoordinates { name: string; expectedInkRange: [number, number]; description: string }
interface DocumentTemplate { id: string; name: string; aspectRatio: number; aspectTolerance: number; regions: TemplateRegion[] }

const TEMPLATES: Partial<Record<DocumentType, DocumentTemplate>> = {
  passport: { id: 'TPL-PASSPORT-TD3', name: 'Passport BDP (TD3-like)', aspectRatio: 1.42, aspectTolerance: 0.22, regions: [
    { name: 'Issuing Authority Header', x: 20, y: 4, width: 60, height: 12, expectedInkRange: [0.02, 0.45], description: 'Country name / issuing authority title.' },
    { name: 'Portrait Photograph Zone', x: 8, y: 28, width: 20, height: 38, expectedInkRange: [0.15, 0.95], description: 'Bearer photograph on the left.' },
    { name: 'Biographical Field Zone', x: 34, y: 26, width: 60, height: 48, expectedInkRange: [0.03, 0.5], description: 'Surname, given names, nationality, DOB, sex, expiry.' },
    { name: 'Machine Readable Zone (MRZ)', x: 4, y: 86, width: 92, height: 12, expectedInkRange: [0.08, 0.6], description: 'Two-line ICAO 9303 OCR-B band.' },
  ]},
  national_id: { id: 'TPL-AADHAAR-FRONT', name: 'National ID (Aadhaar-like, CR80)', aspectRatio: 1.586, aspectTolerance: 0.25, regions: [
    { name: 'Issuing Authority Header', x: 4, y: 6, width: 55, height: 18, expectedInkRange: [0.02, 0.5], description: 'Government / UIDAI header.' },
    { name: 'Portrait Photograph Zone', x: 62, y: 22, width: 26, height: 42, expectedInkRange: [0.15, 0.95], description: 'Bearer photograph on the right.' },
    { name: 'Biographical Field Zone', x: 6, y: 30, width: 52, height: 42, expectedInkRange: [0.03, 0.55], description: 'Name, DOB, gender fields.' },
    { name: 'Credential Number Band', x: 8, y: 74, width: 60, height: 18, expectedInkRange: [0.04, 0.55], description: 'Large-printed 12-digit credential number.' },
  ]},
  driving_license: { id: 'TPL-DL-FRONT', name: 'Driving Licence (CR80)', aspectRatio: 1.586, aspectTolerance: 0.25, regions: [
    { name: 'Issuing Authority Header', x: 4, y: 5, width: 70, height: 16, expectedInkRange: [0.02, 0.5], description: 'State / RTO header.' },
    { name: 'Portrait Photograph Zone', x: 6, y: 24, width: 24, height: 40, expectedInkRange: [0.15, 0.95], description: 'Bearer photograph on the left.' },
    { name: 'Biographical Field Zone', x: 36, y: 24, width: 60, height: 46, expectedInkRange: [0.03, 0.55], description: 'Name, DOB, vehicle class fields.' },
    { name: 'Credential Number Band', x: 8, y: 72, width: 60, height: 20, expectedInkRange: [0.03, 0.55], description: 'DL number near the bottom.' },
  ]},
};

async function loadCanvas(imageSource: string | HTMLImageElement, maxDim = 900): Promise<{ ctx: CanvasRenderingContext2D; width: number; height: number } | null> {
  return new Promise(resolve => {
    const img = typeof imageSource === 'string' ? new Image() : imageSource;
    if (typeof imageSource === 'string') { img.crossOrigin = 'anonymous'; img.src = imageSource; }
    const process = () => {
      try {
        const natW = img.naturalWidth || img.width, natH = img.naturalHeight || img.height;
        if (!natW || !natH) { resolve(null); return; }
        const scale = Math.min(1, maxDim / Math.max(natW, natH));
        const width = Math.max(1, Math.round(natW * scale)), height = Math.max(1, Math.round(natH * scale));
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve({ ctx, width, height });
      } catch { resolve(null); }
    };
    if (img.complete && (img.naturalWidth || img.width)) process();
    else { img.onload = process; img.onerror = () => resolve(null); }
  });
}

function regionInkRatio(imageData: ImageData, region: BoundingBoxCoordinates, imgWidth: number, imgHeight: number): number {
  const x0 = Math.max(0, Math.floor((region.x / 100) * imgWidth)), y0 = Math.max(0, Math.floor((region.y / 100) * imgHeight));
  const x1 = Math.min(imgWidth, Math.ceil(((region.x + region.width) / 100) * imgWidth)), y1 = Math.min(imgHeight, Math.ceil(((region.y + region.height) / 100) * imgHeight));
  const w = x1 - x0, h = y1 - y0; if (w <= 2 || h <= 2) return 0;
  const gray = new Uint8Array(w * h); let sum = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * imgWidth + x) * 4; const v = Math.round(0.299 * imageData.data[i] + 0.587 * imageData.data[i+1] + 0.114 * imageData.data[i+2]); gray[(y-y0)*w+(x-x0)] = v; sum += v; }
  const mean = sum / (w * h); let min = 255; for (let i = 0; i < gray.length; i++) if (gray[i] < min) min = gray[i];
  const threshold = Math.max(20, Math.min(200, (mean + min) / 2)); let dark = 0; for (let i = 0; i < gray.length; i++) if (gray[i] < threshold) dark++;
  return dark / gray.length;
}

export async function analyzeDocumentLayout(imageSource: string | HTMLImageElement, documentType: DocumentType): Promise<LayoutAnalysisResult | null> {
  const template = TEMPLATES[documentType]; if (!template) return null;
  const loaded = await loadCanvas(imageSource); if (!loaded) return null;
  const { ctx, width, height } = loaded; const imageData = ctx.getImageData(0, 0, width, height);
  const actualRatio = width / height;
  const ratioDeviation = Math.abs(actualRatio - template.aspectRatio) / template.aspectRatio;
  const aspectRatioMatch = ratioDeviation <= template.aspectTolerance;
  const regionComparisons: LayoutRegionComparison[] = template.regions.map(region => {
    const ink = regionInkRatio(imageData, region, width, height); const [lo, hi] = region.expectedInkRange;
    let deviation: number;
    if (ink >= lo && ink <= hi) deviation = 0;
    else if (ink < lo) deviation = Math.min(100, Math.round(((lo - ink) / Math.max(lo, 0.01)) * 100));
    else deviation = Math.min(100, Math.round(((ink - hi) / Math.max(hi, 0.01)) * 100));
    const matchScore = Math.max(0, 100 - deviation);
    let details: string;
    if (deviation === 0) details = `Content density (${(ink*100).toFixed(1)}% ink) matches expected template range.`;
    else if (ink < lo) details = `Region too empty (${(ink*100).toFixed(1)}% ink vs expected >= ${(lo*100).toFixed(0)}%). Expected: ${region.description}`;
    else details = `Region over-saturated (${(ink*100).toFixed(1)}% ink vs expected <= ${(hi*100).toFixed(0)}%). Expected: ${region.description}`;
    return { regionName: region.name, expectedPosition: { x: region.x, y: region.y, width: region.width, height: region.height }, positionDeviation: deviation, matchScore, details };
  });
  const layoutSimilarity = Math.round(regionComparisons.reduce((a, r) => a + r.matchScore, 0) / regionComparisons.length);
  const failingRegions = regionComparisons.filter(r => r.matchScore < 60);
  const details = `Template ${template.id}: aspect ratio ${actualRatio.toFixed(2)} (expected ${template.aspectRatio.toFixed(2)}, ${aspectRatioMatch ? 'within' : 'outside'} tolerance). ` +
    (failingRegions.length === 0 ? `All ${regionComparisons.length} structural regions consistent with the genuine layout.` : `Structural deviation in: ${failingRegions.map(r => r.regionName).join(', ')}.`);
  return { templateId: template.id, templateName: template.name, layoutSimilarity, aspectRatioMatch, regionComparisons, details };
}

export async function analyzeTypography(imageSource: string | HTMLImageElement): Promise<TypographyAnalysisResult | null> {
  const loaded = await loadCanvas(imageSource, 800); if (!loaded) return null;
  const { ctx, width, height } = loaded; const imageData = ctx.getImageData(0, 0, width, height);
  const total = width * height; const gray = new Uint8Array(total); let gSum = 0;
  for (let i = 0; i < total; i++) { const p = i * 4; const v = Math.round(0.299*imageData.data[p]+0.587*imageData.data[p+1]+0.114*imageData.data[p+2]); gray[i] = v; gSum += v; }
  const gMean = gSum / total; let variance = 0; for (let i = 0; i < total; i++) variance += (gray[i] - gMean) ** 2; variance /= total;
  const threshold = Math.max(30, Math.min(220, gMean - Math.sqrt(variance) * 0.55));
  const isInk = (i: number) => gray[i] < threshold;
  const rowInk = new Uint16Array(height);
  for (let y = 0; y < height; y++) { let count = 0; for (let x = 0; x < width; x++) if (isInk(y*width+x)) count++; rowInk[y] = count; }
  const rowNoiseFloor = Math.max(2, Math.round(width * 0.004));
  interface TextRow { yStart: number; yEnd: number; }
  const rows: TextRow[] = []; let runStart = -1;
  for (let y = 0; y < height; y++) { const hasInk = rowInk[y] > rowNoiseFloor; if (hasInk && runStart === -1) runStart = y; if ((!hasInk || y === height-1) && runStart !== -1) { if (y - runStart >= 2) rows.push({ yStart: runStart, yEnd: y }); runStart = -1; } }
  if (rows.length < 4) return { consistencyScore: 70, fontInconsistencyDetected: false, baselineMisalignmentDetected: false, strokeWidthVariation: 0, rowsAnalyzed: rows.length, suspiciousRegions: [], details: 'Insufficient printed text rows for typography forensics.' };
  const rowHeights: number[] = []; const strokeMeans: number[] = []; const baselines: number[] = [];
  for (const row of rows) { const h = row.yEnd - row.yStart + 1; rowHeights.push(h); baselines.push(row.yEnd); let runTotal = 0, runCount = 0;
    for (let y = row.yStart; y <= row.yEnd; y++) { let run = 0; for (let x = 0; x < width; x++) { if (isInk(y*width+x)) run++; else if (run > 0) { if (run <= Math.max(4, h*0.6)) { runTotal += run; runCount++; } run = 0; } } if (run > 0 && run <= Math.max(4, h*0.6)) { runTotal += run; runCount++; } }
    strokeMeans.push(runCount > 0 ? runTotal / runCount : 0);
  }
  const mean = (arr: number[]) => arr.reduce((a,b) => a+b,0) / arr.length;
  const cv = (arr: number[]) => { const m = mean(arr); if (m === 0) return 0; return Math.sqrt(arr.reduce((a,v) => a+(v-m)**2,0) / arr.length) / m; };
  const hMedian = [...rowHeights].sort((a,b) => a-b)[Math.floor(rowHeights.length/2)];
  const textRowIdx = rowHeights.map((h,i) => ({h,i})).filter(r => r.h >= Math.max(3, hMedian*0.4) && r.h <= hMedian*3.5).map(r => r.i);
  const heightCV = textRowIdx.length > 1 ? cv(textRowIdx.map(i => rowHeights[i])) : 0;
  const strokeCV = textRowIdx.length > 1 ? cv(textRowIdx.map(i => strokeMeans[i]).filter(s => s > 0)) : 0;
  let baselineJumps = 0;
  for (let i = 1; i < textRowIdx.length; i++) { const gap = baselines[textRowIdx[i]] - baselines[textRowIdx[i-1]]; if (gap < (rowHeights[textRowIdx[i]] + 2) * 0.35) baselineJumps++; }
  const fontInconsistencyDetected = strokeCV > 0.55; const baselineMisalignmentDetected = baselineJumps > Math.max(2, textRowIdx.length * 0.25);
  let consistencyScore = 100; consistencyScore -= Math.min(45, Math.round(strokeCV * 60)); consistencyScore -= Math.min(25, Math.round(heightCV * 40)); consistencyScore -= Math.min(20, baselineJumps * 4);
  consistencyScore = Math.max(0, Math.min(100, consistencyScore));
  const suspiciousRegions: string[] = []; if (fontInconsistencyDetected) suspiciousRegions.push('Stroke-width dispersion across text rows'); if (heightCV > 0.5) suspiciousRegions.push('Character height variance across text rows'); if (baselineMisalignmentDetected) suspiciousRegions.push('Baseline alignment jitter');
  const details = `Analyzed ${textRowIdx.length} printed text rows. Stroke-width variation CV=${strokeCV.toFixed(2)}, height variation CV=${heightCV.toFixed(2)}, baseline anomalies=${baselineJumps}. ` + (suspiciousRegions.length === 0 ? 'Typography is consistent with a single printing system.' : `Suspicious: ${suspiciousRegions.join('; ')}.`);
  return { consistencyScore, fontInconsistencyDetected, baselineMisalignmentDetected, strokeWidthVariation: Math.round(strokeCV*100)/100, rowsAnalyzed: textRowIdx.length, suspiciousRegions, details };
}
