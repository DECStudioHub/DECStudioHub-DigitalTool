import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { DisclaimerBox } from '../../common/DisclaimerBox';
import { Sun, RotateCcw, AlertCircle } from 'lucide-react';

export const SolarPanelCalculator: React.FC = () => {
  const [dailyWh, setDailyWh] = useState<number | string>(4500);
  const [peakSunHours, setPeakSunHours] = useState<number | string>(4.5);
  const [lossFactorPct, setLossFactorPct] = useState<number | string>(30); // 30% system loss (inverter, wiring, soiling, temp)
  const [panelWattageChoice, setPanelWattageChoice] = useState<number>(450);

  const reset = () => {
    setDailyWh(4500);
    setPeakSunHours(4.5);
    setLossFactorPct(30);
    setPanelWattageChoice(450);
  };

  const calculation = useMemo(() => {
    const wh = Number(dailyWh);
    const sunHours = Number(peakSunHours);
    const lossPct = Number(lossFactorPct);

    if (isNaN(wh) || isNaN(sunHours) || isNaN(lossPct)) {
      return { error: 'Please enter valid numerical parameters' };
    }
    if (wh <= 0) return { error: 'Daily energy consumption must be greater than 0 Wh' };
    if (sunHours <= 0 || sunHours > 12) return { error: 'Peak sun hours must be between 0.5 and 12 hours' };
    if (lossPct < 0 || lossPct > 60) return { error: 'System loss percentage must be between 0% and 60%' };

    // Total generation needed per day considering derating
    const systemLossMultiplier = 1 + lossPct / 100;
    const grossWhNeeded = wh * systemLossMultiplier;

    // Required array wattage in Watts-peak (Wp)
    const requiredWp = grossWhNeeded / sunHours;
    const systemKw = requiredWp / 1000;
    const panelCount = Math.ceil(requiredWp / panelWattageChoice);
    const actualArrayWattage = panelCount * panelWattageChoice;

    return {
      error: null,
      requiredWp: Math.round(requiredWp),
      systemKw: Math.round(systemKw * 100) / 100,
      panelCount,
      panelWattageChoice,
      actualArrayWattage,
      dailyWh: wh,
      grossWhNeeded: Math.round(grossWhNeeded),
    };
  }, [dailyWh, peakSunHours, lossFactorPct, panelWattageChoice]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Solar PV Array Sizing Calculator</h3>
              <p className="text-xs text-slate-400">Calculate required solar panel wattage, kW system capacity, and module counts</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Daily Consumption (Wh/day)
            </label>
            <input
              type="number"
              min="100"
              value={dailyWh}
              onChange={(e) => setDailyWh(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">e.g. 4500 Wh = 4.5 kWh/day</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Local Peak Sun Hours (PSH)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={peakSunHours}
              onChange={(e) => setPeakSunHours(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">Equatorial/SE Asia average: 4.5–5.0 hrs</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              System Losses / Derating (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={lossFactorPct}
              onChange={(e) => setLossFactorPct(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">Inverter, heat, cable & dust (typ. 25-30%)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Individual Panel Rating
            </label>
            <select
              value={panelWattageChoice}
              onChange={(e) => setPanelWattageChoice(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            >
              <option value="100">100W Monocrystalline</option>
              <option value="200">200W Monocrystalline</option>
              <option value="350">350W Tier-1 Panel</option>
              <option value="450">450W Half-Cell Panel</option>
              <option value="550">550W High-Efficiency Panel</option>
              <option value="600">600W Commercial Bifacial</option>
            </select>
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
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#262211] border border-yellow-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-400 font-medium">Required Solar Array Power</span>
                <CopyButton textToCopy={`${calculation.requiredWp} Wp`} variant="icon" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-yellow-400 tracking-tight">
                  {calculation.requiredWp.toLocaleString()}
                </span>
                <span className="text-sm font-mono text-yellow-300 ml-1.5">Wp</span>
              </div>
              <div className="text-xs text-slate-400">Minimum PV array wattage</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Recommended System Size</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                  {calculation.systemKw}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">kW</span>
              </div>
              <div className="text-xs text-slate-500">Gross DC system rating</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Suggested Panel Count</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                  {calculation.panelCount}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">× {calculation.panelWattageChoice}W</span>
              </div>
              <div className="text-xs text-slate-500">Total Array: {calculation.actualArrayWattage}W</div>
            </div>
          </div>

          <DisclaimerBox
            title="Solar Engineering Disclaimer"
            text="Solar photovoltaic system sizing requires precise geographical solar irradiance data, shading analysis, seasonal azimuth/tilt optimization, and local building/electrical code compliance. Consult a licensed solar EPC contractor or certified electrician before procuring equipment or installing mounting structures."
          />
        </div>
      )}
    </div>
  );
};
