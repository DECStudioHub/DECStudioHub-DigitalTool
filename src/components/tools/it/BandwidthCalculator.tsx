import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { RotateCcw, Activity, AlertCircle, Users, Check } from 'lucide-react';

export const BandwidthCalculator: React.FC = () => {
  const [usersCount, setUsersCount] = useState<number | string>(25);
  const [mbpsPerUser, setMbpsPerUser] = useState<number | string>(5);
  const [overheadPct, setOverheadPct] = useState<number | string>(25);

  const reset = () => {
    setUsersCount(25);
    setMbpsPerUser(5);
    setOverheadPct(25);
  };

  const calculation = useMemo(() => {
    const users = Number(usersCount);
    const perUser = Number(mbpsPerUser);
    const overhead = Number(overheadPct);

    if (isNaN(users) || isNaN(perUser) || isNaN(overhead)) {
      return { error: 'Please enter valid numerical parameters' };
    }
    if (users <= 0) {
      return { error: 'Number of users/devices must be at least 1' };
    }
    if (perUser <= 0) {
      return { error: 'Average Mbps per user must be greater than 0' };
    }
    if (overhead < 0 || overhead > 200) {
      return { error: 'Overhead percentage must be between 0% and 200%' };
    }

    const baseMbps = users * perUser;
    const recommendedMbps = baseMbps * (1 + overhead / 100);

    // Recommended ISP Tier
    let suggestedTier = '100 Mbps';
    if (recommendedMbps > 1000) {
      suggestedTier = `${(Math.ceil(recommendedMbps / 500) * 0.5).toFixed(1)} Gbps Dedicated Line`;
    } else if (recommendedMbps > 500) {
      suggestedTier = '1 Gbps (1000 Mbps) Commercial Fiber';
    } else if (recommendedMbps > 300) {
      suggestedTier = '500 Mbps Business Fiber';
    } else if (recommendedMbps > 100) {
      suggestedTier = '300 Mbps Fiber';
    } else if (recommendedMbps > 50) {
      suggestedTier = '100 Mbps Broadband';
    } else {
      suggestedTier = '50 Mbps Broadband';
    }

    // Capacity metrics
    const concurrent1080p = Math.floor(recommendedMbps / 5);
    const concurrent4k = Math.floor(recommendedMbps / 25);
    const concurrentVoip = Math.floor(recommendedMbps / 0.1);

    return {
      error: null,
      baseMbps: Math.round(baseMbps * 10) / 10,
      recommendedMbps: Math.round(recommendedMbps * 10) / 10,
      recommendedGbps: (recommendedMbps / 1000).toFixed(2),
      suggestedTier,
      concurrent1080p,
      concurrent4k,
      concurrentVoip,
      overheadBandwidth: Math.round((recommendedMbps - baseMbps) * 10) / 10,
    };
  }, [usersCount, mbpsPerUser, overheadPct]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Network Bandwidth Requirement Calculator</h3>
              <p className="text-xs text-slate-400">Plan concurrent throughput, ISP tier selection, and peak traffic headroom</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Active Users / Devices
            </label>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <input
                type="number"
                id="bw-users"
                min="1"
                value={usersCount}
                onChange={(e) => setUsersCount(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Average Mbps per User
            </label>
            <input
              type="number"
              id="bw-per-user"
              step="0.5"
              min="0.5"
              value={mbpsPerUser}
              onChange={(e) => setMbpsPerUser(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Overhead / Safety Headroom (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bw-overhead"
                min="0"
                max="100"
                value={overheadPct}
                onChange={(e) => setOverheadPct(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
              />
              <span className="text-slate-400 font-mono text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Quick User-Activity Presets */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px]">Usage Presets:</span>
          <button
            onClick={() => setMbpsPerUser(2)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            Light Office (2 Mbps)
          </button>
          <button
            onClick={() => setMbpsPerUser(5)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            Standard HD / Video Calls (5 Mbps)
          </button>
          <button
            onClick={() => setMbpsPerUser(15)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            Heavy / 4K / CAD Transfer (15 Mbps)
          </button>
        </div>
      </div>

      {calculation.error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{calculation.error}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Base Bandwidth</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-slate-200 tracking-tight">
                  {calculation.baseMbps}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">Mbps</span>
              </div>
              <div className="text-xs text-slate-500">Pure sum without overhead buffer</div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#142035] border border-emerald-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium">Recommended Bandwidth</span>
                <CopyButton textToCopy={`${calculation.recommendedMbps} Mbps`} variant="icon" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                  {calculation.recommendedMbps}
                </span>
                <span className="text-sm font-mono text-emerald-300 ml-1.5">Mbps</span>
                {calculation.recommendedMbps >= 1000 && (
                  <div className="text-xs font-mono text-emerald-300/80 mt-0.5">
                    ({calculation.recommendedGbps} Gbps)
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-400">Includes +{calculation.overheadBandwidth} Mbps buffer</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Suggested ISP Subscription Tier</span>
              <div className="my-2 text-lg font-bold text-cyan-400">
                {calculation.suggestedTier}
              </div>
              <div className="text-xs text-slate-500">Commercial or enterprise symmetric fiber</div>
            </div>
          </div>

          {/* Concurrent Streams breakdown */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Theoretical Concurrent Stream Capacities (at {calculation.recommendedMbps} Mbps)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">1080p HD Streams (5 Mbps):</span>
                <span className="text-emerald-400 font-bold font-sans">~{calculation.concurrent1080p} streams</span>
              </div>
              <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">4K UHD Streams (25 Mbps):</span>
                <span className="text-cyan-400 font-bold font-sans">~{calculation.concurrent4k} streams</span>
              </div>
              <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">VoIP Phone Calls (100 Kbps):</span>
                <span className="text-amber-400 font-bold font-sans">~{calculation.concurrentVoip} calls</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
