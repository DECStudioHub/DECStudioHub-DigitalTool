import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Trash2,
  ShieldCheck,
  RotateCcw,
  Zap,
  Info,
  ShieldAlert,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface PanelCircuit {
  id: string;
  name: string;
  watts: number;
  breakerAmps: number;
  wireSizeMm2: number;
  protectionType: 'MCB' | 'RCBO (30mA)' | 'GFCI';
  category: 'lighting' | 'outlet' | 'dedicated';
  notes: string;
}

const DEFAULT_CIRCUITS: PanelCircuit[] = [
  {
    id: 'c1',
    name: 'Circuit 1: Indoor Lighting (LED & Fans)',
    watts: 400,
    breakerAmps: 15,
    wireSizeMm2: 2.0,
    protectionType: 'MCB',
    category: 'lighting',
    notes: 'Living room, bedrooms, and hallway LED fixtures',
  },
  {
    id: 'c2',
    name: 'Circuit 2: General Convenience Outlets',
    watts: 1600,
    breakerAmps: 20,
    wireSizeMm2: 3.5,
    protectionType: 'MCB',
    category: 'outlet',
    notes: 'Duplex wall receptacles in living and master bedroom',
  },
  {
    id: 'c3',
    name: 'Circuit 3: Kitchen Small Appliances',
    watts: 2200,
    breakerAmps: 20,
    wireSizeMm2: 3.5,
    protectionType: 'RCBO (30mA)',
    category: 'outlet',
    notes: 'Countertop receptacles near sink with mandatory earth leakage',
  },
  {
    id: 'c4',
    name: 'Circuit 4: Air Conditioner (Dedicated)',
    watts: 1500,
    breakerAmps: 20,
    wireSizeMm2: 3.5,
    protectionType: 'MCB',
    category: 'dedicated',
    notes: '1.5 HP Inverter Split AC unit',
  },
  {
    id: 'c5',
    name: 'Circuit 5: Shower Water Heater (Dedicated)',
    watts: 3500,
    breakerAmps: 30,
    wireSizeMm2: 5.5,
    protectionType: 'RCBO (30mA)',
    category: 'dedicated',
    notes: 'Bathroom instant multi-point water heater with sensitive protection',
  },
];

