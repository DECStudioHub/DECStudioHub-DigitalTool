import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Gauge, RotateCcw, AlertCircle } from 'lucide-react';

export const KmLCalculator: React.FC = () => {
  const [distanceTraveled, setDistanceTraveled] = useState<number | string>(185.4);
  const [fuelConsumed, setFuelConsumed] = useState<number | string>(4.2);

  const reset = () => {
    setDistanceTraveled(185.4);
    setFuelConsumed(4.2);
  };

  const calculation = useMemo(() => {
    const dist = Number(distanceTraveled);
    const fuel = Number(fuelConsumed);

    if (isNaN(dist) || isNaN(fuel)) {
      return { error: 'Please enter valid numbers for distance and fuel' };
    }
    if (dist <= 0) return { error: 'Distance traveled must be greater than 0 km' };
    if (fuel <= 0) return { error: 'Fuel consumed must be greater than 0 liters' };

    const kmPerLiter = dist / fuel;
    const litersPer100Km = (fuel / dist) * 100;
    const usMpg = kmPerLiter * 2.35215;

    let efficiencyRating = 'Moderate Efficiency';
    let ratingColor = 'text-cyan-400';
    if (kmPerLiter >= 45) {
      efficiencyRating = 'Exceptional Fuel Economy (Commuter Class)';
      ratingColor = 'text-emerald-400';
    } else if (kmPerLiter >= 32) {
      efficiencyRating = 'Good Fuel Economy (Standard / 150-250cc)';
      ratingColor = 'text-cyan-400';
    } else if (kmPerLiter >= 20) {
      efficiencyRating = 'Moderate Economy (Sport / Midweight 400-650cc)';
      ratingColor = 'text-amber-400';
    } else {
      efficiencyRating = 'High Consumption (Superbike / Performance)';
      ratingColor = 'text-rose-400';
    }

    return {
      error: null,
      kmPerLiter: Math.round(kmPerLiter * 100) / 100,
      litersPer100Km: Math.round(litersPer100Km * 100) / 100,
      usMpg: Math.round(usMpg * 10) / 10,
      efficiencyRating,
      ratingColor,
    };
  }, [distanceTraveled, fuelConsumed]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">km/L Fuel Economy Calculator</h3>
              <p className="text-xs text-slate-400">Measure actual gas mileage from odometer trip readings and pump receipt</p>
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
              Distance Traveled on Odometer (km)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={distanceTraveled}
              onChange={(e) => setDistanceTraveled(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
            />
            <span className="text-[11px] text-slate-500">Trip A / Trip B meter reading</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Fuel Consumed / Refilled (Liters)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.01"
              value={fuelConsumed}
              onChange={(e) => setFuelConsumed(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
            />
            <span className="text-[11px] text-slate-500">Liters shown on gas pump dispenser</span>
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
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#2b2210] border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-medium">Fuel Economy (km/L)</span>
                <CopyButton textToCopy={`${calculation.kmPerLiter} km/L`} variant="icon" />
              </div>
              <div className="my-2">
                <span className="text-4xl font-mono font-bold text-amber-400 tracking-tight">
                  {calculation.kmPerLiter}
                </span>
                <span className="text-sm font-mono text-amber-300 ml-1.5">km/L</span>
              </div>
              <div className="text-xs text-slate-400">Kilometers per single liter of fuel</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Metric Consumption (L/100km)</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                  {calculation.litersPer100Km}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">L/100km</span>
              </div>
              <div className="text-xs text-slate-500">International automotive consumption metric</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">US Gallon Equivalent (MPG)</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                  {calculation.usMpg}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">MPG</span>
              </div>
              <div className="text-xs text-slate-500">US Miles per Liquid Gallon</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">Efficiency Classification:</span>
            <span className={`font-semibold ${calculation.ratingColor}`}>
              {calculation.efficiencyRating}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
