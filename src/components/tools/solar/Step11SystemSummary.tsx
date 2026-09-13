import React, { useState } from 'react';
import {
  Sun,
  Battery,
  Zap,
  Plug,
  ShieldCheck,
  Cable,
  Check,
  Copy,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { SolarWizardState } from './solarTypes';

interface Step11Props {
  state: SolarWizardState;
  onReset: () => void;
}

export const Step11SystemSummary: React.FC<Step11Props> = ({ state, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const checklistItems = [
    `Solar Panels: ${state.totalPanels} × ${state.panelPmax}W Monocrystalline Panels (${state.totalPvWattage}W Total)`,
    `Mounting System: Aluminum roof mounting rails, mid-clamps, end-clamps, L-feet & stainless hardware`,
    `Solar Charge Controller: ${state.recommendedControllerAmps}A ${state.controllerType.toUpperCase()} Charge Controller (${state.controllerMaxPvVoc}V Max PV Voc)`,
    `Battery Storage: ${state.batteryBankVoltage}V ${state.recommendedBatteryAh}Ah ${state.batteryType === 'lithium' ? 'LiFePO4 Lithium' : 'Lead-Acid'} Bank (${state.totalBatteryCount} units)`,
    `Power Inverter: ${state.recommendedInverterWattage}W ${state.inverterType.toUpperCase()} Inverter (Surge: ${state.estimatedSurgeWattage}W, DC: ${state.batteryBankVoltage}V, AC: 230V)`,
    `PV DC Protection: ${state.pvDcBreakerRating}A 2-Pole DC Breaker, ${state.pvDcIsolatorRating}A DC Rotary Isolator, and Type 2 DC SPD (Surge Protector)`,
    `Battery DC Protection: ${state.batteryFuseRating}A Class-T/ANL DC Fuse with holder, and heavy-duty Marine Disconnect Switch`,
    `Inverter AC Protection: ${state.inverterAcBreakerRating}A 2-Pole Type C MCB, 30mA RCD/RCBO Earth Leakage, and Manual/Auto Transfer Switch`,
    `PV Cabling: ${state.pvCableMm2} mm² UV-resistant dual-core Solar Cable with genuine MC4 IP68 waterproof connectors`,
    `Battery DC Cables: ${state.batteryCableMm2} mm² Pure Copper Welding/Marine Cables with heavy hydraulic-crimped tinned copper lugs`,
    `AC Distribution: ${state.inverterAcCableMm2} mm² THHN copper wire, 2.0 mm² lighting, 3.5 mm² convenience outlets, and PVC conduit`,
    `Earth Grounding: 5/8" × 8-foot copper-bonded earth ground rod, brass clamp, and 16 mm² bare copper grounding conductor`,
  ];

  const handleCopyChecklist = () => {
    const text = `DECStudioHub — SOLAR SYSTEM BILL OF MATERIALS & SPECIFICATION
Generated on: ${new Date().toLocaleDateString()}
============================================================
SYSTEM SPECIFICATIONS:
- Daily Energy Consumption: ${state.dailyEnergyWh.toLocaleString()} Wh/day (${state.dailyEnergyKwh} kWh/day)
- Adjusted Daily Design Energy: ${state.adjustedDailyWh.toLocaleString()} Wh/day (${state.systemLossPercent}% system loss)
- Solar Array: ${state.totalPanels} × ${state.panelPmax}W (${state.totalPvWattage}W Total Peak PV)
- Battery Bank: ${state.batteryBankVoltage}V ${state.recommendedBatteryAh}Ah (${state.batteryType === 'lithium' ? 'LiFePO4' : 'Lead-Acid'})
- Charge Controller: ${state.recommendedControllerAmps}A ${state.controllerType.toUpperCase()} (${state.controllerMaxPvVoc}V Max Voc)
- Inverter: ${state.recommendedInverterWattage}W ${state.inverterType.toUpperCase()} (${state.estimatedSurgeWattage}W Peak Surge)
- Circuit Protection: DC Breaker (${state.pvDcBreakerRating}A), Battery Fuse (${state.batteryFuseRating}A), Inverter AC Breaker (${state.inverterAcBreakerRating}A)
- Wiring: PV: ${state.pvCableMm2}mm² | Battery: ${state.batteryCableMm2}mm² | AC: ${state.inverterAcCableMm2}mm²

INSTALLATION MATERIAL CHECKLIST:
${checklistItems.map((item, idx) => `[ ] ${idx + 1}. ${item}`).join('\n')}

SAFETY NOTICE:
This solar calculation provides engineering guidelines based on standard formulas. High-voltage DC and 230V AC electricity carry severe fire and shock hazards. Always have final designs verified and installed by a licensed electrical engineer or certified solar professional in compliance with local electrical codes.
============================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Complete Recommendation Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/30 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-lg">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                COMPLETE SOLAR SYSTEM SIZING
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Recommended Solar Configuration
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyChecklist}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Checklist Copied!' : 'Copy Bill of Materials'}</span>
            </button>
          </div>
        </div>

        {/* 6 Key Module Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {/* 1. Daily Energy */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Daily Energy</span>
              <span className="font-mono text-amber-400 font-bold">{state.dailyEnergyKwh} kWh/day</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {state.dailyEnergyWh.toLocaleString()} Wh/day
            </div>
            <p className="text-[11px] text-slate-400">
              Adjusted: {state.adjustedDailyWh.toLocaleString()} Wh/day ({state.systemLossPercent}% loss)
            </p>
          </div>

          {/* 2. Solar Panels */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Solar Array</span>
              <span className="font-mono text-amber-400 font-bold">{(state.totalPvWattage / 1000).toFixed(2)} kWp</span>
            </div>
            <div className="text-lg font-bold text-amber-400 font-mono">
              {state.totalPanels} × {state.panelPmax}W Panels
            </div>
            <p className="text-[11px] text-slate-400">
              Est. Yield: {(state.estimatedDailyPvProductionWh / 1000).toFixed(1)} kWh/day @ {state.peakSunHours}h PSH
            </p>
          </div>

          {/* 3. Battery Bank */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Battery Storage</span>
              <span className="font-mono text-emerald-400 font-bold">
                {((state.recommendedBatteryAh * state.batteryBankVoltage) / 1000).toFixed(1)} kWh
              </span>
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {state.batteryBankVoltage}V {state.recommendedBatteryAh}Ah
            </div>
            <p className="text-[11px] text-slate-400">
              {state.batteryType === 'lithium' ? 'LiFePO4 Lithium (85% DOD)' : 'Lead-Acid Deep Cycle (50% DOD)'} • {state.backupHours}h Backup
            </p>
          </div>

          {/* 4. Charge Controller */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Charge Controller</span>
              <span className="font-mono text-amber-400 font-bold">{state.controllerType.toUpperCase()}</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {state.recommendedControllerAmps}A Controller
            </div>
            <p className="text-[11px] text-slate-400">
              Max PV Input: {state.controllerMaxPvVoc}V DC (Cold Voc: {state.arrayVoc}V)
            </p>
          </div>

          {/* 5. Inverter */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Inverter / Charger</span>
              <span className="font-mono text-blue-400 font-bold">{state.inverterType.toUpperCase()}</span>
            </div>
            <div className="text-lg font-bold text-blue-400 font-mono">
              {state.recommendedInverterWattage.toLocaleString()}W Continuous
            </div>
            <p className="text-[11px] text-slate-400">
              Surge: {state.estimatedSurgeWattage.toLocaleString()}W Peak • {state.batteryDcDrawAmps}A DC Max Draw
            </p>
          </div>

          {/* 6. Protection & Cable */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Protection & Cables</span>
              <span className="font-mono text-rose-400 font-bold">Safety Class I</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">
              PV: {state.pvCableMm2}mm² • Bat: {state.batteryCableMm2}mm²
            </div>
            <p className="text-[11px] text-slate-400">
              {state.pvDcBreakerRating}A PV Breaker • {state.batteryFuseRating}A Battery Fuse • 30mA RCD
            </p>
          </div>
        </div>
      </div>

      {/* Complete Material Checklist */}
      <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Solar Installation Material Checklist & Bill of Materials</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive installation checklist. Click checkboxes to track procurement progress.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyChecklist}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>[Copy Checklist]</span>
          </button>
        </div>

        <div className="space-y-2">
          {checklistItems.map((item, idx) => {
            const isChecked = !!checkedItems[item];
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(item)}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  isChecked
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-400 line-through'
                    : 'bg-[#0f172a] border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition shrink-0 ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-slate-600 bg-slate-900'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs leading-relaxed">{item}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong className="text-sm text-amber-300 font-bold block">
            ⚡ Electrical Safety Disclaimer & Engineering Notice
          </strong>
          <p>
            This solar sizing tool provides preliminary engineering calculations based on standard
            formulas (NEC / Philippine Electrical Code). Solar photovoltaic arrays generate high-voltage
            DC electricity that can cause fatal electric shocks and arc flash fires even in overcast
            weather. Always have your final installation designed, inspected, and commissioned by a
            licensed professional electrical engineer or certified solar technician.
          </p>
        </div>
      </div>
    </div>
  );
};
