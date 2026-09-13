import React, { useState } from 'react';
import {
  FileText,
  Sun,
  Battery,
  Zap,
  Plug,
  ShieldCheck,
  Cable,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Step11SystemSummary } from './Step11SystemSummary';
import { SolarWizardState, INITIAL_APPLIANCES } from './solarTypes';

const PRESET_SYSTEMS: Record<
  string,
  { name: string; desc: string; state: Partial<SolarWizardState> }
> = {
  small: {
    name: 'Small Off-Grid Cabin (1.2 kWp)',
    desc: 'Lights, fans, laptop, WiFi, and small inverter refrigerator',
    state: {
      dailyEnergyWh: 2400,
      dailyEnergyKwh: 2.4,
      adjustedDailyWh: 3200,
      totalPvWattage: 1200,
      totalPanels: 3,
      panelPmax: 400,
      batteryBankVoltage: 24,
      recommendedBatteryAh: 100,
      batteryType: 'lithium',
      recommendedControllerAmps: 40,
      controllerType: 'mppt',
      controllerMaxPvVoc: 150,
      recommendedInverterWattage: 1500,
      estimatedSurgeWattage: 3000,
      inverterType: 'psw',
      pvDcBreakerRating: 20,
      batteryFuseRating: 80,
      inverterAcBreakerRating: 15,
      pvCableMm2: 4,
      batteryCableMm2: 25,
      inverterAcCableMm2: 2.5,
    },
  },
  medium: {
    name: 'Typical Household Setup (3.0 kWp)',
    desc: 'Full lighting, 3 fans, smart TVs, refrigerator, washing machine, pressure pump',
    state: {
      dailyEnergyWh: 5500,
      dailyEnergyKwh: 5.5,
      adjustedDailyWh: 7300,
      totalPvWattage: 2700,
      totalPanels: 6,
      panelPmax: 450,
      batteryBankVoltage: 24,
      recommendedBatteryAh: 200,
      batteryType: 'lithium',
      recommendedControllerAmps: 80,
      controllerType: 'mppt',
      controllerMaxPvVoc: 150,
      recommendedInverterWattage: 3000,
      estimatedSurgeWattage: 6000,
      inverterType: 'psw',
      pvDcBreakerRating: 32,
      batteryFuseRating: 150,
      inverterAcBreakerRating: 20,
      pvCableMm2: 6,
      batteryCableMm2: 35,
      inverterAcCableMm2: 3.5,
    },
  },
  large: {
    name: 'Heavy Residential (5.5 kWp)',
    desc: 'Full home power including inverter air conditioning, refrigerator, induction, and water pump',
    state: {
      dailyEnergyWh: 12000,
      dailyEnergyKwh: 12.0,
      adjustedDailyWh: 16000,
      totalPvWattage: 5500,
      totalPanels: 10,
      panelPmax: 550,
      batteryBankVoltage: 48,
      recommendedBatteryAh: 200,
      batteryType: 'lithium',
      recommendedControllerAmps: 100,
      controllerType: 'mppt',
      controllerMaxPvVoc: 500,
      recommendedInverterWattage: 5000,
      estimatedSurgeWattage: 10000,
      inverterType: 'psw',
      pvDcBreakerRating: 32,
      batteryFuseRating: 150,
      inverterAcBreakerRating: 32,
      pvCableMm2: 6,
      batteryCableMm2: 50,
      inverterAcCableMm2: 5.5,
    },
  },
};

