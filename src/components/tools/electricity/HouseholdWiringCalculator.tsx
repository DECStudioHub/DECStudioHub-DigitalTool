import React, { useState } from 'react';
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Cable,
  Home,
  Info,
} from 'lucide-react';

interface CircuitPreset {
  id: string;
  name: string;
  defaultWatts: number;
  powerFactor: number;
  defaultOutlets: number;
  circuitBreaker: string;
  minWireMm2: number;
  gfciRequired: boolean;
  description: string;
}

const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'lighting',
    name: 'Lighting Circuit',
    defaultWatts: 300,
    powerFactor: 0.9,
    defaultOutlets: 8,
    circuitBreaker: '15A MCB (1-pole or 2-pole)',
    minWireMm2: 2.0,
    gfciRequired: false,
    description: 'General indoor LED, recessed downlights, and ceiling fans (max 10-12 light points recommended).',
  },
  {
    id: 'general-outlets',
    name: 'General Convenience Outlets',
    defaultWatts: 1500,
    powerFactor: 0.95,
    defaultOutlets: 6,
    circuitBreaker: '20A MCB',
    minWireMm2: 3.5,
    gfciRequired: false,
    description: 'Living room, bedrooms, study area convenience duplex receptacles (max 6-8 outlets per branch).',
  },
  {
    id: 'kitchen',
    name: 'Kitchen Small Appliance Circuit',
    defaultWatts: 2200,
    powerFactor: 0.95,
    defaultOutlets: 3,
    circuitBreaker: '20A RCBO / GFCI (30mA)',
    minWireMm2: 3.5,
    gfciRequired: true,
    description: 'Countertop appliances (microwave, electric kettle, toaster, coffee maker). GFCI/RCBO mandatory near water.',
  },
  {
    id: 'aircon',
    name: 'Air Conditioner (Dedicated)',
    defaultWatts: 1500,
    powerFactor: 0.85,
    defaultOutlets: 1,
    circuitBreaker: '20A or 30A Dedicated MCB',
    minWireMm2: 3.5,
    gfciRequired: false,
    description: 'Dedicated single circuit for window or split-type inverter AC unit (no shared receptacles).',
  },
  {
    id: 'refrigerator',
    name: 'Refrigerator (Dedicated)',
    defaultWatts: 350,
    powerFactor: 0.85,
    defaultOutlets: 1,
    circuitBreaker: '15A or 20A Dedicated MCB',
    minWireMm2: 3.5,
    gfciRequired: false,
    description: 'Dedicated home outlet to prevent nuisance tripping and compressor startup voltage sagging.',
  },
  {
    id: 'water-heater',
    name: 'Shower Water Heater (Dedicated)',
    defaultWatts: 3500,
    powerFactor: 1.0,
    defaultOutlets: 1,
    circuitBreaker: '25A / 30A RCBO (10mA - 30mA)',
    minWireMm2: 5.5,
    gfciRequired: true,
    description: 'High-power electric instant shower heater. Mandatory dedicated circuit with sensitive earth leakage protection.',
  },
  {
    id: 'water-pump',
    name: 'Water Pressure Pump (Dedicated)',
    defaultWatts: 750,
    powerFactor: 0.8,
    defaultOutlets: 1,
    circuitBreaker: '20A Dedicated MCB',
    minWireMm2: 3.5,
    gfciRequired: true,
    description: 'Pressure booster or submersible well pump motor with inductive surge considerations.',
  },
  {
    id: 'washing-machine',
    name: 'Washing Machine & Laundry Area',
    defaultWatts: 600,
    powerFactor: 0.85,
    defaultOutlets: 1,
    circuitBreaker: '20A RCBO (30mA)',
    minWireMm2: 3.5,
    gfciRequired: true,
    description: 'Wet utility area. Requires GFCI/RCBO ground fault protection against moisture.',
  },
  {
    id: 'custom',
    name: 'Other Dedicated Load / Custom',
    defaultWatts: 1800,
    powerFactor: 0.9,
    defaultOutlets: 1,
    circuitBreaker: '20A / 30A MCB',
    minWireMm2: 3.5,
    gfciRequired: false,
    description: 'Custom heavy load such as an electric oven, induction cooktop, welder, or workshop power tool.',
  },
];

// Copper THHN standard metric wire resistance (approx ohms / km at 75°C) & nominal ampacities in conduit
const COPPER_WIRES = [
  { sizeMm2: 2.0, awgEquivalent: '14 AWG', maxCurrentAmps: 15, resistancePerKm: 9.2 },
  { sizeMm2: 3.5, awgEquivalent: '12 AWG', maxCurrentAmps: 20, resistancePerKm: 5.2 },
  { sizeMm2: 5.5, awgEquivalent: '10 AWG', maxCurrentAmps: 30, resistancePerKm: 3.3 },
  { sizeMm2: 8.0, awgEquivalent: '8 AWG', maxCurrentAmps: 40, resistancePerKm: 2.1 },
  { sizeMm2: 14.0, awgEquivalent: '6 AWG', maxCurrentAmps: 55, resistancePerKm: 1.2 },
  { sizeMm2: 22.0, awgEquivalent: '4 AWG', maxCurrentAmps: 75, resistancePerKm: 0.78 },
  { sizeMm2: 30.0, awgEquivalent: '2 AWG', maxCurrentAmps: 95, resistancePerKm: 0.52 },
];

