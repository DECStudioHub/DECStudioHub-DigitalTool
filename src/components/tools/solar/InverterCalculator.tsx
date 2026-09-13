import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { DisclaimerBox } from '../../common/DisclaimerBox';
import { Zap, RotateCcw, AlertCircle } from 'lucide-react';

export const InverterCalculator: React.FC = () => {
  const [continuousLoadWatts, setContinuousLoadWatts] = useState<number | string>(1200);
  const [motorSurgeWatts, setMotorSurgeWatts] = useState<number | string>(1500); // Surge from fridge/pump/motor
  const [safetyMarginPct, setSafetyMarginPct] = useState<number>(25); // 25% recommended headroom

  const reset = () => {
    setContinuousLoadWatts(1200);
    setMotorSurgeWatts(1500);
    setSafetyMarginPct(25);
  };

  const calculation = useMemo(() => {
    const running = Number(continuousLoadWatts);
    const motorSurge = Number(motorSurgeWatts);
    const margin = Number(safetyMarginPct) / 100;

    if (isNaN(running) || isNaN(motorSurge) || isNaN(margin)) {
      return { error: 'Please enter valid numerical values' };
    }
    if (running <= 0) return { error: 'Continuous running load must be greater than 0 Watts' };
    if (motorSurge < 0) return { error: 'Motor surge load cannot be negative' };

    // Continuous sizing includes safety margin
    const recommendedContinuousWatts = Math.ceil(running * (1 + margin));
    // Surge sizing: running base + momentary startup inrush
    const peakSurgeWatts = Math.ceil((running + motorSurge) * 1.15);

    // Standard commercial inverter tiers
    const tiers = [300, 500, 800, 1000, 1500, 2000, 2400, 3000, 4000, 5000, 6000, 8000, 10000];
    const recommendedModelTier = tiers.find((t) => t >= recommendedContinuousWatts) || Math.ceil(recommendedContinuousWatts / 1000) * 1000;

    return {
      error: null,
      running,
      motorSurge,
      recommendedContinuousWatts,
      peakSurgeWatts,
      recommendedModelTier,
    };
  }, [continuousLoadWatts, motorSurgeWatts, safetyMarginPct]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Power Inverter Sizing Calculator</h3>
              <p className="text-xs text-slate-400">Determine continuous inverter wattage, surge requirements, and power factor headroom</p>
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
              Simultaneous Continuous Load (Watts)
            </label>
            <input
              type="number"
              min="50"
              value={continuousLoadWatts}
              onChange={(e) => setContinuousLoadWatts(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">Total running appliances combined</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Largest Motor / Compressor Inrush (Watts)
            </label>
            <input
              type="number"
              min="0"
              value={motorSurgeWatts}
              onChange={(e) => setMotorSurgeWatts(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">Fridge, A/C, or water pump (typ. 2–3x running)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Recommended Headroom / Margin
            </label>
            <select
              value={safetyMarginPct}
              onChange={(e) => setSafetyMarginPct(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            >
              <option value="15">15% (Tight / Budget)</option>
              <option value="25">25% (Standard Engineering Best Practice)</option>
              <option value="35">35% (High Reliability / Expanding system)</option>
            </select>
          </div>
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
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#272010] border border-yellow-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-400 font-medium">Recommended Standard Size</span>
                <CopyButton textToCopy={`${calculation.recommendedModelTier}W Pure Sine Wave`} variant="icon" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-yellow-400 tracking-tight">
                  {calculation.recommendedModelTier}
                </span>
                <span className="text-sm font-mono text-yellow-300 ml-1.5">Watts</span>
              </div>
              <div className="text-xs text-slate-400">Pure Sine Wave Inverter rating</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Continuous Power Threshold</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                  {calculation.recommendedContinuousWatts}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">Watts</span>
              </div>
              <div className="text-xs text-slate-500">Includes {safetyMarginPct}% safety headroom</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Peak Surge Capability</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-rose-400 tracking-tight">
                  {calculation.peakSurgeWatts}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">Watts (Surge)</span>
              </div>
              <div className="text-xs text-slate-500">Instantaneous motor startup load</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 text-xs text-slate-300 space-y-1">
            <strong className="text-white block">Waveform Note: Pure Sine Wave vs Modified Sine Wave</strong>
            <p className="text-slate-400">
              Always choose a <strong>Pure Sine Wave</strong> inverter for sensitive household electronics, laptops, motor-driven compressor appliances (refrigerators, air-conditioners), and audio systems. Modified sine wave inverters produce high total harmonic distortion (THD), causing motors to overheat, hum loudly, and fail prematurely.
            </p>
          </div>

          <DisclaimerBox
            title="Inverter Installation Advisory"
            text="High-power inverters draw substantial DC currents from battery banks (e.g. 100A+ at 12V). Always install dedicated DC disconnect switches, appropriate Class T fuses close to the battery terminal, and heavy gauge copper cables properly torqued to prevent terminal heating and fire hazards."
          />
        </div>
      )}
    </div>
  );
};