export const HouseholdPanelBoard: React.FC = () => {
  const [circuits, setCircuits] = useState<PanelCircuit[]>(DEFAULT_CIRCUITS);
  const [voltage, setVoltage] = useState<number>(230);
  const [spareSpaces, setSpareSpaces] = useState<number>(2);
  const [includeSpd, setIncludeSpd] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // New circuit modal/form state
  const [newName, setNewName] = useState<string>('Circuit: Refrigerator');
  const [newWatts, setNewWatts] = useState<number>(350);
  const [newBreaker, setNewBreaker] = useState<number>(20);
  const [newWire, setNewWire] = useState<number>(3.5);
  const [newType, setNewType] = useState<'MCB' | 'RCBO (30mA)' | 'GFCI'>('MCB');
  const [newCategory, setNewCategory] = useState<'lighting' | 'outlet' | 'dedicated'>('dedicated');

  // Load calculations
  const totalWatts = circuits.reduce((sum, c) => sum + c.watts, 0);
  // Demand factor standard (assume 80% diversified coincident peak demand)
  const diversifiedWatts = totalWatts * 0.8;
  const runningAmps = diversifiedWatts / voltage;
  const designMainAmps = runningAmps * 1.25; // 125% continuous margin

  // Sizing standard main breaker sizes: 30, 40, 50, 60, 63, 75, 100, 125, 150, 200
  const STANDARD_MAIN_BREAKERS = [30, 40, 50, 60, 63, 75, 100, 125, 150, 200];
  const recommendedMainBreaker =
    STANDARD_MAIN_BREAKERS.find((b) => b >= designMainAmps) || 63;

  // Main feeder wire size based on main breaker rating
  const getMainFeederWire = (amps: number) => {
    if (amps <= 30) return { size: '5.5 mm²', awg: '10 AWG' };
    if (amps <= 40) return { size: '8.0 mm²', awg: '8 AWG' };
    if (amps <= 63) return { size: '14.0 mm²', awg: '6 AWG' };
    if (amps <= 75) return { size: '22.0 mm²', awg: '4 AWG' };
    if (amps <= 100) return { size: '30.0 mm²', awg: '2 AWG' };
    if (amps <= 125) return { size: '38.0 mm²', awg: '1 AWG' };
    return { size: '50.0 mm²', awg: '1/0 AWG' };
  };

  const mainFeeder = getMainFeederWire(recommendedMainBreaker);

  // Total panel enclosure slots = active branch circuits + spare spaces + (2 slots for SPD if present)
  const spdSlots = includeSpd ? 2 : 0;
  const totalRequiredSlots = circuits.length + spareSpaces + spdSlots;
  const standardEnclosureSizes = [6, 8, 12, 16, 20, 24, 30, 36];
  const recommendedEnclosure =
    standardEnclosureSizes.find((s) => s >= totalRequiredSlots) || 24;

  const handleAddCircuit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCircuit: PanelCircuit = {
      id: 'c_' + Date.now(),
      name: newName,
      watts: Number(newWatts),
      breakerAmps: Number(newBreaker),
      wireSizeMm2: Number(newWire),
      protectionType: newType,
      category: newCategory,
      notes: `${newCategory} branch circuit`,
    };
    setCircuits((prev) => [...prev, newCircuit]);
    setNewName('');
    setNewWatts(1000);
  };

  const handleDeleteCircuit = (id: string) => {
    setCircuits((prev) => prev.filter((c) => c.id !== id));
  };

  const handleReset = () => {
    setCircuits(DEFAULT_CIRCUITS);
    setVoltage(230);
    setSpareSpaces(2);
    setIncludeSpd(true);
  };

  const copySchedule = () => {
    const lines = [
      '========================================',
      'HOUSEHOLD ELECTRICAL PANEL BOARD SCHEDULE',
      '========================================',
      `System Voltage: ${voltage}V Single-Phase`,
      `Total Connected Load: ${totalWatts} Watts`,
      `Estimated Demand Current: ${runningAmps.toFixed(1)} A`,
      `RECOMMENDED MAIN BREAKER: ${recommendedMainBreaker}A (2-Pole MCB)`,
      `MAIN FEEDER CABLE: ${mainFeeder.size} (${mainFeeder.awg}) Copper THHN`,
      `RECOMMENDED ENCLOSURE: ${recommendedEnclosure}-Slot Distribution Panel`,
      `SPARE SLOTS: ${spareSpaces} Spaces`,
      `GROUNDING ROD: 16mm dia x 2.4m Copper Clad + 8.0 mm² Grounding Conductor`,
      `SURGE PROTECTION: ${includeSpd ? 'Type 2 SPD (20kA/40kA 275V)' : 'None'}`,
      '----------------------------------------',
      'BRANCH CIRCUITS:',
      ...circuits.map(
        (c, idx) =>
          `[Slot ${idx + 1}] ${c.name} | ${c.watts}W | ${c.breakerAmps}A ${c.protectionType} | ${c.wireSizeMm2} mm²`
      ),
      `[Spares] ${spareSpaces} Empty Breaker Spaces reserved for future expansion`,
      '========================================',
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Household Distribution Panel Planner</h1>
            <p className="text-xs text-slate-400">
              Calculate main breaker rating, branch breakers schedule, enclosure spaces, grounding, and surge protection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copySchedule}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 hover:text-white text-xs flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Schedule'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Panel Specs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 shadow-lg">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
            Calculated Main Breaker
          </span>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {recommendedMainBreaker}A
          </div>
          <span className="text-xs text-slate-300 block mt-1">
            2-Pole MCB (10kA IC rating)
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Based on {designMainAmps.toFixed(1)}A design load
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Main Feeder Conductor
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {mainFeeder.size}
          </div>
          <span className="text-xs text-slate-300 block mt-1">
            ({mainFeeder.awg}) Copper THHN
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Phase & Neutral service entrance
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Enclosure Slots Sizing
          </span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {recommendedEnclosure} Slots
          </div>
          <span className="text-xs text-slate-300 block mt-1">
            {circuits.length} active + {spareSpaces} spares
          </span>
          {includeSpd && (
            <span className="text-[10px] text-slate-500 block mt-0.5">
              +2 slots for Type 2 SPD
            </span>
          )}
        </div>

        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Total Connected Load
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
            {(totalWatts / 1000).toFixed(2)} kW
          </div>
          <span className="text-xs text-slate-300 block mt-1">
            {totalWatts.toLocaleString()} Watts total
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Peak current: {runningAmps.toFixed(1)}A @ {voltage}V
          </span>
        </div>
      </div>

      {/* Grounding, Neutral, and Protection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
            🌱 Grounding Specification
          </span>
          <p className="text-xs text-slate-300">
            16mm dia × 2.4m copper clad ground rod driven into earth. Minimum <strong>8.0 mm²</strong> bare copper ground electrode conductor linked to panel ground busbar.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
            ⚡ Neutral Busbar
          </span>
          <p className="text-xs text-slate-300">
            Electrically isolated solid copper neutral bus bar sized for full <strong>{recommendedMainBreaker}A</strong> service ampacity with individual branch terminal lugs.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">
              🛡️ Surge Protection (SPD)
            </span>
            <input
              type="checkbox"
              id="includeSpd"
              checked={includeSpd}
              onChange={(e) => setIncludeSpd(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-0"
            />
          </div>
          <p className="text-xs text-slate-300">
            {includeSpd
              ? 'Type 2 AC SPD (20kA / 40kA 275V) installed adjacent to main breaker to protect sensitive electronics against lightning & utility surges.'
              : 'Surge protection device disabled.'}
          </p>
        </div>
      </div>

      {/* Branch Circuit Schedule Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Branch Circuit Schedule</h2>
            <p className="text-xs text-slate-400">
              Active branch breakers configured with conductor mm² and earth leakage protection.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span>Spare slots:</span>
              <select
                value={spareSpaces}
                onChange={(e) => setSpareSpaces(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-[#090d16] border border-slate-700 text-white font-mono"
              >
                {[0, 1, 2, 4, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} spaces
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d16] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-3">Slot / Circuit</th>
                <th className="py-3 px-3">Watts</th>
                <th className="py-3 px-3">Breaker (A)</th>
                <th className="py-3 px-3">Wire (mm²)</th>
                <th className="py-3 px-3">Device Type</th>
                <th className="py-3 px-3">Application Notes</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {circuits.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-slate-400 shrink-0">
                        {idx + 1}
                      </span>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-400">{c.watts} W</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">{c.breakerAmps}A</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">{c.wireSizeMm2} mm²</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.protectionType.includes('RCBO') || c.protectionType.includes('GFCI')
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.protectionType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 truncate max-w-xs">{c.notes}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteCircuit(c.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete circuit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Spare slots row */}
              {Array.from({ length: spareSpaces }).map((_, i) => (
                <tr key={`spare-${i}`} className="bg-slate-900/30 text-slate-500 italic">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-slate-500 shrink-0">
                        {circuits.length + i + 1}
                      </span>
                      <span>Spare Space #{i + 1} (Empty Slot)</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">—</td>
                  <td className="py-2.5 px-3 font-mono">—</td>
                  <td className="py-2.5 px-3 font-mono">—</td>
                  <td className="py-2.5 px-3">Reserved</td>
                  <td className="py-2.5 px-3">Future circuit expansion</td>
                  <td className="py-2.5 px-3 text-right">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Circuit Form */}
        <form
          onSubmit={handleAddCircuit}
          className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 items-end"
        >
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Circuit Name / Description
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Microwave Oven"
              className="w-full px-3 py-1.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Load (Watts)
            </label>
            <input
              type="number"
              min="10"
              required
              value={newWatts}
              onChange={(e) => setNewWatts(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Breaker (A)
            </label>
            <select
              value={newBreaker}
              onChange={(e) => setNewBreaker(Number(e.target.value))}
              className="w-full px-2 py-1.5 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-xs"
            >
              {[15, 20, 30, 40, 50].map((a) => (
                <option key={a} value={a}>
                  {a}A
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Wire (mm²)
            </label>
            <select
              value={newWire}
              onChange={(e) => setNewWire(Number(e.target.value))}
              className="w-full px-2 py-1.5 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-xs"
            >
              {[2.0, 3.5, 5.5, 8.0, 14.0].map((w) => (
                <option key={w} value={w}>
                  {w} mm²
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Protection
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full px-2 py-1.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs"
            >
              <option value="MCB">MCB</option>
              <option value="RCBO (30mA)">RCBO (30mA)</option>
              <option value="GFCI">GFCI</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Safety Notice */}
      <div className="rounded-2xl bg-[#0b0f19] border border-slate-800 p-4 text-xs text-slate-400 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          <strong>Engineering Notice:</strong> Breaker ratings and wire dimensions must coordinate with Philippine Electrical Code (PEC) or NEC standards. Wet areas and bathroom instant water heaters require dedicated earth leakage protection (RCBO or GFCI with 10mA to 30mA trip threshold).
        </span>
      </div>
    </div>
  );
};
