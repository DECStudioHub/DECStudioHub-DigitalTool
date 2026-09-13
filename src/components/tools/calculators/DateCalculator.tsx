import React, { useState } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Calendar, RotateCcw, Plus, Minus } from 'lucide-react';

export const DateCalculator: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Mode 1: Duration between two dates
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  });

  // Mode 2: Add or Subtract days
  const [baseDate, setBaseDate] = useState(todayStr);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState<number | string>(30);
  const [unit, setUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');

  const resetAll = () => {
    setStartDate(todayStr);
    const d = new Date();
    d.setDate(d.getDate() + 45);
    setEndDate(d.toISOString().split('T')[0]);
    setBaseDate(todayStr);
    setOperation('add');
    setAmount(30);
    setUnit('days');
  };

  // Duration calculations
  const duration = (() => {
    if (!startDate || !endDate) return null;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const absDays = Math.abs(diffDays);
    const weeks = Math.floor(absDays / 7);
    const remDays = absDays % 7;

    // Count business days (Monday-Friday)
    let businessDays = 0;
    const cur = new Date(Math.min(d1.getTime(), d2.getTime()));
    const target = new Date(Math.max(d1.getTime(), d2.getTime()));
    // Skip start date, check next days
    cur.setDate(cur.getDate() + 1);
    while (cur <= target) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        businessDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return {
      diffDays,
      absDays,
      weeks,
      remDays,
      businessDays,
      isFuture: diffDays > 0,
      isSame: diffDays === 0,
    };
  })();

  // Projection calculation
  const projection = (() => {
    if (!baseDate || isNaN(Number(amount))) return null;
    const d = new Date(baseDate);
    if (isNaN(d.getTime())) return null;

    const count = Number(amount) * (operation === 'subtract' ? -1 : 1);
    if (unit === 'days') d.setDate(d.getDate() + count);
    else if (unit === 'weeks') d.setDate(d.getDate() + count * 7);
    else if (unit === 'months') d.setMonth(d.getMonth() + count);
    else if (unit === 'years') d.setFullYear(d.getFullYear() + count);

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      iso: d.toISOString().split('T')[0],
      formatted: `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    };
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Date & Duration Calculator</h3>
            <p className="text-xs text-slate-400">Measure calendar intervals or add/subtract time from any date</p>
          </div>
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Days Between Dates */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Duration Between Two Dates</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {duration && (
              <div className="space-y-3">
                <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Total Calendar Days</div>
                    <div className="text-2xl font-mono font-bold text-indigo-400 mt-1">
                      {duration.absDays} days
                    </div>
                  </div>
                  <CopyButton textToCopy={`${duration.absDays} days`} label="Copy" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800">
                    <span className="text-slate-400 block font-sans">Weeks & Days:</span>
                    <span className="text-white font-semibold">{duration.weeks} wks, {duration.remDays} days</span>
                  </div>
                  <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800">
                    <span className="text-slate-400 block font-sans">Business Days:</span>
                    <span className="text-emerald-400 font-semibold">{duration.businessDays} workdays</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Module 2: Add or Subtract Days */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Add or Subtract from Date</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Base Date</label>
                <input
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex bg-[#0b0f19] p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setOperation('add')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
                      operation === 'add' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                  <button
                    onClick={() => setOperation('subtract')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
                      operation === 'subtract' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    Sub
                  </button>
                </div>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white text-center focus:outline-none focus:border-indigo-500"
                />

                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="bg-[#0b0f19] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            {projection && (
              <div className="mt-4 p-4 bg-[#0b0f19] rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Target Result Date</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {projection.formatted}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">ISO: {projection.iso}</div>
                </div>
                <CopyButton textToCopy={projection.formatted} label="Copy" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
