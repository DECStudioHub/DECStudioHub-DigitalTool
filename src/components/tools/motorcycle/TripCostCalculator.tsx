import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Navigation, RotateCcw, AlertCircle } from 'lucide-react';

export const TripCostCalculator: React.FC = () => {
  const [oneWayKm, setOneWayKm] = useState<number | string>(85);
  const [fuelEconomy, setFuelEconomy] = useState<number | string>(38);
  const [fuelPrice, setFuelPrice] = useState<number | string>(65);
  const [tolls, setTolls] = useState<number | string>(120);
  const [foodAndDrinks, setFoodAndDrinks] = useState<number | string>(350);
  const [parkingAndMisc, setParkingAndMisc] = useState<number | string>(50);

  const reset = () => {
    setOneWayKm(85);
    setFuelEconomy(38);
    setFuelPrice(65);
    setTolls(120);
    setFoodAndDrinks(350);
    setParkingAndMisc(50);
  };

  const calculation = useMemo(() => {
    const oneWay = Number(oneWayKm);
    const kml = Number(fuelEconomy);
    const gasPrice = Number(fuelPrice);
    const tollCost = Number(tolls) || 0;
    const foodCost = Number(foodAndDrinks) || 0;
    const miscCost = Number(parkingAndMisc) || 0;

    if (isNaN(oneWay) || isNaN(kml) || isNaN(gasPrice)) {
      return { error: 'Please enter valid numbers for distance, fuel economy, and fuel price' };
    }
    if (oneWay <= 0) return { error: 'One-way distance must be greater than 0' };
    if (kml <= 0) return { error: 'Fuel economy must be greater than 0 km/L' };

    const roundTripKm = oneWay * 2;
    const fuelLiters = roundTripKm / kml;
    const fuelCost = fuelLiters * gasPrice;
    const otherExpenses = tollCost + foodCost + miscCost;
    const totalTripCost = fuelCost + otherExpenses;
    const costPerKm = roundTripKm > 0 ? totalTripCost / roundTripKm : 0;

    return {
      error: null,
      roundTripKm,
      fuelLiters: Math.round(fuelLiters * 100) / 100,
      fuelCost: Math.round(fuelCost * 100) / 100,
      otherExpenses: Math.round(otherExpenses * 100) / 100,
      totalTripCost: Math.round(totalTripCost * 100) / 100,
      costPerKm: Math.round(costPerKm * 100) / 100,
    };
  }, [oneWayKm, fuelEconomy, fuelPrice, tolls, foodAndDrinks, parkingAndMisc]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Motorcycle Trip Cost Planner</h3>
              <p className="text-xs text-slate-400">Calculate full round-trip travel budget factoring in fuel, tolls, meals, and parking</p>
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
              One-Way Distance (km)
            </label>
            <input
              type="number"
              min="1"
              value={oneWayKm}
              onChange={(e) => setOneWayKm(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Fuel Economy (km/L)
            </label>
            <input
              type="number"
              min="1"
              value={fuelEconomy}
              onChange={(e) => setFuelEconomy(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Fuel Price per Liter
            </label>
            <input
              type="number"
              min="0"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Other Trip Expenses */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2.5">
            Additional Ride Expenses
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Expressway / Toll Fees</label>
              <input
                type="number"
                min="0"
                value={tolls}
                onChange={(e) => setTolls(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Food & Coffee Budget</label>
              <input
                type="number"
                min="0"
                value={foodAndDrinks}
                onChange={(e) => setFoodAndDrinks(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Parking & Misc</label>
              <input
                type="number"
                min="0"
                value={parkingAndMisc}
                onChange={(e) => setParkingAndMisc(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#2b2210] border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-medium">Total Round-Trip Cost</span>
              <CopyButton textToCopy={calculation.totalTripCost.toFixed(2)} variant="icon" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-mono font-bold text-amber-400 tracking-tight">
                {calculation.totalTripCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-400">Total budget for {calculation.roundTripKm} km round trip</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Fuel Required & Cost</span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-emerald-400 tracking-tight">
                {calculation.fuelLiters} L
              </span>
              <div className="text-xs text-slate-400 mt-1">
                Fuel cost: <strong>{calculation.fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>
            <div className="text-xs text-slate-500">Based on {fuelEconomy} km/L</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Other Trip Expenses</span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-cyan-400 tracking-tight">
                {calculation.otherExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="text-xs text-slate-400 mt-1">
                Cost per km: <strong>{calculation.costPerKm.toFixed(2)}/km</strong>
              </div>
            </div>
            <div className="text-xs text-slate-500">Tolls + Meals + Parking</div>
          </div>
        </div>
      )}
    </div>
  );
};
