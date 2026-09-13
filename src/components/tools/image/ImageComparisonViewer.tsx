import React, { useState } from 'react';
import { Sparkles, Eye, Columns } from 'lucide-react';
import { formatBytes } from './imageUtils';

interface ImageComparisonViewerProps {
  originalUrl: string;
  processedUrl: string | null;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  processedWidth?: number;
  processedHeight?: number;
  processedSize?: number;
  isProcessing?: boolean;
  formatName?: string;
}

export const ImageComparisonViewer: React.FC<ImageComparisonViewerProps> = ({
  originalUrl,
  processedUrl,
  originalWidth,
  originalHeight,
  originalSize,
  processedWidth = originalWidth,
  processedHeight = originalHeight,
  processedSize = 0,
  isProcessing = false,
  formatName = 'Output',
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'processed' | 'original'>('split');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const percentDiff =
    originalSize > 0 && processedSize > 0
      ? Math.round(((originalSize - processedSize) / originalSize) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Viewer Header & Modes */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Image Preview
          </span>
          {percentDiff > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              Saved {percentDiff}%
            </span>
          )}
        </div>

        {processedUrl && (
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'split' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('processed')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'processed' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Processed
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'original' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Original
            </button>
          </div>
        )}
      </div>

      {/* Preview Stage */}
      {viewMode === 'split' && processedUrl ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Original Card */}
          <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300">Original</span>
                <span className="font-mono text-slate-400">{formatBytes(originalSize)}</span>
              </div>
              <div className="aspect-video bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-[#070a11] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 relative">
                <img
                  src={originalUrl}
                  alt="Original preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
            <div className="mt-2.5 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>{originalWidth} × {originalHeight} px</span>
              <span>Source</span>
            </div>
          </div>

          {/* Processed Card */}
          <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-purple-500/30 flex flex-col justify-between shadow-lg shadow-purple-950/20">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {formatName}
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatBytes(processedSize)}
                </span>
              </div>
              <div className="aspect-video bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-[#070a11] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 relative">
                <img
                  src={processedUrl}
                  alt="Processed preview"
                  className="max-h-full max-w-full object-contain"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-xs text-purple-300 font-medium">
                    Rendering changes...
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2.5 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>{processedWidth} × {processedHeight} px</span>
              {percentDiff > 0 && (
                <span className="text-emerald-400 font-semibold">{percentDiff}% smaller</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Single View (Processed or Original) */
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="font-semibold text-slate-200">
              {viewMode === 'original' ? 'Original Image' : formatName}
            </span>
            <span className="font-mono text-slate-400">
              {formatBytes(viewMode === 'original' ? originalSize : processedSize || originalSize)}
            </span>
          </div>

          <div className="min-h-[260px] sm:min-h-[340px] max-h-[500px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-[#070a11] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 relative p-2">
            <img
              src={viewMode === 'original' || !processedUrl ? originalUrl : processedUrl}
              alt="Preview"
              className="max-h-full max-w-full object-contain rounded"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-xs text-purple-300 font-medium">
                Rendering changes...
              </div>
            )}
          </div>

          <div className="mt-3 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>
              {viewMode === 'original'
                ? `${originalWidth} × ${originalHeight} px`
                : `${processedWidth} × ${processedHeight} px`}
            </span>
            <span>Client-side rendered</span>
          </div>
        </div>
      )}
    </div>
  );
};
