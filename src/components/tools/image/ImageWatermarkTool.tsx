import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { ImageComparisonViewer } from './ImageComparisonViewer';
import { downloadBlob, getBaseFileName } from './imageUtils';
import { Droplet, Download, RotateCcw, Type, Image as ImageIcon, Sparkles } from 'lucide-react';

type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'tile';

const POSITIONS: { id: WatermarkPosition; label: string }[] = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-center', label: 'Top Center' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'center', label: 'Center' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'tile', label: 'Tiled Pattern' },
];

export const ImageWatermarkTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // Watermark mode: 'text' | 'image'
  const [watermarkMode, setWatermarkMode] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState<string>('© DECStudioHub');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Watermark styles
  const [position, setPosition] = useState<WatermarkPosition>('bottom-right');
  const [opacity, setOpacity] = useState<number>(65); // 0-100
  const [fontSize, setFontSize] = useState<number>(36);
  const [fontColor, setFontColor] = useState<string>('#ffffff');
  const [rotation, setRotation] = useState<number>(0); // -180 to 180
  const [margin, setMargin] = useState<number>(30); // px

  // Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
      // Smart default font size based on image width
      setFontSize(Math.max(18, Math.round(img.naturalWidth / 25)));
    };
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const lFile = e.target.files[0];
      setLogoFile(lFile);
      const url = URL.createObjectURL(lFile);
      setLogoUrl(url);

      const lImg = new Image();
      lImg.crossOrigin = 'anonymous';
      lImg.src = url;
      lImg.onload = () => {
        logoImgRef.current = lImg;
        renderWatermark();
      };
    }
  };

  const renderWatermark = () => {
    if (!imgRef.current || origWidth <= 0) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    canvas.width = origWidth;
    canvas.height = origHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(imgRef.current, 0, 0, origWidth, origHeight);

      ctx.save();
      ctx.globalAlpha = opacity / 100;

      if (watermarkMode === 'text' && watermarkText.trim()) {
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = fontColor;
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(watermarkText);
        const textW = metrics.width;
        const textH = fontSize;

        if (position === 'tile') {
          // Tiled diagonal watermark across canvas
          const stepX = textW + 100;
          const stepY = textH + 80;
          for (let y = -origHeight; y < origHeight * 2; y += stepY) {
            for (let x = -origWidth; x < origWidth * 2; x += stepX) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate((-30 * Math.PI) / 180);
              ctx.fillText(watermarkText, 0, 0);
              ctx.restore();
            }
          }
        } else {
          // Single position calculation
          let targetX = margin;
          let targetY = margin + textH / 2;

          switch (position) {
            case 'top-left':
              targetX = margin;
              targetY = margin + textH / 2;
              break;
            case 'top-center':
              targetX = (origWidth - textW) / 2;
              targetY = margin + textH / 2;
              break;
            case 'top-right':
              targetX = origWidth - textW - margin;
              targetY = margin + textH / 2;
              break;
            case 'center':
              targetX = (origWidth - textW) / 2;
              targetY = origHeight / 2;
              break;
            case 'bottom-left':
              targetX = margin;
              targetY = origHeight - margin - textH / 2;
              break;
            case 'bottom-center':
              targetX = (origWidth - textW) / 2;
              targetY = origHeight - margin - textH / 2;
              break;
            case 'bottom-right':
              targetX = origWidth - textW - margin;
              targetY = origHeight - margin - textH / 2;
              break;
          }

          ctx.save();
          // Translate to center of text for rotation
          const centerX = targetX + textW / 2;
          const centerY = targetY;
          ctx.translate(centerX, centerY);
          ctx.rotate((rotation * Math.PI) / 180);

          // Subtle shadow for legibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          ctx.fillText(watermarkText, -textW / 2, 0);
          ctx.restore();
        }
      } else if (watermarkMode === 'image' && logoImgRef.current) {
        // Logo watermark
        const lImg = logoImgRef.current;
        // Scale logo relative to image
        const logoTargetW = Math.min(origWidth * 0.3, 250);
        const logoTargetH = (logoTargetW * lImg.naturalHeight) / lImg.naturalWidth;

        let targetX = margin;
        let targetY = margin;

        switch (position) {
          case 'top-left':
            targetX = margin;
            targetY = margin;
            break;
          case 'top-center':
            targetX = (origWidth - logoTargetW) / 2;
            targetY = margin;
            break;
          case 'top-right':
            targetX = origWidth - logoTargetW - margin;
            targetY = margin;
            break;
          case 'center':
            targetX = (origWidth - logoTargetW) / 2;
            targetY = (origHeight - logoTargetH) / 2;
            break;
          case 'bottom-left':
            targetX = margin;
            targetY = origHeight - logoTargetH - margin;
            break;
          case 'bottom-center':
            targetX = (origWidth - logoTargetW) / 2;
            targetY = origHeight - logoTargetH - margin;
            break;
          case 'bottom-right':
            targetX = origWidth - logoTargetW - margin;
            targetY = origHeight - logoTargetH - margin;
            break;
          case 'tile':
            targetX = (origWidth - logoTargetW) / 2;
            targetY = (origHeight - logoTargetH) / 2;
            break;
        }

        ctx.save();
        const centerX = targetX + logoTargetW / 2;
        const centerY = targetY + logoTargetH / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(lImg, -logoTargetW / 2, -logoTargetH / 2, logoTargetW, logoTargetH);
        ctx.restore();
      }

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
      renderWatermark();
    }
  }, [
    watermarkMode,
    watermarkText,
    position,
    opacity,
    fontSize,
    fontColor,
    rotation,
    margin,
    logoUrl,
  ]);

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setProcessedBlob(null);
    setLogoFile(null);
    setLogoUrl(null);
    setOrigWidth(0);
    setOrigHeight(0);
    setProcessedSize(0);
  };

  const handleDownload = () => {
    if (!processedBlob || !file) return;
    const filename = `${getBaseFileName(file.name)}_watermarked.png`;
    downloadBlob(processedBlob, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Watermark Image</h3>
            <p className="text-xs text-slate-400">
              Add copyright text or brand logo with customizable position, opacity, rotation, and tiling
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
          title="Upload image to watermark"
          subtitle="Supports JPG, PNG, WEBP, BMP"
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
              formatName="Watermarked Result"
            />
          </div>

          {/* Right Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl max-h-[750px] overflow-y-auto">
            {/* Mode switch */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setWatermarkMode('text')}
                className={`py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                  watermarkMode === 'text'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                Text Watermark
              </button>
              <button
                type="button"
                onClick={() => setWatermarkMode('image')}
                className={`py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                  watermarkMode === 'image'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Logo / Image
              </button>
            </div>

            {/* Text input or Logo uploader */}
            {watermarkMode === 'text' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="e.g. © 2025 YourBrand"
                    className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Font Size & Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Size</span>
                      <span className="font-mono text-purple-400">{fontSize} px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="block text-xs text-slate-400 mb-1">Color</span>
                    <div className="flex items-center gap-2 bg-[#0b0f19] border border-slate-700 rounded-xl px-2 py-1">
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-[11px] text-slate-300">{fontColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Logo uploader */
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">Watermark Logo</label>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full p-3 rounded-xl border border-dashed border-slate-700 hover:border-purple-500 bg-[#090d16] text-xs text-slate-300 hover:text-white flex items-center justify-center gap-2 transition"
                >
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span>{logoFile ? logoFile.name : 'Upload transparent PNG / logo'}</span>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Position Picker */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-medium text-slate-300 mb-2 block">Position</span>
              <div className="grid grid-cols-3 gap-1.5">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setPosition(pos.id)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition text-center ${
                      position === pos.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Opacity</span>
                <span className="font-mono text-purple-400">{opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Rotation Angle</span>
                <span className="font-mono text-purple-400">{rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Margin Slider */}
            {position !== 'center' && position !== 'tile' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Edge Margin</span>
                  <span className="font-mono text-purple-400">{margin} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            )}

            {/* Action */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={renderWatermark}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                Apply Watermark
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!processedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Watermarked Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
