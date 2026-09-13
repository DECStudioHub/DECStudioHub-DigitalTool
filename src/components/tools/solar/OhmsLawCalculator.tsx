import React, { useState } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Activity, RotateCcw } from 'lucide-react';

export const OhmsLawCalculator: React.FC = () => {
  const [voltage, setVoltage] = useState<string>('12');
  const [current, setCurrent] = useState<string>('2.5');
  const [resistance, setResistance] = useState<string>('');
  const [power, setPower] = useState<string>('');

  const clearAll = () => {
    setVoltage('');
    setCurrent('');
    setResistance('');
    setPower('');
  };

  // Derive the 4 values if at least 2 are present
  const result = (() => {
    const v = parseFloat(voltage);
    const i = parseFloat(current);
    const r = parseFloat(resistance);
    const p = parseFloat(power);

    const hasV = !isNaN(v) && v > 0;
    const hasI = !isNaN(i) && i > 0;
    const hasR = !isNaN(r) && r > 0;
    const hasP = !isNaN(p) && p > 0;

    let calcV = hasV ? v : null;
    let calcI = hasI ? i : null;
    let calcR = hasR ? r : null;
    let calcP = hasP ? p : null;

    if (hasV && hasI) {
      calcR = v / i;
      calcP = v * i;
    } else if (hasV && hasR) {
      calcI = v / r;
      calcP = (v * v) / r;
    } else if (hasV && hasP) {
      calcI = p / v;
      calcR = (v * v) / p;
    } else if (hasI && hasR) {
      calcV = i * r;
      calcP = i * i * r;
    } else if (hasI && hasP) {
      calcV = p / i;
      calcR = p / (i * i);
    } else if (hasR && hasP) {
      calcV = Math.sqrt(p * r);
      calcI = Math.sqrt(p / r);
    }

    if (calcV !== null && calcI !== null && calcR !== null && calcP !== null) {
      return {
        v: Math.round(calcV * 1000) / 1000,
        i: Math.round(calcI * 1000) / 1000,
        r: Math.round(calcR * 1000) / 1000,
        p: Math.round(calcP * 1000) / 1000,
      };
    }
    return null;
  })();

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Ohm's Law Master Matrix Calculator</h3>
              <p className="text-xs text-slate-400">Enter any two values (Voltage, Current, Resistance, or Power) to solve for all remaining variables</p>
            </div>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Voltage (V) — Volts
            </label>
            <input
              type="number"
              placeholder="e.g. 12"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Current (I) — Amperes
            </label>
            <input
              type="number"
              placeholder="e.g. 2.5"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Resistance (R) — Ohms (Ω)
            </label>
            <input
              type="number"
              placeholder="e.g. 4.8"
              value={resistance}
              onChange={(e) => setResistance(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Power (P) — Watts (W)
            </label>
            <input
              type="number"
              placeholder="e.g. 30"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-500">
          Tip: Enter any 2 values above, and the other 2 will calculate automatically in real time.
        </div>
      </div>

      {result ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Voltage (V)</span>
              <CopyButton textToCopy={`${result.v} V`} variant="icon" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-yellow-400">{result.v}</span>
              <span className="text-sm font-mono text-slate-400 ml-1">V</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Formula: V = I × R</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Current (I)</span>
              <CopyButton textToCopy={`${result.i} A`} variant="icon" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-emerald-400">{result.i}</span>
              <span className="text-sm font-mono text-slate-400 ml-1">A</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Formula: I = V / R</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Resistance (R)</span>
              <CopyButton textToCopy={`${result.r} Ω`} variant="icon" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-cyan-400">{result.r}</span>
              <span className="text-sm font-mono text-slate-400 ml-1">Ω</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Formula: R = V / I</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Power (P)</span>
              <CopyButton textToCopy={`${result.p} W`} variant="icon" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-amber-400">{result.p}</span>
              <span className="text-sm font-mono text-slate-400 ml-1">W</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Formula: P = V × I</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
          Enter at least two values above to solve Ohm's Law and Power equations.
        </div>
      )}
    </div>
  );
};
