import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { ImageComparisonViewer } from './ImageComparisonViewer';
import { formatBytes, downloadBlob, getBaseFileName } from './imageUtils';
import { Lock, Unlock, Download, RotateCcw, Scaling, Sparkles } from 'lucide-react';

interface Preset {
  name: string;
  w: number;
  h: number;
  category?: string;
}

const PRESETS: Preset[] = [
  { name: 'Thumbnail', w: 150, h: 150 },
  { name: 'Profile Picture', w: 400, h: 400 },
  { name: 'Social Media', w: 1080, h: 1080 },
  { name: 'Facebook Cover', w: 820, h: 312 },
  { name: 'Instagram Story', w: 1080, h: 1920 },
  { name: 'YouTube Thumbnail', w: 1280, h: 720 },
  { name: 'Website Banner', w: 1920, h: 1080 },
];

export const ImageResizeTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // Resize state
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/webp');
  const [quality, setQuality] = useState<number>(90);

  // Processed output
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
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
    };
  };

  const handleWidthChange = (w: number) => {
    const validW = Math.max(1, w);
    setTargetWidth(validW);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      setTargetHeight(Math.round(validW * (origHeight / origWidth)));
    }
  };

  const handleHeightChange = (h: number) => {
    const validH = Math.max(1, h);
    setTargetHeight(validH);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      setTargetWidth(Math.round(validH * (origWidth / origHeight)));
    }
  };

  const applyScalePercentage = (pct: number) => {
    if (!origWidth || !origHeight) return;
    const factor = pct / 100;
    setTargetWidth(Math.round(origWidth * factor));
    setTargetHeight(Math.round(origHeight * factor));
  };

  const applyPreset = (preset: Preset) => {
    setLockAspect(false);
    setTargetWidth(preset.w);
    setTargetHeight(preset.h);
  };

  const renderResized = () => {
    if (!imgRef.current || targetWidth <= 0 || targetHeight <= 0) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If converting to JPEG, fill background with white
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(imgRef.current, 0, 0, targetWidth, targetHeight);

      const q = format === 'image/png' ? undefined : quality / 100;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (processedUrl) URL.revokeObjectURL(processedUrl);
            const newUrl = URL.createObjectURL(blob);
            setProcessedUrl(newUrl);
            setProcessedBlob(blob);
            setProcessedSize(blob.size);
          }
          setIsProcessing(false);
        },
        format,
        q
      );
    }
  };

  useEffect(() => {
    if (file && targetWidth > 0 && targetHeight > 0) {
      renderResized();
    }
  }, [targetWidth, targetHeight, format, quality]);

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setProcessedBlob(null);
    setOrigWidth(0);
    setOrigHeight(0);
    setTargetWidth(0);
    setTargetHeight(0);
    setProcessedSize(0);
  };

  const handleDownload = () => {
    if (!processedBlob || !file) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const filename = `${getBaseFileName(file.name)}_resized_${targetWidth}x${targetHeight}.${ext}`;
    downloadBlob(processedBlob, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Scaling className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Resize Image</h3>
            <p className="text-xs text-slate-400">
              Custom dimensions, aspect ratio lock, percentage scaling & standard social media presets
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
        <ImageDropzone onFilesSelected={handleFiles} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Preview: 7 cols */}
          <div className="lg:col-span-7">
            <ImageComparisonViewer
              originalUrl={originalUrl!}
              processedUrl={processedUrl}
              originalWidth={origWidth}
              originalHeight={origHeight}
              originalSize={file.size}
              processedWidth={targetWidth}
              processedHeight={targetHeight}
              processedSize={processedSize}
              isProcessing={isProcessing}
              formatName="Resized Output"
            />
          </div>

          {/* Right Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-5 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resize Settings
              </span>
              <button
                type="button"
                onClick={() => setLockAspect(!lockAspect)}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-purple-400 transition"
              >
                {lockAspect ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Ratio Locked</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ratio Free</span>
                  </>
                )}
              </button>
            </div>

            {/* Dimension Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Percentage Scale */}
            <div>
              <span className="text-xs font-medium text-slate-300 mb-2 block">
                Percentage Scale
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyScalePercentage(pct)}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-xs font-mono transition"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Social & Standard Presets */}
            <div>
              <span className="text-xs font-medium text-slate-300 mb-2 block">
                Size Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 text-left transition"
                  >
                    <div className="text-xs font-semibold text-slate-200 truncate">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {p.w} × {p.h} px
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format & Quality */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">Format & Quality</span>
                <span className="font-mono text-purple-400">{quality}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/webp', label: 'WEBP' },
                  { id: 'image/jpeg', label: 'JPEG' },
                  { id: 'image/png', label: 'PNG' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition ${
                      format === f.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {format !== 'image/png' && (
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!processedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Resized Image
              </button>

              <div className="text-center text-[11px] text-slate-400 font-mono">
                {origWidth}×{origHeight} ({formatBytes(file.size)}) → {targetWidth}×{targetHeight} ({formatBytes(processedSize)})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
