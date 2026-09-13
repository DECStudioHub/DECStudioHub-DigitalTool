import React from 'react';
import { Star, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { TOOLS, CATEGORIES } from '../../data/toolsData';
import { ToolDefinition } from '../../types';
import { IconRenderer } from '../common/IconRenderer';
import { FavoriteButton } from '../common/FavoriteButton';

interface FavoritesViewProps {
  onSelectTool: (tool: ToolDefinition) => void;
  onBack: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onSelectTool, onBack }) => {
  const { favorites } = useFavorites();

  const favoriteTools = TOOLS.filter((t) => favorites.includes(t.id));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Favorite Tools
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                  {favoriteTools.length} {favoriteTools.length === 1 ? 'tool' : 'tools'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                Quick access to your starred calculators and utilities. Saved directly in your browser.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State vs Tool Grid */}
      {favoriteTools.length === 0 ? (
        <div className="rounded-3xl bg-[#111827] border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Star className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">No favorite tools yet</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Click the star icon (☆) on any tool to pin it here for quick one-click access.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteTools.map((tool) => {
            const category = CATEGORIES.find((c) => c.id === tool.categoryId);

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                className="group relative p-5 rounded-2xl bg-[#111827] hover:bg-[#151f33] border border-slate-800 hover:border-amber-500/40 cursor-pointer transition flex flex-col justify-between space-y-4 shadow-lg shadow-black/20"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 group-hover:bg-amber-500/10 border border-slate-700/60 group-hover:border-amber-500/30 text-slate-300 group-hover:text-amber-400 transition">
                      <IconRenderer icon={tool.icon} className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {category && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {category.name}
                        </span>
                      )}
                      <FavoriteButton toolId={tool.id} size="sm" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.shortDescription || tool.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 group-hover:text-amber-400 font-medium transition">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
