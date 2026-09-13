import React, { useState } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { jsPDF } from 'jspdf';
import { FileText, Download, RotateCcw, Trash2, ChevronLeft, ChevronRight, Plus, Eye } from 'lucide-react';

interface PdfPageItem {
  id: string;
  file: File;
  url: string;
  img: HTMLImageElement;
  width: number;
  height: number;
}

type PageSize = 'a4' | 'letter' | 'fit';
type Orientation = 'portrait' | 'landscape' | 'auto';
type MarginSize = 'none' | 'small' | 'medium';

export const ImageToPdfTool: React.FC = () => {
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [margin, setMargin] = useState<MarginSize>('small');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const addFiles = (files: File[]) => {
    files.forEach((f) => {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const item: PdfPageItem = {
          id: Math.random().toString(36).substring(7),
          file: f,
          url,
          img,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        setPages((prev) => [...prev, item]);
      };
    });
  };

  const removePage = (id: string) => {
    setPages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const movePage = (index: number, direction: 'prev' | 'next') => {
    setPages((prev) => {
      const targetIndex = direction === 'prev' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const generateAndDownloadPdf = async () => {
    if (pages.length === 0) return;
    setIsGenerating(true);

    try {
      let pdf: jsPDF | null = null;
      const marginMm = margin === 'none' ? 0 : margin === 'small' ? 10 : 20;

      for (let i = 0; i < pages.length; i++) {
        const item = pages[i];
        const isLandscape = item.width > item.height;
        const pageOrient =
          orientation === 'auto'
            ? isLandscape
              ? 'landscape'
              : 'portrait'
            : orientation;

        // Determine dimensions in mm
        let pdfWidthMm = 210; // A4 standard
        let pdfHeightMm = 297;

        if (pageSize === 'letter') {
          pdfWidthMm = 215.9;
          pdfHeightMm = 279.4;
        } else if (pageSize === 'fit') {
          // Fit page strictly to image ratio
          const baseWidth = 210;
          pdfWidthMm = baseWidth;
          pdfHeightMm = (baseWidth * item.height) / item.width;
        }

        if (pageOrient === 'landscape' && pageSize !== 'fit') {
          const temp = pdfWidthMm;
          pdfWidthMm = pdfHeightMm;
          pdfHeightMm = temp;
        }

        if (i === 0) {
          pdf = new jsPDF({
            orientation: pageOrient,
            unit: 'mm',
            format: pageSize === 'fit' ? [pdfWidthMm, pdfHeightMm] : pageSize,
          });
        } else if (pdf) {
          pdf.addPage(
            pageSize === 'fit' ? [pdfWidthMm, pdfHeightMm] : pageSize,
            pageOrient
          );
        }

        if (pdf) {
          const availableW = pdfWidthMm - marginMm * 2;
          const availableH = pdfHeightMm - marginMm * 2;

          // Scale image proportionally to fit inside available area
          const imgRatio = item.width / item.height;
          const availRatio = availableW / availableH;

          let renderW = availableW;
          let renderH = availableH;

          if (imgRatio > availRatio) {
            renderH = availableW / imgRatio;
          } else {
            renderW = availableH * imgRatio;
          }

          const posX = marginMm + (availableW - renderW) / 2;
          const posY = marginMm + (availableH - renderH) / 2;

          // Draw image via canvas to guarantee clean raster
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = item.width;
          tempCanvas.height = item.height;
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(item.img, 0, 0);
            const imgData = tempCanvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', posX, posY, renderW, renderH);
          }
        }
      }

      if (pdf) {
        pdf.save(`images_document_${pages.length}pages.pdf`);
      }
    } catch (err) {
      console.error('Error generating PDF', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Image to PDF</h3>
            <p className="text-xs text-slate-400">
              Convert one or multiple photos into a polished, print-ready PDF document
            </p>
          </div>
        </div>
        {pages.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
        )}
      </div>

      {pages.length === 0 ? (
        <ImageDropzone
          onFilesSelected={addFiles}
          multiple={true}
          title="Upload images to compile into PDF"
          subtitle="Supports JPG, PNG, WEBP — select single or multiple images"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Document Pages View 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-slate-300">
                  Document Pages ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
                </span>
                <label className="text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1 font-medium">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More Pages</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Grid of Pages */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    className="p-3 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between group hover:border-purple-500/40 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-2 text-slate-400">
                        <span className="font-bold text-purple-400">Page {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removePage(page.id)}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="aspect-[3/4] bg-[#070a11] rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-800">
                        <img
                          src={page.url}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]">
                        {page.width}×{page.height}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => movePage(idx, 'prev')}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === pages.length - 1}
                          onClick={() => movePage(idx, 'next')}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: PDF Settings: 5 cols */}
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                PDF Layout Settings
              </span>
            </div>

            {/* Page Size */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Page Size</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'a4', label: 'A4' },
                  { id: 'letter', label: 'US Letter' },
                  { id: 'fit', label: 'Fit to Image' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPageSize(s.id as PageSize)}
                    className={`py-2 rounded-xl text-xs font-medium transition ${
                      pageSize === s.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Orientation</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'auto', label: 'Auto Detect' },
                  { id: 'portrait', label: 'Portrait' },
                  { id: 'landscape', label: 'Landscape' },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOrientation(o.id as Orientation)}
                    className={`py-2 rounded-xl text-xs font-medium transition ${
                      orientation === o.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Page Margin</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None (0mm)' },
                  { id: 'small', label: 'Small (10mm)' },
                  { id: 'medium', label: 'Medium (20mm)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMargin(m.id as MarginSize)}
                    className={`py-2 rounded-xl text-xs font-medium transition ${
                      margin === m.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={generateAndDownloadPdf}
                disabled={isGenerating || pages.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Compiling PDF...' : 'Download PDF Document'}</span>
              </button>
              <p className="text-center text-[11px] text-slate-400">
                100% processed locally in browser. No file data uploaded.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
