import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Zap, RotateCcw, Home, Calendar, Sparkles } from 'lucide-react';

export const ElectricityCalculator: React.FC = () => {
  const [kwhUsed, setKwhUsed] = useState<number | string>(250);
  const [ratePerKwh, setRatePerKwh] = useState<number | string>(12.0);
  const [billingPeriodDays, setBillingPeriodDays] = useState<number>(30);

  const reset = () => {
    setKwhUsed(250);
    setRatePerKwh(12.0);
    setBillingPeriodDays(30);
  };

  const calculation = useMemo(() => {
    const kwh = Number(kwhUsed);
    const rate = Number(ratePerKwh);
    const days = Number(billingPeriodDays) || 30;

    if (isNaN(kwh) || isNaN(rate) || kwh < 0 || rate < 0) {
      return null;
    }

    const totalCost = kwh * rate;
    const dailyKwh = days > 0 ? kwh / days : 0;
    const dailyCost = days > 0 ? totalCost / days : 0;
    const monthlyCost = totalCost; // Assuming billing period represents monthly cycle
    const annualCost = dailyCost * 365;

    return {
      kwh,
      rate,
      totalCost: totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      dailyKwh: Math.round(dailyKwh * 10) / 10,
      dailyCost: dailyCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      monthlyCost: monthlyCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      annualCost: annualCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  }, [kwhUsed, ratePerKwh, billingPeriodDays]);

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Electricity Bill Calculator</h2>
              <p className="text-xs text-slate-400">Simple, instant electricity bill cost estimation without complex appliance forms</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Electricity Used (kWh)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={kwhUsed}
              onChange={(e) => setKwhUsed(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-mono text-white focus:outline-none focus:border-yellow-500 transition"
              placeholder="e.g. 250"
            />
            <span className="text-[11px] text-slate-500">Total kilowatt-hours from your meter or bill</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Electricity Rate (₱ / kWh)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={ratePerKwh}
              onChange={(e) => setRatePerKwh(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-mono text-white focus:outline-none focus:border-yellow-500 transition"
              placeholder="e.g. 12.00"
            />
            <span className="text-[11px] text-slate-500">Meralco / Local Electric Coop average (₱10 - ₱14)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Billing Period (Days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={billingPeriodDays}
              onChange={(e) => setBillingPeriodDays(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">Typically 30 days per billing cycle</span>
          </div>
        </div>
      </div>

      {/* Primary Result Box */}
      {calculation && (
        <div className="space-y-4">
          <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-[#111827] via-[#172033] to-[#252011] border border-yellow-500/30 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Estimated Electricity Bill
              </span>
              <CopyButton textToCopy={`₱${calculation.totalCost}`} label="Copy Bill Amount" />
            </div>

            <div className="my-4">
              <div className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-tight">
                ₱{calculation.totalCost}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Formula: {calculation.kwh} kWh × ₱{calculation.rate}/kWh
              </p>
            </div>
          </div>

          {/* Optional projections breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Daily Consumption Average</span>
              <div className="my-1.5">
                <span className="text-2xl font-mono font-bold text-white">
                  {calculation.dailyKwh}
                </span>
                <span className="text-xs text-slate-400 ml-1">kWh / day</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">≈ ₱{calculation.dailyCost} daily</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Estimated Monthly Cost</span>
              <div className="my-1.5">
                <span className="text-2xl font-mono font-bold text-yellow-400">
                  ₱{calculation.monthlyCost}
                </span>
              </div>
              <div className="text-xs text-slate-500">Based on 30-day billing cycle</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Estimated Annual Cost</span>
              <div className="my-1.5">
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  ₱{calculation.annualCost}
                </span>
              </div>
              <div className="text-xs text-slate-500">365-day cumulative projection</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
