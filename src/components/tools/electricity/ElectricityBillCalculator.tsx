import React, { useState } from 'react';
import {
  Coins,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  Calendar,
  Check,
  Copy,
} from 'lucide-react';

export const ElectricityBillCalculator: React.FC = () => {
  const [kwh, setKwh] = useState<number>(250);
  const [rate, setRate] = useState<number>(12.0);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'daily' | 'annual'>('monthly');
  const [currencySymbol, setCurrencySymbol] = useState<string>('₱');
  const [copied, setCopied] = useState<boolean>(false);

  const handleReset = () => {
    setKwh(250);
    setRate(12.0);
    setBillingPeriod('monthly');
  };

  // Base monthly calculations
  // If user inputs monthly kWh:
  const monthlyKwh = billingPeriod === 'monthly' ? kwh : billingPeriod === 'daily' ? kwh * 30 : kwh / 12;
  const dailyKwh = monthlyKwh / 30;
  const annualKwh = monthlyKwh * 12;

  const monthlyBill = monthlyKwh * rate;
  const dailyCost = dailyKwh * rate;
  const annualBill = annualKwh * rate;

  const copyBill = () => {
    const text = [
      'ELECTRICITY BILL ESTIMATE',
      '========================',
      `Monthly Consumption: ${monthlyKwh.toFixed(1)} kWh`,
      `Electricity Rate: ${currencySymbol}${rate.toFixed(2)} / kWh`,
      '------------------------',
      `ESTIMATED MONTHLY BILL: ${currencySymbol}${monthlyBill.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      `Daily Cost: ${currencySymbol}${dailyCost.toFixed(2)}`,
      `Annual Cost: ${currencySymbol}${annualBill.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      '========================',
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Electricity Bill Calculator</h1>
            <p className="text-xs text-slate-400">
              Simple and direct energy cost estimation: kWh consumed × utility tariff rate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyBill}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 hover:text-white text-xs flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
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

      {/* Main Calculator Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Billing Inputs
            </span>
            <div className="flex items-center gap-1.5">
              {['₱', '$', '€'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setCurrencySymbol(sym)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition ${
                    currencySymbol === sym
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Electricity Consumption
                </label>
                <div className="flex gap-1 text-[11px]">
                  {(['monthly', 'daily', 'annual'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setBillingPeriod(period)}
                      className={`px-2 py-0.5 rounded capitalize transition ${
                        billingPeriod === period
                          ? 'bg-slate-700 text-white font-medium'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={kwh}
                  onChange={(e) => setKwh(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#090d16] border border-slate-700 text-white font-mono text-xl focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-4 top-3.5 text-sm font-mono text-slate-400">
                  kWh / {billingPeriod}
                </span>
              </div>

              {/* Quick Consumption Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-500 py-1 mr-1">Presets:</span>
                {[100, 200, 250, 300, 500, 750].map((presetVal) => (
                  <button
                    key={presetVal}
                    type="button"
                    onClick={() => {
                      setKwh(presetVal);
                      setBillingPeriod('monthly');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono transition ${
                      kwh === presetVal && billingPeriod === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#090d16] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {presetVal} kWh
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Electricity Rate ({currencySymbol} per kWh)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-sm font-mono text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-20 py-3 rounded-2xl bg-[#090d16] border border-slate-700 text-white font-mono text-xl focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-4 top-3.5 text-sm font-mono text-slate-400">
                  / kWh
                </span>
              </div>

              {/* Quick Rate Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-500 py-1 mr-1">Typical Rates:</span>
                {[
                  { label: '₱9.50 (Provincial)', val: 9.5 },
                  { label: '₱11.50 (Meralco Lifeline)', val: 11.5 },
                  { label: '₱12.00 (Standard)', val: 12.0 },
                  { label: '₱14.50 (Commercial/Peak)', val: 14.5 },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setRate(r.val)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono transition ${
                      rate === r.val
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#090d16] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span className="font-mono">Formula: Estimated Bill = kWh × Rate</span>
            <span className="text-slate-300 font-mono">
              {monthlyKwh.toFixed(1)} kWh × {currencySymbol}{rate.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Big Result Card */}
        <div className="bg-gradient-to-b from-[#131b2e] to-[#0f1422] border border-blue-500/30 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400 border-b border-blue-500/20 pb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Estimated Bill</span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                Estimated Monthly Electricity Bill
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-1 text-emerald-400">
                {currencySymbol}
                {monthlyBill.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <span className="text-xs text-slate-400 block mt-1">
                Based on {monthlyKwh.toFixed(1)} kWh/month @ {currencySymbol}{rate.toFixed(2)}/kWh
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/50">
                <span className="text-slate-400">Daily Cost:</span>
                <span className="font-mono font-bold text-white">
                  {currencySymbol}
                  {dailyCost.toFixed(2)} / day
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/50">
                <span className="text-slate-400">Monthly Cost:</span>
                <span className="font-mono font-bold text-white">
                  {currencySymbol}
                  {monthlyBill.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-slate-400">Annual Cost:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {currencySymbol}
                  {annualBill.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} / yr
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800/60">
            Note: Actual electric utility bills may include universal charges, VAT, missionary electrification, and distribution wheeling charges.
          </div>
        </div>
      </div>
    </div>
  );
};
