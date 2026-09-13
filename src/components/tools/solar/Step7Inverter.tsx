import React from 'react';
import { Plug, AlertTriangle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { SolarHelpTooltip } from './SolarHelpTooltip';

interface Step7Props {
  inverterType: 'psw' | 'msw';
  onUpdateInverterType: (t: 'psw' | 'msw') => void;
  totalContinuousWatts: number;
  totalSurgeWatts: number;
  batteryVoltage: number;
}

export const Step7Inverter: React.FC<Step7Props> = ({
  inverterType,
  onUpdateInverterType,
  totalContinuousWatts,
  totalSurgeWatts,
  batteryVoltage,
}) => {
  // Continuous capacity with 1.25x safety margin
  const minContinuousWatts = Math.round(totalContinuousWatts * 1.25);

  // Standard commercial inverter sizes
  const standardInverters = [500, 1000, 1500, 2000, 2400, 3000, 3500, 5000, 6000, 8000, 10000];
  const recommendedInverterWattage =
    standardInverters.find((w) => w >= minContinuousWatts) ||
    Math.ceil(minContinuousWatts / 1000) * 1000;

  // Surge capability (typically 2x rated continuous capacity for pure sine wave)
  const surgeCapacityWatts = recommendedInverterWattage * 2;

  // Battery DC Draw Amps at full rated load: Inverter Watts ÷ Battery Voltage ÷ 0.90 efficiency
  const fullLoadBatteryAmps = Math.round(
    (recommendedInverterWattage / Math.max(12, batteryVoltage) / 0.9) * 10
  ) / 10;

  // Continuous running draw amps
  const runningBatteryAmps = Math.round(
    (totalContinuousWatts / Math.max(12, batteryVoltage) / 0.9) * 10
  ) / 10;

  // AC output amps at 230V
  const acOutputAmps = Math.round((recommendedInverterWattage / 230) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-0.5">
            <Plug className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Step 7 — Inverter / Charger Sizing</span>
              <SolarHelpTooltip term="PSW" />
              <SolarHelpTooltip term="MSW" />
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The inverter converts DC battery power into 230V AC household electricity. It must be
              sized to comfortably handle both continuous running wattage and inductive startup
              surges from refrigerators, water pumps, and air conditioning compressors.
            </p>
          </div>
        </div>
      </div>

      {/* Waveform Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onUpdateInverterType('psw')}
          className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
            inverterType === 'psw'
              ? 'bg-[#0f1d32] border-blue-500 shadow-lg ring-1 ring-blue-500/30'
              : 'bg-[#090e17] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded-md bg-blue-500/20 text-blue-400 font-bold font-mono text-xs">
                PSW
              </span>
              <span className="text-sm font-bold text-white">Pure Sine Wave (Recommended)</span>
            </div>
            {inverterType === 'psw' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Produces smooth, identical or cleaner electricity than grid utility power. Safe for all
            household electronics, laptop chargers, inverter refrigerators, induction cookers, fans,
            and medical equipment with zero buzzing or overheating.
          </p>
        </div>

        <div
          onClick={() => onUpdateInverterType('msw')}
          className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
            inverterType === 'msw'
              ? 'bg-[#0f1d32] border-amber-500 shadow-lg ring-1 ring-amber-500/30'
              : 'bg-[#090e17] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded-md bg-amber-500/20 text-amber-400 font-bold font-mono text-xs">
                MSW
              </span>
              <span className="text-sm font-bold text-white">Modified Sine Wave</span>
            </div>
            {inverterType === 'msw' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Budget alternative with stepped square waveform. Can cause motors and transformer coils
            to hum, overheat, run inefficiently, and can permanently damage modern inverter
            appliances or digital controls.
          </p>
        </div>
      </div>

      {/* Surge Check Warning */}
      {totalSurgeWatts > surgeCapacityWatts && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <strong className="text-sm text-amber-200 block">
              High Peak Surge Load Detected ({totalSurgeWatts}W)
            </strong>
            <p>
              Your connected motor loads (water pumps, air conditioners, compressors) have an
              estimated starting surge of {totalSurgeWatts}W. Ensure your inverter is specifically
              rated for high peak surge (usually 200% of nominal rating for 5–10 seconds).
            </p>
          </div>
        </div>
      )}

      {/* Inverter Recommendation Card */}
      <div className="bg-[#0b1322] border border-blue-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              RECOMMENDED INVERTER CAPACITY
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {recommendedInverterWattage.toLocaleString()} Watts Continuous{' '}
              <span className="text-blue-400 text-lg sm:text-xl font-bold">
                ({inverterType.toUpperCase()})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              DC Input: {batteryVoltage}V DC • AC Output: 230V AC 60Hz/50Hz
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Surge Capacity (2x Peak)
            </span>
            <div className="text-xl font-extrabold text-amber-400 font-mono">
              {surgeCapacityWatts.toLocaleString()} W Peak
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              AC Current: {acOutputAmps} A @ 230V
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[10px]">Continuous Load vs Rating</span>
            <div className="text-white font-mono font-bold">
              {totalContinuousWatts}W load / {recommendedInverterWattage}W rated
            </div>
            <span className="text-emerald-400 text-[10px]">
              {Math.round((totalContinuousWatts / recommendedInverterWattage) * 100)}% load ratio
              (Safe)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[10px]">Max Battery DC Draw</span>
            <div className="text-amber-400 font-mono font-bold">{fullLoadBatteryAmps} Amps DC</div>
            <span className="text-slate-400 text-[10px]">
              {recommendedInverterWattage}W ÷ {batteryVoltage}V ÷ 90% eff.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[10px]">Continuous Running DC Draw</span>
            <div className="text-emerald-400 font-mono font-bold">
              {runningBatteryAmps} Amps DC
            </div>
            <span className="text-slate-400 text-[10px]">
              During regular household operation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
