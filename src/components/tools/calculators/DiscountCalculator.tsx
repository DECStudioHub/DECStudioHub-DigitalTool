import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Tag, RotateCcw, AlertCircle } from 'lucide-react';

export const DiscountCalculator: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState<number | string>(1500);
  const [discountPercent, setDiscountPercent] = useState<number | string>(20);
  const [extraCoupon, setExtraCoupon] = useState<number | string>(0);

  const reset = () => {
    setOriginalPrice(1500);
    setDiscountPercent(20);
    setExtraCoupon(0);
  };

  const calculation = useMemo(() => {
    const price = Number(originalPrice);
    const disc = Number(discountPercent);
    const coupon = Number(extraCoupon);

    if (isNaN(price) || isNaN(disc) || isNaN(coupon)) {
      return { error: 'Please enter valid numbers' };
    }
    if (price < 0) return { error: 'Original price cannot be negative' };
    if (disc < 0 || disc > 100) return { error: 'Discount percent must be between 0% and 100%' };
    if (coupon < 0) return { error: 'Extra discount cannot be negative' };

    const discountAmount = price * (disc / 100);
    const intermediatePrice = price - discountAmount;
    const finalPrice = Math.max(0, intermediatePrice - coupon);
    const totalSavings = price - finalPrice;
    const effectiveDiscountPct = price > 0 ? (totalSavings / price) * 100 : 0;

    return {
      error: null,
      originalPrice: price,
      discountAmount: Math.round(discountAmount * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      effectiveDiscountPct: Math.round(effectiveDiscountPct * 10) / 10,
    };
  }, [originalPrice, discountPercent, extraCoupon]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Discount & Sale Price Calculator</h3>
              <p className="text-xs text-slate-400">Calculate net checkout price and total money saved with stacked discounts</p>
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
              Original Retail Price
            </label>
            <input
              type="number"
              min="0"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Discount Percentage (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
              />
              <span className="text-slate-400 font-mono text-sm">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Additional Flat Coupon / Voucher
            </label>
            <input
              type="number"
              min="0"
              value={extraCoupon}
              onChange={(e) => setExtraCoupon(e.target.value)}
              placeholder="0"
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Quick discount presets */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 mr-1">Popular Discounts:</span>
          {[5, 10, 15, 20, 25, 30, 40, 50, 70].map((pct) => (
            <button
              key={pct}
              onClick={() => setDiscountPercent(pct)}
              className={`text-[11px] px-2 py-0.5 rounded font-mono border transition ${
                Number(discountPercent) === pct
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {pct}% OFF
            </button>
          ))}
        </div>
      </div>

      {calculation.error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{calculation.error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#13271f] border border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-medium">Final Sale Price</span>
              <CopyButton textToCopy={calculation.finalPrice.toFixed(2)} variant="icon" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                {calculation.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-400">Amount to pay at checkout</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Money Saved</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                {calculation.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Effective savings of {calculation.effectiveDiscountPct}%
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Original Retail Price</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-slate-400 line-through tracking-tight">
                {calculation.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-500">Base list price before promotion</div>
          </div>
        </div>
      )}
    </div>
  );
};
