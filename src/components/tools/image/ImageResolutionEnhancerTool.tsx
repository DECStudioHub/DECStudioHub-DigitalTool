import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, downloadBlob, getBaseFileName } from './imageUtils';
import {
  Brain,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Lock,
  Unlock,
  Sliders,
  Shield,
  Eye,
  Columns,
  SplitSquareVertical,
  Maximize2,
  FileCheck,
  Zap,
} from 'lucide-react';

type ScalePreset = '2x' | '4x' | 'custom';
type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

interface PresetConfig {
  id: string;
  name: string;
  description: string;
  scale: ScalePreset;
  sharpness: number; // 0 - 100
  noiseReduction: number; // 0 - 100
  detailEnhancement: number; // 0 - 100
  quality: number; // 10 - 100
  format?: OutputFormat;
}

const QUALITY_PRESETS: PresetConfig[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced 2× upscale with moderate sharpening and quick rendering',
    scale: '2x',
    sharpness: 45,
    noiseReduction: 25,
    detailEnhancement: 40,
    quality: 88,
  },
  {
    id: 'high',
    name: 'High Quality',
    description: 'Crisp 2× upscale with edge-preserving noise reduction and high details',
    scale: '2x',
    sharpness: 65,
    noiseReduction: 40,
    detailEnhancement: 60,
    quality: 94,
  },
  {
    id: 'max',
    name: 'Maximum Quality',
    description: 'Comprehensive 4× enhancement with micro-detail amplification and uncompressed output',
    scale: '4x',
    sharpness: 80,
    noiseReduction: 50,
    detailEnhancement: 75,
    quality: 98,
  },
];

const USE_CASE_PRESETS: PresetConfig[] = [
  {
    id: 'photo',
    name: 'Photo',
    description: 'Smooth skin and natural textures without over-sharpening grain',
    scale: '2x',
    sharpness: 50,
    noiseReduction: 45,
    detailEnhancement: 55,
    quality: 92,
  },
  {
    id: 'document',
    name: 'Document / Text',
    description: 'High edge contrast for crisp letterforms while scrubbing page noise',
    scale: '2x',
    sharpness: 85,
    noiseReduction: 65,
    detailEnhancement: 50,
    quality: 92,
  },
  {
    id: 'screenshot',
    name: 'Screenshot / UI',
    description: 'Sharp pixel boundaries for fonts, buttons, and graphics with low blur',
    scale: '2x',
    sharpness: 75,
    noiseReduction: 15,
    detailEnhancement: 70,
    quality: 95,
  },
  {
    id: 'product',
    name: 'Product Image',
    description: 'Pristine product highlights, sharp logos, and vibrant edge clarity',
    scale: '2x',
    sharpness: 70,
    noiseReduction: 35,
    detailEnhancement: 65,
    quality: 95,
  },
  {
    id: 'social',
    name: 'Social Media',
    description: 'Punchy contrast and clarity optimized for feed display and quick loading',
    scale: '2x',
    sharpness: 60,
    noiseReduction: 30,
    detailEnhancement: 55,
    quality: 85,
  },
  {
    id: 'print',
    name: 'Print Ready',
    description: 'Maximum 4× resolution with full micro-contrast for physical printing',
    scale: '4x',
    sharpness: 80,
    noiseReduction: 40,
    detailEnhancement: 80,
    quality: 98,
  },
];

// Maximum safe pixel threshold to prevent browser memory instability (~24 Megapixels)
const MAX_SAFE_TOTAL_PIXELS = 24_000_000;
const MAX_SAFE_DIMENSION = 8192;

