import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { ImageComparisonViewer } from './ImageComparisonViewer';
import { downloadBlob, getBaseFileName } from './imageUtils';
import { Layers, Download, RotateCcw, Palette, Wand2, Pipette, Check } from 'lucide-react';

type BgMode = 'color-to-alpha' | 'fill-solid' | 'fill-gradient';

const COLOR_PRESETS = [
  '#ffffff',
  '#000000',
  '#f3f4f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#10b981',
  '#f59e0b',
];

export const ImageBackgroundTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  const [mode, setMode] = useState<BgMode>('fill-solid');

  // Solid background
  const [solidColor, setSolidColor] = useState<string>('#ffffff');

  // Gradient background
  const [gradStart, setGradStart] = useState<string>('#6366f1');
  const [gradEnd, setGradEnd] = useState<string>('#ec4899');
  const [gradAngle, setGradAngle] = useState<number>(135);

  // Color keying / Remove background color (e.g. white product background removal)
  const [keyColor, setKeyColor] = useState<string>('#ffffff');
  const [tolerance, setTolerance] = useState<number>(30); // 0 to 100

  // Output
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

  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const processBackground = () => {
    if (!imgRef.current || origWidth <= 0) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    canvas.width = origWidth;
    canvas.height = origHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      if (mode === 'fill-solid') {
        // Draw solid background underneath
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, origWidth, origHeight);
        ctx.drawImage(imgRef.current, 0, 0, origWidth, origHeight);
      } else if (mode === 'fill-gradient') {
        // Draw gradient background underneath
        const rad = (gradAngle * Math.PI) / 180;
        const x1 = Math.round(origWidth / 2 - Math.cos(rad) * (origWidth / 2));
        const y1 = Math.round(origHeight / 2 - Math.sin(rad) * (origHeight / 2));
        const x2 = Math.round(origWidth / 2 + Math.cos(rad) * (origWidth / 2));
        const y2 = Math.round(origHeight / 2 + Math.sin(rad) * (origHeight / 2));

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, gradStart);
        grad.addColorStop(1, gradEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, origWidth, origHeight);
        ctx.drawImage(imgRef.current, 0, 0, origWidth, origHeight);
      } else if (mode === 'color-to-alpha') {
        // Chroma key: remove matching color by turning it transparent
        ctx.drawImage(imgRef.current, 0, 0, origWidth, origHeight);
        const imgData = ctx.getImageData(0, 0, origWidth, origHeight);
        const data = imgData.data;
        const targetRgb = hexToRgb(keyColor);
        const tol = (tolerance / 100) * 441.67; // max Euclidean dist in RGB is sqrt(255^2*3) ≈ 441.67

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt(
            (r - targetRgb.r) ** 2 +
              (g - targetRgb.g) ** 2 +
              (b - targetRgb.b) ** 2
          );

          if (dist <= tol) {
            // Smooth edge feathering
            const alphaFactor = dist / Math.max(1, tol);
            data[i + 3] = Math.round(data[i + 3] * Math.pow(alphaFactor, 2));
          }
        }
        ctx.putImageData(imgData, 0, 0);
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
      processBackground();
    }
  }, [mode, solidColor, gradStart, gradEnd, gradAngle, keyColor, tolerance]);

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
    const filename = `${getBaseFileName(file.name)}_bg_${mode}.png`;
    downloadBlob(processedBlob, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Image Background Tool</h3>
            <p className="text-xs text-slate-400">
              Fill transparent areas with solid colors or gradients, or make solid background colors transparent
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
          title="Upload image to modify background"
          subtitle="Supports PNG, WEBP, JPG (Processed directly in browser)"
        />
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
              processedSize={processedSize}
              isProcessing={isProcessing}
              formatName={
                mode === 'color-to-alpha'
                  ? 'Transparent Cutout'
                  : mode === 'fill-gradient'
                  ? 'Gradient Background'
                  : 'Solid Background'
              }
            />
          </div>

          {/* Right Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl max-h-[750px] overflow-y-auto">
            {/* Mode selection tabs */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Operation Mode
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('fill-solid')}
                  className={`py-2 px-1 rounded-lg font-medium text-center transition ${
                    mode === 'fill-solid'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Solid Fill
                </button>
                <button
                  type="button"
                  onClick={() => setMode('fill-gradient')}
                  className={`py-2 px-1 rounded-lg font-medium text-center transition ${
                    mode === 'fill-gradient'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Gradient
                </button>
                <button
                  type="button"
                  onClick={() => setMode('color-to-alpha')}
                  className={`py-2 px-1 rounded-lg font-medium text-center transition ${
                    mode === 'color-to-alpha'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Remove Color
                </button>
              </div>
            </div>

            {/* Mode 1: Solid Color Fill */}
            {mode === 'fill-solid' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Choose Background Color
                  </label>
                  <div className="flex items-center gap-3 bg-[#0b0f19] border border-slate-700 rounded-xl p-2">
                    <input
                      type="color"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      className="bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 mb-1.5 block">Quick Swatches</span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setSolidColor(hex)}
                        style={{ backgroundColor: hex }}
                        className={`w-7 h-7 rounded-lg border-2 transition ${
                          solidColor.toLowerCase() === hex.toLowerCase()
                            ? 'border-purple-500 scale-110 shadow'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Gradient Fill */}
            {mode === 'fill-gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Start Color
                    </label>
                    <div className="flex items-center gap-2 bg-[#0b0f19] border border-slate-700 rounded-xl p-1.5">
                      <input
                        type="color"
                        value={gradStart}
                        onChange={(e) => setGradStart(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">{gradStart}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      End Color
                    </label>
                    <div className="flex items-center gap-2 bg-[#0b0f19] border border-slate-700 rounded-xl p-1.5">
                      <input
                        type="color"
                        value={gradEnd}
                        onChange={(e) => setGradEnd(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">{gradEnd}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Gradient Angle</span>
                    <span className="font-mono text-purple-400">{gradAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradAngle}
                    onChange={(e) => setGradAngle(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Mode 3: Remove solid background color (Color to Alpha) */}
            {mode === 'color-to-alpha' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 leading-relaxed">
                  Key out solid backgrounds (such as plain white studio backgrounds on product photos)
                  into transparent PNGs.
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Color to make transparent
                  </label>
                  <div className="flex items-center gap-3 bg-[#0b0f19] border border-slate-700 rounded-xl p-2">
                    <input
                      type="color"
                      value={keyColor}
                      onChange={(e) => setKeyColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={keyColor}
                      onChange={(e) => setKeyColor(e.target.value)}
                      className="bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                    />
                    <div className="flex gap-1 ml-auto">
                      <button
                        type="button"
                        onClick={() => setKeyColor('#ffffff')}
                        className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300"
                      >
                        White
                      </button>
                      <button
                        type="button"
                        onClick={() => setKeyColor('#000000')}
                        className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300"
                      >
                        Black
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Color Matching Tolerance</span>
                    <span className="font-mono text-purple-400">{tolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="80"
                    value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Strict Match</span>
                    <span>Broad Match (Removes near-colors)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={processBackground}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                Re-apply Background Effect
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!processedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
