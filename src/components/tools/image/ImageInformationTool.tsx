import React, { useState } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { formatBytes, calculateAspectRatio } from './imageUtils';
import { Info, Copy, Check, RotateCcw, FileText, Image as ImageIcon, Calendar, HardDrive, Maximize, Printer } from 'lucide-react';

interface ImageMeta {
  name: string;
  sizeBytes: number;
  type: string;
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: string;
  orientation: 'Landscape' | 'Portrait' | 'Square';
  lastModified: string;
  print300DpiInches: string;
  print300DpiCm: string;
  print150DpiInches: string;
}

export const ImageInformationTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFiles = (files: File[]) => {
    if (!files || !files[0]) return;
    const f = files[0];
    setFile(f);

    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const mp = ((w * h) / 1000000).toFixed(2);
      const ratio = calculateAspectRatio(w, h);
      const orientation = w > h ? 'Landscape' : w < h ? 'Portrait' : 'Square';

      const inW300 = (w / 300).toFixed(1);
      const inH300 = (h / 300).toFixed(1);
      const cmW300 = ((w / 300) * 2.54).toFixed(1);
      const cmH300 = ((h / 300) * 2.54).toFixed(1);

      const inW150 = (w / 150).toFixed(1);
      const inH150 = (h / 150).toFixed(1);

      setMeta({
        name: f.name,
        sizeBytes: f.size,
        type: f.type || 'image/unknown',
        width: w,
        height: h,
        aspectRatio: ratio,
        megapixels: `${mp} MP`,
        orientation,
        lastModified: new Date(f.lastModified).toLocaleString(),
        print300DpiInches: `${inW300}" × ${inH300}"`,
        print300DpiCm: `${cmW300} × ${cmH300} cm`,
        print150DpiInches: `${inW150}" × ${inH150}"`,
      });
    };
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setMeta(null);
  };

  const copyMetadataSummary = () => {
    if (!meta) return;
    const summary = `
Image Name: ${meta.name}
Dimensions: ${meta.width} × ${meta.height} px
Resolution: ${meta.megapixels}
Aspect Ratio: ${meta.aspectRatio} (${meta.orientation})
File Size: ${formatBytes(meta.sizeBytes)} (${meta.sizeBytes.toLocaleString()} bytes)
MIME Type: ${meta.type}
Last Modified: ${meta.lastModified}
Print @ 300 DPI: ${meta.print300DpiInches} (${meta.print300DpiCm})
Print @ 150 DPI: ${meta.print150DpiInches}
`.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Image Information</h3>
            <p className="text-xs text-slate-400">
              Inspect resolution, aspect ratio, megapixels, dimensions, byte size, and print dimensions
            </p>
          </div>
        </div>
        {file && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyMetadataSummary}
              className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <ImageDropzone
          onFilesSelected={handleFiles}
          title="Upload image to inspect information"
          subtitle="Supports all browser-supported image formats"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Preview: 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 mb-2">Image Preview</span>
              <div className="min-h-[260px] max-h-[380px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-[#070a11] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 p-2">
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="max-h-[340px] max-w-full object-contain rounded"
                />
              </div>
              <div className="mt-3 text-xs text-slate-400 font-mono text-center truncate">
                {file.name}
              </div>
            </div>
          </div>

          {/* Right Details: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            {meta && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Card 1: Dimensions */}
                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    <Maximize className="w-4 h-4" />
                    <span>Resolution</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {meta.width} × {meta.height} px
                  </div>
                  <div className="flex gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {meta.megapixels}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Ratio {meta.aspectRatio}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      {meta.orientation}
                    </span>
                  </div>
                </div>

                {/* Card 2: File Size */}
                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    <HardDrive className="w-4 h-4" />
                    <span>File Weight</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {formatBytes(meta.sizeBytes)}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {meta.sizeBytes.toLocaleString()} raw bytes
                  </div>
                </div>

                {/* Card 3: Format & Type */}
                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4" />
                    <span>Format & MIME</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white truncate">
                    {meta.type}
                  </div>
                  <div className="text-xs text-slate-400">
                    Extension: <span className="text-slate-200 font-mono">.{meta.name.split('.').pop() || 'img'}</span>
                  </div>
                </div>

                {/* Card 4: Last Modified */}
                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    <span>File Timestamp</span>
                  </div>
                  <div className="text-sm font-medium text-white truncate">
                    {meta.lastModified}
                  </div>
                  <div className="text-xs text-slate-400">Local filesystem timestamp</div>
                </div>

                {/* Card 5 & 6: Print Dimensions */}
                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    <Printer className="w-4 h-4" />
                    <span>Physical Print Dimensions</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-semibold text-slate-300">Magazine Quality (300 DPI)</div>
                      <div className="text-sm font-mono text-emerald-400 font-bold mt-1">
                        {meta.print300DpiInches} ({meta.print300DpiCm})
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-semibold text-slate-300">Standard Poster (150 DPI)</div>
                      <div className="text-sm font-mono text-purple-400 font-bold mt-1">
                        {meta.print150DpiInches}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
