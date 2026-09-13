import React from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';

interface FeedbackCardProps {
  compact?: boolean;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ compact = false }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#0f172a] border border-blue-500/20 p-5 sm:p-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Community & Support</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Suggestions, Feedback & Feature Requests
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Please message us on our Facebook Page for suggestions, feedback, bug reports, or feature requests.
          </p>
        </div>

        <a
          href="https://www.facebook.com/tuxcustodio"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition group shrink-0 border border-blue-400/30"
        >
          <div className="text-left">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <span>💬 Suggestion / Feedback</span>
            </div>
            <div className="text-[11px] text-blue-100 font-normal">
              Please message us on our Facebook Page.
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition shrink-0 ml-1" />
        </a>
      </div>
    </div>
  );
};
