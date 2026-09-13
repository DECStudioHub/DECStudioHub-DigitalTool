import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { ImageComparisonViewer } from './ImageComparisonViewer';
import { formatBytes, downloadBlob, getBaseFileName } from './imageUtils';
import { FileArchive, Download, RotateCcw, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

export const ImageCompressTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // Compression controls
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [maxDimension, setMaxDimension] = useState<number>(0); // 0 = original
  const [targetKb, setTargetKb] = useState<string>('');

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
      // Auto recommend WEBP or JPEG
      if (f.type === 'image/png') {
        setFormat('image/webp');
      } else {
        setFormat('image/jpeg');
      }
    };
  };

  const runCompression = () => {
    if (!imgRef.current || origWidth <= 0) return;
    setIsProcessing(true);

    let drawW = origWidth;
    let drawH = origHeight;

    if (maxDimension > 0 && (drawW > maxDimension || drawH > maxDimension)) {
      if (drawW > drawH) {
        drawH = Math.round((drawH * maxDimension) / drawW);
        drawW = maxDimension;
      } else {
        drawW = Math.round((drawW * maxDimension) / drawH);
        drawH = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = drawW;
    canvas.height = drawH;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, drawW, drawH);
      }

      ctx.drawImage(imgRef.current, 0, 0, drawW, drawH);

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
    if (file && imgRef.current) {
      runCompression();
    }
  }, [quality, format, maxDimension]);

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
    setTargetKb('');
  };

  const handleDownload = () => {
    if (!processedBlob || !file) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const filename = `${getBaseFileName(file.name)}_compressed.${ext}`;
    downloadBlob(processedBlob, filename);
  };

  const percentSaved =
    file && processedSize > 0
      ? Math.round(((file.size - processedSize) / file.size) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <FileArchive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Compress Image</h3>
            <p className="text-xs text-slate-400">
              Drastically reduce file size without noticeable loss of visual fidelity
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
          title="Drop image to compress"
          subtitle="Supports high-res JPG, PNG, WEBP (Processed 100% locally in browser memory)"
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
              formatName="Compressed Preview"
            />
          </div>

          {/* Right Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-5 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            {/* Quick Metrics Bar */}
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800/80 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Original</div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                  {formatBytes(file.size)}
                </div>
              </div>
              <div className="border-x border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Compressed</div>
                <div className="text-xs font-mono font-bold text-purple-400 mt-0.5">
                  {formatBytes(processedSize)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Saved</div>
                <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                  {percentSaved > 0 ? `${percentSaved}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Quality Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Quality Level</span>
                <span className="font-mono text-purple-400 font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Maximum Compression (Smaller file)</span>
                <span>Best Quality</span>
              </div>
            </div>

            {/* Quick Quality Presets */}
            <div>
              <span className="text-xs font-medium text-slate-300 mb-2 block">
                Compression Presets
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Low (90%)', q: 90 },
                  { label: 'Medium (75%)', q: 75 },
                  { label: 'Aggressive (50%)', q: 50 },
                ].map((preset) => (
                  <button
                    key={preset.q}
                    type="button"
                    onClick={() => setQuality(preset.q)}
                    className={`py-2 px-1 rounded-xl text-xs font-medium text-center transition ${
                      quality === preset.q
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <span className="text-xs font-medium text-slate-300 mb-2 block">
                Optimized Output Format
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/webp', label: 'WEBP (Recommended)' },
                  { id: 'image/jpeg', label: 'JPEG (Universal)' },
                  { id: 'image/png', label: 'PNG (Lossless)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-medium text-center transition ${
                      format === f.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Max Dimension scale */}
            <div>
              <span className="text-xs font-medium text-slate-300 mb-2 block">
                Maximum Dimension Limit (Optional)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Full Size', val: 0 },
                  { label: '1920px', val: 1920 },
                  { label: '1280px', val: 1280 },
                  { label: '800px', val: 800 },
                ].map((dim) => (
                  <button
                    key={dim.val}
                    type="button"
                    onClick={() => setMaxDimension(dim.val)}
                    className={`py-1.5 rounded-lg text-xs font-mono transition ${
                      maxDimension === dim.val
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {dim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={runCompression}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                Re-compress Image
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!processedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Compressed Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
