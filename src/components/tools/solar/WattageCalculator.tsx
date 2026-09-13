import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Cpu, RotateCcw } from 'lucide-react';

type Mode = 'find_power' | 'find_current' | 'find_voltage';

export const WattageCalculator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('find_power');
  const [volts, setVolts] = useState<number | string>(220);
  const [amps, setAmps] = useState<number | string>(5);
  const [watts, setWatts] = useState<number | string>(1100);
  const [hoursPerDay, setHoursPerDay] = useState<number | string>(8);

  const reset = () => {
    setMode('find_power');
    setVolts(220);
    setAmps(5);
    setWatts(1100);
    setHoursPerDay(8);
  };

  const calculation = useMemo(() => {
    const v = Number(volts);
    const i = Number(amps);
    const w = Number(watts);
    const h = Number(hoursPerDay) || 0;

    let computedVolts = v;
    let computedAmps = i;
    let computedWatts = w;

    if (mode === 'find_power') {
      if (isNaN(v) || isNaN(i) || v <= 0 || i < 0) return null;
      computedWatts = v * i;
    } else if (mode === 'find_current') {
      if (isNaN(w) || isNaN(v) || w < 0 || v <= 0) return null;
      computedAmps = w / v;
    } else if (mode === 'find_voltage') {
      if (isNaN(w) || isNaN(i) || w < 0 || i <= 0) return null;
      computedVolts = w / i;
    }

    const dailyWh = computedWatts * h;
    const dailyKwh = dailyWh / 1000;
    const monthlyKwh = dailyKwh * 30;

    return {
      volts: Math.round(computedVolts * 100) / 100,
      amps: Math.round(computedAmps * 1000) / 1000,
      watts: Math.round(computedWatts * 10) / 10,
      dailyWh: Math.round(dailyWh),
      dailyKwh: Math.round(dailyKwh * 100) / 100,
      monthlyKwh: Math.round(monthlyKwh * 10) / 10,
    };
  }, [mode, volts, amps, watts, hoursPerDay]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Electrical Wattage & Load Calculator</h3>
              <p className="text-xs text-slate-400">Solve for Watts (P), Volts (V), or Amps (I) with daily kWh energy usage</p>
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

        {/* Mode selector */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setMode('find_power')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              mode === 'find_power'
                ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Find Power (Watts = V × A)
          </button>
          <button
            onClick={() => setMode('find_current')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              mode === 'find_current'
                ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Find Current (Amps = W ÷ V)
          </button>
          <button
            onClick={() => setMode('find_voltage')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              mode === 'find_voltage'
                ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Find Voltage (Volts = W ÷ A)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {mode !== 'find_voltage' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Voltage (V)
              </label>
              <input
                type="number"
                value={volts}
                onChange={(e) => setVolts(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          )}

          {mode !== 'find_current' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current (Amps)
              </label>
              <input
                type="number"
                step="0.1"
                value={amps}
                onChange={(e) => setAmps(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          )}

          {mode !== 'find_power' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Power (Watts)
              </label>
              <input
                type="number"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Operating Hours / Day
            </label>
            <input
              type="number"
              min="0"
              max="24"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>
      </div>

      {calculation && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#252011] border border-yellow-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-400 font-medium">Calculated Power</span>
              <CopyButton textToCopy={`${calculation.watts} W`} variant="icon" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-yellow-400 tracking-tight">
                {calculation.watts}
              </span>
              <span className="text-sm font-mono text-yellow-300 ml-1.5">Watts</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {calculation.volts}V @ {calculation.amps}A
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Daily Energy Usage</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                {calculation.dailyKwh}
              </span>
              <span className="text-sm font-mono text-slate-400 ml-1.5">kWh/day</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">{calculation.dailyWh} Wh for {hoursPerDay}h runtime</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Monthly Energy (30 Days)</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                {calculation.monthlyKwh}
              </span>
              <span className="text-sm font-mono text-slate-400 ml-1.5">kWh/month</span>
            </div>
            <div className="text-xs text-slate-500">Estimated billing units per month</div>
          </div>
        </div>
      )}
    </div>
  );
};
