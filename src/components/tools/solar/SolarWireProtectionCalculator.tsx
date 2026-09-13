import React, { useState } from 'react';
import { ShieldCheck, Cable, AlertTriangle, CheckCircle2, RotateCcw, Zap } from 'lucide-react';
import { sizeCable } from './solarCalculations';

export const SolarWireProtectionCalculator: React.FC = () => {
  const [inverterWatts, setInverterWatts] = useState<number>(3000);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(24);
  const [pvCurrentAmps, setPvCurrentAmps] = useState<number>(14);
  const [pvVoltage, setPvVoltage] = useState<number>(120);
  const [pvCableLength, setPvCableLength] = useState<number>(15);
  const [batCableLength, setBatCableLength] = useState<number>(1.5);
  const [acCableLength, setAcCableLength] = useState<number>(10);

  // Calculations
  const batDcCurrent = inverterWatts / Math.max(12, batteryVoltage) / 0.9;
  const acCurrent = inverterWatts / 230;

  const pvCable = sizeCable(pvCurrentAmps, pvCableLength, pvVoltage, 3.0);
  const batCable = sizeCable(batDcCurrent, batCableLength, batteryVoltage, 2.0);
  const acCable = sizeCable(acCurrent, acCableLength, 230, 2.0);

  const pvBreakerRating = Math.max(16, Math.ceil((pvCurrentAmps * 1.25) / 5) * 5);
  const batteryFuseRating = Math.max(60, Math.ceil((batDcCurrent * 1.25) / 25) * 25);
  const inverterAcBreakerRating = Math.max(15, Math.ceil((acCurrent * 1.25) / 5) * 5);

  const handleReset = () => {
    setInverterWatts(3000);
    setBatteryVoltage(24);
    setPvCurrentAmps(14);
    setPvVoltage(120);
    setPvCableLength(15);
    setBatCableLength(1.5);
    setAcCableLength(10);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Solar Wire & Circuit Protection Calculator</h1>
            <p className="text-xs text-slate-400">
              Calculate wire cross-sectional sizes (mm²), DC/AC circuit breakers, battery fuses, and surge protection.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* System Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Inverter Rated Watts</label>
          <input
            type="number"
            step="500"
            value={inverterWatts}
            onChange={(e) => setInverterWatts(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Battery Bank Voltage</label>
          <div className="grid grid-cols-4 gap-1">
            {[12, 24, 36, 48].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setBatteryVoltage(v)}
                className={`py-2 rounded-xl border text-xs font-bold font-mono transition ${
                  batteryVoltage === v
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {v}V
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">PV Working Current (Imp)</label>
          <input
            type="number"
            step="0.5"
            value={pvCurrentAmps}
            onChange={(e) => setPvCurrentAmps(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">PV Array Voltage (Vmp)</label>
          <input
            type="number"
            value={pvVoltage}
            onChange={(e) => setPvVoltage(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Wire Lengths */}
      <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Cable Segment Run Lengths (Meters One-Way)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-300 block mb-1">PV Panels to Controller:</label>
            <div className="relative">
              <input
                type="number"
                value={pvCableLength}
                onChange={(e) => setPvCableLength(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-400">meters</span>
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">Battery to Inverter (Keep Short!):</label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={batCableLength}
                onChange={(e) => setBatCableLength(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-400">meters</span>
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">Inverter to AC Distribution Panel:</label>
            <div className="relative">
              <input
                type="number"
                value={acCableLength}
                onChange={(e) => setAcCableLength(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-400">meters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Cards: 3 Segments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Segment 1: PV Wire */}
        <div className="bg-[#0b1322] border border-amber-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-bold text-white text-sm">Solar PV Array Cable</span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">DC Side</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[10px]">Recommended Conductor:</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {pvCable.recommendedMm2} mm² PV Cable
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <div>Working Current: <strong className="text-white font-mono">{pvCurrentAmps} A</strong></div>
              <div>Voltage Drop: <strong className="text-emerald-400 font-mono">{pvCable.actualDropPercent}% ({pvCable.actualDropVolts}V)</strong></div>
            </div>
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Required Protection:</span>
              <div className="text-white font-mono font-bold">{pvBreakerRating}A DC Breaker 2-Pole</div>
              <div className="text-slate-300 text-[11px]">Type 2 DC Surge Protector (SPD)</div>
            </div>
          </div>
        </div>

        {/* Segment 2: Battery Cable */}
        <div className="bg-[#0b1322] border border-rose-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-bold text-white text-sm">Battery to Inverter Cable</span>
            <span className="text-[10px] font-mono text-rose-400 font-bold">High DC Amps</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[10px]">Recommended Conductor:</span>
              <span className="text-xl font-black text-rose-400 font-mono">
                {batCable.recommendedMm2} mm² Pure Copper
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <div>Continuous Current: <strong className="text-white font-mono">{Math.round(batDcCurrent)} A DC</strong></div>
              <div>Voltage Drop: <strong className="text-emerald-400 font-mono">{batCable.actualDropPercent}% ({batCable.actualDropVolts}V)</strong></div>
            </div>
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Required Protection:</span>
              <div className="text-white font-mono font-bold">{batteryFuseRating}A Class-T / ANL Fuse</div>
              <div className="text-slate-300 text-[11px]">Heavy Duty Battery Disconnect Switch</div>
            </div>
          </div>
        </div>

        {/* Segment 3: AC Output Wire */}
        <div className="bg-[#0b1322] border border-blue-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-bold text-white text-sm">Inverter AC Output Cable</span>
            <span className="text-[10px] font-mono text-blue-400 font-bold">230V AC Mains</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[10px]">Recommended Conductor:</span>
              <span className="text-xl font-black text-blue-400 font-mono">
                {acCable.recommendedMm2} mm² THHN Cu
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <div>AC Output Current: <strong className="text-white font-mono">{acCurrent.toFixed(1)} A @ 230V</strong></div>
              <div>Voltage Drop: <strong className="text-emerald-400 font-mono">{acCable.actualDropPercent}% ({acCable.actualDropVolts}V)</strong></div>
            </div>
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Required Protection:</span>
              <div className="text-white font-mono font-bold">{inverterAcBreakerRating}A 2-Pole AC MCB</div>
              <div className="text-slate-300 text-[11px]">30mA Residual Current Device (RCD)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
