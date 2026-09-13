import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

export interface ApplianceRow {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  quantity: number;
}

const APPLIANCE_PRESETS = [
  { name: 'LED Light', watts: 10, hoursPerDay: 6, quantity: 5 },
  { name: 'Electric Fan', watts: 60, hoursPerDay: 8, quantity: 2 },
  { name: 'Refrigerator', watts: 150, hoursPerDay: 12, quantity: 1 },
  { name: 'Television', watts: 100, hoursPerDay: 5, quantity: 1 },
  { name: 'Laptop', watts: 65, hoursPerDay: 6, quantity: 1 },
  { name: 'WiFi Router', watts: 15, hoursPerDay: 24, quantity: 1 },
  { name: 'Rice Cooker', watts: 700, hoursPerDay: 1, quantity: 1 },
  { name: 'Washing Machine', watts: 500, hoursPerDay: 1, quantity: 1 },
  { name: 'Water Pump', watts: 750, hoursPerDay: 1, quantity: 1 },
  { name: 'Air Conditioner', watts: 1000, hoursPerDay: 6, quantity: 1 },
  { name: 'Microwave', watts: 1200, hoursPerDay: 0.5, quantity: 1 },
];

const INITIAL_APPLIANCES: ApplianceRow[] = [
  { id: '1', name: 'LED Light', watts: 10, hoursPerDay: 6, quantity: 6 },
  { id: '2', name: 'Electric Fan', watts: 60, hoursPerDay: 8, quantity: 2 },
  { id: '3', name: 'Refrigerator (Inverter)', watts: 120, hoursPerDay: 10, quantity: 1 },
  { id: '4', name: 'Television (Smart TV)', watts: 90, hoursPerDay: 4, quantity: 1 },
  { id: '5', name: 'WiFi Router', watts: 12, hoursPerDay: 24, quantity: 1 },
  { id: '6', name: 'Air Conditioner (1.0 HP)', watts: 850, hoursPerDay: 6, quantity: 1 },
];

interface ElectricityConsumptionProps {
  onCalculateBill?: (kwhPerMonth: number) => void;
}

