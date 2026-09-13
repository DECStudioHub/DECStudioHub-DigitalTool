import React, { useState } from 'react';
import { CATEGORIES, TOOLS } from '../../data/toolsData';
import { ToolDefinition } from '../../types';
import { IconRenderer } from '../common/IconRenderer';
import { useFavorites } from '../../context/FavoritesContext';
import {
  LayoutDashboard,
  Star,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: ToolDefinition | null;
  activeCategoryId: string | null;
  isFavoritesActive?: boolean;
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectFavorites?: () => void;
  onGoHome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTool,
  activeCategoryId,
  isFavoritesActive = false,
  onSelectTool,
  onSelectCategory,
  onSelectFavorites,
  onGoHome,
}) => {
  const { favorites } = useFavorites();
  const favoriteTools = TOOLS.filter((t) => favorites.includes(t.id));

  // Expanded categories in sidebar
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    favorites: true,
    it: false,
    calculators: false,
    motorcycle: false,
    solar: false,
    'household-electricity': false,
    units: false,
    image: false,
    donation: false,
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const renderToolLink = (tool: ToolDefinition) => {
    const isSelected = activeTool?.id === tool.id;

    return (
      <button
        key={tool.id}
        onClick={() => {
          onSelectTool(tool);
          onClose();
        }}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition text-left truncate ${
          isSelected
            ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <IconRenderer icon={tool.icon} className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{tool.name}</span>
        </div>
        {tool.popular && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#090d16] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onGoHome();
              onClose();
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
              DEC
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight">
                DECStudioHub
              </span>
              <span className="block text-[10px] text-slate-400">Digital Toolbox</span>
            </div>
          </button>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {/* Home / Dashboard button */}
          <button
            onClick={() => {
              onGoHome();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              !activeTool && !activeCategoryId && !isFavoritesActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>Dashboard & Overview</span>
          </button>

          {/* ⭐ FAVORITES Accordion / Button */}
          <div className="space-y-0.5 pt-1">
            <div
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                isFavoritesActive && !activeTool
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <button
                onClick={() => {
                  if (onSelectFavorites) onSelectFavorites();
                  onClose();
                }}
                className="flex items-center gap-2.5 flex-1 text-left truncate"
              >
                <Star
                  className={`w-4 h-4 transition ${
                    favoriteTools.length > 0 ? 'text-amber-400 fill-amber-400' : 'text-amber-400'
                  }`}
                />
                <span className="truncate font-bold">Favorites</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  {favoriteTools.length}
                </span>
                <button
                  type="button"
                  onClick={() => toggleCategory('favorites')}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Toggle favorites list"
                >
                  {expandedCategories.favorites ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Favorite tools sub-list */}
            {expandedCategories.favorites && (
              <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-amber-500/20 ml-4 my-1">
                {favoriteTools.length === 0 ? (
                  <div className="px-2.5 py-2 text-[11px] text-slate-500 italic">
                    No favorite tools yet. Click the star icon (☆) on any tool to pin it here.
                  </div>
                ) : (
                  favoriteTools.map(renderToolLink)
                )}
              </div>
            )}
          </div>

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Categories
          </div>

          {/* Categories Accordion */}
          {CATEGORIES.map((category) => {
            const isExpanded = !!expandedCategories[category.id];
            const catTools = TOOLS.filter((t) => t.categoryId === category.id);
            const isCategoryActive = activeCategoryId === category.id && !activeTool && !isFavoritesActive;

            return (
              <div key={category.id} className="space-y-0.5">
                <div
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                    isCategoryActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectCategory(category.id);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 flex-1 text-left truncate"
                  >
                    <IconRenderer
                      icon={category.icon}
                      className="w-4 h-4 text-blue-400 group-hover:scale-110 transition"
                    />
                    <span className="truncate">{category.name}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {catTools.length}
                    </span>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-tools list */}
                {isExpanded && (
                  <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-slate-800/80 ml-4 my-1">
                    {catTools.map(renderToolLink)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
