import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Landmark, RotateCcw, AlertCircle } from 'lucide-react';

export const LoanCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number | string>(250000);
  const [interestRate, setInterestRate] = useState<number | string>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number | string>(5);
  const [termType, setTermType] = useState<'years' | 'months'>('years');

  const reset = () => {
    setLoanAmount(250000);
    setInterestRate(6.5);
    setLoanTermYears(5);
    setTermType('years');
  };

  const calculation = useMemo(() => {
    const P = Number(loanAmount);
    const annualRate = Number(interestRate);
    const termVal = Number(loanTermYears);

    if (isNaN(P) || isNaN(annualRate) || isNaN(termVal)) {
      return { error: 'Please enter valid loan terms' };
    }
    if (P <= 0) return { error: 'Loan principal must be greater than 0' };
    if (annualRate < 0) return { error: 'Interest rate cannot be negative' };
    if (termVal <= 0) return { error: 'Loan term must be greater than 0' };

    const totalMonths = termType === 'years' ? termVal * 12 : termVal;
    const monthlyRate = annualRate / 100 / 12;

    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = P / totalMonths;
    } else {
      monthlyPayment =
        (P * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalRepayment = monthlyPayment * totalMonths;
    const totalInterest = totalRepayment - P;
    const principalPct = Math.round((P / totalRepayment) * 100);
    const interestPct = 100 - principalPct;

    return {
      error: null,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalRepayment: Math.round(totalRepayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalMonths,
      principalPct,
      interestPct,
    };
  }, [loanAmount, interestRate, loanTermYears, termType]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Loan & Amortization Calculator</h3>
              <p className="text-xs text-slate-400">Calculate monthly repayment, total interest, and financing breakdown</p>
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
              Loan Principal Amount
            </label>
            <input
              type="number"
              min="1"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Annual Interest Rate (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
              />
              <span className="text-slate-400 font-mono text-sm">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Loan Term
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
              />
              <select
                value={termType}
                onChange={(e) => setTermType(e.target.value as any)}
                className="bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#142323] border border-emerald-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium">Monthly Repayment</span>
                <CopyButton textToCopy={calculation.monthlyPayment.toFixed(2)} variant="icon" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                  {calculation.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-xs text-slate-400">For {calculation.totalMonths} total payments</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Interest Paid</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-rose-400 tracking-tight">
                  {calculation.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-xs text-slate-500">Cost of borrowing</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Loan Repayment</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                  {calculation.totalRepayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-xs text-slate-500">Principal + Total Interest</div>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Principal: <strong className="text-emerald-400">{calculation.principalPct}%</strong></span>
              <span>Interest: <strong className="text-rose-400">{calculation.interestPct}%</strong></span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${calculation.principalPct}%` }}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${calculation.interestPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