export const ElectricityConsumption: React.FC<ElectricityConsumptionProps> = ({
  onCalculateBill,
}) => {
  const [appliances, setAppliances] = useState<ApplianceRow[]>(INITIAL_APPLIANCES);
  const [copied, setCopied] = useState<boolean>(false);

  // Form state for adding new row
  const [newName, setNewName] = useState<string>('');
  const [newWatts, setNewWatts] = useState<number>(100);
  const [newHours, setNewHours] = useState<number>(4);
  const [newQty, setNewQty] = useState<number>(1);

  const handleAddPreset = (preset: { name: string; watts: number; hoursPerDay: number; quantity: number }) => {
    const newRow: ApplianceRow = {
      id: 'app_' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: preset.name,
      watts: preset.watts,
      hoursPerDay: preset.hoursPerDay,
      quantity: preset.quantity,
    };
    setAppliances((prev) => [...prev, newRow]);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newRow: ApplianceRow = {
      id: 'app_' + Date.now(),
      name: newName.trim(),
      watts: Math.max(1, Number(newWatts)),
      hoursPerDay: Math.max(0.1, Math.min(24, Number(newHours))),
      quantity: Math.max(1, Number(newQty)),
    };
    setAppliances((prev) => [...prev, newRow]);
    setNewName('');
    setNewWatts(100);
  };

  const handleUpdateRow = (id: string, field: keyof ApplianceRow, value: any) => {
    setAppliances((prev) =>
      prev.map((app) => (app.id === id ? { ...app, [field]: value } : app))
    );
  };

  const handleDeleteRow = (id: string) => {
    setAppliances((prev) => prev.filter((app) => app.id !== id));
  };

  const handleReset = () => {
    setAppliances(INITIAL_APPLIANCES);
  };

  // Calculations
  // Wh/Day = Watts * Hours/Day * Quantity
  const totalWhPerDay = appliances.reduce(
    (sum, a) => sum + a.watts * a.hoursPerDay * a.quantity,
    0
  );
  // kWh/Day = Wh/Day / 1000
  const totalKWhPerDay = totalWhPerDay / 1000;
  // Monthly (30 days)
  const monthlyKWh = totalKWhPerDay * 30;
  // Annual (365 days)
  const annualKWh = totalKWhPerDay * 365;

  const copySummary = () => {
    const text = [
      'HOUSEHOLD ELECTRICITY CONSUMPTION',
      '==================================',
      ...appliances.map(
        (a) =>
          `${a.name}: ${a.watts}W × ${a.hoursPerDay}h/day × Qty ${a.quantity} = ${(
            a.watts *
            a.hoursPerDay *
            a.quantity
          ).toFixed(0)} Wh/Day (${(
            (a.watts * a.hoursPerDay * a.quantity) /
            1000
          ).toFixed(2)} kWh/Day)`
      ),
      '----------------------------------',
      `Total Wh/Day: ${totalWhPerDay.toLocaleString(undefined, { maximumFractionDigits: 0 })} Wh/Day`,
      `Total kWh/Day: ${totalKWhPerDay.toFixed(2)} kWh/Day`,
      `Estimated Monthly kWh: ${monthlyKWh.toFixed(1)} kWh/Month`,
      `Estimated Annual kWh: ${annualKWh.toFixed(1)} kWh/Year`,
      '==================================',
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Electricity Consumption Calculator</h1>
            <p className="text-xs text-slate-400">
              Calculate daily Wh, daily kWh, estimated monthly kWh, and annual household energy consumption.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copySummary}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
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

      {/* Quick Add Appliance Presets */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Click to Quick-Add Common Appliances:
        </span>
        <div className="flex flex-wrap gap-2">
          {APPLIANCE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3 text-blue-400" />
              <span>{preset.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">({preset.watts}W)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Appliance Energy Matrix</h2>
          <span className="text-xs font-mono text-slate-400">
            {appliances.length} {appliances.length === 1 ? 'appliance' : 'appliances'} listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d16] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-3">Appliance</th>
                <th className="py-3 px-3">Watts</th>
                <th className="py-3 px-3">Hours / Day</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">Wh / Day</th>
                <th className="py-3 px-3">kWh / Day</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {appliances.map((app) => {
                const wh = app.watts * app.hoursPerDay * app.quantity;
                const kwh = wh / 1000;
                return (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <input
                        type="text"
                        value={app.name}
                        onChange={(e) => handleUpdateRow(app.id, 'name', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none text-white text-xs w-full"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <input
                        type="number"
                        min="1"
                        value={app.watts}
                        onChange={(e) =>
                          handleUpdateRow(app.id, 'watts', Math.max(1, Number(e.target.value)))
                        }
                        className="bg-[#090d16] px-2 py-1 rounded border border-slate-800 text-cyan-400 text-xs w-20 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <input
                        type="number"
                        min="0.1"
                        max="24"
                        step="0.5"
                        value={app.hoursPerDay}
                        onChange={(e) =>
                          handleUpdateRow(
                            app.id,
                            'hoursPerDay',
                            Math.max(0.1, Math.min(24, Number(e.target.value)))
                          )
                        }
                        className="bg-[#090d16] px-2 py-1 rounded border border-slate-800 text-amber-400 text-xs w-16 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <input
                        type="number"
                        min="1"
                        value={app.quantity}
                        onChange={(e) =>
                          handleUpdateRow(app.id, 'quantity', Math.max(1, Number(e.target.value)))
                        }
                        className="bg-[#090d16] px-2 py-1 rounded border border-slate-800 text-slate-300 text-xs w-14 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">
                      {wh.toLocaleString(undefined, { maximumFractionDigits: 0 })} Wh
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      {kwh.toFixed(3)} kWh
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(app.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Custom Add Row Form */}
        <form
          onSubmit={handleAddCustom}
          className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end"
        >
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Appliance Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Induction Cooker, Hair Dryer..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Watts
            </label>
            <input
              type="number"
              min="1"
              required
              value={newWatts}
              onChange={(e) => setNewWatts(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Hours / Day
            </label>
            <input
              type="number"
              min="0.1"
              max="24"
              step="0.5"
              required
              value={newHours}
              onChange={(e) => setNewHours(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Appliance</span>
            </button>
          </div>
        </form>
      </div>

      {/* Energy Accumulation Summary Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Total Wh / Day
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {totalWhPerDay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <span className="text-xs text-slate-400 block mt-1">Watt-hours daily</span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
            Total kWh / Day
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
            {totalKWhPerDay.toFixed(2)}
          </div>
          <span className="text-xs text-slate-300 block mt-1">Kilowatt-hours daily</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Estimated Monthly kWh
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
            {monthlyKWh.toFixed(1)}
          </div>
          <span className="text-xs text-slate-400 block mt-1">Based on 30 days/mo</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Estimated Annual kWh
          </span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1">
            {annualKWh.toFixed(0)}
          </div>
          <span className="text-xs text-slate-400 block mt-1">Based on 365 days/yr</span>
        </div>
      </div>

      {/* Bill Transfer CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Ready to calculate your estimated monthly bill based on this <strong>{monthlyKWh.toFixed(1)} kWh</strong> consumption?
          </span>
        </div>

        <a
          href="#tool-electricity-bill"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition whitespace-nowrap"
        >
          <span>Open Bill Calculator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
