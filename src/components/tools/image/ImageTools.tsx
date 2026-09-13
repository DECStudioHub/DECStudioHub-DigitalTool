import React, { useState, useEffect } from 'react';
import {
  Scaling,
  FileArchive,
  RefreshCw,
  Crop,
  RotateCw,
  Palette,
  Droplet,
  Layers,
  Info,
  ShieldCheck,
  Grid,
  FileText,
  Camera,
  Printer,
  Sparkles,
  Shield,
  ChevronDown,
  Brain,
} from 'lucide-react';

// Tool Components
import { ImageResizeTool } from './ImageResizeTool';
import { ImageCompressTool } from './ImageCompressTool';
import { ImageConvertTool } from './ImageConvertTool';
import { ImageResolutionEnhancerTool } from './ImageResolutionEnhancerTool';
import { ImageCropTool } from './ImageCropTool';
import { ImageRotateFlipTool } from './ImageRotateFlipTool';
import { ImageAdjustmentsTool } from './ImageAdjustmentsTool';
import { ImageWatermarkTool } from './ImageWatermarkTool';
import { ImageBackgroundTool } from './ImageBackgroundTool';
import { ImageInformationTool } from './ImageInformationTool';
import { ImageMetadataCleanerTool } from './ImageMetadataCleanerTool';
import { ImageMergeTool } from './ImageMergeTool';
import { ImageToPdfTool } from './ImageToPdfTool';
import { ImageScreenshotOptimizerTool } from './ImageScreenshotOptimizerTool';
import { ImageDpiCalculatorTool } from './ImageDpiCalculatorTool';

export interface ImageToolsProps {
  activeToolId?: string;
  onSelectTool?: (toolId: string) => void;
}

interface ImageToolTab {
  id: string;
  name: string;
  shortName: string;
  icon: React.FC<{ className?: string }>;
  tag?: string;
}

const IMAGE_SUITE_TABS: ImageToolTab[] = [
  { id: 'image-resize', name: 'Resize Image', shortName: 'Resize', icon: Scaling },
  { id: 'image-compress', name: 'Compress Image', shortName: 'Compress', icon: FileArchive, tag: 'Popular' },
  { id: 'image-convert', name: 'Convert Image', shortName: 'Convert', icon: RefreshCw },
  { id: 'image-resolution-enhancer', name: 'Resolution Enhancer', shortName: 'Enhancer', icon: Brain, tag: 'HD' },
  { id: 'image-crop', name: 'Crop Image', shortName: 'Crop', icon: Crop },
  { id: 'image-rotate', name: 'Rotate & Flip', shortName: 'Rotate', icon: RotateCw },
  { id: 'image-adjustments', name: 'Image Adjustments', shortName: 'Adjust', icon: Palette },
  { id: 'image-watermark', name: 'Watermark Image', shortName: 'Watermark', icon: Droplet },
  { id: 'image-background', name: 'Image Background Tool', shortName: 'Background', icon: Layers },
  { id: 'image-info', name: 'Image Information', shortName: 'Info', icon: Info },
  { id: 'image-metadata-cleaner', name: 'Remove Metadata', shortName: 'Scrub EXIF', icon: ShieldCheck, tag: 'Privacy' },
  { id: 'image-merge', name: 'Merge Images', shortName: 'Merge', icon: Grid },
  { id: 'image-to-pdf', name: 'Image to PDF', shortName: 'To PDF', icon: FileText },
  { id: 'image-screenshot-optimizer', name: 'Screenshot Optimizer', shortName: 'Showcase', icon: Camera, tag: 'New' },
  { id: 'image-dpi-calculator', name: 'Print / DPI Calculator', shortName: 'DPI Calc', icon: Printer },
];

export const ImageTools: React.FC<ImageToolsProps> = ({ activeToolId = 'image-resize', onSelectTool }) => {
  const [currentTab, setCurrentTab] = useState<string>(activeToolId);

  useEffect(() => {
    if (activeToolId && activeToolId !== currentTab) {
      setCurrentTab(activeToolId);
    }
  }, [activeToolId]);

  const handleTabClick = (id: string) => {
    setCurrentTab(id);
    if (onSelectTool) {
      onSelectTool(id);
    }
  };

  const renderCurrentTool = () => {
    switch (currentTab) {
      case 'image-resize':
        return <ImageResizeTool />;
      case 'image-compress':
        return <ImageCompressTool />;
      case 'image-convert':
        return <ImageConvertTool />;
      case 'image-resolution-enhancer':
        return <ImageResolutionEnhancerTool />;
      case 'image-crop':
        return <ImageCropTool />;
      case 'image-rotate':
        return <ImageRotateFlipTool />;
      case 'image-adjustments':
        return <ImageAdjustmentsTool />;
      case 'image-watermark':
        return <ImageWatermarkTool />;
      case 'image-background':
        return <ImageBackgroundTool />;
      case 'image-info':
        return <ImageInformationTool />;
      case 'image-metadata-cleaner':
        return <ImageMetadataCleanerTool />;
      case 'image-merge':
        return <ImageMergeTool />;
      case 'image-to-pdf':
        return <ImageToPdfTool />;
      case 'image-screenshot-optimizer':
        return <ImageScreenshotOptimizerTool />;
      case 'image-dpi-calculator':
        return <ImageDpiCalculatorTool />;
      default:
        return <ImageResizeTool />;
    }
  };

  const currentTabObj = IMAGE_SUITE_TABS.find((t) => t.id === currentTab) || IMAGE_SUITE_TABS[0];

  return (
    <div className="space-y-6">
      {/* Top Suite Navigation Bar */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Image Tools Professional Suite
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
              15 Browser-Based Utilities
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium w-fit">
            <Shield className="w-3 h-3" />
            <span>100% Private (No server upload)</span>
          </div>
        </div>

        {/* Horizontal scrollable tool tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {IMAGE_SUITE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#141b2d]/80 text-slate-300 hover:text-white hover:bg-slate-800/90 border border-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                <span>{tab.shortName}</span>
                {tab.tag && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {tab.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tool View */}
      <div>{renderCurrentTool()}</div>
    </div>
  );
};
