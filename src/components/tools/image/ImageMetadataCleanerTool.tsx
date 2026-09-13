import React, { useState, useRef, useEffect } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { ImageComparisonViewer } from './ImageComparisonViewer';
import { formatBytes, downloadBlob, getBaseFileName } from './imageUtils';
import { ShieldCheck, Download, RotateCcw, Check, Sparkles, MapPin, Camera, User, Calendar } from 'lucide-react';

export const ImageMetadataCleanerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // Clean output
  const [cleanUrl, setCleanUrl] = useState<string | null>(null);
  const [cleanBlob, setCleanBlob] = useState<Blob | null>(null);
  const [cleanSize, setCleanSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

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

      if (f.type === 'image/png') {
        setFormat('image/png');
      } else {
        setFormat('image/jpeg');
      }
    };
  };

  const stripMetadata = () => {
    if (!imgRef.current || origWidth <= 0) return;
    setIsProcessing(true);

    // Canvas drawing decodes only pure pixel data (RGBA) and ignores EXIF/IPTC/XMP chunks completely
    const canvas = document.createElement('canvas');
    canvas.width = origWidth;
    canvas.height = origHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, origWidth, origHeight);
      }
      ctx.drawImage(imgRef.current, 0, 0, origWidth, origHeight);

      const q = format === 'image/png' ? undefined : 0.95;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (cleanUrl) URL.revokeObjectURL(cleanUrl);
            const newUrl = URL.createObjectURL(blob);
            setCleanUrl(newUrl);
            setCleanBlob(blob);
            setCleanSize(blob.size);
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
      stripMetadata();
    }
  }, [format]);

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (cleanUrl) URL.revokeObjectURL(cleanUrl);
    setFile(null);
    setOriginalUrl(null);
    setCleanUrl(null);
    setCleanBlob(null);
    setOrigWidth(0);
    setOrigHeight(0);
    setCleanSize(0);
  };

  const handleDownload = () => {
    if (!cleanBlob || !file) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const filename = `${getBaseFileName(file.name)}_clean.${ext}`;
    downloadBlob(cleanBlob, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Remove Metadata (Privacy Shield)</h3>
            <p className="text-xs text-slate-400">
              Strip hidden EXIF, GPS location tags, camera serials, timestamps & author data before sharing online
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
          title="Upload photo to scrub sensitive metadata"
          subtitle="Supports JPG, PNG, WEBP — strips EXIF, GPS, device markers"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Preview: 7 cols */}
          <div className="lg:col-span-7">
            <ImageComparisonViewer
              originalUrl={originalUrl!}
              processedUrl={cleanUrl}
              originalWidth={origWidth}
              originalHeight={origHeight}
              originalSize={file.size}
              processedSize={cleanSize}
              isProcessing={isProcessing}
              formatName="Scrubbed Photo"
            />
          </div>

          {/* Right Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Privacy Protection Status
              </span>
            </div>

            {/* Privacy Checklist */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Protected & Metadata Stripped</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-6 list-disc">
                <li>
                  <span className="font-semibold text-white">GPS Coordinates</span> (Latitude, Longitude, Altitude)
                </li>
                <li>
                  <span className="font-semibold text-white">Device Info</span> (Phone model, Lens, Serial number)
                </li>
                <li>
                  <span className="font-semibold text-white">Exposure Details</span> (ISO, Shutter speed, Aperture)
                </li>
                <li>
                  <span className="font-semibold text-white">Origin & Timestamps</span> (Creation date, Software, Artist)
                </li>
              </ul>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Cleaned Format</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/jpeg', label: 'JPG' },
                  { id: 'image/webp', label: 'WEBP' },
                  { id: 'image/png', label: 'PNG' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id as any)}
                    className={`py-2 rounded-xl text-xs font-medium transition ${
                      format === f.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!cleanBlob || isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <Download className="w-4 h-4" />
                Download Sanitized Image
              </button>

              <div className="text-center text-[11px] text-slate-400 font-mono">
                Safe to publish on social media, forums, and public web
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
