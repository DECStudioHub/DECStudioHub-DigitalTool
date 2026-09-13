import React from 'react';
import { Search, Menu, Wrench, Heart, Star } from 'lucide-react';
import { ToolDefinition } from '../../types';
import { TOOLS } from '../../data/toolsData';
import { useFavorites } from '../../context/FavoritesContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
  onSelectFavorites?: () => void;
  onGoHome: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onSelectTool,
  onSelectFavorites,
  onGoHome,
}) => {
  const { favorites } = useFavorites();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm md:text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>DECStudioHub</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                TOOLBOX
              </span>
            </div>
            <div className="hidden sm:block text-[10px] text-slate-400 font-medium">
              Your Everyday Digital Toolbox
            </div>
          </div>
        </button>
      </div>

      {/* Middle: Global Search bar trigger */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#111827] border border-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-slate-200 text-xs transition shadow-sm group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-blue-400 group-hover:scale-110 transition shrink-0" />
            <span className="truncate">Search tools, formulas, commands...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2 shrink-0">
        {onSelectFavorites && (
          <button
            onClick={onSelectFavorites}
            title="View Favorite Tools"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
          >
            <Star className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Favorites</span>
            <span className="text-[10px] font-mono px-1 rounded bg-amber-500/20 border border-amber-500/30">{favorites.length}</span>
          </button>
        )}

        <button
          onClick={() => {
            const coffee = TOOLS.find((t) => t.id === 'buy-me-a-coffee');
            if (coffee) onSelectTool(coffee);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold transition"
        >
          <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
          <span className="hidden sm:inline">Donate</span>
        </button>
      </div>
    </header>
  );
};
