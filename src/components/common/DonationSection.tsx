import React from 'react';
import { CopyButton } from './CopyButton';
import { Heart, Coffee, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { FeedbackCard } from './FeedbackCard';
import { SocialMediaSection } from './SocialMediaSection';

export const DonationSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121c32] via-[#0f172a] to-[#18112e] border border-blue-500/20 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Heart className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
            Support DECStudioHub Development
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Help keep our digital toolbox free, private, and open for everyone.
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            DECStudioHub was created to provide fast, reliable, zero-tracking everyday tools for engineers, IT professionals, riders, solar builders, and creators. If these calculators and utilities saved you time or helped on a project, your voluntary support helps cover hosting and ongoing tool development!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GCash Card */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-sky-500/30 relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center font-black text-sky-400 text-lg">
                G
              </div>
              <div>
                <h3 className="text-base font-bold text-white">GCash (Philippines)</h3>
                <p className="text-xs text-slate-400">Direct mobile wallet transfer</p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Instant
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">Account Mobile Number</div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-mono font-bold text-white tracking-wider">
                09454026319
              </span>
              <CopyButton textToCopy="09454026319" label="Copy Number" />
            </div>
            <div className="text-[11px] text-slate-500">Account Name: Dante C.</div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Open your GCash app &gt; Send Money &gt; Express Send</span>
          </div>
        </div>

        {/* PayPal Card */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-indigo-500/30 relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-lg">
                P
              </div>
              <div>
                <h3 className="text-base font-bold text-white">PayPal (International)</h3>
                <p className="text-xs text-slate-400">Credit card & global currencies</p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Global
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">Recipient PayPal Email</div>
            <div className="flex items-center justify-between">
              <span className="text-base md:text-lg font-mono font-bold text-white truncate pr-2">
                dantecustodio13@gmail.com
              </span>
              <CopyButton textToCopy="dantecustodio13@gmail.com" label="Copy Email" />
            </div>
            <div className="text-[11px] text-slate-500">Recipient: Dante Custodio</div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Send via PayPal balance, debit, or credit card</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex items-center gap-4 text-xs text-slate-400">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <strong className="text-white block font-medium mb-0.5">Zero Paywalls, Zero Tracking, Zero Ads</strong>
          All DECStudioHub utilities execute 100% on client-side browsers with no intrusive analytics, telemetry, or account sign-in requirements. Maraming salamat sa inyong suporta!
        </div>
      </div>

      {/* Suggestion / Feedback banner */}
      <FeedbackCard />

      {/* Official Social Media links */}
      <SocialMediaSection />
    </div>
  );
};
