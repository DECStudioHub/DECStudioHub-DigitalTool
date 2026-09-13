import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, downloadBlob, getBaseFileName } from './imageUtils';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Download, RefreshCw } from 'lucide-react';

export const ImageRotateFlipTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // Transformations
  const [rotationDeg, setRotationDeg] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Processed Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedWidth, setProcessedWidth] = useState<number>(0);
  const [processedHeight, setProcessedHeight] = useState<number>(0);
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
      setProcessedWidth(img.naturalWidth);
      setProcessedHeight(img.naturalHeight);
    };
  };

  const applyTransformation = () => {
    if (!imgRef.current || origWidth <= 0) return;
    setIsProcessing(true);

    const rad = (rotationDeg * Math.PI) / 180;
    const isSideways = rotationDeg === 90 || rotationDeg === 270;
    const targetW = isSideways ? origHeight : origWidth;
    const targetH = isSideways ? origWidth : origHeight;

    setProcessedWidth(targetW);
    setProcessedHeight(targetH);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Move to center of target canvas
      ctx.translate(targetW / 2, targetH / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Draw original image centered
      ctx.drawImage(imgRef.current, -origWidth / 2, -origHeight / 2);

      canvas.toBlob((blob) => {
        if (blob) {
          if (processedUrl) URL.revokeObjectURL(processedUrl);
          const newUrl = URL.createObjectURL(blob);
          setProcessedUrl(newUrl);
          setProcessedBlob(blob);
        }
        setIsProcessing(false);
      }, 'image/png');
    }
  };

  useEffect(() => {
    if (file && imgRef.current) {
      applyTransformation();
    }
  }, [rotationDeg, flipH, flipV]);

  const rotateCw = () => setRotationDeg((prev) => (prev + 90) % 360);
  const rotateCcw = () => setRotationDeg((prev) => (prev + 270) % 360);
  const rotate180 = () => setRotationDeg((prev) => (prev + 180) % 360);
  const toggleFlipH = () => setFlipH((prev) => !prev);
  const toggleFlipV = () => setFlipV((prev) => !prev);

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setProcessedBlob(null);
    setOrigWidth(0);
    setOrigHeight(0);
    setRotationDeg(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleDownload = () => {
    if (!processedBlob || !file) return;
    const filename = `${getBaseFileName(file.name)}_rotated_${rotationDeg}deg.png`;
    downloadBlob(processedBlob, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Rotate & Flip</h3>
            <p className="text-xs text-slate-400">
              Rotate by 90°, 180° and mirror horizontally or vertically with instantaneous live preview
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
          title="Upload image to rotate or flip"
          subtitle="Supports JPG, PNG, WEBP, BMP"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Preview: 7 cols */}
          <div className="lg:col-span-7 space-y-3">
            <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-slate-300">Live Rotated View</span>
                <span className="font-mono text-purple-400">
                  {processedWidth} × {processedHeight} px • {rotationDeg}°
                </span>
              </div>

              <div className="min-h-[340px] max-h-[500px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-[#070a11] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 p-3 relative">
                <img
                  src={processedUrl || originalUrl!}
                  alt="Rotated preview"
                  className="max-h-[460px] max-w-full object-contain rounded transition-all"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-purple-300 font-medium">
                    Applying transformation...
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs font-mono text-slate-400 flex justify-between">
                <span>Original: {origWidth} × {origHeight} px</span>
                <span>
                  {flipH && 'Flipped H '}
                  {flipV && 'Flipped V '}
                  {rotationDeg > 0 && `Rotated ${rotationDeg}°`}
                  {!flipH && !flipV && rotationDeg === 0 && 'Normal orientation'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-5 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Rotation Controls
              </span>
            </div>

            {/* Rotate buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={rotateCcw}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex flex-col items-center gap-1.5 transition"
              >
                <RotateCcw className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-medium">90° Left</span>
              </button>

              <button
                type="button"
                onClick={rotateCw}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex flex-col items-center gap-1.5 transition"
              >
                <RotateCw className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-medium">90° Right</span>
              </button>

              <button
                type="button"
                onClick={rotate180}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex flex-col items-center gap-1.5 transition"
              >
                <RefreshCw className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-medium">180°</span>
              </button>
            </div>

            {/* Flip buttons */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
                Mirror & Flip
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={toggleFlipH}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                    flipH
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="text-xs font-medium">Flip Horizontal</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFlipV}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                    flipV
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                  <span className="text-xs font-medium">Flip Vertical</span>
                </button>
              </div>
            </div>

            {/* Quick reset orientation */}
            <button
              type="button"
              onClick={() => {
                setRotationDeg(0);
                setFlipH(false);
                setFlipV(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
            >
              Reset to 0° (No flip)
            </button>

            {/* Action */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!processedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Rotated Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
