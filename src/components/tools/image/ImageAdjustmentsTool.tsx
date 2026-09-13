import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { ImageComparisonViewer } from './ImageComparisonViewer';
import { downloadBlob, getBaseFileName, applyConvolution } from './imageUtils';
import { Palette, Download, RotateCcw, Sliders, Sparkles } from 'lucide-react';

interface FilterAdjustments {
  brightness: number; // 0% to 200%, default 100
  contrast: number; // 0% to 200%, default 100
  saturation: number; // 0% to 200%, default 100
  exposure: number; // -100 to 100, default 0
  blur: number; // 0 to 15 px, default 0
  grayscale: number; // 0% to 100%, default 0
  sepia: number; // 0% to 100%, default 0
  sharpen: boolean; // boolean
}

const DEFAULT_ADJUSTMENTS: FilterAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  sharpen: false,
};

export const ImageAdjustmentsTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // Filters state
  const [adj, setAdj] = useState<FilterAdjustments>(DEFAULT_ADJUSTMENTS);

  // Processed Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    if (!files || !files[0]) return;
    const f = files[0];
    setFile(f);

    const url = URL.createObjectURL(f);
    setOriginalUrl(url);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      imgRef.current = img;
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
    };
  };

  const applyFiltersToCanvas = () => {
    if (!imgRef.current || origWidth <= 0) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    canvas.width = origWidth;
    canvas.height = origHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Build CSS filter string
      const brightnessCalc = Math.max(0, adj.brightness + adj.exposure);
      const filterStr = `brightness(${brightnessCalc}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%) grayscale(${adj.grayscale}%) sepia(${adj.sepia}%) blur(${adj.blur}px)`;

      ctx.filter = filterStr;
      ctx.drawImage(imgRef.current, 0, 0, origWidth, origHeight);

      // Apply sharpening matrix if enabled
      if (adj.sharpen) {
        ctx.filter = 'none';
        // Sharpen kernel
        const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        applyConvolution(ctx, origWidth, origHeight, sharpenKernel);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          if (processedUrl) URL.revokeObjectURL(processedUrl);
          const newUrl = URL.createObjectURL(blob);
          setProcessedUrl(newUrl);
          setProcessedBlob(blob);
          setProcessedSize(blob.size);
        }
        setIsProcessing(false);
      }, 'image/png');
    }
  };

  useEffect(() => {
    if (file && imgRef.current) {
      applyFiltersToCanvas();
    }
  }, [adj]);

  const updateAdj = (key: keyof FilterAdjustments, val: any) => {
    setAdj((prev) => ({ ...prev, [key]: val }));
  };

  const resetAdjustments = () => {
    setAdj(DEFAULT_ADJUSTMENTS);
  };

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setProcessedBlob(null);
    setOrigWidth(0);
    setOrigHeight(0);
    setProcessedSize(0);
    setAdj(DEFAULT_ADJUSTMENTS);
  };

  const handleDownload = () => {
    if (!processedBlob || !file) return;
    const filename = `${getBaseFileName(file.name)}_adjusted.png`;
    downloadBlob(processedBlob, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Image Adjustments</h3>
            <p className="text-xs text-slate-400">
              Brightness, contrast, saturation, exposure, grayscale, sepia, blur & sharpening filters
            </p>
          </div>
        </div>
        {file && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
        )}
      </div>

      {!file ? (
        <ImageDropzone
          onFilesSelected={handleFiles}
          title="Upload image to adjust colors & filters"
          subtitle="Supports JPG, PNG, WEBP, BMP"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Preview 7 cols */}
          <div className="lg:col-span-7">
            <ImageComparisonViewer
              originalUrl={originalUrl!}
              processedUrl={processedUrl}
              originalWidth={origWidth}
              originalHeight={origHeight}
              originalSize={file.size}
              processedSize={processedSize}
              isProcessing={isProcessing}
              formatName="Adjusted Output"
            />
          </div>

          {/* Right: Controls 5 cols */}
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl max-h-[750px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Adjustment Sliders
              </span>
              <button
                type="button"
                onClick={resetAdjustments}
                className="text-xs text-purple-400 hover:text-purple-300 transition"
              >
                Reset Sliders
              </button>
            </div>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Brightness</span>
                <span className="font-mono text-purple-400">{adj.brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="180"
                value={adj.brightness}
                onChange={(e) => updateAdj('brightness', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Contrast</span>
                <span className="font-mono text-purple-400">{adj.contrast}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                value={adj.contrast}
                onChange={(e) => updateAdj('contrast', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Saturation</span>
                <span className="font-mono text-purple-400">{adj.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adj.saturation}
                onChange={(e) => updateAdj('saturation', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Exposure */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Exposure</span>
                <span className="font-mono text-purple-400">
                  {adj.exposure > 0 ? `+${adj.exposure}` : adj.exposure}
                </span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={adj.exposure}
                onChange={(e) => updateAdj('exposure', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Blur</span>
                <span className="font-mono text-purple-400">{adj.blur} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={adj.blur}
                onChange={(e) => updateAdj('blur', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Grayscale */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Grayscale</span>
                <span className="font-mono text-purple-400">{adj.grayscale}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adj.grayscale}
                onChange={(e) => updateAdj('grayscale', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Sepia */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Sepia</span>
                <span className="font-mono text-purple-400">{adj.sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adj.sepia}
                onChange={(e) => updateAdj('sepia', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Sharpen Toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Sharpen Details</span>
                <span className="text-[11px] text-slate-400">High-pass detail enhance</span>
              </div>
              <button
                type="button"
                onClick={() => updateAdj('sharpen', !adj.sharpen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  adj.sharpen
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {adj.sharpen ? 'Enabled' : 'Off'}
              </button>
            </div>

            {/* Quick Mood Presets */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 mb-2 block">
                Quick Filters
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setAdj({
                      ...DEFAULT_ADJUSTMENTS,
                      contrast: 130,
                      saturation: 130,
                      exposure: 5,
                    })
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 text-center"
                >
                  Vivid Pop
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAdj({
                      ...DEFAULT_ADJUSTMENTS,
                      grayscale: 100,
                      contrast: 125,
                    })
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 text-center"
                >
                  B&W Drama
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAdj({
                      ...DEFAULT_ADJUSTMENTS,
                      sepia: 70,
                      contrast: 95,
                      brightness: 95,
                    })
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 text-center"
                >
                  Warm Vintage
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!processedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Adjusted Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
