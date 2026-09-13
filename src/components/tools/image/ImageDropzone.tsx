import React, { useRef } from 'react';
import { Upload, ImageIcon, ShieldCheck } from 'lucide-react';

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onFilesSelected,
  accept = 'image/*',
  multiple = false,
  title = 'Drag & Drop your image here',
  subtitle = 'Supports JPG, PNG, WEBP, BMP, GIF, SVG (Processed locally in browser)',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          validFiles.push(file);
          if (!multiple) break;
        }
      }
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (file.type.startsWith('image/')) {
          validFiles.push(file);
          if (!multiple) break;
        }
      }
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-slate-700/80 hover:border-purple-500/80 bg-[#0d1322]/80 hover:bg-[#111827] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-4 group shadow-inner"
    >
      <div className="p-4 bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-105 rounded-2xl border border-purple-500/25 transition">
        <Upload className="w-8 h-8" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <p className="text-base sm:text-lg font-semibold text-white group-hover:text-purple-300 transition">
          {title} or <span className="text-purple-400 underline decoration-purple-500/50">Browse</span>
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">{subtitle}</p>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Your images are processed locally in your browser</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};