export const SolarSystemSummaryView: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('medium');

  const activeData = PRESET_SYSTEMS[selectedPreset].state;

  const fullState: SolarWizardState = {
    appliances: INITIAL_APPLIANCES,
    dailyEnergyWh: activeData.dailyEnergyWh || 3850,
    dailyEnergyKwh: activeData.dailyEnergyKwh || 3.85,
    totalContinuousWatts: 1200,
    totalSurgeWatts: 2500,
    solarLossPercent: 12,
    batteryLossPercent: 8,
    inverterLossPercent: 7,
    wireLossPercent: 3,
    systemLossPercent: 25,
    safetyMarginPercent: 15,
    adjustedDailyWh: activeData.adjustedDailyWh || 5133,
    batteryType: activeData.batteryType || 'lithium',
    batteryBankVoltage: activeData.batteryBankVoltage || 24,
    batteryUnitCapacityAh: 100,
    backupHours: 8,
    batteryDodPercent: 85,
    batteryEfficiencyPercent: 95,
    requiredBatteryWh: 4500,
    requiredBatteryAh: activeData.recommendedBatteryAh || 200,
    recommendedBatteryAh: activeData.recommendedBatteryAh || 200,
    batterySeriesCount: activeData.batteryBankVoltage === 48 ? 4 : 2,
    batteryParallelCount: 1,
    totalBatteryCount: activeData.batteryBankVoltage === 48 ? 4 : 2,
    usableBatteryWh: Math.round((activeData.recommendedBatteryAh || 200) * (activeData.batteryBankVoltage || 24) * 0.85),
    peakSunHours: 4.5,
    panelPmax: activeData.panelPmax || 450,
    panelVoc: 41.5,
    panelVmp: 34.8,
    panelIsc: 13.85,
    panelImp: 12.94,
    panelMaxSystemVoltage: 1000,
    panelMaxSeriesFuse: 25,
    panelModuleApplication: 'Class A / Rooftop',
    requiredPvWattage: activeData.totalPvWattage || 1800,
    recommendedPanelWattage: activeData.panelPmax || 450,
    totalPanels: activeData.totalPanels || 4,
    panelsInSeries: 2,
    panelsInParallel: 2,
    totalPvWattage: activeData.totalPvWattage || 1800,
    estimatedDailyPvProductionWh: Math.round((activeData.totalPvWattage || 1800) * 4.5 * 0.85),
    arrayVoc: 83.0,
    arrayVmp: 69.6,
    arrayIsc: 27.7,
    arrayImp: 25.88,
    controllerType: activeData.controllerType || 'mppt',
    controllerSafetyMargin: 1.25,
    requiredControllerAmps: activeData.recommendedControllerAmps || 80,
    recommendedControllerAmps: activeData.recommendedControllerAmps || 80,
    recommendedControllerVoltage: activeData.batteryBankVoltage || 24,
    controllerMaxPvVoc: activeData.controllerMaxPvVoc || 150,
    isPvVoltageExceeded: false,
    inverterType: activeData.inverterType || 'psw',
    inverterEfficiency: 90,
    inverterSafetyMargin: 25,
    requiredContinuousWattage: 1500,
    estimatedSurgeWattage: activeData.estimatedSurgeWattage || 6000,
    recommendedInverterWattage: activeData.recommendedInverterWattage || 3000,
    acOutputVoltage: 230,
    acOutputCurrentAmps: Math.round(((activeData.recommendedInverterWattage || 3000) / 230) * 10) / 10,
    batteryDcDrawAmps: Math.round(((activeData.recommendedInverterWattage || 3000) / (activeData.batteryBankVoltage || 24) / 0.9) * 10) / 10,
    pvDcBreakerRating: activeData.pvDcBreakerRating || 32,
    pvDcIsolatorRating: 32,
    pvSpdRecommended: true,
    pvCombinerBoxRequired: false,
    batteryFuseRating: activeData.batteryFuseRating || 150,
    batteryDcDisconnectRating: 250,
    inverterAcBreakerRating: activeData.inverterAcBreakerRating || 20,
    houseMainBreakerRating: 40,
    pvCableLengthMeters: 15,
    pvCableMm2: activeData.pvCableMm2 || 6,
    batteryCableLengthMeters: 1.5,
    batteryCableMm2: activeData.batteryCableMm2 || 35,
    inverterAcCableLengthMeters: 5,
    inverterAcCableMm2: activeData.inverterAcCableMm2 || 3.5,
    groundingCableMm2: 16,
    generalOutletsCount: 8,
    lightingPointsCount: 12,
    dedicatedCircuitsCount: 3,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Preset Selector */}
      <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Select System Size Preset for Instant Summary</span>
            </h3>
            <p className="text-xs text-slate-400">
              Choose a standard template or use the full 11-step Solar Setup Wizard for custom loads.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(PRESET_SYSTEMS).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedPreset(key)}
              className={`p-4 rounded-xl border text-left transition ${
                selectedPreset === key
                  ? 'bg-[#0f1d32] border-amber-500 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="font-bold text-white text-xs block">{config.name}</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{config.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Render the full summary component */}
      <Step11SystemSummary state={fullState} onReset={() => setSelectedPreset('medium')} />
    </div>
  );
};
