import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, downloadBlob, getBaseFileName } from './imageUtils';
import { Crop, Download, RotateCcw, Check, Sparkles, Move, Maximize2 } from 'lucide-react';

interface AspectRatioPreset {
  id: string;
  name: string;
  ratio: number | null; // width / height or null for free
}

const CROP_PRESETS: AspectRatioPreset[] = [
  { id: 'free', name: 'Free Crop', ratio: null },
  { id: '1:1', name: 'Square 1:1', ratio: 1 },
  { id: '16:9', name: 'Widescreen 16:9', ratio: 16 / 9 },
  { id: '4:3', name: 'Standard 4:3', ratio: 4 / 3 },
  { id: '3:2', name: 'Photo 3:2', ratio: 3 / 2 },
  { id: '9:16', name: 'Story / Reel 9:16', ratio: 9 / 16 },
];

export const ImageCropTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);

  // Crop rectangle in natural image pixels
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropW, setCropW] = useState<number>(0);
  const [cropH, setCropH] = useState<number>(0);
  const [selectedRatio, setSelectedRatio] = useState<string>('free');

  // Processed Output
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedSize, setCroppedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setImgWidth(w);
      setImgHeight(h);

      // Default crop to central 80%
      const cw = Math.round(w * 0.8);
      const ch = Math.round(h * 0.8);
      const cx = Math.round((w - cw) / 2);
      const cy = Math.round((h - ch) / 2);
      setCropX(cx);
      setCropY(cy);
      setCropW(cw);
      setCropH(ch);
    };
  };

  const applyPreset = (preset: AspectRatioPreset) => {
    setSelectedRatio(preset.id);
    if (!imgWidth || !imgHeight) return;

    if (preset.ratio === null) {
      return; // Free crop
    }

    const r = preset.ratio;
    let newW = cropW;
    let newH = Math.round(newW / r);

    if (newH > imgHeight) {
      newH = imgHeight;
      newW = Math.round(newH * r);
    }
    if (newW > imgWidth) {
      newW = imgWidth;
      newH = Math.round(newW / r);
    }

    const newX = Math.max(0, Math.min(cropX, imgWidth - newW));
    const newY = Math.max(0, Math.min(cropY, imgHeight - newH));

    setCropW(newW);
    setCropH(newH);
    setCropX(newX);
    setCropY(newY);
  };

  const handleWidthSlider = (newW: number) => {
    const validW = Math.max(20, Math.min(newW, imgWidth - cropX));
    setCropW(validW);

    const preset = CROP_PRESETS.find((p) => p.id === selectedRatio);
    if (preset && preset.ratio !== null) {
      const validH = Math.round(validW / preset.ratio);
      if (cropY + validH <= imgHeight) {
        setCropH(validH);
      }
    }
  };

  const handleHeightSlider = (newH: number) => {
    const validH = Math.max(20, Math.min(newH, imgHeight - cropY));
    setCropH(validH);

    const preset = CROP_PRESETS.find((p) => p.id === selectedRatio);
    if (preset && preset.ratio !== null) {
      const validW = Math.round(validH * preset.ratio);
      if (cropX + validW <= imgWidth) {
        setCropW(validW);
      }
    }
  };

  const executeCrop = () => {
    if (!imgRef.current || cropW <= 0 || cropH <= 0) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgRef.current, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      canvas.toBlob((blob) => {
        if (blob) {
          if (croppedUrl) URL.revokeObjectURL(croppedUrl);
          const newUrl = URL.createObjectURL(blob);
          setCroppedUrl(newUrl);
          setCroppedBlob(blob);
          setCroppedSize(blob.size);
        }
        setIsProcessing(false);
      }, 'image/png');
    }
  };

  useEffect(() => {
    if (file && imgRef.current && cropW > 0 && cropH > 0) {
      executeCrop();
    }
  }, [cropX, cropY, cropW, cropH]);

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setFile(null);
    setOriginalUrl(null);
    setCroppedUrl(null);
    setCroppedBlob(null);
    setImgWidth(0);
    setImgHeight(0);
    setCropX(0);
    setCropY(0);
    setCropW(0);
    setCropH(0);
    setCroppedSize(0);
  };

  const handleDownload = () => {
    if (!croppedBlob || !file) return;
    const filename = `${getBaseFileName(file.name)}_cropped_${cropW}x${cropH}.png`;
    downloadBlob(croppedBlob, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Crop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Crop Image</h3>
            <p className="text-xs text-slate-400">
              Crop freely or use fixed aspect ratios (1:1, 16:9, 4:3, 9:16) with pixel precision
            </p>
          </div>
        </div>
        {file && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {!file ? (
        <ImageDropzone
          onFilesSelected={handleFiles}
          title="Upload image to crop"
          subtitle="Supports JPG, PNG, WEBP, BMP"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Visual Crop Stage: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-slate-300">Visual Crop Area</span>
                <span className="font-mono text-purple-400">
                  {cropW} × {cropH} px (X: {cropX}, Y: {cropY})
                </span>
              </div>

              {/* Crop Stage with dim overlay */}
              <div
                ref={containerRef}
                className="relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-[#070a11] rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] border border-slate-800/80 p-2"
              >
                <div className="relative inline-block max-h-[460px]">
                  <img
                    src={originalUrl!}
                    alt="Original for cropping"
                    className="max-h-[460px] max-w-full object-contain block select-none pointer-events-none"
                  />

                  {/* Visual Crop Box Overlay calculated from percentages */}
                  {imgWidth > 0 && imgHeight > 0 && (
                    <div
                      style={{
                        left: `${(cropX / imgWidth) * 100}%`,
                        top: `${(cropY / imgHeight) * 100}%`,
                        width: `${(cropW / imgWidth) * 100}%`,
                        height: `${(cropH / imgHeight) * 100}%`,
                      }}
                      className="absolute border-2 border-purple-400 bg-purple-500/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none transition-all duration-75"
                    >
                      {/* Grid lines inside crop */}
                      <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none">
                        <div className="border-r border-b border-white/25"></div>
                        <div className="border-r border-b border-white/25"></div>
                        <div className="border-b border-white/25"></div>
                        <div className="border-r border-b border-white/25"></div>
                        <div className="border-r border-b border-white/25"></div>
                        <div className="border-b border-white/25"></div>
                        <div className="border-r border-white/25"></div>
                        <div className="border-r border-white/25"></div>
                        <div></div>
                      </div>

                      {/* Corner markers */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-purple-600"></div>
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-purple-600"></div>
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-purple-600"></div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-purple-600"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cropped Output Preview Card */}
            {croppedUrl && (
              <div className="p-4 rounded-2xl bg-[#0f1422] border border-purple-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 rounded-lg bg-black/60 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img
                      src={croppedUrl}
                      alt="Cropped thumbnail"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Cropped Result</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      {cropW} × {cropH} px • {formatBytes(croppedSize)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Crop Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-5 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
                Aspect Ratio Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CROP_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium text-center transition ${
                      selectedRatio === preset.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Position and Size Sliders */}
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block">
                Adjust Crop Position & Dimensions
              </span>

              {/* Crop Width */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Crop Width</span>
                  <span className="font-mono text-purple-400">{cropW} px</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max={imgWidth - cropX}
                  value={cropW}
                  onChange={(e) => handleWidthSlider(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Crop Height */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Crop Height</span>
                  <span className="font-mono text-purple-400">{cropH} px</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max={imgHeight - cropY}
                  value={cropH}
                  onChange={(e) => handleHeightSlider(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Offset X */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Position X (Horizontal)</span>
                  <span className="font-mono text-slate-300">{cropX} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, imgWidth - cropW)}
                  value={cropX}
                  onChange={(e) => setCropX(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Offset Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Position Y (Vertical)</span>
                  <span className="font-mono text-slate-300">{cropY} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, imgHeight - cropH)}
                  value={cropY}
                  onChange={(e) => setCropY(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Alignment helpers */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-medium text-slate-400 mb-2 block">
                Center & Fill Helpers
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCropX(Math.round((imgWidth - cropW) / 2));
                    setCropY(Math.round((imgHeight - cropH) / 2));
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  Center Crop Box
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCropX(0);
                    setCropY(0);
                    setCropW(imgWidth);
                    setCropH(imgHeight);
                    setSelectedRatio('free');
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  Reset to Full
                </button>
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={executeCrop}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                Apply Crop
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!croppedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Cropped Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
