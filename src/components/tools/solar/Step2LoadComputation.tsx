import React, { useState } from 'react';
import { ApplianceLoad, PRESET_APPLIANCES } from './solarTypes';
import { SolarHelpTooltip } from './SolarHelpTooltip';
import { calculateApplianceWh } from './solarCalculations';
import { Plus, Trash2, RotateCcw, Sparkles, Check, Lightbulb } from 'lucide-react';

interface Step2Props {
  appliances: ApplianceLoad[];
  onUpdateAppliances: (apps: ApplianceLoad[]) => void;
  totalDailyWh: number;
  totalDailyKwh: number;
  continuousWatts: number;
  surgeWatts: number;
}

export const Step2LoadComputation: React.FC<Step2Props> = ({
  appliances,
  onUpdateAppliances,
  totalDailyWh,
  totalDailyKwh,
  continuousWatts,
  surgeWatts,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRowChange = (id: string, field: keyof ApplianceLoad, val: string | number) => {
    const updated = appliances.map((item) => {
      if (item.id !== id) return item;
      const copy = { ...item, [field]: val };
      copy.whPerDay = calculateApplianceWh(
        Number(copy.watts) || 0,
        Number(copy.hoursPerDay) || 0,
        Number(copy.quantity) || 1
      );
      return copy;
    });
    onUpdateAppliances(updated);
  };

  const handleDeleteRow = (id: string) => {
    onUpdateAppliances(appliances.filter((a) => a.id !== id));
  };

  const handleAddEmptyRow = () => {
    const newApp: ApplianceLoad = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: 'New Appliance',
      watts: 100,
      hoursPerDay: 4,
      quantity: 1,
      whPerDay: 400,
    };
    onUpdateAppliances([...appliances, newApp]);
    setEditingId(newApp.id);
  };

  const handleAddPreset = (preset: (typeof PRESET_APPLIANCES)[0]) => {
    const newApp: ApplianceLoad = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      watts: preset.watts,
      hoursPerDay: preset.hoursPerDay,
      quantity: preset.quantity,
      whPerDay: calculateApplianceWh(preset.watts, preset.hoursPerDay, preset.quantity),
    };
    onUpdateAppliances([...appliances, newApp]);
  };

  const handleResetPresets = () => {
    const defaultApps: ApplianceLoad[] = PRESET_APPLIANCES.slice(0, 6).map((p, idx) => ({
      id: `app-def-${idx}`,
      name: p.name,
      watts: p.watts,
      hoursPerDay: p.hoursPerDay,
      quantity: p.quantity,
      whPerDay: calculateApplianceWh(p.watts, p.hoursPerDay, p.quantity),
    }));
    onUpdateAppliances(defaultApps);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Step 2 — Load Computation Table</span>
            <SolarHelpTooltip term="Wh" />
          </h3>
          <p className="text-xs text-slate-400">
            Formula: Wh/Day = Watts × Hours/Day × Quantity. Edit any value directly in the table.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddEmptyRow}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Appliance</span>
          </button>

          <button
            type="button"
            onClick={handleResetPresets}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition"
            title="Reset to default typical household loads"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Defaults</span>
          </button>
        </div>
      </div>

      {/* Quick Add Presets Pills */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Quick-Add Common Household Loads:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_APPLIANCES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-2.5 h-2.5 text-amber-400" />
              <span>{preset.name}</span>
              <span className="text-slate-400 font-mono text-[10px]">({preset.watts}W)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="bg-[#090e17] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Appliance</th>
                <th className="py-3 px-3 w-28">Watts</th>
                <th className="py-3 px-3 w-28">Hours/Day</th>
                <th className="py-3 px-3 w-24">Quantity</th>
                <th className="py-3 px-4 w-36 text-right">Wh/Day</th>
                <th className="py-3 px-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {appliances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No appliances in table. Click &quot;+ Add Appliance&quot; or select a quick preset above.
                  </td>
                </tr>
              ) : (
                appliances.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-4 font-medium text-white">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleRowChange(item.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-amber-500 focus:outline-none text-white font-medium"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={item.watts}
                          onChange={(e) =>
                            handleRowChange(item.id, 'watts', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                        />
                        <span className="absolute right-2 top-1 text-[10px] text-slate-400">W</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0.1"
                          max="24"
                          step="0.5"
                          value={item.hoursPerDay}
                          onChange={(e) =>
                            handleRowChange(item.id, 'hoursPerDay', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                        />
                        <span className="absolute right-2 top-1 text-[10px] text-slate-400">h</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleRowChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-400">
                      {item.whPerDay.toLocaleString()} Wh
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Footer */}
        <div className="p-4 sm:p-5 bg-[#0b1322] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              TOTAL DAILY ENERGY CONSUMPTION
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {totalDailyWh.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-amber-400">Wh/day</span>
              <span className="text-slate-400">•</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {totalDailyKwh} kWh/day
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">Running Load:</span>
              <span className="text-white font-bold">{continuousWatts} W</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px]">Est. Peak Surge:</span>
              <span className="text-amber-400 font-bold">{surgeWatts} W</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
