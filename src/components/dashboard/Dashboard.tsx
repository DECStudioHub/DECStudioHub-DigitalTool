import React from 'react';
import { CATEGORIES, TOOLS } from '../../data/toolsData';
import { ToolDefinition } from '../../types';
import { IconRenderer } from '../common/IconRenderer';
import { FavoriteButton } from '../common/FavoriteButton';
import { useFavorites } from '../../context/FavoritesContext';
import { Search, Sparkles, ArrowRight, ShieldCheck, Zap, Layers, Star } from 'lucide-react';
import { FeedbackCard } from '../common/FeedbackCard';
import { SocialMediaSection } from '../common/SocialMediaSection';

interface DashboardProps {
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectFavorites?: () => void;
  onOpenSearch: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectTool,
  onSelectCategory,
  onSelectFavorites,
  onOpenSearch,
}) => {
  const { favorites } = useFavorites();
  const popularTools = TOOLS.filter((t) => t.popular);
  const favoriteTools = TOOLS.filter((t) => favorites.includes(t.id));

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1527] via-[#111c38] to-[#17102e] border border-blue-500/20 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            Everyday Engineering & Lifestyle Suite
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            DECStudioHub
            <span className="block text-xl sm:text-2xl font-normal text-slate-300 mt-1">
              Your Everyday Digital Toolbox
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            High-precision client-side calculators, network diagnostics, solar power configuration, household electricity planning, motorcycle trip trackers, and private in-browser image studio. Zero ads, zero tracking, instant execution.
          </p>

          {/* Creator Disclaimer / Note */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-950/40 border border-blue-500/25 backdrop-blur-xs flex items-start gap-3 shadow-inner">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed italic">
              <span className="font-bold text-blue-300 not-italic">Disclaimer:</span> I’m not a programmer. I’m a human with a bold imagination—and AI is the tool that brings my ideas to life.
            </p>
          </div>

          {/* Quick Search Launch Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="flex-1 max-w-lg flex items-center justify-between px-4 py-3 rounded-2xl bg-[#090d16]/80 hover:bg-[#090d16] border border-slate-700/80 hover:border-blue-500/50 text-slate-400 hover:text-slate-200 shadow-inner transition group"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                <span className="text-xs sm:text-sm">Search all tools (e.g. Solar System, Subnet, Fuel, Loan)...</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                Ctrl + K
              </span>
            </button>

            <button
              onClick={() => {
                const coffee = TOOLS.find((t) => t.id === 'buy-me-a-coffee');
                if (coffee) onSelectTool(coffee);
              }}
              className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2"
            >
              Support Project
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Favorites Bar (If user has pinned favorites) */}
      {favoriteTools.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#111827] to-[#111827] border border-amber-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Your Pinned Favorites ({favoriteTools.length})
              </h2>
            </div>
            {onSelectFavorites && (
              <button
                type="button"
                onClick={onSelectFavorites}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition font-medium"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {favoriteTools.slice(0, 6).map((tool) => (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                className="p-3 rounded-xl bg-[#0b0f19] hover:bg-[#152033] border border-slate-800 hover:border-amber-500/50 cursor-pointer transition flex items-center gap-2.5 group min-w-0"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 shrink-0">
                  <IconRenderer icon={tool.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white group-hover:text-amber-300 truncate">
                    {tool.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Category Navigation Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Tool Categories
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => {
            const count = TOOLS.filter((t) => t.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="p-4 rounded-2xl bg-[#111827] hover:bg-[#152033] border border-slate-800 hover:border-blue-500/40 text-left transition group flex flex-col justify-between"
              >
                <div className="p-2.5 rounded-xl bg-slate-800/80 group-hover:bg-blue-500/20 group-hover:text-blue-400 text-slate-300 w-fit transition mb-2">
                  <IconRenderer icon={cat.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition line-clamp-1">
                    {cat.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {count} {count === 1 ? 'tool' : 'tools'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular / Featured Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Featured & Popular Tools
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {popularTools.length} Quick Launch items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.slice(0, 8).map((tool) => {
            const cat = CATEGORIES.find((c) => c.id === tool.categoryId);
            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                className="p-4 rounded-2xl bg-[#111827] hover:bg-[#131d30] border border-slate-800 hover:border-blue-500/50 text-left transition duration-200 group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg shadow-black/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                      <IconRenderer icon={tool.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {cat && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
                          {cat.name}
                        </span>
                      )}
                      <FavoriteButton toolId={tool.id} size="sm" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400 group-hover:text-blue-300">
                  <span className="font-mono text-[11px]">Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categorized Sections */}
      {CATEGORIES.map((cat) => {
        const catTools = TOOLS.filter((t) => t.categoryId === cat.id);
        if (catTools.length === 0) return null;

        return (
          <div key={cat.id} id={`section-${cat.id}`} className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-blue-400 border border-slate-700/60">
                  <IconRenderer icon={cat.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-slate-400">{cat.description}</p>
                </div>
              </div>
              <button
                onClick={() => onSelectCategory(cat.id)}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
              >
                <span>View All ({catTools.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool)}
                  className="p-4 rounded-2xl bg-[#111827] hover:bg-[#141f33] border border-slate-800 hover:border-blue-500/40 text-left transition duration-200 group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg shadow-black/20"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-slate-800/80 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                        <IconRenderer icon={tool.icon} className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {tool.popular && (
                          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            POPULAR
                          </span>
                        )}
                        <FavoriteButton toolId={tool.id} size="sm" />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {tool.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400 group-hover:text-blue-400">
                    <span className="font-mono text-[11px]">Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Suggestion / Feedback Section */}
      <FeedbackCard />

      {/* Social Media Section */}
      <SocialMediaSection />

      {/* Footer Trust Bar */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Client-Side Processing:</strong> All computations, electrical formulas, solar PV designs, and image edits run locally on your device.
          </span>
        </div>
        <div className="font-mono text-slate-400">
          DECStudioHub v1.0.0 — Crafted for Everyday Productivity
        </div>
      </div>
    </div>
  );
};