export const ImageResolutionEnhancerTool: React.FC = () => {
  // Input File State
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [hasAlpha, setHasAlpha] = useState<boolean>(false);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Enhancement Controls
  const [scaleMode, setScaleMode] = useState<ScalePreset>('2x');
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // Processing Sliders
  const [sharpness, setSharpness] = useState<number>(60);
  const [noiseReduction, setNoiseReduction] = useState<number>(35);
  const [detailEnhancement, setDetailEnhancement] = useState<number>(55);
  const [outputQuality, setOutputQuality] = useState<number>(92);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');

  // Preset tracking
  const [selectedPresetId, setSelectedPresetId] = useState<string>('high');

  // Output State
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [enhancedSize, setEnhancedSize] = useState<number>(0);
  const [enhancedWidth, setEnhancedWidth] = useState<number>(0);
  const [enhancedHeight, setEnhancedHeight] = useState<number>(0);

  // Status & Progress
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  // Comparison Viewer State
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'side-by-side' | 'enhanced' | 'original'>('slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage (0-100)
  const isDraggingSlider = useRef<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  // Calculate target dimensions
  let targetW = origWidth;
  let targetH = origHeight;

  if (scaleMode === '2x') {
    targetW = origWidth * 2;
    targetH = origHeight * 2;
  } else if (scaleMode === '4x') {
    targetW = origWidth * 4;
    targetH = origHeight * 4;
  } else if (scaleMode === 'custom') {
    targetW = customWidth || origWidth;
    targetH = customHeight || origHeight;
  }

  const targetTotalPixels = targetW * targetH;
  const isTooLarge =
    targetTotalPixels > MAX_SAFE_TOTAL_PIXELS ||
    targetW > MAX_SAFE_DIMENSION ||
    targetH > MAX_SAFE_DIMENSION;

  // Handle uploaded files
  const handleFiles = (files: File[]) => {
    if (!files || !files[0]) return;
    const f = files[0];

    // Reset previous
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);

    setErrorMsg(null);
    setHasCompleted(false);
    setEnhancedUrl(null);
    setEnhancedBlob(null);
    setFile(f);

    // Pick appropriate default format based on input
    const isPng = f.type === 'image/png';
    const isWebp = f.type === 'image/webp';
    if (isPng) setOutputFormat('image/png');
    else if (isWebp) setOutputFormat('image/webp');
    else setOutputFormat('image/jpeg');

    const url = URL.createObjectURL(f);
    setOriginalUrl(url);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      imageElementRef.current = img;
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setCustomWidth(img.naturalWidth * 2);
      setCustomHeight(img.naturalHeight * 2);

      // Check for transparency
      try {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = Math.min(100, img.naturalWidth);
        testCanvas.height = Math.min(100, img.naturalHeight);
        const tctx = testCanvas.getContext('2d');
        if (tctx) {
          tctx.drawImage(img, 0, 0, testCanvas.width, testCanvas.height);
          const pData = tctx.getImageData(0, 0, testCanvas.width, testCanvas.height).data;
          let transparentFound = false;
          for (let i = 3; i < pData.length; i += 4) {
            if (pData[i] < 250) {
              transparentFound = true;
              break;
            }
          }
          setHasAlpha(transparentFound);
        }
      } catch (e) {
        // Ignore canvas read error if tainted
      }
    };

    img.onerror = () => {
      setErrorMsg('The selected image could not be loaded. Please ensure it is a valid JPG, PNG, or WebP file.');
    };
  };

  // Custom dimension handlers
  const handleCustomWidthChange = (val: number) => {
    setCustomWidth(val);
    if (lockAspectRatio && origWidth > 0 && origHeight > 0) {
      const calculatedH = Math.round((val * origHeight) / origWidth);
      setCustomHeight(calculatedH);
    }
  };

  const handleCustomHeightChange = (val: number) => {
    setCustomHeight(val);
    if (lockAspectRatio && origWidth > 0 && origHeight > 0) {
      const calculatedW = Math.round((val * origWidth) / origHeight);
      setCustomWidth(calculatedW);
    }
  };

  // Apply a preset
  const applyPreset = (preset: PresetConfig) => {
    setSelectedPresetId(preset.id);
    setScaleMode(preset.scale);
    setSharpness(preset.sharpness);
    setNoiseReduction(preset.noiseReduction);
    setDetailEnhancement(preset.detailEnhancement);
    setOutputQuality(preset.quality);
    if (preset.format) {
      setOutputFormat(preset.format);
    }
    if (preset.scale === '2x') {
      setCustomWidth(origWidth * 2);
      setCustomHeight(origHeight * 2);
    } else if (preset.scale === '4x') {
      setCustomWidth(origWidth * 4);
      setCustomHeight(origHeight * 4);
    }
  };

  // ==========================================================
  // RESOLUTION ENHANCEMENT ALGORITHMIC PIPELINE
  // ==========================================================
  const executeResolutionEnhancement = async () => {
    if (!imageElementRef.current || !file || origWidth <= 0 || origHeight <= 0) return;

    if (isTooLarge) {
      setErrorMsg('This image is too large to process safely in your browser. Try a smaller image or lower enhancement scale.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setHasCompleted(false);
    setProcessingStatus('Enhancing image...');

    // Allow UI to update before heavy computation
    await new Promise((resolve) => setTimeout(resolve, 60));

    try {
      const img = imageElementRef.current;
      const targetWidth = targetW;
      const targetHeight = targetH;

      // Stage 1: High-Quality Multi-Step Interpolation
      // For 4x or large scales, progressive 2-stage stepping yields noticeably
      // sharper edge clarity and fewer aliasing artifacts than a single aggressive jump.
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        throw new Error('Canvas context could not be created.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const scaleFactor = targetWidth / origWidth;

      if (scaleFactor > 2.5) {
        // Two-stage progressive upscale: 1x -> intermediate -> target
        const intermediateW = Math.round(origWidth * (scaleFactor * 0.5));
        const intermediateH = Math.round(origHeight * (scaleFactor * 0.5));

        const interCanvas = document.createElement('canvas');
        interCanvas.width = intermediateW;
        interCanvas.height = intermediateH;
        const interCtx = interCanvas.getContext('2d');

        if (interCtx) {
          interCtx.imageSmoothingEnabled = true;
          interCtx.imageSmoothingQuality = 'high';
          interCtx.drawImage(img, 0, 0, intermediateW, intermediateH);
          ctx.drawImage(interCanvas, 0, 0, intermediateW, intermediateH, 0, 0, targetWidth, targetHeight);
        } else {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        }
      } else {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      }

      // Stage 2: Detail-Preserving Noise Reduction & Edge / Sharpness Enhancement
      // Read pixel buffer directly
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;
      const w = targetWidth;
      const h = targetHeight;

      // Copy buffer for convolution reading
      const srcData = new Uint8ClampedArray(data);

      // Sliders normalization
      const sharpFactor = (sharpness / 100) * 0.9; // 0 to 0.9
      const noiseFactor = noiseReduction / 100; // 0 to 1.0
      const detailFactor = (detailEnhancement / 100) * 0.8; // 0 to 0.8

      // Noise threshold: color differences below this are smoothed, higher are preserved as edges
      const noiseThreshold = 14 * noiseFactor;
      const noiseWeight = 0.45 * noiseFactor;

      // Process rows
      for (let y = 1; y < h - 1; y++) {
        const rowOffset = y * w * 4;
        const rowAbove = (y - 1) * w * 4;
        const rowBelow = (y + 1) * w * 4;

        for (let x = 1; x < w - 1; x++) {
          const idx = rowOffset + x * 4;
          const alpha = srcData[idx + 3];

          // Skip completely transparent pixels
          if (alpha === 0) continue;

          // Center pixel values
          const r = srcData[idx];
          const g = srcData[idx + 1];
          const b = srcData[idx + 2];

          // 4-neighbor pixels
          const idxL = rowOffset + (x - 1) * 4;
          const idxR = rowOffset + (x + 1) * 4;
          const idxU = rowAbove + x * 4;
          const idxD = rowBelow + x * 4;

          const rL = srcData[idxL];
          const gL = srcData[idxL + 1];
          const bL = srcData[idxL + 2];

          const rR = srcData[idxR];
          const gR = srcData[idxR + 1];
          const bR = srcData[idxR + 2];

          const rU = srcData[idxU];
          const gU = srcData[idxU + 1];
          const bU = srcData[idxU + 2];

          const rD = srcData[idxD];
          const gD = srcData[idxD + 1];
          const bD = srcData[idxD + 2];

          // 1. Noise Reduction: Edge-Preserving Bilateral Smoothing
          let smoothR = r;
          let smoothG = g;
          let smoothB = b;

          if (noiseFactor > 0.05) {
            let neighborSumR = r;
            let neighborSumG = g;
            let neighborSumB = b;
            let neighborCount = 1;

            // Check neighbor differences
            const neighbors = [
              [rL, gL, bL],
              [rR, gR, bR],
              [rU, gU, bU],
              [rD, gD, bD],
            ];

            for (let i = 0; i < 4; i++) {
              const [nr, ng, nb] = neighbors[i];
              const diff = Math.abs(nr - r) + Math.abs(ng - g) + Math.abs(nb - b);
              // If difference is small, it's flat noise/grain -> smooth it
              if (diff < noiseThreshold * 3) {
                neighborSumR += nr;
                neighborSumG += ng;
                neighborSumB += nb;
                neighborCount++;
              }
            }

            if (neighborCount > 1) {
              const avgR = neighborSumR / neighborCount;
              const avgG = neighborSumG / neighborCount;
              const avgB = neighborSumB / neighborCount;
              smoothR = r * (1 - noiseWeight) + avgR * noiseWeight;
              smoothG = g * (1 - noiseWeight) + avgG * noiseWeight;
              smoothB = b * (1 - noiseWeight) + avgB * noiseWeight;
            }
          }

          // 2. High-Frequency Detail & Edge Enhancement (Laplacian Spatial Operator)
          // Laplacian: 4 * center - left - right - up - down
          const lapR = 4 * r - rL - rR - rU - rD;
          const lapG = 4 * g - gL - gR - gU - gD;
          const lapB = 4 * b - bL - bR - bU - bD;

          // Detail enhancement adds back micro-frequency variations
          const enhancedR = smoothR + lapR * (detailFactor * 0.5);
          const enhancedG = smoothG + lapG * (detailFactor * 0.5);
          const enhancedB = smoothB + lapB * (detailFactor * 0.5);

          // 3. Unsharp Mask Sharpening
          const sharpR = enhancedR + lapR * sharpFactor;
          const sharpG = enhancedG + lapG * sharpFactor;
          const sharpB = enhancedB + lapB * sharpFactor;

          // Clamp to [0, 255]
          data[idx] = sharpR < 0 ? 0 : sharpR > 255 ? 255 : sharpR;
          data[idx + 1] = sharpG < 0 ? 0 : sharpG > 255 ? 255 : sharpG;
          data[idx + 2] = sharpB < 0 ? 0 : sharpB > 255 ? 255 : sharpB;
          // Alpha remains untouched
        }
      }

      // Write back modified pixel buffer
      ctx.putImageData(imageData, 0, 0);

      // Stage 3: Output Quality Optimization & Blob Export
      const exportQuality = Math.max(0.1, Math.min(1.0, outputQuality / 100));

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setErrorMsg('Failed to generate output image file.');
            setIsProcessing(false);
            return;
          }

          if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
          const newUrl = URL.createObjectURL(blob);

          setEnhancedUrl(newUrl);
          setEnhancedBlob(blob);
          setEnhancedSize(blob.size);
          setEnhancedWidth(targetWidth);
          setEnhancedHeight(targetHeight);
          setIsProcessing(false);
          setHasCompleted(true);
          setProcessingStatus('Resolution enhancement complete.');
        },
        outputFormat,
        exportQuality
      );
    } catch (err: any) {
      console.error('Enhancement error:', err);
      setErrorMsg(
        err?.message ||
          'An unexpected error occurred during processing. Try a smaller enhancement scale or another format.'
      );
      setIsProcessing(false);
    }
  };

  // Draggable comparison slider handlers
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingSlider.current = true;
    handleSliderMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      isDraggingSlider.current = true;
      handleSliderMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider.current) {
        handleSliderMove(e.clientX);
      }
    };
    const onMouseUp = () => {
      isDraggingSlider.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider.current && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => {
      isDraggingSlider.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleSliderMove]);

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    };
  }, []);

  // Reset / Start Again
  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    setFile(null);
    setOriginalUrl(null);
    setEnhancedUrl(null);
    setEnhancedBlob(null);
    setOrigWidth(0);
    setOrigHeight(0);
    setEnhancedWidth(0);
    setEnhancedHeight(0);
    setEnhancedSize(0);
    setHasCompleted(false);
    setErrorMsg(null);
    setIsProcessing(false);
    setScaleMode('2x');
    imageElementRef.current = null;
  };

  // Download Handler
  const handleDownload = () => {
    if (!enhancedBlob || !file) return;
    const baseName = getBaseFileName(file.name);
    const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${baseName}_enhanced_${enhancedWidth}x${enhancedHeight}.${ext}`;
    downloadBlob(enhancedBlob, filename);
  };

  // Estimated file size calculation before processing
  const estimateOutputSize = (): string => {
    if (origWidth <= 0 || origHeight <= 0) return '—';
    const totalPixels = targetW * targetH;
    let bpp = 0.5; // bytes per pixel baseline estimate
    if (outputFormat === 'image/png') {
      bpp = hasAlpha ? 1.8 : 1.2;
    } else if (outputFormat === 'image/jpeg') {
      bpp = 0.15 * (outputQuality / 100);
    } else if (outputFormat === 'image/webp') {
      bpp = 0.12 * (outputQuality / 100);
    }
    const bytes = Math.round(totalPixels * bpp);
    return `~${formatBytes(bytes)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl text-purple-400 border border-purple-500/30 shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Resolution Enhancement</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold uppercase tracking-wider">
                Multi-Step Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Upscale dimensions while enhancing perceived sharpness, micro-details, and edge fidelity
            </p>
          </div>
        </div>

        {file && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start Again
          </button>
        )}
      </div>

      {/* Privacy Guarantee Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>100% Private:</strong> Your image is processed locally in your browser. No files are uploaded to any server.
          </span>
        </div>
        <span className="text-[11px] text-emerald-400/80 font-mono">HTML5 Canvas • Offline-Capable</span>
      </div>

      {/* Error Message Display */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-red-200">Processing Alert:</span>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Large Image Warning Check */}
      {file && isTooLarge && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-200">Memory Warning:</span>
            <p>
              This image is too large to process safely in your browser ({((targetW * targetH) / 1000000).toFixed(1)} MP).
              Try a smaller image or lower enhancement scale to prevent tab memory limits.
            </p>
          </div>
        </div>
      )}

      {!file ? (
        /* Upload Area */
        <ImageDropzone
          onFilesSelected={handleFiles}
          title="Drag & Drop Image or Click to Browse"
          subtitle="Supports JPG, JPEG, PNG, and WEBP — processed completely offline"
        />
      ) : (
        /* Active Enhancement Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================================================= */}
          {/* LEFT SIDE: Before / After Preview (7 Columns) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* Preview Stage Card */}
            <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
              {/* Header & View Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Resolution Comparison
                  </span>
                  {hasCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Enhanced
                    </span>
                  )}
                </div>

                {enhancedUrl && (
                  <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setComparisonMode('slider')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                        comparisonMode === 'slider'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <SplitSquareVertical className="w-3 h-3" />
                      Slider
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonMode('side-by-side')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                        comparisonMode === 'side-by-side'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Columns className="w-3 h-3" />
                      Side-by-Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonMode('enhanced')}
                      className={`px-2 py-1 rounded-lg transition ${
                        comparisonMode === 'enhanced'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Enhanced
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonMode('original')}
                      className={`px-2 py-1 rounded-lg transition ${
                        comparisonMode === 'original'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Original
                    </button>
                  </div>
                )}
              </div>

              {/* VIEW MODE 1: Interactive Draggable Split Slider */}
              {comparisonMode === 'slider' && enhancedUrl ? (
                <div className="space-y-2">
                  <div
                    ref={sliderContainerRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className="relative min-h-[320px] max-h-[520px] h-[400px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-[#070a11] rounded-xl overflow-hidden select-none cursor-ew-resize border border-slate-800"
                  >
                    {/* Background Layer: Enhanced (Full Right) */}
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <img
                        src={enhancedUrl}
                        alt="Enhanced"
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                    </div>

                    {/* Foreground Layer: Original (Clipped from left to sliderPosition %) */}
                    <div
                      className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden pointer-events-none"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={originalUrl!}
                        alt="Original"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Draggable Divider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none z-10"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-purple-500 text-[10px] font-bold">
                        ↔
                      </div>
                    </div>

                    {/* Corner Labels */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 backdrop-blur-xs text-[10px] font-bold text-slate-300 z-20 border border-slate-700 pointer-events-none">
                      BEFORE ({origWidth} × {origHeight})
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded bg-purple-900/80 backdrop-blur-xs text-[10px] font-bold text-purple-200 z-20 border border-purple-500/50 pointer-events-none">
                      AFTER ({enhancedWidth} × {enhancedHeight})
                    </div>
                  </div>

                  <p className="text-[11px] text-center text-slate-400">
                    Drag the slider left and right to inspect detail and sharpness enhancements
                  </p>
                </div>
              ) : comparisonMode === 'side-by-side' && enhancedUrl ? (
                /* VIEW MODE 2: Side-by-Side */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Original */}
                  <div className="p-3 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Original (Before)</span>
                      <span className="font-mono text-slate-400">{formatBytes(file.size)}</span>
                    </div>
                    <div className="aspect-square bg-[#070a11] rounded-lg overflow-hidden flex items-center justify-center p-2 border border-slate-800">
                      <img
                        src={originalUrl!}
                        alt="Original"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                      <span>{origWidth} × {origHeight} px</span>
                      <span>1× Baseline</span>
                    </div>
                  </div>

                  {/* Enhanced */}
                  <div className="p-3 rounded-xl bg-[#111827] border border-purple-500/40 space-y-2 shadow-lg shadow-purple-950/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Enhanced (After)
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatBytes(enhancedSize)}
                      </span>
                    </div>
                    <div className="aspect-square bg-[#070a11] rounded-lg overflow-hidden flex items-center justify-center p-2 border border-slate-800">
                      <img
                        src={enhancedUrl}
                        alt="Enhanced"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="text-[11px] font-mono text-purple-300 flex justify-between">
                      <span>{enhancedWidth} × {enhancedHeight} px</span>
                      <span className="font-semibold text-emerald-400">
                        {((enhancedWidth * enhancedHeight) / (origWidth * origHeight)).toFixed(0)}× Resolution
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* VIEW MODE 3: Single Preview Stage (or when not yet processed) */
                <div className="relative min-h-[300px] sm:min-h-[380px] max-h-[500px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-[#070a11] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 p-3">
                  <img
                    src={comparisonMode === 'original' || !enhancedUrl ? originalUrl! : enhancedUrl}
                    alt="Preview"
                    className="max-h-[460px] max-w-full object-contain rounded shadow-lg"
                  />

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-20">
                      <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <div className="text-center space-y-1">
                        <div className="text-sm font-semibold text-purple-300">
                          {processingStatus || 'Enhancing image...'}
                        </div>
                        <p className="text-xs text-slate-400">
                          Applying high-quality scaling, detail synthesis, and noise reduction...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Single mode badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-xs font-mono text-slate-300 border border-slate-700">
                    {comparisonMode === 'original' || !enhancedUrl ? (
                      <span>Original: {origWidth} × {origHeight} px</span>
                    ) : (
                      <span className="text-purple-300">Enhanced: {enhancedWidth} × {enhancedHeight} px</span>
                    )}
                  </div>
                </div>
              )}

              {/* Dimension & File Size Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Original Dimensions</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">
                    {origWidth} × {origHeight} px
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Original File Size</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">
                    {formatBytes(file.size)}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30">
                  <div className="text-[10px] text-purple-300 font-medium">Target Dimensions</div>
                  <div className="text-xs font-mono font-bold text-purple-200 mt-0.5">
                    {targetW} × {targetH} px
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30">
                  <div className="text-[10px] text-purple-300 font-medium">Enhanced File Size</div>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                    {enhancedSize > 0 ? formatBytes(enhancedSize) : estimateOutputSize()}
                  </div>
                </div>
              </div>
            </div>

            {/* Post-Processing Action Box */}
            {hasCompleted && enhancedBlob && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Resolution Enhancement Complete</h4>
                    <p className="text-xs text-slate-300">
                      Output ready ({enhancedWidth} × {enhancedHeight} px • {formatBytes(enhancedSize)})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Enhanced Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: Enhancement Controls (5 Columns) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl max-h-[820px] overflow-y-auto">
            {/* 1. Scale Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Enhancement Scale
                </span>
                <span className="text-xs font-mono text-purple-400 font-semibold">
                  {scaleMode === '2x'
                    ? '2× Upscale (4× pixels)'
                    : scaleMode === '4x'
                    ? '4× Upscale (16× pixels)'
                    : 'Custom Resolution'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScaleMode('2x');
                    setCustomWidth(origWidth * 2);
                    setCustomHeight(origHeight * 2);
                  }}
                  className={`py-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition ${
                    scaleMode === '2x'
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30 font-bold'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-sm">2×</span>
                  <span className="text-[10px] opacity-80">{origWidth * 2}×{origHeight * 2}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScaleMode('4x');
                    setCustomWidth(origWidth * 4);
                    setCustomHeight(origHeight * 4);
                  }}
                  className={`py-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition ${
                    scaleMode === '4x'
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30 font-bold'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-sm">4×</span>
                  <span className="text-[10px] opacity-80">{origWidth * 4}×{origHeight * 4}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScaleMode('custom')}
                  className={`py-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition ${
                    scaleMode === 'custom'
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30 font-bold'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-sm">Custom</span>
                  <span className="text-[10px] opacity-80">Manual W×H</span>
                </button>
              </div>

              {/* Custom Dimensions Form */}
              {scaleMode === 'custom' && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max={MAX_SAFE_DIMENSION}
                        value={customWidth}
                        onChange={(e) => handleCustomWidthChange(Number(e.target.value))}
                        className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max={MAX_SAFE_DIMENSION}
                        value={customHeight}
                        onChange={(e) => handleCustomHeightChange(Number(e.target.value))}
                        className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockAspectRatio}
                      onChange={(e) => setLockAspectRatio(e.target.checked)}
                      className="rounded accent-purple-600 cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      {lockAspectRatio ? <Lock className="w-3 h-3 text-purple-400" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                      Maintain Aspect Ratio ({origWidth}:{origHeight})
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* 2. Quality & Use-Case Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Quality Presets
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {QUALITY_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`p-2 rounded-xl border text-center transition ${
                      selectedPresetId === p.id
                        ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-semibold">{p.name}</div>
                  </button>
                ))}
              </div>

              {/* Use cases pills */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 mb-1.5 block">Use Cases:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {USE_CASE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`px-2 py-1 rounded-lg border text-[11px] font-medium truncate transition ${
                        selectedPresetId === p.id
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title={p.description}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Processing Sliders */}
            <div className="space-y-3.5 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Enhancement Controls
              </span>

              {/* Sharpness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Sharpness</span>
                  <span className="font-mono text-purple-400">{sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sharpness}
                  onChange={(e) => {
                    setSharpness(Number(e.target.value));
                    setSelectedPresetId('');
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Soft</span>
                  <span>Balanced</span>
                  <span>Ultra Sharp</span>
                </div>
              </div>

              {/* Noise Reduction */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Noise Reduction</span>
                  <span className="font-mono text-purple-400">{noiseReduction}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={noiseReduction}
                  onChange={(e) => {
                    setNoiseReduction(Number(e.target.value));
                    setSelectedPresetId('');
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Off</span>
                  <span>Moderate</span>
                  <span>Heavy Smoothing</span>
                </div>
              </div>

              {/* Detail Enhancement */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Detail Enhancement</span>
                  <span className="font-mono text-purple-400">{detailEnhancement}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={detailEnhancement}
                  onChange={(e) => {
                    setDetailEnhancement(Number(e.target.value));
                    setSelectedPresetId('');
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Subtle</span>
                  <span>Micro-Contrast</span>
                  <span>Deep Textures</span>
                </div>
              </div>
            </div>

            {/* 4. Output Settings */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Output Format & Quality
              </span>

              {/* Format selection */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/png', label: 'PNG', hint: 'Lossless' },
                  { id: 'image/jpeg', label: 'JPG', hint: 'Compressed' },
                  { id: 'image/webp', label: 'WEBP', hint: 'Modern' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOutputFormat(f.id as OutputFormat)}
                    className={`py-2 rounded-xl border flex flex-col items-center gap-0.5 transition ${
                      outputFormat === f.id
                        ? 'bg-purple-600 border-purple-500 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-xs">{f.label}</span>
                    <span className="text-[9px] opacity-70">{f.hint}</span>
                  </button>
                ))}
              </div>

              {/* Output Quality Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Output Quality</span>
                  <span className="font-mono text-purple-400">{outputQuality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={outputQuality}
                  onChange={(e) => setOutputQuality(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 5. Execution Action Buttons */}
            <div className="pt-3 space-y-2 border-t border-slate-800">
              <button
                type="button"
                onClick={executeResolutionEnhancement}
                disabled={isProcessing || isTooLarge}
                className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enhancing Image...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-purple-200" />
                    <span>Enhance Resolution</span>
                  </>
                )}
              </button>

              {hasCompleted && enhancedBlob && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow transition"
                >
                  <Download className="w-4 h-4" />
                  Download Enhanced Image ({formatBytes(enhancedSize)})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