export const HouseholdWiringCalculator: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('general-outlets');
  const [voltage, setVoltage] = useState<number>(230);
  const [watts, setWatts] = useState<number>(1500);
  const [cableLengthMeters, setCableLengthMeters] = useState<number>(18);
  const [outletsCount, setOutletsCount] = useState<number>(6);
  const [powerFactor, setPowerFactor] = useState<number>(0.95);

  const activePreset = CIRCUIT_PRESETS.find((p) => p.id === selectedPreset) || CIRCUIT_PRESETS[1];

  const handleSelectPreset = (presetId: string) => {
    const preset = CIRCUIT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset.id);
      setWatts(preset.defaultWatts);
      setPowerFactor(preset.powerFactor);
      setOutletsCount(preset.defaultOutlets);
    }
  };

  const handleReset = () => {
    handleSelectPreset('general-outlets');
    setVoltage(230);
    setCableLengthMeters(18);
  };

  // Calculations
  const calculatedAmps = Math.max(0.1, watts / (Math.max(100, voltage) * Math.max(0.5, powerFactor)));
  // Continuous load safety factor (NEC / PEC 125%)
  const designAmps = calculatedAmps * 1.25;

  // Find wire that satisfies: 1) Preset minimum, 2) Design ampacity, 3) Voltage drop <= 3.0%
  let recommendedWire = COPPER_WIRES[0];

  for (const wire of COPPER_WIRES) {
    if (wire.sizeMm2 < activePreset.minWireMm2) continue;
    if (wire.maxCurrentAmps < designAmps) continue;

    // Single phase AC voltage drop: 2 * L (meters) * I (amps) * R (ohms/km) / 1000
    const vDrop = (2 * cableLengthMeters * calculatedAmps * wire.resistancePerKm) / 1000;
    const vDropPercent = (vDrop / voltage) * 100;

    recommendedWire = wire;
    if (vDropPercent <= 3.0) {
      break;
    }
  }

  const estimatedVDropVolts = (2 * cableLengthMeters * calculatedAmps * recommendedWire.resistancePerKm) / 1000;
  const estimatedVDropPercent = (estimatedVDropVolts / voltage) * 100;
  const voltageAtEnd = voltage - estimatedVDropVolts;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Household Wiring Planner</h1>
            <p className="text-xs text-slate-400">
              Calculate wire size (mm²), running current, voltage drop %, and circuit protection recommendations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Circuit Type Preset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Select Circuit / Appliance Load Type:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {CIRCUIT_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                    : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="text-xs font-bold text-white line-clamp-1">{preset.name}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  ~{preset.defaultWatts}W
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Circuit Operating Parameters
            </span>
            <span className="text-xs text-blue-400 font-medium">{activePreset.name}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                System Voltage (V)
              </label>
              <div className="flex gap-2">
                {[115, 220, 230, 240].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVoltage(v)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      voltage === v
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#090d16] border border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {v}V
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Connected Load Wattage (W)
              </label>
              <input
                type="number"
                min="10"
                step="50"
                value={watts}
                onChange={(e) => setWatts(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                One-Way Cable Run Length (Meters)
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={cableLengthMeters}
                onChange={(e) => setCableLengthMeters(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Distance from panel board to furthest outlet/load
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Number of Outlets / Points on Circuit
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={outletsCount}
                onChange={(e) => setOutletsCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-1 text-xs text-slate-300">
            <span className="font-semibold text-white block">Circuit Application Notes:</span>
            <p className="text-slate-400">{activePreset.description}</p>
          </div>
        </div>

        {/* Calculation Result Summary Card */}
        <div className="bg-gradient-to-b from-[#131b2e] to-[#0f1422] border border-blue-500/30 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400 border-b border-blue-500/20 pb-3">
              <Cable className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Wiring Recommendation</span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                Recommended Conductor Size (Metric)
              </span>
              <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2 mt-1">
                <span>{recommendedWire.sizeMm2} mm²</span>
                <span className="text-sm font-normal text-slate-400">({recommendedWire.awgEquivalent})</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold block mt-1">
                Copper THHN / THWN-2 in conduit
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Operating Current</span>
                <span className="text-lg font-bold text-white font-mono">
                  {calculatedAmps.toFixed(2)} A
                </span>
                <span className="text-[10px] text-slate-500 block">Design: {designAmps.toFixed(1)}A</span>
              </div>

              <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Voltage Drop %</span>
                <span
                  className={`text-lg font-bold font-mono ${
                    estimatedVDropPercent <= 3.0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {estimatedVDropPercent.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-500 block">Drop: {estimatedVDropVolts.toFixed(1)}V</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase text-slate-400 block">Recommended Circuit Breaker</span>
              <span className="text-sm font-bold text-amber-400 block">{activePreset.circuitBreaker}</span>
              {activePreset.gfciRequired && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  GFCI / RCBO Required
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800">
            Voltage at end of run: <strong className="text-white font-mono">{voltageAtEnd.toFixed(1)} VAC</strong>
          </div>
        </div>
      </div>

      {/* Safety & Compliance Disclaimer */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-start gap-3 text-xs text-amber-300">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block">Preliminary Electrical Engineering Disclaimer</strong>
          <p className="text-amber-200/90 leading-relaxed">
            Recommendations generated by this tool are preliminary estimates based on standard metric copper THHN conductors under normal ambient conditions and Philippine Electrical Code (PEC) / National Electrical Code (NEC) guidelines. Actual conductor ampacity, conduit fill deratings, ambient temperatures, and protective device coordination must be verified and installed by a licensed Master Electrician or Professional Electrical Engineer.
          </p>
        </div>
      </div>
    </div>
  );
};
