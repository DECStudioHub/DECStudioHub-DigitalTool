import React, { useState } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Percent, RotateCcw, ArrowRight } from 'lucide-react';

export const PercentageCalculator: React.FC = () => {
  // Mode 1: What is X% of Y?
  const [val1X, setVal1X] = useState<number | string>(15);
  const [val1Y, setVal1Y] = useState<number | string>(250);

  // Mode 2: X is what percent of Y?
  const [val2X, setVal2X] = useState<number | string>(45);
  const [val2Y, setVal2Y] = useState<number | string>(180);

  // Mode 3: Percentage increase / decrease from X to Y
  const [val3From, setVal3From] = useState<number | string>(80);
  const [val3To, setVal3To] = useState<number | string>(120);

  // Mode 4: Percentage difference between X and Y
  const [val4A, setVal4A] = useState<number | string>(50);
  const [val4B, setVal4B] = useState<number | string>(75);

  const resetAll = () => {
    setVal1X(15);
    setVal1Y(250);
    setVal2X(45);
    setVal2Y(180);
    setVal3From(80);
    setVal3To(120);
    setVal4A(50);
    setVal4B(75);
  };

  // Calculations
  const res1 = (() => {
    const x = Number(val1X);
    const y = Number(val1Y);
    if (isNaN(x) || isNaN(y)) return null;
    return (x / 100) * y;
  })();

  const res2 = (() => {
    const x = Number(val2X);
    const y = Number(val2Y);
    if (isNaN(x) || isNaN(y) || y === 0) return null;
    return (x / y) * 100;
  })();

  const res3 = (() => {
    const from = Number(val3From);
    const to = Number(val3To);
    if (isNaN(from) || isNaN(to) || from === 0) return null;
    const diff = to - from;
    const pct = (diff / from) * 100;
    return {
      diff,
      pct,
      isIncrease: diff >= 0,
    };
  })();

  const res4 = (() => {
    const a = Number(val4A);
    const b = Number(val4B);
    if (isNaN(a) || isNaN(b) || a + b === 0) return null;
    const diff = Math.abs(a - b);
    const avg = (a + b) / 2;
    return (diff / avg) * 100;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Multi-Mode Percentage Calculator</h3>
            <p className="text-xs text-slate-400">All standard percentage relationships calculated in real-time</p>
          </div>
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: X% of Y */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">What is X% of Y?</h4>
            {res1 !== null && <CopyButton textToCopy={res1.toFixed(2)} label="Copy" />}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>What is</span>
            <input
              type="number"
              value={val1X}
              onChange={(e) => setVal1X(e.target.value)}
              className="w-20 bg-[#0b0f19] border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-cyan-300 text-center focus:outline-none focus:border-emerald-500"
            />
            <span>% of</span>
            <input
              type="number"
              value={val1Y}
              onChange={(e) => setVal1Y(e.target.value)}
              className="w-28 bg-[#0b0f19] border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-cyan-300 text-center focus:outline-none focus:border-emerald-500"
            />
            <span>?</span>
          </div>
          <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Result:</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {res1 !== null ? res1.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Formula: ({val1X} / 100) × {val1Y} = {res1 !== null ? res1.toFixed(2) : '?'}
          </div>
        </div>

        {/* Card 2: X is what % of Y? */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">X is what % of Y?</h4>
            {res2 !== null && <CopyButton textToCopy={`${res2.toFixed(2)}%`} label="Copy" />}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="number"
              value={val2X}
              onChange={(e) => setVal2X(e.target.value)}
              className="w-24 bg-[#0b0f19] border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-cyan-300 text-center focus:outline-none focus:border-emerald-500"
            />
            <span>is what % of</span>
            <input
              type="number"
              value={val2Y}
              onChange={(e) => setVal2Y(e.target.value)}
              className="w-28 bg-[#0b0f19] border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-cyan-300 text-center focus:outline-none focus:border-emerald-500"
            />
            <span>?</span>
          </div>
          <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Result:</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {res2 !== null ? `${res2.toFixed(2)}%` : '—'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Formula: ({val2X} / {val2Y}) × 100 = {res2 !== null ? `${res2.toFixed(2)}%` : '?'}
          </div>
        </div>

        {/* Card 3: Percentage Increase or Decrease */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Percentage Increase / Decrease</h4>
            {res3 !== null && (
              <CopyButton
                textToCopy={`${res3.isIncrease ? '+' : ''}${res3.pct.toFixed(2)}%`}
                label="Copy"
              />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>From</span>
            <input
              type="number"
              value={val3From}
              onChange={(e) => setVal3From(e.target.value)}
              className="w-24 bg-[#0b0f19] border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-cyan-300 text-center focus:outline-none focus:border-emerald-500"
            />
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span>To</span>
            <input
              type="number"
              value={val3To}
              onChange={(e) => setVal3To(e.target.value)}
              className="w-24 bg-[#0b0f19] border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-cyan-300 text-center focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {res3?.isIncrease ? 'Increase:' : 'Decrease:'}
            </span>
            <div className="text-right font-mono">
              <span
                className={`text-xl font-bold ${
                  res3?.isIncrease ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {res3 !== null ? `${res3.isIncrease ? '+' : ''}${res3.pct.toFixed(2)}%` : '—'}
              </span>
              {res3 !== null && (
                <div className="text-[11px] text-slate-400">
                  (Difference: {res3.diff > 0 ? `+${res3.diff}` : res3.diff})
                </div>
              )}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Formula: (({val3To} - {val3From}) / |{val3From}|) × 100
          </div>
        </div>

        {/* Card 4: Percentage Difference */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Percentage Difference</h4>
            {res4 !== null && <CopyButton textToCopy={`${res4.toFixed(2)}%`} label="Copy" />}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Value A:</span>
            <input
              type="number"
              value={val4A}
              onChange={(e) => setVal4A(e.target.value)}
              className="w-24 bg-[#0b0f19] border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-cyan-300 text-center focus:outline-none focus:border-emerald-500"
            />
            <span>Value B:</span>
            <input
              type="number"
              value={val4B}
              onChange={(e) => setVal4B(e.target.value)}
              className="w-24 bg-[#0b0f19] border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-cyan-300 text-center focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Relative Difference:</span>
            <span className="text-xl font-mono font-bold text-amber-400">
              {res4 !== null ? `${res4.toFixed(2)}%` : '—'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Formula: (|{val4A} - {val4B}| / Average) × 100
          </div>
        </div>
      </div>
    </div>
  );
};
