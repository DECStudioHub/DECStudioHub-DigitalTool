import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { CalendarClock, RotateCcw, AlertCircle, Cake } from 'lucide-react';

export const AgeCalculator: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [birthDate, setBirthDate] = useState('2000-01-15');
  const [targetDate, setTargetDate] = useState(todayStr);

  const reset = () => {
    setBirthDate('2000-01-15');
    setTargetDate(new Date().toISOString().split('T')[0]);
  };

  const calculation = useMemo(() => {
    if (!birthDate || !targetDate) {
      return { error: 'Please select both Date of Birth and Target Date' };
    }

    const start = new Date(birthDate);
    const end = new Date(targetDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { error: 'Invalid date format' };
    }

    if (start > end) {
      return { error: 'Date of Birth cannot be after the Target Date' };
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Total milliseconds difference
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;

    // Day of the week born
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bornDayOfWeek = weekdays[start.getDay()];

    // Next Birthday calculation
    let nextBday = new Date(end.getFullYear(), start.getMonth(), start.getDate());
    if (nextBday < end) {
      nextBday = new Date(end.getFullYear() + 1, start.getMonth(), start.getDate());
    }
    const daysUntilNextBday = Math.ceil((nextBday.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));

    return {
      error: null,
      years,
      months,
      days,
      totalDays: totalDays.toLocaleString(),
      totalWeeks: totalWeeks.toLocaleString(),
      totalMonths: totalMonths.toLocaleString(),
      totalHours: totalHours.toLocaleString(),
      bornDayOfWeek,
      daysUntilNextBday,
    };
  }, [birthDate, targetDate]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Chronological Age Calculator</h3>
              <p className="text-xs text-slate-400">Calculate exact years, months, and days with next birthday countdown</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              id="age-birthdate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Calculate Age At Date
            </label>
            <input
              type="date"
              id="age-targetdate"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {calculation.error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{calculation.error}</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main age display */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Current Age</span>
              <div className="mt-2 flex items-baseline gap-2 font-mono flex-wrap justify-center md:justify-start">
                <span className="text-4xl font-extrabold text-white">{calculation.years}</span>
                <span className="text-sm text-slate-400 mr-2">years</span>
                <span className="text-4xl font-extrabold text-emerald-400">{calculation.months}</span>
                <span className="text-sm text-slate-400 mr-2">months</span>
                <span className="text-4xl font-extrabold text-cyan-400">{calculation.days}</span>
                <span className="text-sm text-slate-400">days</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CopyButton
                textToCopy={`${calculation.years} years, ${calculation.months} months, and ${calculation.days} days`}
                label="Copy Full Age"
              />
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400">Total Days Lived</span>
              <div className="text-lg font-mono font-bold text-white mt-1">
                {calculation.totalDays}
              </div>
              <span className="text-[11px] text-slate-500">Days since birth</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400">Total Weeks</span>
              <div className="text-lg font-mono font-bold text-cyan-400 mt-1">
                {calculation.totalWeeks}
              </div>
              <span className="text-[11px] text-slate-500">Full calendar weeks</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400">Born On</span>
              <div className="text-lg font-bold text-indigo-400 mt-1">
                {calculation.bornDayOfWeek}
              </div>
              <span className="text-[11px] text-slate-500">Day of the week</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Cake className="w-3.5 h-3.5 text-amber-400" />
                <span>Next Birthday</span>
              </div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                {calculation.daysUntilNextBday === 0 ? 'Today! 🎉' : `${calculation.daysUntilNextBday} days`}
              </div>
              <span className="text-[11px] text-slate-500">Countdown</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
