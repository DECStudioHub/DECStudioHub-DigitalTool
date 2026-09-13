import React, { useState } from 'react';
import { Cable, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { sizeCable } from './solarCalculations';

interface Step9Props {
  arrayImp: number;
  arrayVmp: number;
  controllerAmps: number;
  batteryVoltage: number;
  inverterWatts: number;
}

export const Step9Wiring: React.FC<Step9Props> = ({
  arrayImp,
  arrayVmp,
  controllerAmps,
  batteryVoltage,
  inverterWatts,
}) => {
  const [pvLength, setPvLength] = useState<number>(15);
  const [ccToBatLength, setCcToBatLength] = useState<number>(2);
  const [batToInvLength, setBatToInvLength] = useState<number>(1.5);
  const [invToPanelLength, setInvToPanelLength] = useState<number>(5);

  // Segment 1: PV to Controller
  const seg1 = sizeCable(Math.max(1, arrayImp), pvLength, Math.max(20, arrayVmp), 3.0);

  // Segment 2: Controller to Battery
  const seg2 = sizeCable(Math.max(1, controllerAmps), ccToBatLength, batteryVoltage, 2.0);

  // Segment 3: Battery to Inverter (Large DC Current)
  const batDcCurrent = inverterWatts / Math.max(12, batteryVoltage) / 0.9;
  const seg3 = sizeCable(batDcCurrent, batToInvLength, batteryVoltage, 2.0);

  // Segment 4: Inverter to AC Main Panel (230V AC)
  const acCurrent = inverterWatts / 230;
  const seg4 = sizeCable(acCurrent, invToPanelLength, 230, 2.0);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-yellow-950/40 via-slate-900 to-slate-900 border border-yellow-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 mt-0.5">
            <Cable className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-white">
              Step 9 — Wire Sizing & Voltage Drop Sizing
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Undersized wires overheat, pose dangerous fire risks, and cause voltage drops that
              trigger premature inverter cut-offs. Cable gauges are sized to strictly ensure safe
              ampacity and keep line voltage drop under <strong>3%</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Battery Cable Warning */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <strong className="text-sm text-amber-200 block">
            Critical Safety Notice: Battery-to-Inverter Cable Sizing
          </strong>
          <p>
            At {batteryVoltage}V DC, a {inverterWatts}W inverter draws{' '}
            <strong>{Math.round(batDcCurrent)} Amps</strong> through the battery cables at full
            power! These cables MUST be short (&le; 1.5–2 meters) and thick (e.g.{' '}
            <strong>{seg3.recommendedMm2} mm²</strong> pure copper welding or marine-grade cable)
            with heavy hydraulic crimped tinned copper lugs.
          </p>
        </div>
      </div>

      {/* 4 Cable Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Segment 1 */}
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded bg-amber-500/20 text-amber-400 font-bold font-mono text-[10px]">
                SEGMENT 1
              </span>
              <h4 className="text-xs font-bold text-white">Solar Array → Charge Controller</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">PV Solar Cable (UV Resistant)</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="text-slate-300 text-[11px]">One-Way Length (meters):</label>
            <div className="relative w-24">
              <input
                type="number"
                min="1"
                max="100"
                value={pvLength}
                onChange={(e) => setPvLength(parseFloat(e.target.value) || 1)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute right-2 top-1 text-[10px] text-slate-400">m</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Recommended Size:</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {seg1.recommendedMm2} mm² (XLPO Solar PV Wire)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>Working Imp: {arrayImp.toFixed(1)} A</span>
              <span className={seg1.actualDropPercent > 3 ? 'text-amber-400' : 'text-emerald-400'}>
                Voltage Drop: {seg1.actualDropPercent}% ({seg1.actualDropVolts}V)
              </span>
            </div>
          </div>
        </div>

        {/* Segment 2 */}
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded bg-amber-500/20 text-amber-400 font-bold font-mono text-[10px]">
                SEGMENT 2
              </span>
              <h4 className="text-xs font-bold text-white">Charge Controller → Battery Bank</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">DC Charging Lead</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="text-slate-300 text-[11px]">One-Way Length (meters):</label>
            <div className="relative w-24">
              <input
                type="number"
                min="0.5"
                max="20"
                step="0.5"
                value={ccToBatLength}
                onChange={(e) => setCcToBatLength(parseFloat(e.target.value) || 1)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute right-2 top-1 text-[10px] text-slate-400">m</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Recommended Size:</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {seg2.recommendedMm2} mm² Flexible Copper
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>Max Charging Current: {controllerAmps} A</span>
              <span className={seg2.actualDropPercent > 2 ? 'text-amber-400' : 'text-emerald-400'}>
                Voltage Drop: {seg2.actualDropPercent}% ({seg2.actualDropVolts}V)
              </span>
            </div>
          </div>
        </div>

        {/* Segment 3 */}
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded bg-rose-500/20 text-rose-400 font-bold font-mono text-[10px]">
                SEGMENT 3
              </span>
              <h4 className="text-xs font-bold text-white">Battery Bank → Inverter</h4>
            </div>
            <span className="text-[10px] text-rose-400 font-mono font-bold">Ultra High DC Amps</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="text-slate-300 text-[11px]">One-Way Length (meters):</label>
            <div className="relative w-24">
              <input
                type="number"
                min="0.5"
                max="5"
                step="0.5"
                value={batToInvLength}
                onChange={(e) => setBatToInvLength(parseFloat(e.target.value) || 1)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute right-2 top-1 text-[10px] text-slate-400">m</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Recommended Size:</span>
              <span className="text-base font-extrabold text-rose-400 font-mono">
                {seg3.recommendedMm2} mm² (Welding / Marine)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>Peak DC Current: {Math.round(batDcCurrent)} A</span>
              <span className="text-emerald-400">
                Voltage Drop: {seg3.actualDropPercent}% ({seg3.actualDropVolts}V)
              </span>
            </div>
          </div>
        </div>

        {/* Segment 4 */}
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded bg-blue-500/20 text-blue-400 font-bold font-mono text-[10px]">
                SEGMENT 4
              </span>
              <h4 className="text-xs font-bold text-white">Inverter AC Output → Distribution Panel</h4>
            </div>
            <span className="text-[10px] text-blue-400 font-mono">230V AC Mains</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="text-slate-300 text-[11px]">One-Way Length (meters):</label>
            <div className="relative w-24">
              <input
                type="number"
                min="1"
                max="50"
                value={invToPanelLength}
                onChange={(e) => setInvToPanelLength(parseFloat(e.target.value) || 1)}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute right-2 top-1 text-[10px] text-slate-400">m</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Recommended Size:</span>
              <span className="text-base font-extrabold text-blue-400 font-mono">
                {seg4.recommendedMm2} mm² THHN / Cu
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>AC Current: {acCurrent.toFixed(1)} A @ 230V</span>
              <span className="text-emerald-400">
                Voltage Drop: {seg4.actualDropPercent}% ({seg4.actualDropVolts}V)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
