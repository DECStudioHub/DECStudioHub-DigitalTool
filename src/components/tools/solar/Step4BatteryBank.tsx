import React from 'react';
import { Battery, BatteryCharging, Info, Check, ShieldAlert } from 'lucide-react';
import { SolarHelpTooltip } from './SolarHelpTooltip';

interface Step4Props {
  batteryType: 'lithium' | 'lead_acid';
  onUpdateType: (type: 'lithium' | 'lead_acid') => void;
  systemVoltage: number; // 12, 24, 36, 48
  onUpdateVoltage: (v: number) => void;
  backupHours: number;
  onUpdateBackupHours: (h: number) => void;
  batteryUnitAh: number;
  onUpdateUnitAh: (ah: number) => void;
  adjustedDailyWh: number;
  totalContinuousWatts: number;
}

export const Step4BatteryBank: React.FC<Step4Props> = ({
  batteryType,
  onUpdateType,
  systemVoltage,
  onUpdateVoltage,
  backupHours,
  onUpdateBackupHours,
  batteryUnitAh,
  onUpdateUnitAh,
  adjustedDailyWh,
  totalContinuousWatts,
}) => {
  const dod = batteryType === 'lithium' ? 0.85 : 0.5;
  const efficiency = batteryType === 'lithium' ? 0.95 : 0.85;

  // Energy needed during backup period (proportional to daily hours or running continuous watts)
  const hoursFraction = Math.min(24, Math.max(1, backupHours)) / 24;
  const energyDuringBackupWh = Math.round(adjustedDailyWh * hoursFraction);

  // Required Wh accounting for DOD and battery efficiency
  const requiredBatteryWh = Math.round(energyDuringBackupWh / (dod * efficiency));
  const requiredBatteryAh = Math.round((requiredBatteryWh / systemVoltage) * 10) / 10;

  // Standard recommendations for bank
  const standardAhOptions = [50, 100, 150, 200, 280, 300, 400];
  const recommendedBankAh =
    standardAhOptions.find((opt) => opt >= requiredBatteryAh) ||
    Math.ceil(requiredBatteryAh / 100) * 100;

  // Battery counts
  // Standard unit battery nominal voltage: 12V for lead acid or modular lithium, or 48V server rack
  const unitVoltage = systemVoltage === 48 && batteryType === 'lithium' && batteryUnitAh >= 100 ? 48 : 12;
  const seriesCount = Math.max(1, Math.round(systemVoltage / unitVoltage));
  const parallelCount = Math.max(1, Math.ceil(recommendedBankAh / batteryUnitAh));
  const totalBatteries = seriesCount * parallelCount;

  const totalInstalledCapacityWh = Math.round(recommendedBankAh * systemVoltage);
  const usableCapacityWh = Math.round(totalInstalledCapacityWh * dod);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-emerald-900/30 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
            <Battery className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Step 4 — Battery Bank Sizing</span>
              <SolarHelpTooltip term="Ah" />
              <SolarHelpTooltip term="DOD" />
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculate the required battery storage in Amp-hours (Ah) and Watt-hours (Wh) for night
              usage and power outages based on your backup hours and depth of discharge limit.
            </p>
          </div>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Battery Chemistry */}
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Battery Chemistry</span>
            <SolarHelpTooltip term="DOD" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdateType('lithium')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                batteryType === 'lithium'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Lithium (LiFePO4)</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">85% DOD</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateType('lead_acid')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                batteryType === 'lead_acid'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Lead-Acid (AGM/Gel)</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">50% DOD</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            {batteryType === 'lithium'
              ? '✓ 4000+ cycles, 95% efficiency, lightweight, safe for daily deep cycling.'
              : '⚠ 500–800 cycles, heavy, must never be discharged below 50% to prevent damage.'}
          </p>
        </div>

        {/* System Voltage */}
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <label className="text-xs font-bold text-slate-300 block">System Voltage (DC)</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[12, 24, 36, 48].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onUpdateVoltage(v)}
                className={`py-2 rounded-xl border text-xs font-bold font-mono transition ${
                  systemVoltage === v
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {v}V
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            {systemVoltage === 12 && 'Best for tiny setups (<1,000W). High cable current.'}
            {systemVoltage === 24 && 'Recommended for small-medium homes (1,000W - 3,000W).'}
            {systemVoltage === 36 && 'Used in specialized setups.'}
            {systemVoltage === 48 && 'Industry standard for modern solar homes (3,000W - 10kW+).'}
          </p>
        </div>

        {/* Backup Hours */}
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">Backup Duration</label>
            <span className="text-xs font-mono font-bold text-amber-400">{backupHours} Hours</span>
          </div>
          <input
            type="range"
            min="2"
            max="24"
            step="1"
            value={backupHours}
            onChange={(e) => onUpdateBackupHours(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>4h (Evening)</span>
            <span>12h (Overnight)</span>
            <span>24h (Full Day)</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1">
            Energy required during backup:{' '}
            <strong className="text-white">{energyDuringBackupWh.toLocaleString()} Wh</strong>
          </p>
        </div>

        {/* Unit Battery Size */}
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Unit Battery Size (Ah)</label>
          <select
            value={batteryUnitAh}
            onChange={(e) => onUpdateUnitAh(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
          >
            <option value={100}>100 Ah (Standard Modular)</option>
            <option value={150}>150 Ah</option>
            <option value={200}>200 Ah (High Capacity)</option>
            <option value={280}>280 Ah (Grade-A Prismatic)</option>
            <option value={300}>300 Ah</option>
          </select>
          <p className="text-[10px] text-slate-400">
            Select the Ah capacity of each individual battery unit you plan to buy.
          </p>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-[#0b1322] border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              RECOMMENDED BATTERY BANK SPECIFICATION
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {systemVoltage}V {recommendedBankAh} Ah{' '}
              <span className="text-emerald-400 text-lg sm:text-xl font-bold">
                ({batteryType === 'lithium' ? 'LiFePO4 Lithium' : 'Lead-Acid / Gel'})
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Installed Energy Storage
            </span>
            <div className="text-xl font-extrabold text-emerald-400 font-mono">
              {(totalInstalledCapacityWh / 1000).toFixed(2)} kWh
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Usable: {(usableCapacityWh / 1000).toFixed(2)} kWh @ {Math.round(dod * 100)}% DOD
            </span>
          </div>
        </div>

        {/* Configuration Diagram / Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 block text-[10px]">Calculated Requirement</span>
            <div className="text-white font-mono font-bold">
              {requiredBatteryWh.toLocaleString()} Wh ({requiredBatteryAh} Ah)
            </div>
            <span className="text-slate-400 text-[10px]">
              Includes {Math.round((1 - dod) * 100)}% DOD reserve limit
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 block text-[10px]">Series × Parallel Layout</span>
            <div className="text-amber-400 font-mono font-bold">
              {seriesCount} in Series × {parallelCount} in Parallel
            </div>
            <span className="text-slate-400 text-[10px]">
              {seriesCount * 12}V string voltage • {parallelCount * batteryUnitAh}Ah total
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 block text-[10px]">Total Physical Battery Units</span>
            <div className="text-emerald-400 font-mono font-bold">
              {totalBatteries} × {unitVoltage}V {batteryUnitAh}Ah Units
            </div>
            <span className="text-slate-400 text-[10px]">
              Wiring: Connect {seriesCount} in series, then parallel {parallelCount} string(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
