import React from 'react';
import { Home, Lightbulb, Zap, ShieldCheck, Check } from 'lucide-react';
import { ApplianceLoad } from './solarTypes';

interface Step10Props {
  appliances: ApplianceLoad[];
  inverterWatts: number;
}

export const Step10HouseholdSetup: React.FC<Step10Props> = ({ appliances, inverterWatts }) => {
  const hasAircon = appliances.some((a) => /air\s*con/i.test(a.name));
  const hasPump = appliances.some((a) => /pump/i.test(a.name));
  const hasRef = appliances.some((a) => /refrig/i.test(a.name));

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
            <Home className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-white">
              Step 10 — Household Outlets & Distribution Panel Layout
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect your solar pure sine wave inverter output to your household sub-panel.
              Separating circuits ensures lighting remains on even if a high-power kitchen outlet
              trips its breaker.
            </p>
          </div>
        </div>
      </div>

      {/* Household Branch Circuits Schedule */}
      <div className="bg-[#090e17] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Branch Circuit Schedule (Philippine Electrical Code / NEC Compliant)
            </h4>
            <p className="text-[11px] text-slate-400">
              Fed from {inverterWatts}W Inverter AC Output via Distribution Sub-Panel
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            230V AC Single Phase
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Circuit Name</th>
                <th className="py-2.5 px-3">Breaker (MCB)</th>
                <th className="py-2.5 px-3">Wire Size (Copper)</th>
                <th className="py-2.5 px-3">Conduit</th>
                <th className="py-2.5 px-4">Description / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lighting Circuit</span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-amber-400">15A 2-Pole</td>
                <td className="py-3 px-3 font-mono text-white">2.0 mm² THHN (#14 AWG)</td>
                <td className="py-3 px-3 font-mono text-slate-400">15mm / 1/2&quot; PVC</td>
                <td className="py-3 px-4 text-slate-300">
                  Living room, bedrooms, outdoor LED bulbs
                </td>
              </tr>

              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>General Convenience Outlets</span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-emerald-400">20A 2-Pole</td>
                <td className="py-3 px-3 font-mono text-white">3.5 mm² THHN (#12 AWG)</td>
                <td className="py-3 px-3 font-mono text-slate-400">20mm / 3/4&quot; PVC</td>
                <td className="py-3 px-4 text-slate-300">
                  TV, WiFi, laptop, phone charging, electric fans
                </td>
              </tr>

              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kitchen High-Load Outlets</span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-blue-400">20A 2-Pole</td>
                <td className="py-3 px-3 font-mono text-white">3.5 mm² THHN (#12 AWG)</td>
                <td className="py-3 px-3 font-mono text-slate-400">20mm / 3/4&quot; PVC</td>
                <td className="py-3 px-4 text-slate-300">
                  Rice cooker, microwave, blender, toaster
                </td>
              </tr>

              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dedicated Refrigerator Circuit</span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-cyan-400">15A or 20A 2-Pole</td>
                <td className="py-3 px-3 font-mono text-white">3.5 mm² THHN (#12 AWG)</td>
                <td className="py-3 px-3 font-mono text-slate-400">20mm / 3/4&quot; PVC</td>
                <td className="py-3 px-4 text-slate-300">
                  Dedicated single outlet to isolate compressor startup
                </td>
              </tr>

              {hasAircon && (
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dedicated Inverter Aircon</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">20A or 30A 2-Pole</td>
                  <td className="py-3 px-3 font-mono text-white">3.5 or 5.5 mm² THHN</td>
                  <td className="py-3 px-3 font-mono text-slate-400">20mm / 3/4&quot; PVC</td>
                  <td className="py-3 px-4 text-slate-300">
                    Direct homerun to outdoor condensing unit
                  </td>
                </tr>
              )}

              {hasPump && (
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-teal-400" />
                    <span>Dedicated Water Pump</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-teal-400">20A 2-Pole</td>
                  <td className="py-3 px-3 font-mono text-white">3.5 mm² THHN (#12 AWG)</td>
                  <td className="py-3 px-3 font-mono text-slate-400">20mm / 3/4&quot; PVC</td>
                  <td className="py-3 px-4 text-slate-300">
                    Dedicated run with weatherproof outdoor enclosure
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Earth Grounding System */}
      <div className="p-4 rounded-2xl bg-[#0b1322] border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>System Earth Grounding & Lightning Safety</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Ground Rod</span>
            <span className="font-bold text-white">5/8&quot; × 8-foot (2.4m)</span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Solid copper-bonded steel rod driven fully into moist soil
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Ground Conductor</span>
            <span className="font-bold text-white">16 mm² Bare Copper Wire</span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Continuous bonded run with heavy bronze ground clamp
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Bonded Equipment</span>
            <span className="font-bold text-white">Panel Frames, Inverter, & SPDs</span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Equalizes potential to safely divert lightning surges
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
