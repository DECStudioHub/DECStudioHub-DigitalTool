import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Coins, RotateCcw, AlertCircle } from 'lucide-react';

export const SalaryCalculator: React.FC = () => {
  const [monthlySalary, setMonthlySalary] = useState<number | string>(50000);
  const [workdaysPerMonth, setWorkdaysPerMonth] = useState<number | string>(22);
  const [hoursPerDay, setHoursPerDay] = useState<number | string>(8);

  const reset = () => {
    setMonthlySalary(50000);
    setWorkdaysPerMonth(22);
    setHoursPerDay(8);
  };

  const calculation = useMemo(() => {
    const monthly = Number(monthlySalary);
    const workdays = Number(workdaysPerMonth);
    const hours = Number(hoursPerDay);

    if (isNaN(monthly) || isNaN(workdays) || isNaN(hours)) {
      return { error: 'Please enter valid salary and workday values' };
    }
    if (monthly < 0) return { error: 'Monthly salary cannot be negative' };
    if (workdays <= 0 || workdays > 31) return { error: 'Workdays per month must be between 1 and 31' };
    if (hours <= 0 || hours > 24) return { error: 'Hours per workday must be between 1 and 24' };

    const daily = monthly / workdays;
    const hourly = daily / hours;
    // Standard year = 12 months, 52 weeks
    const annual = monthly * 12;
    const weekly = annual / 52;

    return {
      error: null,
      monthly,
      annual,
      weekly: Math.round(weekly * 100) / 100,
      daily: Math.round(daily * 100) / 100,
      hourly: Math.round(hourly * 100) / 100,
    };
  }, [monthlySalary, workdaysPerMonth, hoursPerDay]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Salary & Wage Converter</h3>
              <p className="text-xs text-slate-400">Convert monthly compensation into equivalent weekly, daily, and hourly rates</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Monthly Salary
            </label>
            <input
              type="number"
              min="0"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Workdays per Month
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={workdaysPerMonth}
              onChange={(e) => setWorkdaysPerMonth(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
            />
            <span className="text-[11px] text-slate-500">Standard: 20–22 days</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Hours per Workday
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
            />
            <span className="text-[11px] text-slate-500">Standard shift: 8 hours</span>
          </div>
        </div>
      </div>

      {calculation.error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{calculation.error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Hourly Wage</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-amber-400 tracking-tight">
                {calculation.hourly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Per productive hour</span>
              <CopyButton textToCopy={calculation.hourly.toFixed(2)} variant="icon" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Daily Pay</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                {calculation.daily.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Per workday</span>
              <CopyButton textToCopy={calculation.daily.toFixed(2)} variant="icon" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Approximate Weekly</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                {calculation.weekly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">52-week annualized split</span>
              <CopyButton textToCopy={calculation.weekly.toFixed(2)} variant="icon" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Annual Equivalent</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-indigo-400 tracking-tight">
                {calculation.annual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">12-month base income</span>
              <CopyButton textToCopy={calculation.annual.toFixed(2)} variant="icon" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
