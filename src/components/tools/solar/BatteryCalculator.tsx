import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { DisclaimerBox } from '../../common/DisclaimerBox';
import { BatteryCharging, RotateCcw, AlertCircle } from 'lucide-react';

export const BatteryCalculator: React.FC = () => {
  const [loadWatts, setLoadWatts] = useState<number | string>(350);
  const [backupHours, setBackupHours] = useState<number | string>(8);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(24);
  const [dodPercent, setDodPercent] = useState<number>(80); // 80% for LiFePO4
  const [efficiencyPercent, setEfficiencyPercent] = useState<number>(90); // 90% inverter + wiring efficiency

  const reset = () => {
    setLoadWatts(350);
    setBackupHours(8);
    setBatteryVoltage(24);
    setDodPercent(80);
    setEfficiencyPercent(90);
  };

  const calculation = useMemo(() => {
    const watts = Number(loadWatts);
    const hours = Number(backupHours);
    const volts = Number(batteryVoltage);
    const dod = Number(dodPercent) / 100;
    const eff = Number(efficiencyPercent) / 100;

    if (isNaN(watts) || isNaN(hours) || isNaN(volts) || isNaN(dod) || isNaN(eff)) {
      return { error: 'Please enter valid numbers' };
    }
    if (watts <= 0) return { error: 'Continuous load must be greater than 0 Watts' };
    if (hours <= 0) return { error: 'Backup duration must be greater than 0 hours' };
    if (dod <= 0 || dod > 1) return { error: 'Depth of Discharge must be between 10% and 100%' };
    if (eff <= 0 || eff > 1) return { error: 'System efficiency must be between 50% and 100%' };

    // Net energy consumed by appliances
    const netWhConsumed = watts * hours;
    // Gross energy needed in battery storage taking DoD and efficiency into account
    const grossWhStorage = netWhConsumed / (dod * eff);
    // Ah required = Wh / Volts
    const capacityAh = grossWhStorage / volts;

    // Recommended 100Ah 12V batteries in series/parallel
    const standard12v100AhWh = 12 * 100; // 1200Wh
    const num100AhBatteries = Math.ceil(grossWhStorage / standard12v100AhWh);

    return {
      error: null,
      netWhConsumed: Math.round(netWhConsumed),
      grossWhStorage: Math.round(grossWhStorage),
      grossKwhStorage: (grossWhStorage / 1000).toFixed(2),
      capacityAh: Math.round(capacityAh),
      batteryVoltage: volts,
      num100AhBatteries,
    };
  }, [loadWatts, backupHours, batteryVoltage, dodPercent, efficiencyPercent]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Battery Bank Capacity Calculator</h3>
              <p className="text-xs text-slate-400">Compute Amp-Hour (Ah) and Watt-Hour (Wh) storage needed for backup autonomy</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Continuous Load (Watts)
            </label>
            <input
              type="number"
              min="1"
              value={loadWatts}
              onChange={(e) => setLoadWatts(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Backup Autonomy (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={backupHours}
              onChange={(e) => setBackupHours(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              System Voltage
            </label>
            <select
              value={batteryVoltage}
              onChange={(e) => setBatteryVoltage(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="12">12V DC (Small / RV)</option>
              <option value="24">24V DC (Mid-sized home)</option>
              <option value="48">48V DC (Standard Telecom / Solar)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Depth of Discharge (DoD)
            </label>
            <select
              value={dodPercent}
              onChange={(e) => setDodPercent(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="50">50% (Lead-Acid / AGM / Gel)</option>
              <option value="80">80% (LiFePO4 Lithium Iron)</option>
              <option value="90">90% (LiFePO4 High Cycle)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              System Efficiency (%)
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={efficiencyPercent}
              onChange={(e) => setEfficiencyPercent(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition"
            />
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
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#12281a] border border-emerald-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium">Required Battery Capacity</span>
                <CopyButton textToCopy={`${calculation.capacityAh} Ah @ ${calculation.batteryVoltage}V`} variant="icon" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                  {calculation.capacityAh}
                </span>
                <span className="text-sm font-mono text-emerald-300 ml-1.5">Ah @ {calculation.batteryVoltage}V</span>
              </div>
              <div className="text-xs text-slate-400">Total usable capacity required</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Required Gross Energy Storage</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                  {calculation.grossWhStorage.toLocaleString()}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">Wh ({calculation.grossKwhStorage} kWh)</span>
              </div>
              <div className="text-xs text-slate-500">Includes {dodPercent}% DoD and {efficiencyPercent}% efficiency</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Standard 12V 100Ah Equivalent</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-amber-400 tracking-tight">
                  ~{calculation.num100AhBatteries}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">units</span>
              </div>
              <div className="text-xs text-slate-500">Based on standard 1.2 kWh battery modules</div>
            </div>
          </div>

          <DisclaimerBox
            title="Battery Safety & Chemistry Notice"
            text="Deep-cycle batteries require appropriate overcurrent protection (Class T or ANL fuses), correct cell balancing, and Battery Management Systems (BMS) with high/low temperature and voltage cutoffs. Lead-acid batteries must never be discharged below 50% without suffering irreversible sulfation and shortened cycle life."
          />
        </div>
      )}
    </div>
  );
};
