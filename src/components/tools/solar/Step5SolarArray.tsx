import React from 'react';
import { Sun, Sparkles, AlertTriangle, HelpCircle } from 'lucide-react';
import { SolarHelpTooltip } from './SolarHelpTooltip';

interface Step5Props {
  peakSunHours: number;
  onUpdatePeakSunHours: (val: number) => void;
  panelPmax: number;
  onUpdatePanelPmax: (val: number) => void;
  panelVoc: number;
  onUpdatePanelVoc: (val: number) => void;
  panelVmp: number;
  onUpdatePanelVmp: (val: number) => void;
  panelIsc: number;
  onUpdatePanelIsc: (val: number) => void;
  panelImp: number;
  onUpdatePanelImp: (val: number) => void;
  panelMaxSystemVoltage: number;
  onUpdateMaxSystemVoltage: (val: number) => void;
  panelMaxSeriesFuse: number;
  onUpdateMaxSeriesFuse: (val: number) => void;
  panelModuleApplication: string;
  onUpdateModuleApplication: (val: string) => void;
  adjustedDailyWh: number;
}

export const Step5SolarArray: React.FC<Step5Props> = ({
  peakSunHours,
  onUpdatePeakSunHours,
  panelPmax,
  onUpdatePanelPmax,
  panelVoc,
  onUpdatePanelVoc,
  panelVmp,
  onUpdatePanelVmp,
  panelIsc,
  onUpdatePanelIsc,
  panelImp,
  onUpdatePanelImp,
  panelMaxSystemVoltage,
  onUpdateMaxSystemVoltage,
  panelMaxSeriesFuse,
  onUpdateMaxSeriesFuse,
  panelModuleApplication,
  onUpdateModuleApplication,
  adjustedDailyWh,
}) => {
  // Required PV wattage to replenish daily energy
  const requiredSolarWatts = Math.round(adjustedDailyWh / Math.max(1, peakSunHours));
  const exactPanels = requiredSolarWatts / Math.max(50, panelPmax);
  const numberOfPanels = Math.max(1, Math.ceil(exactPanels));
  const totalArrayWattage = numberOfPanels * panelPmax;
  const estimatedDailySolarGenerationWh = Math.round(totalArrayWattage * peakSunHours * 0.85);

  // Common preset panel specs
  const handlePresetSelect = (presetWatts: number) => {
    onUpdatePanelPmax(presetWatts);
    if (presetWatts === 550) {
      onUpdatePanelVoc(49.8);
      onUpdatePanelVmp(41.95);
      onUpdatePanelIsc(14.0);
      onUpdatePanelImp(13.12);
      onUpdateMaxSeriesFuse(25);
    } else if (presetWatts === 450) {
      onUpdatePanelVoc(41.5);
      onUpdatePanelVmp(34.8);
      onUpdatePanelIsc(13.85);
      onUpdatePanelImp(12.94);
      onUpdateMaxSeriesFuse(25);
    } else if (presetWatts === 400) {
      onUpdatePanelVoc(37.2);
      onUpdatePanelVmp(31.2);
      onUpdatePanelIsc(13.6);
      onUpdatePanelImp(12.82);
      onUpdateMaxSeriesFuse(20);
    } else if (presetWatts === 200) {
      onUpdatePanelVoc(24.3);
      onUpdatePanelVmp(20.4);
      onUpdatePanelIsc(10.2);
      onUpdatePanelImp(9.8);
      onUpdateMaxSeriesFuse(15);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mt-0.5">
            <Sun className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Step 5 — Solar Panel Array Sizing</span>
              <SolarHelpTooltip term="PMAX" />
              <SolarHelpTooltip term="VOC" />
              <SolarHelpTooltip term="VMP" />
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculate total photovoltaic capacity needed to replenish the adjusted daily energy
              within the peak sun hours available in your geographic region. Enter technical data
              from your solar panel sticker or choose a standard rating.
            </p>
          </div>
        </div>
      </div>

      {/* Inputs: Sun hours & quick presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">Peak Sun Hours (PSH)</label>
            <span className="text-xs font-mono font-bold text-amber-400">{peakSunHours} Hours/Day</span>
          </div>
          <input
            type="range"
            min="3.0"
            max="6.5"
            step="0.1"
            value={peakSunHours}
            onChange={(e) => onUpdatePeakSunHours(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>3.5h (Cloudy / Rainy)</span>
            <span>4.5h (Tropical Avg)</span>
            <span>5.5h+ (High Solar Irradiance)</span>
          </div>
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Quick Panel Size Presets</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[200, 400, 450, 550].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => handlePresetSelect(w)}
                className={`py-2 px-1 rounded-xl border text-xs font-bold font-mono transition ${
                  panelPmax === w
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {w}W
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            Clicking a preset automatically auto-fills standard Voc, Vmp, Isc, and Imp values.
          </p>
        </div>
      </div>

      {/* Solar Panel Technical Specifications Form */}
      <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Solar Panel Technical Specification Sticker Data
            </h4>
            <p className="text-[11px] text-slate-400">
              Click the help icon next to each label for an exact plain-language definition
            </p>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            STC: 1000W/m², 25°C
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center">
              <span>Pmax (Rated Power)</span>
              <SolarHelpTooltip term="PMAX" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={panelPmax}
                onChange={(e) => onUpdatePanelPmax(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">W</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center">
              <span>Voc (Open-Circuit V)</span>
              <SolarHelpTooltip term="VOC" />
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={panelVoc}
                onChange={(e) => onUpdatePanelVoc(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">V</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center">
              <span>Vmp (Max Power V)</span>
              <SolarHelpTooltip term="VMP" />
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={panelVmp}
                onChange={(e) => onUpdatePanelVmp(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">V</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center">
              <span>Isc (Short-Circuit I)</span>
              <SolarHelpTooltip term="ISC" />
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={panelIsc}
                onChange={(e) => onUpdatePanelIsc(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">A</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center">
              <span>Imp (Max Power I)</span>
              <SolarHelpTooltip term="IMP" />
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={panelImp}
                onChange={(e) => onUpdatePanelImp(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">A</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Max System Voltage
            </label>
            <div className="relative">
              <input
                type="number"
                value={panelMaxSystemVoltage}
                onChange={(e) => onUpdateMaxSystemVoltage(parseFloat(e.target.value) || 1000)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">V</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Max Series Fuse Rating
            </label>
            <div className="relative">
              <input
                type="number"
                value={panelMaxSeriesFuse}
                onChange={(e) => onUpdateMaxSeriesFuse(parseFloat(e.target.value) || 25)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">A</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Module Application
            </label>
            <input
              type="text"
              value={panelModuleApplication}
              onChange={(e) => onUpdateModuleApplication(e.target.value)}
              placeholder="Class A / Rooftop"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Sizing Results Card */}
      <div className="bg-[#0b1322] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              RECOMMENDED SOLAR ARRAY CONFIGURATION
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {numberOfPanels} × {panelPmax}W Panels{' '}
              <span className="text-amber-400 text-lg sm:text-xl font-bold">
                ({(totalArrayWattage / 1000).toFixed(2)} kWp Total)
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Est. Daily Energy Yield
            </span>
            <div className="text-xl font-extrabold text-amber-400 font-mono">
              {(estimatedDailySolarGenerationWh / 1000).toFixed(2)} kWh/day
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">
              Surplus Buffer: +{Math.round(totalArrayWattage - requiredSolarWatts)} Watts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Required Solar Watts</span>
            <div className="text-white font-mono font-bold">{requiredSolarWatts} W</div>
            <span className="text-[10px] text-slate-400">
              {adjustedDailyWh.toLocaleString()} Wh ÷ {peakSunHours}h
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Calculated Panel Count</span>
            <div className="text-amber-400 font-mono font-bold">
              {exactPanels.toFixed(2)} → {numberOfPanels} panels
            </div>
            <span className="text-[10px] text-slate-400">Rounded up for reliability</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Array Pmax</span>
            <div className="text-emerald-400 font-mono font-bold">{totalArrayWattage} Watts</div>
            <span className="text-[10px] text-slate-400">Standard Test Conditions</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Est. Daily kWh Output</span>
            <div className="text-white font-mono font-bold">
              {(estimatedDailySolarGenerationWh / 1000).toFixed(2)} kWh
            </div>
            <span className="text-[10px] text-slate-400">@ {peakSunHours} Peak Sun Hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};
