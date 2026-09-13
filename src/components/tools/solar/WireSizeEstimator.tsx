import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { DisclaimerBox } from '../../common/DisclaimerBox';
import { Cable, RotateCcw, AlertCircle } from 'lucide-react';

const STANDARD_GAUGES = [
  { mm2: 1.5, awg: '16 AWG', maxContinuousAmps: 14 },
  { mm2: 2.5, awg: '14 AWG', maxContinuousAmps: 20 },
  { mm2: 4.0, awg: '12 AWG', maxContinuousAmps: 25 },
  { mm2: 6.0, awg: '10 AWG', maxContinuousAmps: 35 },
  { mm2: 10.0, awg: '8 AWG', maxContinuousAmps: 50 },
  { mm2: 16.0, awg: '6 AWG', maxContinuousAmps: 65 },
  { mm2: 25.0, awg: '4 AWG', maxContinuousAmps: 85 },
  { mm2: 35.0, awg: '2 AWG', maxContinuousAmps: 115 },
  { mm2: 50.0, awg: '1/0 AWG', maxContinuousAmps: 150 },
  { mm2: 70.0, awg: '2/0 AWG', maxContinuousAmps: 175 },
  { mm2: 95.0, awg: '3/0 AWG', maxContinuousAmps: 200 },
];

export const WireSizeEstimator: React.FC = () => {
  const [currentAmps, setCurrentAmps] = useState<number | string>(20);
  const [lengthMeters, setLengthMeters] = useState<number | string>(15);
  const [voltage, setVoltage] = useState<number>(24);
  const [maxDropPct, setMaxDropPct] = useState<number>(3); // 3% standard

  const reset = () => {
    setCurrentAmps(20);
    setLengthMeters(15);
    setVoltage(24);
    setMaxDropPct(3);
  };

  const calculation = useMemo(() => {
    const I = Number(currentAmps);
    const L = Number(lengthMeters);
    const V = Number(voltage);
    const dropPct = Number(maxDropPct);

    if (isNaN(I) || isNaN(L) || isNaN(V) || isNaN(dropPct)) {
      return { error: 'Please enter valid numbers' };
    }
    if (I <= 0) return { error: 'Current must be greater than 0 Amps' };
    if (L <= 0) return { error: 'Length must be greater than 0 meters' };

    // Max allowed voltage drop in Volts
    const maxVdrop = V * (dropPct / 100);

    // Area (mm²) = (2 * L * I * rho) / maxVdrop
    // rho copper = 0.0175 Ω·mm²/m
    const theoreticalArea = (2 * L * I * 0.0175) / maxVdrop;

    // Find standard size that satisfies BOTH voltage drop and continuous ampacity
    const selected = STANDARD_GAUGES.find(
      (g) => g.mm2 >= theoreticalArea && g.maxContinuousAmps >= I
    ) || STANDARD_GAUGES[STANDARD_GAUGES.length - 1];

    // Actual voltage drop with the selected standard size
    const actualVdrop = (2 * L * I * 0.0175) / selected.mm2;
    const actualDropPct = (actualVdrop / V) * 100;

    return {
      error: null,
      theoreticalArea: Math.round(theoreticalArea * 100) / 100,
      selectedMm2: selected.mm2,
      selectedAwg: selected.awg,
      maxAmpacity: selected.maxContinuousAmps,
      actualDropPct: Math.round(actualDropPct * 100) / 100,
      actualVdrop: Math.round(actualVdrop * 100) / 100,
    };
  }, [currentAmps, lengthMeters, voltage, maxDropPct]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Wire & Cable Gauge Estimator</h3>
              <p className="text-xs text-slate-400">Determine minimum copper conductor cross-section (mm² & AWG) based on ampacity and line run</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Operating Current (Amps)
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={currentAmps}
              onChange={(e) => setCurrentAmps(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              One-Way Distance (Meters)
            </label>
            <input
              type="number"
              min="1"
              value={lengthMeters}
              onChange={(e) => setLengthMeters(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              System Voltage
            </label>
            <select
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            >
              <option value="12">12V DC</option>
              <option value="24">24V DC</option>
              <option value="48">48V DC</option>
              <option value="230">230V AC</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target Max Voltage Drop
            </label>
            <select
              value={maxDropPct}
              onChange={(e) => setMaxDropPct(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            >
              <option value="2">2% (Stringent / Critical Solar & DC)</option>
              <option value="3">3% (Standard Branch Circuit)</option>
              <option value="5">5% (General Maximum Limit)</option>
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
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#241f11] border border-yellow-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-400 font-medium">Recommended Standard Wire</span>
                <CopyButton textToCopy={`${calculation.selectedMm2} mm² (${calculation.selectedAwg})`} variant="icon" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-yellow-400 tracking-tight">
                  {calculation.selectedMm2} mm²
                </span>
                <div className="text-sm font-mono text-yellow-200 mt-0.5">
                  {calculation.selectedAwg}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                Minimum theoretical: {calculation.theoreticalArea} mm²
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Actual Voltage Drop with this Wire</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                  {calculation.actualDropPct}%
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">({calculation.actualVdrop} V)</span>
              </div>
              <div className="text-xs text-slate-500">Target was ≤ {maxDropPct}%</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Continuous Conductor Ampacity</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                  {calculation.maxAmpacity}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">Amps</span>
              </div>
              <div className="text-xs text-slate-500">Rated for {currentAmps}A continuous circuit</div>
            </div>
          </div>

          <DisclaimerBox
            title="Conductor Sizing Engineering Disclaimer"
            text="Wire gauge calculations are approximations based on standard copper resistivity (0.0175 Ω·mm²/m). Actual installations must comply with the Philippine Electrical Code (PEC), National Electrical Code (NEC), or IEC 60364. Factor in conduit fill derating, ambient rooftop thermal extremes (which can exceed 60°C in direct sunlight), and insulation temperature ratings (60°C, 75°C, or 90°C)."
          />
        </div>
      )}
    </div>
  );
};
