import React, { useState } from 'react';
import { WattsWheelHelper } from './WattsWheelHelper';
import { SolarHelpTooltip } from './SolarHelpTooltip';
import { ApplianceLoad } from './solarTypes';
import { Lightbulb, Plus, Zap, ArrowRight, Sparkles } from 'lucide-react';

interface Step1Props {
  onAddAppliance: (app: ApplianceLoad) => void;
  onGoToStep2: () => void;
  totalDailyWh: number;
  totalDailyKwh: number;
}

export const Step1EnergyConsumption: React.FC<Step1Props> = ({
  onAddAppliance,
  onGoToStep2,
  totalDailyWh,
  totalDailyKwh,
}) => {
  const [name, setName] = useState('');
  const [watts, setWatts] = useState<number | string>(150);
  const [amps, setAmps] = useState<number | string>('');
  const [volts, setVolts] = useState<number | string>(230);
  const [hours, setHours] = useState<number | string>(6);
  const [qty, setQty] = useState<number | string>(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // When Watts Wheel applies values
  const handleWattsWheelApply = (w: number, a: number, v: number) => {
    setWatts(w);
    setAmps(a);
    setVolts(v);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(String(watts)) || 0;
    const h = parseFloat(String(hours)) || 0;
    const q = parseInt(String(qty), 10) || 1;
    const appName = name.trim() || 'Custom Appliance';

    if (w <= 0 || h <= 0) return;

    onAddAppliance({
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: appName,
      watts: w,
      amps: amps ? parseFloat(String(amps)) : undefined,
      volts: volts ? parseFloat(String(volts)) : 230,
      hoursPerDay: h,
      quantity: q,
      whPerDay: Math.round(w * h * q),
    });

    setName('');
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-blue-900/30 to-amber-900/20 border border-blue-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-white">
              Step 1 — Daily Energy Consumption
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Before selecting solar panels, batteries, and inverter capacity, determine how much
              energy the household uses each day. Enter appliances below, or compute their wattage
              using the integrated Watts Wheel.
            </p>
            {totalDailyWh > 0 && (
              <div className="pt-2 flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">Current Daily Load:</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">
                  {totalDailyWh.toLocaleString()} Wh/day ({totalDailyKwh} kWh/day)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Watts Wheel / Ohm's Law Calculator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Compact Watts Wheel / Ohm’s Law Solver
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Missing wattage? Enter Volts & Amps below
          </span>
        </div>
        <WattsWheelHelper onApply={handleWattsWheelApply} />
      </div>

      {/* Add Appliance Form */}
      <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Add Appliance or Load</span>
            <SolarHelpTooltip term="Wh" />
          </h4>
          <button
            type="button"
            onClick={onGoToStep2}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
          >
            <span>View All Loads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Appliance Name
              </label>
              <input
                type="text"
                placeholder="e.g. Inverter Refrigerator, TV, Fan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                Power (Watts)
                <SolarHelpTooltip term="Wh" />
              </label>
              <input
                type="number"
                min="1"
                placeholder="Watts"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hours Used Per Day
              </label>
              <input
                type="number"
                min="0.1"
                max="24"
                step="0.5"
                placeholder="Hours/day"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current (Amps - Optional)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Amps"
                value={amps}
                onChange={(e) => setAmps(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Voltage (Volts)
              </label>
              <input
                type="number"
                placeholder="e.g. 230"
                value={volts}
                onChange={(e) => setVolts(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 font-mono">
              Calculated for this item:{' '}
              <span className="text-amber-400 font-bold">
                {Math.round(
                  (parseFloat(String(watts)) || 0) *
                    (parseFloat(String(hours)) || 0) *
                    (parseInt(String(qty), 10) || 1)
                )}{' '}
                Wh/day
              </span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Household Loads</span>
            </button>
          </div>
        </form>

        {addedNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
            <span>Appliance added to load table successfully!</span>
            <button
              type="button"
              onClick={onGoToStep2}
              className="underline font-bold text-emerald-300 hover:text-white"
            >
              View in Step 2 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
