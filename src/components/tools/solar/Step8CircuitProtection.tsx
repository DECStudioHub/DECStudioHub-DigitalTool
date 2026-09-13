import React from 'react';
import { ShieldCheck, Zap, AlertTriangle, Info, Check } from 'lucide-react';
import { SolarHelpTooltip } from './SolarHelpTooltip';

interface Step8Props {
  arrayIsc: number;
  batteryVoltage: number;
  recommendedInverterWattage: number;
  panelsInParallel: number;
}

export const Step8CircuitProtection: React.FC<Step8Props> = ({
  arrayIsc,
  batteryVoltage,
  recommendedInverterWattage,
  panelsInParallel,
}) => {
  // PV side fuse/breaker: Isc × 1.25 (or × 1.56 per NEC standard continuous)
  const pvBreakerRating = Math.max(16, Math.ceil((arrayIsc * 1.25) / 5) * 5);
  const pvIsolatorRating = Math.max(32, pvBreakerRating);

  // Battery DC fuse / breaker: Inverter full load DC Amps × 1.25
  const inverterDcAmps = recommendedInverterWattage / Math.max(12, batteryVoltage) / 0.9;
  const standardDcFuses = [60, 80, 100, 125, 150, 175, 200, 250, 300, 400];
  const batteryFuseRating =
    standardDcFuses.find((f) => f >= inverterDcAmps * 1.25) ||
    Math.ceil((inverterDcAmps * 1.25) / 25) * 25;

  // Inverter AC Breaker: Continuous AC Amps × 1.25
  const inverterAcAmps = recommendedInverterWattage / 230;
  const standardAcBreakers = [10, 15, 20, 25, 30, 40, 50, 63];
  const inverterAcBreakerRating =
    standardAcBreakers.find((b) => b >= inverterAcAmps * 1.25) ||
    Math.ceil((inverterAcAmps * 1.25) / 5) * 5;

  const requiresCombinerBox = panelsInParallel > 2;

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900 border border-red-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Step 8 — DC & AC Circuit Protection Schedule</span>
              <SolarHelpTooltip term="ISC" />
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Electrical protection prevents fire hazards, short circuits, lightning surge damage,
              and electric shocks. Every segment of your solar installation requires dedicated,
              correctly rated DC and AC safety devices.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Main Stages of Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        {/* Stage 1: Solar PV Side */}
        <div className="bg-[#090e17] border border-amber-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <span className="p-1 px-2 rounded bg-amber-500/20 text-amber-400 font-bold font-mono">
              STAGE 1
            </span>
            <h4 className="text-sm font-bold text-white">Solar PV Array (DC)</h4>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">DC Circuit Breaker</span>
                <span className="font-mono font-bold text-amber-400">{pvBreakerRating}A DC 2-Pole</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Rated for string voltage (up to 500V/1000V DC)
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">DC Rotary Isolator</span>
                <span className="font-mono font-bold text-amber-400">{pvIsolatorRating}A 1000V DC</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Lockable manual disconnect for servicing panels safely
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">DC Surge Protector (SPD)</span>
                <span className="font-mono font-bold text-emerald-400">Type 2 DC 600V/1000V</span>
              </div>
              <p className="text-[10px] text-slate-400">Protects MPPT from nearby lightning induced surges</p>
            </div>

            {requiresCombinerBox && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <span className="font-bold block text-[11px]">PV Combiner Box with Fuses</span>
                <p className="text-[10px] mt-0.5">
                  Required because you have {panelsInParallel} parallel strings. Add a 15A–25A gPV
                  fuse on each positive string lead.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stage 2: Battery Storage Side */}
        <div className="bg-[#090e17] border border-emerald-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <span className="p-1 px-2 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono">
              STAGE 2
            </span>
            <h4 className="text-sm font-bold text-white">Battery Bank (High-DC)</h4>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Main Battery Fuse / Breaker</span>
                <span className="font-mono font-bold text-emerald-400">
                  {batteryFuseRating}A DC Class-T / ANL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Install within 18 inches (45cm) of positive battery post
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Heavy Duty Disconnect Switch</span>
                <span className="font-mono font-bold text-emerald-400">
                  {Math.max(250, batteryFuseRating)}A Marine Switch
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Instant emergency battery bank shut-off switch
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">BMS Overcurrent Protection</span>
                <span className="font-mono font-bold text-white">Integrated in LiFePO4</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Electronic battery management system internal cut-off
              </p>
            </div>
          </div>
        </div>

        {/* Stage 3: Inverter AC Output */}
        <div className="bg-[#090e17] border border-blue-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <span className="p-1 px-2 rounded bg-blue-500/20 text-blue-400 font-bold font-mono">
              STAGE 3
            </span>
            <h4 className="text-sm font-bold text-white">Inverter AC Output (230V)</h4>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Inverter AC Breaker (MCB)</span>
                <span className="font-mono font-bold text-blue-400">
                  {inverterAcBreakerRating}A 2-Pole Type C
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Protects inverter internal H-bridge from output overload
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Earth Leakage (RCD / RCBO)</span>
                <span className="font-mono font-bold text-emerald-400">30mA Sensitivity</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Crucial life-saving protection against electrocution and shock
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Transfer Switch (MTS / ATS)</span>
                <span className="font-mono font-bold text-blue-400">63A 2P Double Throw</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Prevents dangerous backfeeding into grid utility or generator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
