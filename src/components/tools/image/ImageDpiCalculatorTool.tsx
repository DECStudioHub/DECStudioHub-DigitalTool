import React, { useState } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { Printer, Calculator, Sparkles, CheckCircle2, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';

interface PrintPreset {
  name: string;
  inW: number;
  inH: number;
  cmW: number;
  cmH: number;
}

const PRINT_PRESETS: PrintPreset[] = [
  { name: '4" × 6" Photo', inW: 4, inH: 6, cmW: 10.2, cmH: 15.2 },
  { name: '5" × 7" Photo', inW: 5, inH: 7, cmW: 12.7, cmH: 17.8 },
  { name: '8" × 10" Portrait', inW: 8, inH: 10, cmW: 20.3, cmH: 25.4 },
  { name: 'A4 Document', inW: 8.27, inH: 11.69, cmW: 21.0, cmH: 29.7 },
  { name: 'A3 Poster', inW: 11.69, inH: 16.54, cmW: 29.7, cmH: 42.0 },
  { name: 'Business Card', inW: 3.5, inH: 2.0, cmW: 8.9, cmH: 5.1 },
];

export const ImageDpiCalculatorTool: React.FC = () => {
  const [calcMode, setCalcMode] = useState<'from-pixels' | 'from-physical'>('from-pixels');

  // Mode 1: From Pixels
  const [pxWidth, setPxWidth] = useState<number>(3840);
  const [pxHeight, setPxHeight] = useState<number>(2160);
  const [targetDpi, setTargetDpi] = useState<number>(300);

  // Mode 2: From Physical
  const [physWidth, setPhysWidth] = useState<number>(8.5);
  const [physHeight, setPhysHeight] = useState<number>(11);
  const [physUnit, setPhysUnit] = useState<'inches' | 'cm'>('inches');
  const [physDpi, setPhysDpi] = useState<number>(300);

  // Optional file upload
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    if (!files || !files[0]) return;
    const f = files[0];
    setUploadedFileName(f.name);

    const url = URL.createObjectURL(f);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setPxWidth(img.naturalWidth);
      setPxHeight(img.naturalHeight);
      setCalcMode('from-pixels');
      URL.revokeObjectURL(url);
    };
  };

  // Calculations for Mode 1
  const inchesW = (pxWidth / targetDpi).toFixed(2);
  const inchesH = (pxHeight / targetDpi).toFixed(2);
  const cmW = ((pxWidth / targetDpi) * 2.54).toFixed(1);
  const cmH = ((pxHeight / targetDpi) * 2.54).toFixed(1);

  // Quality rating
  const getQualityRating = (dpi: number) => {
    if (dpi >= 300) {
      return {
        label: 'Museum / Fine-Art Quality (Sharp at reading distance)',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        icon: CheckCircle2,
      };
    } else if (dpi >= 150) {
      return {
        label: 'Standard Print Quality (Suitable for wall art & magazines)',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/30',
        icon: Sparkles,
      };
    } else if (dpi >= 100) {
      return {
        label: 'Acceptable (Viewable from 3+ feet / posters)',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        icon: AlertTriangle,
      };
    } else {
      return {
        label: 'Low Resolution (Visible pixelation up close)',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/30',
        icon: XCircle,
      };
    }
  };

  // Calculations for Mode 2
  const effectiveInchesW = physUnit === 'inches' ? physWidth : physWidth / 2.54;
  const effectiveInchesH = physUnit === 'inches' ? physHeight : physHeight / 2.54;
  const reqPxW = Math.round(effectiveInchesW * physDpi);
  const reqPxH = Math.round(effectiveInchesH * physDpi);
  const reqMegapixels = ((reqPxW * reqPxH) / 1000000).toFixed(2);

  const applyPreset = (preset: PrintPreset) => {
    if (physUnit === 'inches') {
      setPhysWidth(preset.inW);
      setPhysHeight(preset.inH);
    } else {
      setPhysWidth(preset.cmW);
      setPhysHeight(preset.cmH);
    }
  };

  const rating = getQualityRating(targetDpi);
  const RatingIcon = rating.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Print Size / DPI Calculator</h3>
            <p className="text-xs text-slate-400">
              Calculate maximum physical print dimensions in inches and cm, or determine pixel resolution required for print
            </p>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setCalcMode('from-pixels')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              calcMode === 'from-pixels'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pixels → Print Size
          </button>
          <button
            type="button"
            onClick={() => setCalcMode('from-physical')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              calcMode === 'from-physical'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Print Size → Required Pixels
          </button>
        </div>
      </div>

      {calcMode === 'from-pixels' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Input Pixel Dimensions
              </span>
              {uploadedFileName && (
                <span className="text-[11px] text-purple-400 truncate max-w-[150px]">
                  {uploadedFileName}
                </span>
              )}
            </div>

            {/* Upload optional */}
            <div>
              <ImageDropzone
                onFilesSelected={handleFiles}
                title="Or drop image to auto-fill"
                subtitle="Reads exact pixel dimensions instantly"
              />
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Width (Pixels)
                </label>
                <input
                  type="number"
                  min="1"
                  value={pxWidth}
                  onChange={(e) => setPxWidth(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Height (Pixels)
                </label>
                <input
                  type="number"
                  min="1"
                  value={pxHeight}
                  onChange={(e) => setPxHeight(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* DPI selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-medium text-slate-300 block">Print Quality / DPI</span>
              <div className="grid grid-cols-4 gap-2">
                {[72, 150, 300, 600].map((dpi) => (
                  <button
                    key={dpi}
                    type="button"
                    onClick={() => setTargetDpi(dpi)}
                    className={`py-2 rounded-xl text-xs font-mono font-medium transition ${
                      targetDpi === dpi
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {dpi} DPI
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Calculated Physical Print Size
                </span>
                <span className="text-xs font-mono text-purple-400 font-semibold">
                  @ {targetDpi} DPI
                </span>
              </div>

              {/* Big metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Inches</span>
                  <div className="text-2xl font-bold font-mono text-white">
                    {inchesW}" × {inchesH}"
                  </div>
                  <span className="text-xs text-slate-500">Imperial measure</span>
                </div>

                <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Centimeters</span>
                  <div className="text-2xl font-bold font-mono text-purple-400">
                    {cmW} × {cmH} cm
                  </div>
                  <span className="text-xs text-slate-500">Metric measure</span>
                </div>
              </div>

              {/* Quality rating badge */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${rating.bg}`}>
                <RatingIcon className={`w-5 h-5 shrink-0 mt-0.5 ${rating.color}`} />
                <div>
                  <div className={`text-sm font-semibold ${rating.color}`}>
                    {targetDpi} DPI Print Assessment
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{rating.label}</p>
                </div>
              </div>

              {/* Multi-DPI Comparison Table */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Quick DPI Comparison Table
                </span>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#111827] text-slate-400 font-semibold">
                      <tr>
                        <th className="p-2.5">Resolution</th>
                        <th className="p-2.5">Inches</th>
                        <th className="p-2.5">Centimeters</th>
                        <th className="p-2.5">Use Case</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                      <tr>
                        <td className="p-2.5 font-bold text-white">300 DPI</td>
                        <td className="p-2.5">{(pxWidth / 300).toFixed(1)}" × {(pxHeight / 300).toFixed(1)}"</td>
                        <td className="p-2.5">{((pxWidth / 300) * 2.54).toFixed(1)} × {((pxHeight / 300) * 2.54).toFixed(1)} cm</td>
                        <td className="p-2.5 text-emerald-400">Fine Art / Photo</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-white">150 DPI</td>
                        <td className="p-2.5">{(pxWidth / 150).toFixed(1)}" × {(pxHeight / 150).toFixed(1)}"</td>
                        <td className="p-2.5">{((pxWidth / 150) * 2.54).toFixed(1)} × {((pxHeight / 150) * 2.54).toFixed(1)} cm</td>
                        <td className="p-2.5 text-purple-400">Wall Poster</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-white">72 DPI</td>
                        <td className="p-2.5">{(pxWidth / 72).toFixed(1)}" × {(pxHeight / 72).toFixed(1)}"</td>
                        <td className="p-2.5">{((pxWidth / 72) * 2.54).toFixed(1)} × {((pxHeight / 72) * 2.54).toFixed(1)} cm</td>
                        <td className="p-2.5 text-slate-400">Screen / Billboard</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: From Physical -> Required Pixels */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Print Dimensions
              </span>
            </div>

            {/* Presets */}
            <div>
              <span className="text-xs font-medium text-slate-300 mb-2 block">Standard Sizes</span>
              <div className="grid grid-cols-2 gap-2">
                {PRINT_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition"
                  >
                    <div className="text-xs font-semibold text-slate-200">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {physUnit === 'inches' ? `${p.inW}" × ${p.inH}"` : `${p.cmW} × ${p.cmH} cm`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Unit toggle */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-slate-400">Measurement Unit:</span>
              <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPhysUnit('inches')}
                  className={`px-2.5 py-1 rounded transition ${
                    physUnit === 'inches' ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setPhysUnit('cm')}
                  className={`px-2.5 py-1 rounded transition ${
                    physUnit === 'cm' ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Centimeters
                </button>
              </div>
            </div>

            {/* Dimensions inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Width ({physUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={physWidth}
                  onChange={(e) => setPhysWidth(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Height ({physUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={physHeight}
                  onChange={(e) => setPhysHeight(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Target DPI */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-medium text-slate-300 block">Desired DPI</span>
              <div className="grid grid-cols-3 gap-2">
                {[150, 300, 600].map((dpi) => (
                  <button
                    key={dpi}
                    type="button"
                    onClick={() => setPhysDpi(dpi)}
                    className={`py-2 rounded-xl text-xs font-mono font-medium transition ${
                      physDpi === dpi
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {dpi} DPI
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Required Image Resolution
                </span>
                <span className="text-xs font-mono text-purple-400 font-semibold">
                  For {physWidth} × {physHeight} {physUnit} @ {physDpi} DPI
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#111827] border border-purple-500/30 text-center space-y-2">
                <span className="text-xs font-semibold uppercase text-purple-400 tracking-wider">
                  Minimum Canvas Size Needed
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-white">
                  {reqPxW} × {reqPxH} px
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Total Resolution: <span className="text-emerald-400 font-bold">{reqMegapixels} Megapixels</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 leading-relaxed">
                Tip: When designing in Photoshop, Illustrator, or Canva for physical printing, create a canvas with exactly{' '}
                <span className="font-mono font-bold text-white">{reqPxW} × {reqPxH} px</span> at{' '}
                <span className="font-mono font-bold text-white">{physDpi} DPI</span> to guarantee maximum sharpness.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
