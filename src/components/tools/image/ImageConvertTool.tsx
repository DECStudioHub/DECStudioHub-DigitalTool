import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { ImageComparisonViewer } from './ImageComparisonViewer';
import { formatBytes, downloadBlob, getBaseFileName } from './imageUtils';
import { RefreshCw, Download, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface FormatOption {
  id: 'image/webp' | 'image/jpeg' | 'image/png';
  ext: string;
  name: string;
  badge: string;
  supportsAlpha: boolean;
  desc: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'image/webp',
    ext: 'webp',
    name: 'WEBP',
    badge: 'Modern & Compact',
    supportsAlpha: true,
    desc: 'Google modern format. Great compression with full transparency support.',
  },
  {
    id: 'image/jpeg',
    ext: 'jpg',
    name: 'JPG / JPEG',
    badge: 'Universal',
    supportsAlpha: false,
    desc: 'Universal photo compatibility. Replaces transparent areas with background color.',
  },
  {
    id: 'image/png',
    ext: 'png',
    name: 'PNG',
    badge: 'Lossless & Alpha',
    supportsAlpha: true,
    desc: 'Crisp pixel-perfect lossless compression with alpha transparency channel.',
  },
];

export const ImageConvertTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // Conversion controls
  const [targetFormat, setTargetFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [quality, setQuality] = useState<number>(90);
  const [fillBgColor, setFillBgColor] = useState<string>('#ffffff');

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

      // Default smart target format
      if (f.type === 'image/jpeg') {
        setTargetFormat('image/webp');
      } else if (f.type === 'image/png') {
        setTargetFormat('image/webp');
      } else {
        setTargetFormat('image/jpeg');
      }
    };
  };

  const convertImage = () => {
    if (!imgRef.current || origWidth <= 0) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    canvas.width = origWidth;
    canvas.height = origHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // For JPEG, fill non-alpha background
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = fillBgColor;
        ctx.fillRect(0, 0, origWidth, origHeight);
      }

      ctx.drawImage(imgRef.current, 0, 0, origWidth, origHeight);

      const q = targetFormat === 'image/png' ? undefined : quality / 100;
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
        targetFormat,
        q
      );
    }
  };

  useEffect(() => {
    if (file && imgRef.current) {
      convertImage();
    }
  }, [targetFormat, quality, fillBgColor]);

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
    const activeOpt = FORMAT_OPTIONS.find((f) => f.id === targetFormat);
    const ext = activeOpt ? activeOpt.ext : 'webp';
    const filename = `${getBaseFileName(file.name)}.${ext}`;
    downloadBlob(processedBlob, filename);
  };

  const currentOpt = FORMAT_OPTIONS.find((f) => f.id === targetFormat);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Convert Image</h3>
            <p className="text-xs text-slate-400">
              Transform image format between JPG, PNG, and modern WEBP offline in your browser
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
          title="Choose image to convert format"
          subtitle="Supports JPG, JPEG, PNG, WEBP, BMP, GIF, SVG"
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
              formatName={`Converted (${currentOpt?.name})`}
            />
          </div>

          {/* Right Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-5 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Format Selection
              </span>
            </div>

            {/* Target format cards */}
            <div className="space-y-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTargetFormat(opt.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between ${
                    targetFormat === opt.id
                      ? 'bg-purple-600/10 border-purple-500/60 ring-1 ring-purple-500/40'
                      : 'bg-[#0f1422] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{opt.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{opt.desc}</p>
                  </div>
                  {targetFormat === opt.id && (
                    <div className="p-1 rounded-full bg-purple-500 text-white shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Quality Slider (For lossy formats like WebP / JPEG) */}
            {targetFormat !== 'image/png' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Encoding Quality</span>
                  <span className="font-mono text-purple-400 font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            )}

            {/* Background Color Fill for JPEG (No alpha) */}
            {targetFormat === 'image/jpeg' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>JPEG does not support transparency</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Transparent area background:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fillBgColor}
                      onChange={(e) => setFillBgColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-[11px] text-slate-400">{fillBgColor}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Download Action */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!processedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download as {currentOpt?.ext.toUpperCase()}
              </button>

              <div className="text-center text-[11px] text-slate-400 font-mono">
                {file.name} ({formatBytes(file.size)}) → {currentOpt?.ext.toUpperCase()} ({formatBytes(processedSize)})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
