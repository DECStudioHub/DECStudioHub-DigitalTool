import React, { useState, useMemo } from 'react';
import {
  Sun,
  Battery,
  Zap,
  Plug,
  ShieldCheck,
  Cable,
  Home,
  FileText,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import {
  SolarWizardState,
  INITIAL_APPLIANCES,
  ApplianceLoad,
} from './solarTypes';
import { calculateApplianceTotals, sizeCable } from './solarCalculations';

// Step components
import { Step1EnergyConsumption } from './Step1EnergyConsumption';
import { Step2LoadComputation } from './Step2LoadComputation';
import { Step3SystemLoss } from './Step3SystemLoss';
import { Step4BatteryBank } from './Step4BatteryBank';
import { Step5SolarArray } from './Step5SolarArray';
import { Step6ChargeController } from './Step6ChargeController';
import { Step7Inverter } from './Step7Inverter';
import { Step8CircuitProtection } from './Step8CircuitProtection';
import { Step9Wiring } from './Step9Wiring';
import { Step10HouseholdSetup } from './Step10HouseholdSetup';
import { Step11SystemSummary } from './Step11SystemSummary';

const STEPS = [
  { number: 1, title: 'Energy', label: 'Energy Consumption', icon: Lightbulb },
  { number: 2, title: 'Loads', label: 'Load Computation', icon: Zap },
  { number: 3, title: 'Loss', label: 'Loss & Margin', icon: AlertTriangle },
  { number: 4, title: 'Battery', label: 'Battery Bank', icon: Battery },
  { number: 5, title: 'Panels', label: 'Solar Array', icon: Sun },
  { number: 6, title: 'Controller', label: 'Charge Controller', icon: Zap },
  { number: 7, title: 'Inverter', label: 'Inverter Sizing', icon: Plug },
  { number: 8, title: 'Protection', label: 'Circuit Protection', icon: ShieldCheck },
  { number: 9, title: 'Wiring', label: 'Cable & Voltage Drop', icon: Cable },
  { number: 10, title: 'Household', label: 'Household Outlets', icon: Home },
  { number: 11, title: 'Summary', label: 'Complete Summary', icon: FileText },
];

export const SolarSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Core wizard state
  const [appliances, setAppliances] = useState<ApplianceLoad[]>(INITIAL_APPLIANCES);
  const [systemLossPercent, setSystemLossPercent] = useState<number>(25);
  const [safetyMarginPercent, setSafetyMarginPercent] = useState<number>(15);

  const [batteryType, setBatteryType] = useState<'lithium' | 'lead_acid'>('lithium');
  const [batteryBankVoltage, setBatteryBankVoltage] = useState<number>(24);
  const [batteryUnitAh, setBatteryUnitAh] = useState<number>(100);
  const [backupHours, setBackupHours] = useState<number>(8);

  const [peakSunHours, setPeakSunHours] = useState<number>(4.5);
  const [panelPmax, setPanelPmax] = useState<number>(450);
  const [panelVoc, setPanelVoc] = useState<number>(41.5);
  const [panelVmp, setPanelVmp] = useState<number>(34.8);
  const [panelIsc, setPanelIsc] = useState<number>(13.85);
  const [panelImp, setPanelImp] = useState<number>(12.94);
  const [panelMaxSystemVoltage, setPanelMaxSystemVoltage] = useState<number>(1000);
  const [panelMaxSeriesFuse, setPanelMaxSeriesFuse] = useState<number>(25);
  const [panelModuleApplication, setPanelModuleApplication] = useState<string>('Class A / Rooftop');

  const [controllerType, setControllerType] = useState<'mppt' | 'pwm'>('mppt');
  const [controllerSafetyMargin, setControllerSafetyMargin] = useState<number>(1.25);
  const [controllerMaxVoc, setControllerMaxVoc] = useState<number>(150);

  const [inverterType, setInverterType] = useState<'psw' | 'msw'>('psw');

  // Compute calculated values
  const { totalDailyWh, totalDailyKwh, continuousWatts, surgeWatts } = useMemo(
    () => calculateApplianceTotals(appliances),
    [appliances]
  );

  const adjustedDailyWh = useMemo(() => {
    const rawWh = Math.max(100, totalDailyWh);
    const lossFactor = Math.max(0.1, 1 - systemLossPercent / 100);
    const marginFactor = 1 + safetyMarginPercent / 100;
    return Math.round((rawWh / lossFactor) * marginFactor);
  }, [totalDailyWh, systemLossPercent, safetyMarginPercent]);

  // Battery calculations
  const dod = batteryType === 'lithium' ? 0.85 : 0.5;
  const batteryEff = batteryType === 'lithium' ? 0.95 : 0.85;
  const backupEnergyWh = Math.round(adjustedDailyWh * (backupHours / 24));
  const requiredBatteryWh = Math.round(backupEnergyWh / (dod * batteryEff));
  const requiredBatteryAh = Math.round((requiredBatteryWh / batteryBankVoltage) * 10) / 10;
  const standardAhOptions = [50, 100, 150, 200, 280, 300, 400];
  const recommendedBatteryAh =
    standardAhOptions.find((opt) => opt >= requiredBatteryAh) ||
    Math.ceil(requiredBatteryAh / 100) * 100;
  const unitVoltage = batteryBankVoltage === 48 && batteryType === 'lithium' && batteryUnitAh >= 100 ? 48 : 12;
  const seriesCount = Math.max(1, Math.round(batteryBankVoltage / unitVoltage));
  const parallelCount = Math.max(1, Math.ceil(recommendedBatteryAh / batteryUnitAh));
  const totalBatteries = seriesCount * parallelCount;

  // Solar array calculations
  const requiredSolarWatts = Math.round(adjustedDailyWh / Math.max(1, peakSunHours));
  const numberOfPanels = Math.max(1, Math.ceil(requiredSolarWatts / Math.max(50, panelPmax)));
  // String sizing: keep series Voc under controllerMaxVoc (with 1.15 cold temp margin)
  const maxPanelsSeries = Math.max(1, Math.floor(controllerMaxVoc / (panelVoc * 1.15)));
  const panelsInSeries = Math.min(numberOfPanels, maxPanelsSeries);
  const panelsInParallel = Math.max(1, Math.ceil(numberOfPanels / panelsInSeries));
  const totalPanels = panelsInSeries * panelsInParallel;
  const totalPvWattage = totalPanels * panelPmax;
  const estimatedDailyPvProductionWh = Math.round(totalPvWattage * peakSunHours * 0.85);
  const arrayVoc = Math.round(panelsInSeries * panelVoc * 10) / 10;
  const arrayVmp = Math.round(panelsInSeries * panelVmp * 10) / 10;
  const arrayIsc = Math.round(panelsInParallel * panelIsc * 10) / 10;
  const arrayImp = Math.round(panelsInParallel * panelImp * 10) / 10;

  // Charge controller
  const reqControllerAmps = Math.round((totalPvWattage / batteryBankVoltage) * controllerSafetyMargin * 10) / 10;
  const standardCcRatings = [20, 30, 40, 60, 80, 100];
  const recommendedControllerAmps =
    standardCcRatings.find((r) => r >= reqControllerAmps) || Math.ceil(reqControllerAmps / 10) * 10;

  // Inverter
  const minContinuousWatts = Math.round(continuousWatts * 1.25);
  const standardInverters = [500, 1000, 1500, 2000, 2400, 3000, 3500, 5000, 6000, 8000, 10000];
  const recommendedInverterWattage =
    standardInverters.find((w) => w >= minContinuousWatts) ||
    Math.ceil(minContinuousWatts / 1000) * 1000;
  const estimatedSurgeWattage = recommendedInverterWattage * 2;
  const batteryDcDrawAmps = Math.round((recommendedInverterWattage / batteryBankVoltage / 0.9) * 10) / 10;

  // Protection
  const pvDcBreakerRating = Math.max(16, Math.ceil((arrayIsc * 1.25) / 5) * 5);
  const pvDcIsolatorRating = Math.max(32, pvDcBreakerRating);
  const batteryFuseRating = Math.max(60, Math.ceil((batteryDcDrawAmps * 1.25) / 25) * 25);
  const inverterAcBreakerRating = Math.max(15, Math.ceil(((recommendedInverterWattage / 230) * 1.25) / 5) * 5);

  // Wires
  const pvCable = sizeCable(Math.max(1, arrayImp), 15, Math.max(20, arrayVmp), 3.0);
  const batCable = sizeCable(batteryDcDrawAmps, 1.5, batteryBankVoltage, 2.0);
  const acCable = sizeCable(recommendedInverterWattage / 230, 5, 230, 2.0);

  // Consolidated state for Summary
  const wizardState: SolarWizardState = {
    appliances,
    dailyEnergyWh: totalDailyWh,
    dailyEnergyKwh: totalDailyKwh,
    totalContinuousWatts: continuousWatts,
    totalSurgeWatts: surgeWatts,
    solarLossPercent: 12,
    batteryLossPercent: 8,
    inverterLossPercent: 7,
    wireLossPercent: 3,
    systemLossPercent,
    safetyMarginPercent,
    adjustedDailyWh,
    batteryType,
    batteryBankVoltage,
    batteryUnitCapacityAh: batteryUnitAh,
    backupHours,
    batteryDodPercent: Math.round(dod * 100),
    batteryEfficiencyPercent: Math.round(batteryEff * 100),
    requiredBatteryWh,
    requiredBatteryAh,
    recommendedBatteryAh,
    batterySeriesCount: seriesCount,
    batteryParallelCount: parallelCount,
    totalBatteryCount: totalBatteries,
    usableBatteryWh: Math.round(recommendedBatteryAh * batteryBankVoltage * dod),
    peakSunHours,
    panelPmax,
    panelVoc,
    panelVmp,
    panelIsc,
    panelImp,
    panelMaxSystemVoltage,
    panelMaxSeriesFuse,
    panelModuleApplication,
    requiredPvWattage: requiredSolarWatts,
    recommendedPanelWattage: panelPmax,
    totalPanels,
    panelsInSeries,
    panelsInParallel,
    totalPvWattage,
    estimatedDailyPvProductionWh,
    arrayVoc,
    arrayVmp,
    arrayIsc,
    arrayImp,
    controllerType,
    controllerSafetyMargin,
    requiredControllerAmps: reqControllerAmps,
    recommendedControllerAmps,
    recommendedControllerVoltage: batteryBankVoltage,
    controllerMaxPvVoc: controllerMaxVoc,
    isPvVoltageExceeded: arrayVoc * 1.15 > controllerMaxVoc,
    inverterType,
    inverterEfficiency: 90,
    inverterSafetyMargin: 25,
    requiredContinuousWattage: continuousWatts,
    estimatedSurgeWattage,
    recommendedInverterWattage,
    acOutputVoltage: 230,
    acOutputCurrentAmps: Math.round((recommendedInverterWattage / 230) * 10) / 10,
    batteryDcDrawAmps,
    pvDcBreakerRating,
    pvDcIsolatorRating,
    pvSpdRecommended: true,
    pvCombinerBoxRequired: panelsInParallel > 2,
    batteryFuseRating,
    batteryDcDisconnectRating: Math.max(250, batteryFuseRating),
    inverterAcBreakerRating,
    houseMainBreakerRating: Math.max(40, inverterAcBreakerRating),
    pvCableLengthMeters: 15,
    pvCableMm2: pvCable.recommendedMm2,
    batteryCableLengthMeters: 1.5,
    batteryCableMm2: batCable.recommendedMm2,
    inverterAcCableLengthMeters: 5,
    inverterAcCableMm2: acCable.recommendedMm2,
    groundingCableMm2: 16,
    generalOutletsCount: 8,
    lightingPointsCount: 12,
    dedicatedCircuitsCount: 3,
  };

  const handleReset = () => {
    setAppliances(INITIAL_APPLIANCES);
    setCurrentStep(1);
    setSystemLossPercent(25);
    setSafetyMarginPercent(15);
    setBatteryBankVoltage(24);
    setPanelPmax(450);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sun className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Solar Setup Wizard
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase">
                11 Steps Complete
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step household solar sizing: energy, loads, losses, battery, solar array,
              controller, inverter, protection, wiring, and materials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(11)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Summary</span>
          </button>
        </div>
      </div>

      {/* Persistent Live Specs Ribbon */}
      <div className="bg-[#0b1322] border border-amber-500/20 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-slate-400 text-[10px] block">Daily Energy:</span>
            <span className="font-mono font-bold text-white">
              {totalDailyWh.toLocaleString()} Wh ({totalDailyKwh} kWh)
            </span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-800" />
          <div>
            <span className="text-slate-400 text-[10px] block">Solar Array:</span>
            <span className="font-mono font-bold text-amber-400">
              {totalPanels} × {panelPmax}W ({(totalPvWattage / 1000).toFixed(2)} kWp)
            </span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-800" />
          <div>
            <span className="text-slate-400 text-[10px] block">Battery Bank:</span>
            <span className="font-mono font-bold text-emerald-400">
              {batteryBankVoltage}V {recommendedBatteryAh}Ah ({batteryType === 'lithium' ? 'LiFePO4' : 'Lead-Acid'})
            </span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-800" />
          <div>
            <span className="text-slate-400 text-[10px] block">Inverter:</span>
            <span className="font-mono font-bold text-blue-400">
              {recommendedInverterWattage}W {inverterType.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Step <strong className="text-amber-400">{currentStep}</strong> of 11
        </div>
      </div>

      {/* 11-Step Progress Navigation Pills */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 min-w-max">
          {STEPS.map((s) => {
            const isActive = currentStep === s.number;
            const isCompleted = currentStep > s.number;
            const Icon = s.icon;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => setCurrentStep(s.number)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : isCompleted
                    ? 'bg-[#0f172a] text-slate-300 hover:bg-slate-800 border border-slate-800'
                    : 'bg-[#090e17] text-slate-400 hover:text-slate-200 border border-slate-800/60'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-slate-950 text-amber-400'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : s.number}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="min-h-[420px]">
        {currentStep === 1 && (
          <Step1EnergyConsumption
            onAddAppliance={(app) => setAppliances((prev) => [...prev, app])}
            onGoToStep2={() => setCurrentStep(2)}
            totalDailyWh={totalDailyWh}
            totalDailyKwh={totalDailyKwh}
          />
        )}

        {currentStep === 2 && (
          <Step2LoadComputation
            appliances={appliances}
            onUpdateAppliances={setAppliances}
            totalDailyWh={totalDailyWh}
            totalDailyKwh={totalDailyKwh}
            continuousWatts={continuousWatts}
            surgeWatts={surgeWatts}
          />
        )}

        {currentStep === 3 && (
          <Step3SystemLoss
            systemLossPercent={systemLossPercent}
            onUpdateLossPercent={setSystemLossPercent}
            safetyMarginPercent={safetyMarginPercent}
            onUpdateSafetyMargin={setSafetyMarginPercent}
            totalDailyWh={totalDailyWh}
            adjustedDailyWh={adjustedDailyWh}
          />
        )}

        {currentStep === 4 && (
          <Step4BatteryBank
            batteryType={batteryType}
            onUpdateType={setBatteryType}
            systemVoltage={batteryBankVoltage}
            onUpdateVoltage={setBatteryBankVoltage}
            backupHours={backupHours}
            onUpdateBackupHours={setBackupHours}
            batteryUnitAh={batteryUnitAh}
            onUpdateUnitAh={setBatteryUnitAh}
            adjustedDailyWh={adjustedDailyWh}
            totalContinuousWatts={continuousWatts}
          />
        )}

        {currentStep === 5 && (
          <Step5SolarArray
            peakSunHours={peakSunHours}
            onUpdatePeakSunHours={setPeakSunHours}
            panelPmax={panelPmax}
            onUpdatePanelPmax={setPanelPmax}
            panelVoc={panelVoc}
            onUpdatePanelVoc={setPanelVoc}
            panelVmp={panelVmp}
            onUpdatePanelVmp={setPanelVmp}
            panelIsc={panelIsc}
            onUpdatePanelIsc={setPanelIsc}
            panelImp={panelImp}
            onUpdatePanelImp={setPanelImp}
            panelMaxSystemVoltage={panelMaxSystemVoltage}
            onUpdateMaxSystemVoltage={setPanelMaxSystemVoltage}
            panelMaxSeriesFuse={panelMaxSeriesFuse}
            onUpdateMaxSeriesFuse={setPanelMaxSeriesFuse}
            panelModuleApplication={panelModuleApplication}
            onUpdateModuleApplication={setPanelModuleApplication}
            adjustedDailyWh={adjustedDailyWh}
          />
        )}

        {currentStep === 6 && (
          <Step6ChargeController
            controllerType={controllerType}
            onUpdateControllerType={setControllerType}
            controllerSafetyMargin={controllerSafetyMargin}
            onUpdateControllerMargin={setControllerSafetyMargin}
            totalPvWattage={totalPvWattage}
            batteryVoltage={batteryBankVoltage}
            panelVoc={panelVoc}
            panelsInSeries={panelsInSeries}
            controllerMaxVoc={controllerMaxVoc}
            onUpdateControllerMaxVoc={setControllerMaxVoc}
          />
        )}

        {currentStep === 7 && (
          <Step7Inverter
            inverterType={inverterType}
            onUpdateInverterType={setInverterType}
            totalContinuousWatts={continuousWatts}
            totalSurgeWatts={surgeWatts}
            batteryVoltage={batteryBankVoltage}
          />
        )}

        {currentStep === 8 && (
          <Step8CircuitProtection
            arrayIsc={arrayIsc}
            batteryVoltage={batteryBankVoltage}
            recommendedInverterWattage={recommendedInverterWattage}
            panelsInParallel={panelsInParallel}
          />
        )}

        {currentStep === 9 && (
          <Step9Wiring
            arrayImp={arrayImp}
            arrayVmp={arrayVmp}
            controllerAmps={recommendedControllerAmps}
            batteryVoltage={batteryBankVoltage}
            inverterWatts={recommendedInverterWattage}
          />
        )}

        {currentStep === 10 && (
          <Step10HouseholdSetup
            appliances={appliances}
            inverterWatts={recommendedInverterWattage}
          />
        )}

        {currentStep === 11 && (
          <Step11SystemSummary state={wizardState} onReset={handleReset} />
        )}
      </div>

      {/* Step Navigation Bar */}
      <div className="p-4 bg-[#090e17] border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={currentStep <= 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
            currentStep <= 1
              ? 'opacity-30 cursor-not-allowed border-slate-800 text-slate-500'
              : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        <div className="flex items-center gap-2">
          {currentStep < 11 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(11, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
            >
              <span>Next: {STEPS[currentStep]?.title || 'Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <span>Back to Top ↑</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
