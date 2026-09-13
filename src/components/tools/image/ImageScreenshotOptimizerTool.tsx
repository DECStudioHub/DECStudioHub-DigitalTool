import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { ImageComparisonViewer } from './ImageComparisonViewer';
import { formatBytes, downloadBlob, getBaseFileName } from './imageUtils';
import { Camera, Download, RotateCcw, Sparkles, Monitor, Square, Layers } from 'lucide-react';

const GRADIENT_PRESETS = [
  { name: 'Sunset', from: '#f43f5e', to: '#fb923c' },
  { name: 'Violet', from: '#8b5cf6', to: '#d946ef' },
  { name: 'Ocean', from: '#0ea5e9', to: '#10b981' },
  { name: 'Dark Slate', from: '#1e293b', to: '#0f172a' },
  { name: 'Transparent', from: 'transparent', to: 'transparent' },
];

export const ImageScreenshotOptimizerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // Optimizer Settings
  const [padding, setPadding] = useState<number>(40); // px canvas padding around screenshot
  const [borderRadius, setBorderRadius] = useState<number>(14); // px
  const [shadowLevel, setShadowLevel] = useState<'none' | 'soft' | 'dramatic'>('dramatic');
  const [windowHeader, setWindowHeader] = useState<boolean>(true); // macOS dots bar
  const [bgStyle, setBgStyle] = useState<number>(1); // index in GRADIENT_PRESETS

  // Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [outWidth, setOutWidth] = useState<number>(0);
  const [outHeight, setOutHeight] = useState<number>(0);
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

  const renderOptimized = () => {
    if (!imgRef.current || origWidth <= 0) return;
    setIsProcessing(true);

    const titleBarHeight = windowHeader ? 36 : 0;
    const contentW = origWidth;
    const contentH = origHeight + titleBarHeight;

    const totalW = contentW + padding * 2;
    const totalH = contentH + padding * 2;

    setOutWidth(totalW);
    setOutHeight(totalH);

    const canvas = document.createElement('canvas');
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Draw outer gradient background if not transparent
      const preset = GRADIENT_PRESETS[bgStyle];
      if (preset.from !== 'transparent') {
        const grad = ctx.createLinearGradient(0, 0, totalW, totalH);
        grad.addColorStop(0, preset.from);
        grad.addColorStop(1, preset.to);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, totalW, totalH);
      } else {
        ctx.clearRect(0, 0, totalW, totalH);
      }

      // 2. Draw shadow behind inner card
      ctx.save();
      if (shadowLevel === 'soft') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 12;
      } else if (shadowLevel === 'dramatic') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 48;
        ctx.shadowOffsetY = 20;
      }

      // Rounded clip path for the screenshot card
      const cardX = padding;
      const cardY = padding;
      const r = borderRadius;

      // Draw background shape for shadow
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, contentW, contentH, r);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.restore();

      // 3. Clip and draw screenshot content inside rounded rect
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, contentW, contentH, r);
      ctx.clip();

      // Window header
      if (windowHeader) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cardX, cardY, contentW, titleBarHeight);

        // macOS Window buttons
        const dotY = cardY + titleBarHeight / 2;
        const dotRadius = 5.5;

        // Red
        ctx.beginPath();
        ctx.arc(cardX + 18, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // Yellow
        ctx.beginPath();
        ctx.arc(cardX + 36, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        // Green
        ctx.beginPath();
        ctx.arc(cardX + 54, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      }

      // Draw image
      ctx.drawImage(imgRef.current, cardX, cardY + titleBarHeight, origWidth, origHeight);

      // Subtle 1px border around card
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, contentW, contentH, r);
      ctx.stroke();

      ctx.restore();

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
      renderOptimized();
    }
  }, [padding, borderRadius, shadowLevel, windowHeader, bgStyle]);

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
  };

  const handleDownload = () => {
    if (!processedBlob || !file) return;
    const filename = `${getBaseFileName(file.name)}_showcase.png`;
    downloadBlob(processedBlob, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Screenshot / Image Optimizer</h3>
            <p className="text-xs text-slate-400">
              Turn raw screenshots and UI mockups into presentation-ready visuals with window frames and shadows
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
          title="Upload screenshot or UI capture"
          subtitle="Supports PNG, JPG, WEBP"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Preview: 7 cols */}
          <div className="lg:col-span-7">
            <ImageComparisonViewer
              originalUrl={originalUrl!}
              processedUrl={processedUrl}
              originalWidth={origWidth}
              originalHeight={origHeight}
              originalSize={file.size}
              processedWidth={outWidth}
              processedHeight={outHeight}
              processedSize={processedSize}
              isProcessing={isProcessing}
              formatName="Optimized Showcase"
            />
          </div>

          {/* Right Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl max-h-[750px] overflow-y-auto">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Showcase Controls
              </span>
            </div>

            {/* Window Header Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-white">macOS Window Bar</span>
              </div>
              <button
                type="button"
                onClick={() => setWindowHeader(!windowHeader)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  windowHeader
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {windowHeader ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Background Canvas Presets */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Backdrop Style</span>
              <div className="grid grid-cols-5 gap-2">
                {GRADIENT_PRESETS.map((p, idx) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setBgStyle(idx)}
                    style={{
                      background:
                        p.from === 'transparent'
                          ? 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 8px 8px'
                          : `linear-gradient(135deg, ${p.from}, ${p.to})`,
                    }}
                    className={`h-9 rounded-xl border-2 transition ${
                      bgStyle === idx ? 'border-white scale-105 shadow' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            {/* Outer Padding */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Canvas Padding</span>
                <span className="font-mono text-purple-400">{padding} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Corner Rounding</span>
                <span className="font-mono text-purple-400">{borderRadius} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Shadow Level */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Card Shadow</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'soft', label: 'Soft' },
                  { id: 'dramatic', label: 'Dramatic' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShadowLevel(s.id as any)}
                    className={`py-2 rounded-xl text-xs font-medium transition ${
                      shadowLevel === s.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!processedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Showcase PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
