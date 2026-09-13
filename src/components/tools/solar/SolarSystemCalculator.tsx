import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { DisclaimerBox } from '../../common/DisclaimerBox';
import {
  Sun,
  BatteryCharging,
  Cpu,
  Cable,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap
} from 'lucide-react';

export const SolarSystemCalculator: React.FC = () => {
  // Primary Inputs
  const [dailyKwh, setDailyKwh] = useState<number | string>(5.0);
  const [sunHours, setSunHours] = useState<number | string>(4.5);
  const [systemVoltage, setSystemVoltage] = useState<number>(24);
  const [backupHours, setBackupHours] = useState<number | string>(8);
  const [batteryType, setBatteryType] = useState<string>('lithium');
  const [dod, setDod] = useState<number>(80);
  const [inverterEff, setInverterEff] = useState<number>(90);
  const [safetyFactor, setSafetyFactor] = useState<number>(1.25);

  // Optional inputs
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [panelWattageChoice, setPanelWattageChoice] = useState<number>(550);
  const [backupDays, setBackupDays] = useState<number>(1);
  const [maxInverterLoad, setMaxInverterLoad] = useState<number | string>('');
  const [cableLengthMeters, setCableLengthMeters] = useState<number>(10);

  // Auto-set DOD when battery type changes
  const handleBatteryTypeChange = (type: string) => {
    setBatteryType(type);
    if (type === 'lead_acid' || type === 'agm' || type === 'gel') {
      setDod(50);
    } else if (type === 'lithium') {
      setDod(80);
    }
  };

  const handleReset = () => {
    setDailyKwh(5.0);
    setSunHours(4.5);
    setSystemVoltage(24);
    setBackupHours(8);
    setBatteryType('lithium');
    setDod(80);
    setInverterEff(90);
    setSafetyFactor(1.25);
    setPanelWattageChoice(550);
    setBackupDays(1);
    setMaxInverterLoad('');
    setCableLengthMeters(10);
  };

  const results = useMemo(() => {
    const kwh = Number(dailyKwh);
    const sun = Number(sunHours);
    const v = Number(systemVoltage);
    const bHours = Number(backupHours);
    const dodFrac = Number(dod) / 100;
    const invEffFrac = Number(inverterEff) / 100;
    const sf = Number(safetyFactor);

    if (isNaN(kwh) || kwh <= 0 || isNaN(sun) || sun <= 0 || isNaN(v) || v <= 0) {
      return null;
    }

    // 1. Solar Panels
    // Daily Wh needed at array level = (kWh * 1000 * safetyFactor) / inverterEff
    const dailyWhNeeded = (kwh * 1000 * sf) / invEffFrac;
    const arrayWattageReq = dailyWhNeeded / sun; // in Watts
    const arrayKwReq = Math.round((arrayWattageReq / 1000) * 10) / 10;

    const panelW = panelWattageChoice || 550;
    const panelCount = Math.ceil(arrayWattageReq / panelW);
    const totalInstalledWatts = panelCount * panelW;
    const totalInstalledKw = Math.round((totalInstalledWatts / 1000) * 10) / 10;
    const estDailyProductionKwh = Math.round(((totalInstalledWatts * sun * invEffFrac) / 1000) * 10) / 10;

    // 2. Battery Storage
    // Daily energy used during backup period: (dailyKwh / 24) * backupHours * backupDays
    const hoursBackup = Math.max(1, bHours);
    const energyNeededForBackupWh = ((kwh * 1000) / 24) * hoursBackup * (backupDays || 1);
    const totalBatteryWhNeeded = energyNeededForBackupWh / Math.max(0.1, dodFrac * invEffFrac);
    const totalBatteryAhNeeded = Math.round(totalBatteryWhNeeded / v);
    const usableBatteryWh = Math.round(totalBatteryWhNeeded * dodFrac);
    const usableBatteryKwh = Math.round((usableBatteryWh / 1000) * 10) / 10;

    // Recommended Standard Battery Bank
    // For 12V system: 12V batteries in parallel
    // For 24V system: 2 x 12V in series, or 24V Lithium pack
    // For 48V system: 4 x 12V in series, or 48V/51.2V rack battery
    let recBatteryConfig = '';
    let recBatteryAh = 100;
    if (totalBatteryAhNeeded <= 100) recBatteryAh = 100;
    else if (totalBatteryAhNeeded <= 150) recBatteryAh = 150;
    else if (totalBatteryAhNeeded <= 200) recBatteryAh = 200;
    else if (totalBatteryAhNeeded <= 300) recBatteryAh = 300;
    else recBatteryAh = Math.ceil(totalBatteryAhNeeded / 100) * 100;

    if (batteryType === 'lithium') {
      if (v === 12) recBatteryConfig = `1 × 12.8V ${recBatteryAh}Ah LiFePO4 Module`;
      else if (v === 24) recBatteryConfig = `1 × 25.6V ${recBatteryAh}Ah (or 2 × 12V in series) LiFePO4 Pack`;
      else recBatteryConfig = `1 × 51.2V ${recBatteryAh}Ah Server Rack Battery (${Math.round((51.2 * recBatteryAh) / 1000)} kWh)`;
    } else {
      const batteriesInSeries = v / 12;
      recBatteryConfig = `${batteriesInSeries} × 12V ${recBatteryAh}Ah ${batteryType.toUpperCase()} in series`;
    }

    // 3. Inverter
    // Continuous load: average hourly load * 3 to 4 factor for typical peaks, or manual max load
    const userPeak = Number(maxInverterLoad);
    const avgLoadWatts = Math.round((kwh * 1000) / 24);
    let continuousLoadEstimate = Math.max(avgLoadWatts * 3.5, 1200);
    if (!isNaN(userPeak) && userPeak > 0) {
      continuousLoadEstimate = userPeak;
    }
    // Standard sizes: 1500W, 2000W, 3000W, 5000W, 6000W, 8000W, 10000W
    let recInverterWatts = 3000;
    if (continuousLoadEstimate <= 1200) recInverterWatts = 1500;
    else if (continuousLoadEstimate <= 1800) recInverterWatts = 2400;
    else if (continuousLoadEstimate <= 2500) recInverterWatts = 3000;
    else if (continuousLoadEstimate <= 4200) recInverterWatts = 5000;
    else if (continuousLoadEstimate <= 5500) recInverterWatts = 6000;
    else recInverterWatts = Math.ceil(continuousLoadEstimate / 1000) * 1000;

    // 4. Cables
    // PV string current estimate (approx 10-14A per string)
    const pvCableMm2 = '6.0 mm² Solar PV Twin-core (1000V/1500V DC)';
    // Battery current = Inverter Watts / System Voltage
    const maxBattCurrent = Math.round(recInverterWatts / (v * invEffFrac));
    let battCableMm2 = '25 mm² (~4 AWG)';
    if (maxBattCurrent > 160) battCableMm2 = '50 mm² (~1/0 AWG)';
    else if (maxBattCurrent > 120) battCableMm2 = '35 mm² (~2 AWG)';
    else if (maxBattCurrent > 80) battCableMm2 = '25 mm² (~4 AWG)';
    else battCableMm2 = '16 mm² (~6 AWG)';

    const inverterAcCable = recInverterWatts > 4500 ? '5.5 mm² (~10 AWG)' : '3.5 mm² (~12 AWG)';

    // 5. Breakers & Protection
    // PV DC Breaker: 1.25 * PV string current (approx 15-32A depending on configuration)
    const pvBreaker = '20A – 32A 2-Pole 500V/1000V DC Breaker';
    const battFuseRating = Math.round(maxBattCurrent * 1.25);
    const battBreaker = `${battFuseRating}A DC Fuse / DC MCCB (${v}V Rated)`;
    const acBreakerCurrent = Math.round((recInverterWatts / 230) * 1.25);
    const acBreaker = `${Math.max(16, Math.min(63, Math.ceil(acBreakerCurrent / 5) * 5))}A 2-Pole 230V AC Breaker`;

    // Summary Text for copy
    const summaryText = `DECStudioHub — Solar System Recommendation
• Daily Usage: ${kwh} kWh/day
• Solar Array: ${totalInstalledKw} kW (${panelCount} × ${panelW}W)
• Est. Daily Generation: ~${estDailyProductionKwh} kWh/day
• Battery Bank: ${v}V ${recBatteryAh}Ah (~${usableBatteryKwh} kWh usable)
• Inverter: ${recInverterWatts.toLocaleString()}W Pure Sine Wave (${v}V DC to 230V AC)
• PV Cable: 6.0 mm² Solar DC
• Battery Cable: ${battCableMm2}
• Inverter AC Cable: ${inverterAcCable}
• Battery Fuse/Breaker: ${battBreaker}`;

    return {
      dailyKwh: kwh,
      arrayKwReq,
      panelW,
      panelCount,
      totalInstalledKw,
      estDailyProductionKwh,
      recBatteryAh,
      recBatteryConfig,
      usableBatteryKwh,
      recInverterWatts,
      continuousLoadEstimate: Math.round(continuousLoadEstimate),
      pvCableMm2,
      battCableMm2,
      inverterAcCable,
      maxBattCurrent,
      pvBreaker,
      battBreaker,
      acBreaker,
      summaryText,
    };
  }, [
    dailyKwh,
    sunHours,
    systemVoltage,
    backupHours,
    batteryType,
    dod,
    inverterEff,
    safetyFactor,
    panelWattageChoice,
    backupDays,
    maxInverterLoad,
    cableLengthMeters,
  ]);

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Solar System Complete Sizing Calculator</h2>
              <p className="text-xs text-slate-400">All-in-one comprehensive sizing: Solar Panels, Battery, Inverter, Cables & Protection in ONE VIEW</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Primary Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Daily Electricity Usage (kWh/day)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={dailyKwh}
              onChange={(e) => setDailyKwh(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
              placeholder="e.g. 5.0"
            />
            <span className="text-[11px] text-slate-500">Check your monthly electric bill kWh ÷ 30</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Peak Sun Hours (hrs/day)
            </label>
            <input
              type="number"
              step="0.1"
              min="2"
              max="8"
              value={sunHours}
              onChange={(e) => setSunHours(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
              placeholder="e.g. 4.5"
            />
            <span className="text-[11px] text-slate-500">Philippines average is 4.0 – 5.0 hrs</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              System DC Voltage
            </label>
            <select
              value={systemVoltage}
              onChange={(e) => setSystemVoltage(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-yellow-500 transition"
            >
              <option value="12">12V DC (Small / RV / Minimal)</option>
              <option value="24">24V DC (Medium Household 2-5 kW)</option>
              <option value="48">48V DC (Standard Residential 5 kW+)</option>
            </select>
            <span className="text-[11px] text-slate-500">48V recommended for loads &gt; 3 kW</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Battery Backup Hours
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={backupHours}
              onChange={(e) => setBackupHours(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
              placeholder="e.g. 8"
            />
            <span className="text-[11px] text-slate-500">Hours of nighttime / off-grid storage</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Battery Chemistry
            </label>
            <select
              value={batteryType}
              onChange={(e) => handleBatteryTypeChange(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-yellow-500 transition"
            >
              <option value="lithium">Lithium (LiFePO4 - 80% DoD recommended)</option>
              <option value="gel">Deep Cycle GEL (50% DoD)</option>
              <option value="agm">AGM Sealed (50% DoD)</option>
              <option value="lead_acid">Flooded Lead Acid (50% DoD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Battery Depth of Discharge (DoD %)
            </label>
            <input
              type="number"
              min="20"
              max="95"
              value={dod}
              onChange={(e) => setDod(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">80% for LiFePO4, 50% for Lead Acid</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Inverter Efficiency (%)
            </label>
            <input
              type="number"
              min="75"
              max="98"
              value={inverterEff}
              onChange={(e) => setInverterEff(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">Typical pure sine wave is 90%–93%</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Safety / Derating Margin
            </label>
            <select
              value={safetyFactor}
              onChange={(e) => setSafetyFactor(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-yellow-500 transition"
            >
              <option value="1.20">1.20 (20% safety margin)</option>
              <option value="1.25">1.25 (25% standard design buffer)</option>
              <option value="1.30">1.30 (30% high temperature / dust)</option>
            </select>
          </div>
        </div>

        {/* Toggle Advanced Optional Options */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showAdvanced ? 'Hide Optional Settings' : 'Show Optional Settings (Panel Wattage, Max Inverter Load, Cable Length)'}</span>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Panel Wattage</label>
                <select
                  value={panelWattageChoice}
                  onChange={(e) => setPanelWattageChoice(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-yellow-500"
                >
                  <option value="400">400W Monocrystalline</option>
                  <option value="450">450W Monocrystalline</option>
                  <option value="550">550W Tier-1 Half-Cell</option>
                  <option value="600">600W Bifacial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Max Instantaneous Inverter Load (W)</label>
                <input
                  type="number"
                  placeholder="e.g. 3500 (leave blank to auto-estimate)"
                  value={maxInverterLoad}
                  onChange={(e) => setMaxInverterLoad(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Estimated PV Cable Length (Meters)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={cableLengthMeters}
                  onChange={(e) => setCableLengthMeters(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ONE VIEW RESULTS */}
      {results && (
        <div className="space-y-6">
          {/* Top System Summary Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121c32] via-[#0e172a] to-[#261f0e] border border-yellow-500/30 p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white tracking-tight uppercase">
                  Solar System Recommendation
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton textToCopy={results.summaryText} label="Copy System Summary" />
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Concise Spec Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Daily Usage</span>
                <span className="text-lg font-mono font-bold text-white">{results.dailyKwh} kWh</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-yellow-500/30">
                <span className="text-[11px] text-yellow-400 block font-medium">Solar Array</span>
                <span className="text-lg font-mono font-bold text-yellow-300">{results.totalInstalledKw} kW</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Panels</span>
                <span className="text-lg font-mono font-bold text-white">{results.panelCount} × {results.panelW}W</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 block font-medium">Battery</span>
                <span className="text-lg font-mono font-bold text-emerald-300">{systemVoltage}V {results.recBatteryAh}Ah</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-cyan-500/30">
                <span className="text-[11px] text-cyan-400 block font-medium">Inverter</span>
                <span className="text-lg font-mono font-bold text-cyan-300">{results.recInverterWatts.toLocaleString()}W</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">PV Cable</span>
                <span className="text-lg font-mono font-bold text-white">6 mm²</span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Solar Panels */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-yellow-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span>☀️ Solar PV Array</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Required Array Size:</span>
                    <span className="font-mono font-bold text-white">{results.arrayKwReq} kW ({Math.round(results.arrayKwReq * 1000)} W)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Recommended Panels:</span>
                    <span className="font-mono font-bold text-yellow-300">{results.panelCount} × {results.panelW}W Monocrystalline</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Total Installed PV:</span>
                    <span className="font-mono font-bold text-white">{results.totalInstalledKw} kW</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Est. Daily Production:</span>
                    <span className="font-mono font-bold text-emerald-400">~{results.estDailyProductionKwh} kWh / day</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Derated for rooftop temperature and dust coefficient.</span>
            </div>

            {/* 2. Battery Storage */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <BatteryCharging className="w-4 h-4" />
                  </div>
                  <span>🔋 Battery Bank</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Recommended Bank:</span>
                    <span className="font-mono font-bold text-white">{systemVoltage}V {results.recBatteryAh}Ah</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Usable Storage:</span>
                    <span className="font-mono font-bold text-emerald-300">~{results.usableBatteryKwh} kWh ({dod}% DoD)</span>
                  </div>
                  <div className="py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">Configuration:</span>
                    <span className="font-mono font-bold text-slate-200">{results.recBatteryConfig}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Chemistry:</span>
                    <span className="font-mono font-medium text-slate-300 uppercase">{batteryType.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Clearly calculated for {backupHours} hours backup duration.</span>
            </div>

            {/* 3. Inverter */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span>🔌 Inverter</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Continuous Load Est.:</span>
                    <span className="font-mono font-bold text-white">{results.continuousLoadEstimate} W</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Recommended Inverter:</span>
                    <span className="font-mono font-bold text-cyan-300">{results.recInverterWatts.toLocaleString()}W Pure Sine Wave</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">DC Input Voltage:</span>
                    <span className="font-mono font-bold text-white">{systemVoltage}V DC</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">AC Output Voltage:</span>
                    <span className="font-mono font-bold text-white">230V AC Single-Phase 60Hz</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Pure Sine Wave ensures safe operation of compressors & electronics.</span>
            </div>

            {/* 4. Solar Cable / Wire */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Cable className="w-4 h-4" />
                  </div>
                  <span>🔧 Solar Cable / Wire</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">PV String Cable:</span>
                    <span className="font-mono font-bold text-indigo-300">{results.pvCableMm2}</span>
                  </div>
                  <div className="py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">Battery to Inverter:</span>
                    <span className="font-mono font-bold text-indigo-300">{results.battCableMm2} (rated for {results.maxBattCurrent}A)</span>
                  </div>
                  <div className="py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">Inverter AC Output:</span>
                    <span className="font-mono font-bold text-white">{results.inverterAcCable} THHN/THWN</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Cable Distance Modeled:</span>
                    <span className="font-mono text-slate-300">{cableLengthMeters} meters one-way</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Preliminary estimate. Final sizing must verify voltage drop & PEC ampacity.</span>
            </div>

            {/* 5. Circuit Breakers & Protection */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4 lg:col-span-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span>⚡ Circuit Breakers & Protection (Recommended Ranges)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#0b0f19] border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">PV Array DC Protection:</span>
                    <span className="font-mono font-bold text-white mt-1 block">{results.pvBreaker}</span>
                    <span className="text-[10px] text-slate-500">Plus DC Surge Protective Device (SPD 500V/1000V)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b0f19] border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Battery Bank DC Protection:</span>
                    <span className="font-mono font-bold text-white mt-1 block">{results.battBreaker}</span>
                    <span className="text-[10px] text-slate-500">High interrupt capacity ANL, Class T, or DC MCCB</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b0f19] border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Inverter AC Output Breaker:</span>
                    <span className="font-mono font-bold text-white mt-1 block">{results.acBreaker}</span>
                    <span className="text-[10px] text-slate-500">230V AC 2-pole branch breaker to sub-panel</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b0f19] border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Safety Isolation & Grounding:</span>
                    <span className="font-mono font-bold text-white mt-1 block">Rotary DC Isolator + Solid Earth Rod</span>
                    <span className="text-[10px] text-slate-500">5/8" copper ground rod with 8.0 mm² bare copper ground</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-amber-300/90 italic">
                Final breaker/fuse sizing must be verified against equipment specifications, conductor ampacity, fault current, installation method and applicable electrical code.
              </p>
            </div>
          </div>

          {/* 6. Recommended Materials Checklist */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Recommended Materials Checklist
              </h4>
              <span className="text-xs text-slate-400 font-mono">Complete Installation Package</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs text-slate-300">
              {[
                `Solar Panels (${results.panelCount} × ${results.panelW}W)`,
                'Aluminum Mounting Rails',
                'Mid & End Panel Clamps',
                'Solar PV Cable (6.0 mm²)',
                'MC4 Connectors (Male/Female pairs)',
                'DC Isolator Switch (600V/1000V)',
                'PV DC Breaker / Fuse Box',
                'Surge Protection Device (DC SPD)',
                `${results.recInverterWatts}W Pure Sine Inverter`,
                `Battery Bank (${systemVoltage}V ${results.recBatteryAh}Ah)`,
                `Heavy-Duty Battery Cables (${results.battCableMm2})`,
                `Battery Fuse / Breaker (${results.battBreaker})`,
                'AC Breaker & Distribution Box',
                'AC THHN Output Cable',
                'Grounding Wire (Green/Yellow 8mm²)',
                'Copper-Clad Grounding Rod (5/8")',
                'Ground Rod Brass Clamp',
                'PV Combiner Box',
                'Junction Boxes (Weatherproof)',
                'Heavy Copper Cable Lugs & Ferrules',
                'IP68 Waterproof Cable Glands',
                'PVC / EMT Conduit & Saddles',
                'DC/AC High Voltage Warning Labels',
                'Smart Energy Meter / WiFi Monitor',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-[#0b0f19] border border-slate-800/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Disclaimer */}
          <DisclaimerBox
            title="Important Electrical Safety & Code Compliance"
            text="IMPORTANT: This calculator provides preliminary estimates for planning purposes only. Final electrical design, wire sizing, breaker sizing, grounding, protection and installation must be verified by a qualified electrician and according to applicable Philippine electrical codes, equipment specifications and site conditions."
          />
        </div>
      )}
    </div>
  );
};
