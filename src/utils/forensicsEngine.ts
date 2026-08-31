import { TamperingForensics, TamperBoundingBox, DocumentType } from '../types';

/**
 * Generates an Error Level Analysis (ELA) heatmap from an image using HTML5 Canvas.
 * Computes pixel-by-pixel compression difference between original and 80% JPEG recompression.
 */
export async function generateELACanvas(
  imageSource: string | HTMLImageElement,
  scaleGain: number = 25
): Promise<{ elaDataUrl: string; anomalyScore: number }> {
  return new Promise((resolve) => {
    const img = typeof imageSource === 'string' ? new Image() : imageSource;
    if (typeof imageSource === 'string') {
      img.crossOrigin = 'anonymous';
      img.src = imageSource;
    }

    const process = () => {
      const width = Math.min(img.naturalWidth || img.width || 800, 1200);
      const height = Math.min(img.naturalHeight || img.height || 600, 900);

      // Canvas 1: Original
      const origCanvas = document.createElement('canvas');
      origCanvas.width = width;
      origCanvas.height = height;
      const origCtx = origCanvas.getContext('2d');
      if (!origCtx) {
        resolve({ elaDataUrl: '', anomalyScore: 0 });
        return;
      }
      origCtx.drawImage(img, 0, 0, width, height);
      const origData = origCtx.getImageData(0, 0, width, height);

      // Recompress to JPEG at 80% quality
      const compressedDataUrl = origCanvas.toDataURL('image/jpeg', 0.80);
      const compImg = new Image();
      compImg.crossOrigin = 'anonymous';
      compImg.onload = () => {
        // Canvas 2: Recompressed
        const compCanvas = document.createElement('canvas');
        compCanvas.width = width;
        compCanvas.height = height;
        const compCtx = compCanvas.getContext('2d');
        if (!compCtx) {
          resolve({ elaDataUrl: '', anomalyScore: 0 });
          return;
        }
        compCtx.drawImage(compImg, 0, 0, width, height);
        const compData = compCtx.getImageData(0, 0, width, height);

        // Canvas 3: Difference Heatmap
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = width;
        diffCanvas.height = height;
        const diffCtx = diffCanvas.getContext('2d');
        if (!diffCtx) {
          resolve({ elaDataUrl: '', anomalyScore: 0 });
          return;
        }
        const diffData = diffCtx.createImageData(width, height);

        let totalDiff = 0;
        let highVariancePixelCount = 0;

        for (let i = 0; i < origData.data.length; i += 4) {
          const rDiff = Math.abs(origData.data[i] - compData.data[i]);
          const gDiff = Math.abs(origData.data[i + 1] - compData.data[i + 1]);
          const bDiff = Math.abs(origData.data[i + 2] - compData.data[i + 2]);

          // Compute perceived intensity difference
          const avgDiff = (rDiff + gDiff + bDiff) / 3;
          totalDiff += avgDiff;

          // Amplify for forensic visualization
          const amplifiedR = Math.min(255, rDiff * scaleGain);
          const amplifiedG = Math.min(255, gDiff * scaleGain);
          const amplifiedB = Math.min(255, bDiff * (scaleGain + 5));

          if (avgDiff * scaleGain > 140) {
            highVariancePixelCount++;
            // High error level -> highlight with vibrant forensic tint
            diffData.data[i] = Math.min(255, amplifiedR + 40);     // Red
            diffData.data[i + 1] = amplifiedG;                     // Green
            diffData.data[i + 2] = Math.max(0, amplifiedB - 30);   // Blue
          } else {
            diffData.data[i] = amplifiedR;
            diffData.data[i + 1] = amplifiedG;
            diffData.data[i + 2] = amplifiedB;
          }
          diffData.data[i + 3] = 255; // Alpha
        }

        diffCtx.putImageData(diffData, 0, 0);

        const totalPixels = width * height;
        const anomalyPercentage = Math.min(100, Math.round((highVariancePixelCount / (totalPixels * 0.15)) * 100));

        resolve({
          elaDataUrl: diffCanvas.toDataURL('image/png'),
          anomalyScore: anomalyPercentage,
        });
      };
      compImg.src = compressedDataUrl;
    };

    if (img.complete) {
      process();
    } else {
      img.onload = process;
      img.onerror = () => resolve({ elaDataUrl: '', anomalyScore: 0 });
    }
  });
}

/**
 * Generate synthetic forensic noise map for visualization
 */
export function generateNoiseResidualMap(width: number = 600, height: number = 400, highRiskBoxes?: TamperBoundingBox[]): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background dark tactical gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0f1d');
  bgGrad.addColorStop(1, '#05070d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Draw subtle high-frequency noise
  const imgData = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 35;
    imgData.data[i] = Math.max(0, Math.min(255, 20 + n));
    imgData.data[i + 1] = Math.max(0, Math.min(255, 30 + n));
    imgData.data[i + 2] = Math.max(0, Math.min(255, 60 + n * 1.5));
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // If high risk boxes exist, render forensic noise discontinuity hotspot
  if (highRiskBoxes && highRiskBoxes.length > 0) {
    highRiskBoxes.forEach(box => {
      const bx = (box.x / 100) * width;
      const by = (box.y / 100) * height;
      const bw = (box.width / 100) * width;
      const bh = (box.height / 100) * height;

      // Glow effect around spliced region
      const radGrad = ctx.createRadialGradient(bx + bw / 2, by + bh / 2, 5, bx + bw / 2, by + bh / 2, Math.max(bw, bh));
      radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
      radGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.35)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = radGrad;
      ctx.fillRect(bx - 10, by - 10, bw + 20, bh + 20);

      // Draw dashed forensic perimeter
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(bx, by, bw, bh);
    });
  }

  return canvas.toDataURL('image/png');
}

/**
 * Evaluates EXIF metadata string for common photo manipulation software
 */
export function analyzeExifSoftwareSignatures(metadataString: string): {
  isTampered: boolean;
  detectedSoftware: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
} {
  const suspiciousKeywords = [
    'Adobe Photoshop',
    'Photoshop',
    'GIMP',
    'Canva',
    'PicsArt',
    'CorelDraw',
    'Pixelmator',
    'Lightroom',
    'Affinity Photo',
    'Photopea',
    'Snapseed',
    'DeepFaceLab',
  ];

  const detected: string[] = [];
  suspiciousKeywords.forEach(kw => {
    if (metadataString.toLowerCase().includes(kw.toLowerCase())) {
      detected.push(kw);
    }
  });

  return {
    isTampered: detected.length > 0,
    detectedSoftware: detected,
    riskLevel: detected.length > 0 ? 'HIGH' : 'LOW',
  };
}
