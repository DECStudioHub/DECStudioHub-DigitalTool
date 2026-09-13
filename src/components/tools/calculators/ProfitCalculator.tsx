import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { TrendingUp, RotateCcw, AlertCircle } from 'lucide-react';

export const ProfitCalculator: React.FC = () => {
  const [costPrice, setCostPrice] = useState<number | string>(800);
  const [sellingPrice, setSellingPrice] = useState<number | string>(1200);

  const reset = () => {
    setCostPrice(800);
    setSellingPrice(1200);
  };

  const calculation = useMemo(() => {
    const cost = Number(costPrice);
    const sell = Number(sellingPrice);

    if (isNaN(cost) || isNaN(sell)) {
      return { error: 'Please enter valid numbers for cost and selling price' };
    }
    if (cost < 0 || sell < 0) {
      return { error: 'Prices cannot be negative' };
    }

    const profit = sell - cost;
    const isProfit = profit >= 0;
    const marginPct = sell > 0 ? (profit / sell) * 100 : 0;
    const markupPct = cost > 0 ? (profit / cost) * 100 : 0;

    return {
      error: null,
      profit: Math.round(profit * 100) / 100,
      isProfit,
      marginPct: Math.round(marginPct * 10) / 10,
      markupPct: Math.round(markupPct * 10) / 10,
    };
  }, [costPrice, sellingPrice]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Profit, Margin & Markup Calculator</h3>
              <p className="text-xs text-slate-400">Analyze gross profit margin % and markup % on wholesale cost</p>
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
              Unit Cost Price (COGS)
            </label>
            <input
              type="number"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
            />
            <span className="text-[11px] text-slate-500">Acquisition / manufacturing cost</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Selling Price (Revenue)
            </label>
            <input
              type="number"
              min="0"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
            />
            <span className="text-[11px] text-slate-500">Retail price charged to customer</span>
          </div>
        </div>
      </div>

      {calculation.error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{calculation.error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between ${
              calculation.isProfit
                ? 'bg-gradient-to-br from-[#111827] to-[#12281b] border-emerald-500/30'
                : 'bg-gradient-to-br from-[#111827] to-[#281212] border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-medium ${
                  calculation.isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {calculation.isProfit ? 'Gross Profit' : 'Net Loss'}
              </span>
              <CopyButton textToCopy={calculation.profit.toFixed(2)} variant="icon" />
            </div>
            <div className="my-2">
              <span
                className={`text-3xl font-mono font-bold tracking-tight ${
                  calculation.isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {calculation.isProfit ? '+' : ''}
                {calculation.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Selling Price − Cost Price
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Profit Margin</span>
            <div className="my-2">
              <span
                className={`text-3xl font-mono font-bold tracking-tight ${
                  calculation.marginPct >= 0 ? 'text-cyan-400' : 'text-rose-400'
                }`}
              >
                {calculation.marginPct}%
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Profit as percentage of Selling Price
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Cost Markup</span>
            <div className="my-2">
              <span
                className={`text-3xl font-mono font-bold tracking-tight ${
                  calculation.markupPct >= 0 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {calculation.markupPct}%
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Profit as percentage of Cost Price
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
