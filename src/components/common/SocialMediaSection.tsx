import React from 'react';
import { SOCIAL_LINKS } from '../../data/socialLinks';
import { IconRenderer } from './IconRenderer';
import { ExternalLink, Globe } from 'lucide-react';

export const SocialMediaSection: React.FC = () => {
  return (
    <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Follow DECStudioHub
            </h3>
            <p className="text-xs text-slate-400">
              Stay connected for tutorials, project updates, and new tool releases
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          Official Channels
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-xl bg-[#0d131f] border border-slate-800/80 text-slate-300 transition flex items-center justify-between group ${link.color}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 group-hover:scale-105 transition shrink-0">
                <IconRenderer icon={link.icon} className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <span className="text-xs font-semibold text-white block group-hover:text-current transition truncate">
                  {link.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {link.handle}
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-current group-hover:translate-x-0.5 transition shrink-0 ml-1.5" />
          </a>
        ))}
      </div>
    </div>
  );
};
