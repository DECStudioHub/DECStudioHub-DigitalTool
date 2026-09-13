import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, downloadBlob } from './imageUtils';
import { Columns, ArrowLeftRight, ArrowUpDown, Grid, Download, RotateCcw, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  url: string;
  img: HTMLImageElement;
  width: number;
  height: number;
}

type MergeLayout = 'horizontal' | 'vertical' | 'grid';

export const ImageMergeTool: React.FC = () => {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [layout, setLayout] = useState<MergeLayout>('horizontal');
  const [gap, setGap] = useState<number>(10);
  const [bgColor, setBgColor] = useState<string>('#0b0f19');

  // Output
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedWidth, setMergedWidth] = useState<number>(0);
  const [mergedHeight, setMergedHeight] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const addFiles = (files: File[]) => {
    files.forEach((f) => {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        const newItem: ImageItem = {
          id: Math.random().toString(36).substring(7),
          file: f,
          url,
          img,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        setItems((prev) => [...prev, newItem]);
      };
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
  };

  const moveItem = (index: number, direction: 'prev' | 'next') => {
    setItems((prev) => {
      const targetIndex = direction === 'prev' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const renderMergedCanvas = () => {
    if (items.length === 0) {
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
      setMergedUrl(null);
      setMergedBlob(null);
      return;
    }

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (layout === 'horizontal') {
      // Find max height, normalize all images to equal height
      const targetHeight = Math.max(...items.map((i) => i.height));
      const scaledWidths = items.map((i) => Math.round((i.width * targetHeight) / i.height));
      const totalWidth =
        scaledWidths.reduce((sum, w) => sum + w, 0) + gap * (items.length - 1);

      canvas.width = totalWidth;
      canvas.height = targetHeight;
      setMergedWidth(totalWidth);
      setMergedHeight(targetHeight);

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalWidth, targetHeight);

      let curX = 0;
      items.forEach((item, idx) => {
        const w = scaledWidths[idx];
        ctx.drawImage(item.img, curX, 0, w, targetHeight);
        curX += w + gap;
      });
    } else if (layout === 'vertical') {
      // Find max width, normalize all images to equal width
      const targetWidth = Math.max(...items.map((i) => i.width));
      const scaledHeights = items.map((i) => Math.round((i.height * targetWidth) / i.width));
      const totalHeight =
        scaledHeights.reduce((sum, h) => sum + h, 0) + gap * (items.length - 1);

      canvas.width = targetWidth;
      canvas.height = totalHeight;
      setMergedWidth(targetWidth);
      setMergedHeight(totalHeight);

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidth, totalHeight);

      let curY = 0;
      items.forEach((item, idx) => {
        const h = scaledHeights[idx];
        ctx.drawImage(item.img, 0, curY, targetWidth, h);
        curY += h + gap;
      });
    } else if (layout === 'grid') {
      // 2 columns grid
      const cols = 2;
      const rows = Math.ceil(items.length / cols);
      const cellW = Math.max(...items.map((i) => i.width));
      const cellH = Math.max(...items.map((i) => i.height));

      const totalW = cols * cellW + (cols - 1) * gap;
      const totalH = rows * cellH + (rows - 1) * gap;

      canvas.width = totalW;
      canvas.height = totalH;
      setMergedWidth(totalW);
      setMergedHeight(totalH);

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalW, totalH);

      items.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = col * (cellW + gap);
        const y = row * (cellH + gap);

        // Center within cell
        const ratio = Math.min(cellW / item.width, cellH / item.height);
        const dw = Math.round(item.width * ratio);
        const dh = Math.round(item.height * ratio);
        const dx = x + (cellW - dw) / 2;
        const dy = y + (cellH - dh) / 2;

        ctx.drawImage(item.img, dx, dy, dw, dh);
      });
    }

    canvas.toBlob((blob) => {
      if (blob) {
        if (mergedUrl) URL.revokeObjectURL(mergedUrl);
        const newUrl = URL.createObjectURL(blob);
        setMergedUrl(newUrl);
        setMergedBlob(blob);
      }
      setIsProcessing(false);
    }, 'image/png');
  };

  useEffect(() => {
    renderMergedCanvas();
  }, [items, layout, gap, bgColor]);

  const handleReset = () => {
    items.forEach((item) => URL.revokeObjectURL(item.url));
    if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    setItems([]);
    setMergedUrl(null);
    setMergedBlob(null);
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    downloadBlob(mergedBlob, `merged_image_${layout}.png`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Merge Images</h3>
            <p className="text-xs text-slate-400">
              Combine multiple images side-by-side (horizontal), stacked (vertical), or in a grid
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <ImageDropzone
          onFilesSelected={addFiles}
          multiple={true}
          title="Drag & drop images to merge"
          subtitle="Select 2 or more images (JPG, PNG, WEBP)"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Preview: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-slate-300">Merged Result</span>
                <span className="font-mono text-purple-400">
                  {mergedWidth} × {mergedHeight} px • {items.length} images combined
                </span>
              </div>

              <div className="min-h-[340px] max-h-[500px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-[#070a11] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 p-3">
                {mergedUrl ? (
                  <img
                    src={mergedUrl}
                    alt="Merged"
                    className="max-h-[460px] max-w-full object-contain rounded shadow-lg"
                  />
                ) : (
                  <span className="text-xs text-slate-500">Merging...</span>
                )}
              </div>
            </div>

            {/* List of images with reorder buttons */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Images Sequence ({items.length})</span>
                <label className="text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1 font-medium">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-10 h-10 rounded bg-black flex items-center justify-center overflow-hidden shrink-0">
                        <img src={item.url} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{item.file.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {item.width}×{item.height}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, 'prev')}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => moveItem(idx, 'next')}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Merge Layout
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLayout('horizontal')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  layout === 'horizontal'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span className="text-xs font-medium">Side by Side</span>
              </button>

              <button
                type="button"
                onClick={() => setLayout('vertical')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  layout === 'vertical'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-xs font-medium">Stacked</span>
              </button>

              <button
                type="button"
                onClick={() => setLayout('grid')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  layout === 'grid'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="text-xs font-medium">2x2 Grid</span>
              </button>
            </div>

            {/* Gap slider */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Spacing Between Images</span>
                <span className="font-mono text-purple-400">{gap} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Border / background color */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Gap Background Color</span>
              <div className="flex items-center gap-3 bg-[#0b0f19] border border-slate-700 rounded-xl p-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                />
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!mergedBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Merged Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
