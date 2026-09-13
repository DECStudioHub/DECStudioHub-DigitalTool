import React from 'react';
import { Category, ToolDefinition } from '../../types';
import { TOOLS } from '../../data/toolsData';
import { IconRenderer } from '../common/IconRenderer';
import { FavoriteButton } from '../common/FavoriteButton';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface CategoryViewProps {
  category: Category;
  onSelectTool: (tool: ToolDefinition) => void;
  onBack: () => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  onSelectTool,
  onBack,
}) => {
  const categoryTools = TOOLS.filter((t) => t.categoryId === category.id);

  const renderToolCard = (tool: ToolDefinition) => (
    <div
      key={tool.id}
      onClick={() => onSelectTool(tool)}
      className="p-5 rounded-2xl bg-[#111827] hover:bg-[#131d31] border border-slate-800 hover:border-blue-500/40 text-left transition duration-200 group flex flex-col justify-between space-y-4 cursor-pointer shadow-lg shadow-black/20"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
            <IconRenderer icon={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.popular && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                POPULAR
              </span>
            )}
            <FavoriteButton toolId={tool.id} size="sm" />
          </div>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
          {tool.name}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {tool.shortDescription || tool.description}
        </p>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-800/70">
        <div className="flex items-center gap-1 flex-wrap">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-[#0b0f19] border border-slate-800 text-[10px] font-mono text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400 font-medium">
          <span>Open Tool</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Category Header */}
      <div className="border-b border-slate-800 pb-5 space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/5">
            <IconRenderer icon={category.icon} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {category.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs">
                {categoryTools.length} {categoryTools.length === 1 ? 'tool' : 'tools'}
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryTools.map(renderToolCard)}
      </div>
    </div>
  );
};
