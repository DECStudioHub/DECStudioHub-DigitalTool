import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { CategoryView } from './components/dashboard/CategoryView';
import { FavoritesView } from './components/dashboard/FavoritesView';
import { ToolHost } from './components/tools/ToolHost';
import { GlobalSearchModal } from './components/dashboard/GlobalSearchModal';
import { TOOLS, CATEGORIES } from './data/toolsData';
import { SOCIAL_LINKS } from './data/socialLinks';
import { IconRenderer } from './components/common/IconRenderer';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { ToolDefinition } from './types';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isFavoritesView, setIsFavoritesView] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Synchronize with URL hash for shareable links and browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      if (hash === 'favorites') {
        setIsFavoritesView(true);
        setActiveTool(null);
        setActiveCategoryId(null);
        return;
      }

      if (hash.startsWith('tool-')) {
        let toolId = hash.replace('tool-', '');
        if (toolId === 'solar-panel') toolId = 'solar-system';
        const found = TOOLS.find((t) => t.id === toolId);
        if (found) {
          setActiveTool(found);
          setActiveCategoryId(null);
          setIsFavoritesView(false);
          return;
        }
      } else if (hash.startsWith('cat-')) {
        const catId = hash.replace('cat-', '');
        const found = CATEGORIES.find((c) => c.id === catId);
        if (found) {
          setActiveCategoryId(catId);
          setActiveTool(null);
          setIsFavoritesView(false);
          return;
        }
      }

      // Default to Dashboard
      if (!hash) {
        setActiveTool(null);
        setActiveCategoryId(null);
        setIsFavoritesView(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut for Global Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveTool(tool);
    setActiveCategoryId(null);
    setIsFavoritesView(false);
    window.location.hash = `tool-${tool.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setActiveTool(null);
    setIsFavoritesView(false);
    window.location.hash = `cat-${categoryId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFavorites = () => {
    setIsFavoritesView(true);
    setActiveTool(null);
    setActiveCategoryId(null);
    window.location.hash = 'favorites';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setActiveTool(null);
    setActiveCategoryId(null);
    setIsFavoritesView(false);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategory = activeCategoryId
    ? CATEGORIES.find((c) => c.id === activeCategoryId) || null
    : null;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar (Desktop Persistent / Mobile Drawer) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTool={activeTool}
        activeCategoryId={activeCategoryId}
        isFavoritesActive={isFavoritesView}
        onSelectTool={handleSelectTool}
        onSelectCategory={handleSelectCategory}
        onSelectFavorites={handleSelectFavorites}
        onGoHome={handleGoHome}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300">
        {/* Sticky Top Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectTool={handleSelectTool}
          onSelectFavorites={handleSelectFavorites}
          onGoHome={handleGoHome}
        />

        {/* Primary Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTool ? (
            <ToolHost
              tool={activeTool}
              onBack={handleGoHome}
              onSelectCategory={handleSelectCategory}
            />
          ) : isFavoritesView ? (
            <FavoritesView
              onSelectTool={handleSelectTool}
              onBack={handleGoHome}
            />
          ) : activeCategory ? (
            <CategoryView
              category={activeCategory}
              onSelectTool={handleSelectTool}
              onBack={handleGoHome}
            />
          ) : (
            <Dashboard
              onSelectTool={handleSelectTool}
              onSelectCategory={handleSelectCategory}
              onSelectFavorites={handleSelectFavorites}
              onOpenSearch={() => setIsSearchOpen(true)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#070a12] py-8 px-4 lg:px-8 mt-auto space-y-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight">DECStudioHub</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your Everyday Digital Toolbox — 100% Client-Side, Private & Fast
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.facebook.com/tuxcustodio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500 text-blue-300 hover:text-white text-xs font-semibold transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>💬 Suggestion / Feedback</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <button
                onClick={() => {
                  const coffee = TOOLS.find((t) => t.id === 'buy-me-a-coffee');
                  if (coffee) handleSelectTool(coffee);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500 text-rose-300 hover:text-white text-xs font-semibold transition"
              >
                <span>☕ Buy Me a Coffee</span>
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${s.name}: ${s.handle}`}
                  className="p-2 rounded-xl bg-[#0f1523] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition flex items-center justify-center"
                >
                  <IconRenderer icon={s.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
            <span>Client-Side Local Processing • No Analytics Tracking</span>
            <span>Please message us on our Facebook Page for suggestions or feedback.</span>
          </div>
        </footer>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={handleSelectTool}
      />
    </div>
  );
}
