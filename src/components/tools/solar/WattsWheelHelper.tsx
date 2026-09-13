import React, { useState } from 'react';
import { Zap, RotateCcw, Check, Sparkles, ArrowRight } from 'lucide-react';

interface WattsWheelHelperProps {
  onApply?: (watts: number, amps: number, volts: number) => void;
}

export const WattsWheelHelper: React.FC<WattsWheelHelperProps> = ({ onApply }) => {
  const [volts, setVolts] = useState<string>('230');
  const [amps, setAmps] = useState<string>('2');
  const [watts, setWatts] = useState<string>('');
  const [ohms, setOhms] = useState<string>('');
  const [applied, setApplied] = useState<boolean>(false);

  // Calculate based on inputs
  const v = parseFloat(volts);
  const i = parseFloat(amps);
  const p = parseFloat(watts);
  const r = parseFloat(ohms);

  let calcV: number | null = null;
  let calcI: number | null = null;
  let calcP: number | null = null;
  let calcR: number | null = null;
  let formulaUsed = '';

  if (!isNaN(v) && v > 0 && !isNaN(i) && i > 0) {
    calcV = v;
    calcI = i;
    calcP = v * i;
    calcR = v / i;
    formulaUsed = 'P = V × I  •  R = V ÷ I';
  } else if (!isNaN(p) && p > 0 && !isNaN(v) && v > 0) {
    calcP = p;
    calcV = v;
    calcI = p / v;
    calcR = (v * v) / p;
    formulaUsed = 'I = P ÷ V  •  R = V² ÷ P';
  } else if (!isNaN(p) && p > 0 && !isNaN(i) && i > 0) {
    calcP = p;
    calcI = i;
    calcV = p / i;
    calcR = p / (i * i);
    formulaUsed = 'V = P ÷ I  •  R = P ÷ I²';
  } else if (!isNaN(v) && v > 0 && !isNaN(r) && r > 0) {
    calcV = v;
    calcR = r;
    calcI = v / r;
    calcP = (v * v) / r;
    formulaUsed = 'I = V ÷ R  •  P = V² ÷ R';
  } else if (!isNaN(i) && i > 0 && !isNaN(r) && r > 0) {
    calcI = i;
    calcR = r;
    calcV = i * r;
    calcP = i * i * r;
    formulaUsed = 'V = I × R  •  P = I² × R';
  }

  const handleReset = () => {
    setVolts('230');
    setAmps('2');
    setWatts('');
    setOhms('');
    setApplied(false);
  };

  const handleApply = () => {
    if (onApply && calcP && calcI && calcV) {
      onApply(Math.round(calcP * 100) / 100, Math.round(calcI * 100) / 100, Math.round(calcV * 100) / 100);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  return (
    <div className="bg-[#0b1220] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Watts Wheel / Ohm’s Law Assistant
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                W = V × A
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Calculate missing appliance values (enter any 2 known values)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition px-2.5 py-1 rounded-lg hover:bg-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Voltage (V)
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="e.g. 230"
              value={volts}
              onChange={(e) => {
                setVolts(e.target.value);
                setApplied(false);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
            <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">
              Volts
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Current (A)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 2.0"
              value={amps}
              onChange={(e) => {
                setAmps(e.target.value);
                setApplied(false);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
            <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">
              Amps
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Power (W)
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="e.g. 460"
              value={watts}
              onChange={(e) => {
                setWatts(e.target.value);
                setApplied(false);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
            <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">
              Watts
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Resistance (Ω)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 115"
              value={ohms}
              onChange={(e) => {
                setOhms(e.target.value);
                setApplied(false);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
            <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">
              Ohms
            </span>
          </div>
        </div>
      </div>

      {calcP !== null && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Computed Result:</span>
              <span className="text-sm font-extrabold text-amber-400">
                {Math.round(calcP * 10) / 10} Watts
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                {Math.round(calcI! * 100) / 100} Amps @ {Math.round(calcV!)}V
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Formula: {formulaUsed}
            </div>
          </div>

          {onApply && (
            <button
              type="button"
              onClick={handleApply}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              {applied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-950" />
                  <span>Applied to Load!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use as Appliance Load</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
