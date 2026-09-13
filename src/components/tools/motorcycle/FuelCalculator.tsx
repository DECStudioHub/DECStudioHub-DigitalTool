import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Fuel, RotateCcw, AlertCircle } from 'lucide-react';

export const FuelCalculator: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number | string>(120);
  const [fuelEconomyKmL, setFuelEconomyKmL] = useState<number | string>(42);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number | string>(65);

  const reset = () => {
    setDistanceKm(120);
    setFuelEconomyKmL(42);
    setFuelPricePerLiter(65);
  };

  const calculation = useMemo(() => {
    const dist = Number(distanceKm);
    const kml = Number(fuelEconomyKmL);
    const price = Number(fuelPricePerLiter);

    if (isNaN(dist) || isNaN(kml) || isNaN(price)) {
      return { error: 'Please enter valid numerical inputs' };
    }
    if (dist <= 0) return { error: 'Distance must be greater than 0 km' };
    if (kml <= 0) return { error: 'Fuel economy (km/L) must be greater than 0' };
    if (price < 0) return { error: 'Fuel price cannot be negative' };

    const fuelRequiredLiters = dist / kml;
    const totalFuelCost = fuelRequiredLiters * price;
    const costPerKm = dist > 0 ? totalFuelCost / dist : 0;

    return {
      error: null,
      fuelRequiredLiters: Math.round(fuelRequiredLiters * 100) / 100,
      totalFuelCost: Math.round(totalFuelCost * 100) / 100,
      costPerKm: Math.round(costPerKm * 100) / 100,
    };
  }, [distanceKm, fuelEconomyKmL, fuelPricePerLiter]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Motorcycle Fuel & Expense Calculator</h3>
              <p className="text-xs text-slate-400">Calculate fuel volume needed, total gas expense, and cost-per-km efficiency</p>
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
              Trip Distance (km)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
              />
              <span className="text-slate-400 font-mono text-xs">km</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Motorcycle Economy (km/L)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="1"
                value={fuelEconomyKmL}
                onChange={(e) => setFuelEconomyKmL(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
              />
              <span className="text-slate-400 font-mono text-xs">km/L</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Fuel Price per Liter
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.25"
                min="0"
                value={fuelPricePerLiter}
                onChange={(e) => setFuelPricePerLiter(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
              />
              <span className="text-slate-400 font-mono text-xs">/L</span>
            </div>
          </div>
        </div>

        {/* Quick motorcycle presets */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px]">Bike Category Presets:</span>
          <button
            onClick={() => setFuelEconomyKmL(50)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            Underbone / 110-125cc (~50 km/L)
          </button>
          <button
            onClick={() => setFuelEconomyKmL(40)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            Scooter / 150-160cc (~40 km/L)
          </button>
          <button
            onClick={() => setFuelEconomyKmL(24)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            Big Bike / 400cc+ (~24 km/L)
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
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#251e12] border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-medium">Estimated Fuel Cost</span>
              <CopyButton textToCopy={calculation.totalFuelCost.toFixed(2)} variant="icon" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-amber-400 tracking-tight">
                {calculation.totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-400">Total expense for {distanceKm} km</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Fuel Volume Required</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                {calculation.fuelRequiredLiters}
              </span>
              <span className="text-sm font-mono text-slate-400 ml-1.5">Liters</span>
            </div>
            <div className="text-xs text-slate-500">Gas needed in tank</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Cost per Kilometer</span>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                {calculation.costPerKm.toFixed(2)}
              </span>
              <span className="text-sm font-mono text-slate-400 ml-1.5">/km</span>
            </div>
            <div className="text-xs text-slate-500">Riding cost efficiency rate</div>
          </div>
        </div>
      )}
    </div>
  );
};
