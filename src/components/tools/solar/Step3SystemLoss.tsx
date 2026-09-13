import React from 'react';
import { Sliders, ShieldCheck, Info, Sparkles, TrendingUp } from 'lucide-react';

interface Step3Props {
  systemLossPercent: number;
  onUpdateLossPercent: (val: number) => void;
  safetyMarginPercent: number;
  onUpdateSafetyMargin: (val: number) => void;
  totalDailyWh: number;
  adjustedDailyWh: number;
}

export const Step3SystemLoss: React.FC<Step3Props> = ({
  systemLossPercent,
  onUpdateLossPercent,
  safetyMarginPercent,
  onUpdateSafetyMargin,
  totalDailyWh,
  adjustedDailyWh,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mt-0.5">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-white">
              Step 3 — System Loss & Design Safety Margin
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-world solar systems do not operate at 100% laboratory efficiency. High ambient
              temperatures, inverter DC-to-AC conversion, wire resistance, and battery chemical
              charge absorption all introduce minor energy losses.
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown explanation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
          <span className="font-semibold text-amber-400 block">☀️ Thermal Panel Loss (8-14%)</span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            As solar cell temperatures rise above 25°C in bright sunlight, panel voltage drops
            slightly (temperature coefficient ~-0.35%/°C).
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
          <span className="font-semibold text-blue-400 block">🔌 Inverter & Controller Loss (5-10%)</span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            High quality Pure Sine Wave inverters typically achieve 90–93% efficiency, while MPPT
            controllers operate around 97–98%.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
          <span className="font-semibold text-emerald-400 block">🔋 Battery & Cable Drop (3-8%)</span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Lithium LiFePO4 cells are ~95% round-trip efficient; Lead-Acid is ~80–85%. DC cable
            runs contribute 1–3% voltage drop.
          </p>
        </div>
      </div>

      {/* Sliders Control */}
      <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-5 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Overall System Loss Factor:</span>
              <span className="text-amber-400 font-mono text-sm">{systemLossPercent}%</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Recommended: 20% – 30% (Default: 25%)</span>
          </div>

          <input
            type="range"
            min="10"
            max="40"
            step="1"
            value={systemLossPercent}
            onChange={(e) => onUpdateLossPercent(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>10% (Ultra High Efficiency)</span>
            <span>25% (Standard Realistic)</span>
            <span>40% (Conservative / High Heat)</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Design Safety / Expansion Margin:</span>
              <span className="text-emerald-400 font-mono text-sm">{safetyMarginPercent}%</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Recommended: 10% – 25% (Default: 15%)</span>
          </div>

          <input
            type="range"
            min="0"
            max="35"
            step="5"
            value={safetyMarginPercent}
            onChange={(e) => onUpdateSafetyMargin(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>0% (Exact Fit)</span>
            <span>15% (Recommended Buffer)</span>
            <span>35% (Heavy Expansion Buffer)</span>
          </div>
        </div>

        {/* Calculation Box */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider block">
              Formula: Adjusted Wh = Daily Wh ÷ (1 - Loss) × (1 + Margin)
            </span>
            <div className="text-xs text-slate-300">
              {totalDailyWh.toLocaleString()} Wh ÷ (1 - {systemLossPercent / 100}) × (1 +{' '}
              {safetyMarginPercent / 100})
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Adjusted Design Daily Energy
            </span>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">
              {adjustedDailyWh.toLocaleString()} Wh/day
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              ({Math.round((adjustedDailyWh / 1000) * 100) / 100} kWh/day)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
