// Shared image utility functions for DECStudioHub Image Tools Suite

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function calculateAspectRatio(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const rw = width / divisor;
  const rh = height / divisor;
  
  // Standard common aspect ratios check for clean display
  const ratio = width / height;
  if (Math.abs(ratio - 16 / 9) < 0.02) return '16:9';
  if (Math.abs(ratio - 4 / 3) < 0.02) return '4:3';
  if (Math.abs(ratio - 1) < 0.02) return '1:1';
  if (Math.abs(ratio - 3 / 2) < 0.02) return '3:2';
  if (Math.abs(ratio - 9 / 16) < 0.02) return '9:16';
  if (Math.abs(ratio - 2 / 3) < 0.02) return '2:3';
  if (Math.abs(ratio - 21 / 9) < 0.03) return '21:9';

  return `${rw}:${rh}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

export function getBaseFileName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = url;
  });
}

export function applyConvolution(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weights: number[],
  opaque = true
) {
  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side / 2);
  const srcData = ctx.getImageData(0, 0, width, height);
  const src = srcData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;
  const alphaFac = opaque ? 1 : 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sy = y;
      const sx = x;
      const dstOff = (y * width + x) * 4;
      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = Math.min(height - 1, Math.max(0, sy + cy - halfSide));
          const scx = Math.min(width - 1, Math.max(0, sx + cx - halfSide));
          const srcOff = (scy * width + scx) * 4;
          const wt = weights[cy * side + cx];
          r += src[srcOff] * wt;
          g += src[srcOff + 1] * wt;
          b += src[srcOff + 2] * wt;
          a += src[srcOff + 3] * wt;
        }
      }

      dst[dstOff] = Math.min(255, Math.max(0, r));
      dst[dstOff + 1] = Math.min(255, Math.max(0, g));
      dst[dstOff + 2] = Math.min(255, Math.max(0, b));
      dst[dstOff + 3] = src[dstOff + 3] + alphaFac * (255 - src[dstOff + 3]);
    }
  }

  ctx.putImageData(output, 0, 0);
}
