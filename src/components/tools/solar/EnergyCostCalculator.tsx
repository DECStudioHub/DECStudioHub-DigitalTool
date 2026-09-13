import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { CircleDollarSign, RotateCcw, AlertCircle } from 'lucide-react';

export const EnergyCostCalculator: React.FC = () => {
  const [powerWatts, setPowerWatts] = useState<number | string>(150);
  const [hoursPerDay, setHoursPerDay] = useState<number | string>(8);
  const [ratePerKwh, setRatePerKwh] = useState<number | string>(12); // e.g. Meralco rate ~12 PHP/kWh
  const [daysPerMonth, setDaysPerMonth] = useState<number | string>(30);

  const reset = () => {
    setPowerWatts(150);
    setHoursPerDay(8);
    setRatePerKwh(12);
    setDaysPerMonth(30);
  };

  const calculation = useMemo(() => {
    const w = Number(powerWatts);
    const h = Number(hoursPerDay);
    const rate = Number(ratePerKwh);
    const days = Number(daysPerMonth);

    if (isNaN(w) || isNaN(h) || isNaN(rate) || isNaN(days)) {
      return { error: 'Please enter valid numerical inputs' };
    }
    if (w < 0 || h < 0 || rate < 0 || days <= 0) {
      return { error: 'Input values cannot be negative' };
    }

    const dailyKwh = (w * h) / 1000;
    const dailyCost = dailyKwh * rate;
    const monthlyKwh = dailyKwh * days;
    const monthlyCost = monthlyKwh * rate;
    const annualCost = dailyCost * 365;

    return {
      error: null,
      dailyKwh: Math.round(dailyKwh * 100) / 100,
      dailyCost: Math.round(dailyCost * 100) / 100,
      monthlyKwh: Math.round(monthlyKwh * 10) / 10,
      monthlyCost: Math.round(monthlyCost * 100) / 100,
      annualCost: Math.round(annualCost * 100) / 100,
    };
  }, [powerWatts, hoursPerDay, ratePerKwh, daysPerMonth]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Appliance Energy & Electricity Cost Calculator</h3>
              <p className="text-xs text-slate-400">Estimate daily, monthly, and yearly power bill impact of specific electrical loads</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Appliance Power (Watts)
            </label>
            <input
              type="number"
              min="1"
              value={powerWatts}
              onChange={(e) => setPowerWatts(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Usage Hours per Day
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Electricity Tariff Rate (per kWh)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={ratePerKwh}
              onChange={(e) => setRatePerKwh(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">From utility power bill</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Days in Billing Cycle
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={daysPerMonth}
              onChange={(e) => setDaysPerMonth(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>
        </div>

        {/* Common appliance presets */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Appliance Presets:</span>
          <button
            onClick={() => { setPowerWatts(10); setHoursPerDay(8); }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
          >
            LED Bulb (10W)
          </button>
          <button
            onClick={() => { setPowerWatts(65); setHoursPerDay(10); }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
          >
            Stand Fan (65W)
          </button>
          <button
            onClick={() => { setPowerWatts(150); setHoursPerDay(24); }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
          >
            Refrigerator (150W avg)
          </button>
          <button
            onClick={() => { setPowerWatts(1000); setHoursPerDay(8); }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
          >
            1.0 HP Aircon (1000W)
          </button>
          <button
            onClick={() => { setPowerWatts(2000); setHoursPerDay(1.5); }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
          >
            Induction Cooker (2000W)
          </button>
        </div>
      </div>

      {calculation.error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{calculation.error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#252011] border border-yellow-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-400 font-medium">Monthly Cost</span>
              <CopyButton textToCopy={calculation.monthlyCost.toFixed(2)} variant="icon" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-yellow-400 tracking-tight">
                {calculation.monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              For {calculation.monthlyKwh} kWh consumed / month
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Daily Operating Cost</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                {calculation.dailyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {calculation.dailyKwh} kWh per {hoursPerDay}h day
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Annualized Cost (365 Days)</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                {calculation.annualCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Total 12-month power expenditure
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
