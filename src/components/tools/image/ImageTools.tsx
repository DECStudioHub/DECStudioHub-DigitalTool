import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, Upload, Download, RotateCcw, Lock, Unlock, Check, Sparkles } from 'lucide-react';

export const ImageTools: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [originalSizeKb, setOriginalSizeKb] = useState<number>(0);

  // Resize controls
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // Quality & Format
  const [quality, setQuality] = useState<number>(85);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');

  // Processed Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSizeKb, setProcessedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    setFile(selectedFile);
    setOriginalSizeKb(Math.round(selectedFile.size / 1024));

    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      imgRef.current = img;
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Aspect ratio handlers
  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspectRatio && originalWidth > 0 && originalHeight > 0) {
      const ratio = originalHeight / originalWidth;
      setTargetHeight(Math.round(w * ratio));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspectRatio && originalWidth > 0 && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setTargetWidth(Math.round(h * ratio));
    }
  };

  const setScalePreset = (scaleFraction: number) => {
    if (originalWidth > 0 && originalHeight > 0) {
      setTargetWidth(Math.round(originalWidth * scaleFraction));
      setTargetHeight(Math.round(originalHeight * scaleFraction));
    }
  };

  // Process image using HTML5 Canvas
  useEffect(() => {
    if (!imgRef.current || targetWidth <= 0 || targetHeight <= 0) return;

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // High-quality bicubic smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgRef.current, 0, 0, targetWidth, targetHeight);

      const mimeType = format;
      const q = format === 'image/png' ? undefined : quality / 100;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (processedUrl) URL.revokeObjectURL(processedUrl);
            const newUrl = URL.createObjectURL(blob);
            setProcessedUrl(newUrl);
            setProcessedSizeKb(Math.round(blob.size / 1024));
          }
          setIsProcessing(false);
        },
        mimeType,
        q
      );
    }
  }, [targetWidth, targetHeight, quality, format, file]);

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setTargetWidth(0);
    setTargetHeight(0);
    setProcessedSizeKb(0);
  };

  const downloadProcessed = () => {
    if (!processedUrl || !file) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `${baseName}_decstudiohub.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const percentSaved =
    originalSizeKb > 0 && processedSizeKb > 0
      ? Math.round(((originalSizeKb - processedSizeKb) / originalSizeKb) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Client-Side Image Studio (Resize, Compress & Convert)</h3>
            <p className="text-xs text-slate-400">100% private in-browser optimization — your photos never leave your device</p>
          </div>
        </div>
        {file && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Image
          </button>
        )}
      </div>

      {!file ? (
        /* Upload Drag & Drop Box */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-[#111827]/60 hover:bg-[#111827] rounded-3xl p-12 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-4"
        >
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-white">
              Drag and drop your image here, or <span className="text-purple-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports JPEG, PNG, WEBP, GIF, SVG, BMP (Processed locally in your browser memory)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        /* Optimization Studio */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Optimization Settings
              </h4>

              {/* Format selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'WEBP (Best)', val: 'image/webp' },
                    { label: 'JPEG (Photo)', val: 'image/jpeg' },
                    { label: 'PNG (Lossless)', val: 'image/png' },
                  ].map((fmt) => (
                    <button
                      key={fmt.val}
                      onClick={() => setFormat(fmt.val as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition ${
                        format === fmt.val
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider */}
              {format !== 'image/png' && (
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-medium text-slate-300">Compression Quality</span>
                    <span className="font-mono text-purple-400 font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Smallest File</span>
                    <span>Balanced</span>
                    <span>High Fidelity</span>
                  </div>
                </div>
              )}

              {/* Resize dimensions */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Dimensions (Pixels)</span>
                  <button
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-purple-300"
                  >
                    {lockAspectRatio ? (
                      <>
                        <Lock className="w-3 h-3 text-purple-400" />
                        <span>Ratio Locked</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 text-slate-500" />
                        <span>Ratio Free</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Scale presets */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 mr-1">Scale:</span>
                  {[0.25, 0.5, 0.75, 1.0].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setScalePreset(scale)}
                      className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition"
                    >
                      {scale * 100}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Action */}
              <button
                onClick={downloadProcessed}
                disabled={!processedUrl || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Optimized Image
              </button>
            </div>

            {/* Live Comparison Previews */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Original Photo</span>
                    <span className="text-xs font-mono text-slate-400">{originalSizeKb} KB</span>
                  </div>
                  <div className="aspect-video bg-[#0b0f19] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80">
                    {originalUrl && (
                      <img
                        src={originalUrl}
                        alt="Original"
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400 font-mono flex justify-between">
                  <span>{originalWidth} × {originalHeight} px</span>
                  <span className="uppercase">{file.type.replace('image/', '')}</span>
                </div>
              </div>

              {/* Processed */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-purple-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Optimized Output
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {processedSizeKb} KB
                    </span>
                  </div>
                  <div className="aspect-video bg-[#0b0f19] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 relative">
                    {processedUrl && (
                      <img
                        src={processedUrl}
                        alt="Processed"
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-purple-300 font-mono">
                        Rendering...
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs flex items-center justify-between">
                  <span className="font-mono text-slate-400">
                    {targetWidth} × {targetHeight} px
                  </span>
                  {percentSaved > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                      {percentSaved}% smaller
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
