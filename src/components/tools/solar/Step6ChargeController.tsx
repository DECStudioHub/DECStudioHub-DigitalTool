import React from 'react';
import { Zap, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SolarHelpTooltip } from './SolarHelpTooltip';

interface Step6Props {
  controllerType: 'mppt' | 'pwm';
  onUpdateControllerType: (type: 'mppt' | 'pwm') => void;
  controllerSafetyMargin: number;
  onUpdateControllerMargin: (val: number) => void;
  totalPvWattage: number;
  batteryVoltage: number;
  panelVoc: number;
  panelsInSeries: number;
  controllerMaxVoc: number;
  onUpdateControllerMaxVoc: (val: number) => void;
}

export const Step6ChargeController: React.FC<Step6Props> = ({
  controllerType,
  onUpdateControllerType,
  controllerSafetyMargin,
  onUpdateControllerMargin,
  totalPvWattage,
  batteryVoltage,
  panelVoc,
  panelsInSeries,
  controllerMaxVoc,
  onUpdateControllerMaxVoc,
}) => {
  // Required Amps formula: (Total Solar Watts ÷ Battery Voltage) × safety margin (1.25)
  const baseAmps = totalPvWattage / Math.max(12, batteryVoltage);
  const requiredAmps = Math.round(baseAmps * controllerSafetyMargin * 10) / 10;

  // Standard controller ratings
  const standardRatings = [20, 30, 40, 60, 80, 100];
  const recommendedControllerAmps =
    standardRatings.find((r) => r >= requiredAmps) || Math.ceil(requiredAmps / 10) * 10;

  // Array Voc check: Series Voc × 1.15 (cold temperature coefficient safety factor)
  const arrayVocCold = Math.round(panelsInSeries * panelVoc * 1.15 * 10) / 10;
  const isVocExceeded = arrayVocCold > controllerMaxVoc;

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mt-0.5">
            <Zap className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Step 6 — Solar Charge Controller Sizing</span>
              <SolarHelpTooltip term="MPPT" />
              <SolarHelpTooltip term="PWM" />
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The charge controller regulates incoming DC current from the solar panels into the
              battery bank, preventing overcharging and battery boiling while maximizing solar
              harvest.
            </p>
          </div>
        </div>
      </div>

      {/* Controller Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onUpdateControllerType('mppt')}
          className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
            controllerType === 'mppt'
              ? 'bg-[#0f1d32] border-amber-500 shadow-lg ring-1 ring-amber-500/30'
              : 'bg-[#090e17] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 font-bold font-mono text-xs">
                MPPT
              </div>
              <span className="text-sm font-bold text-white">Maximum Power Point Tracking</span>
            </div>
            {controllerType === 'mppt' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Harvests up to <strong>30% more energy</strong> by stepping high solar voltage down to
            charging voltage. Allows long series strings with thin wire and low voltage drop.
            Recommended for all residential setups.
          </p>
        </div>

        <div
          onClick={() => onUpdateControllerType('pwm')}
          className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
            controllerType === 'pwm'
              ? 'bg-[#0f1d32] border-amber-500 shadow-lg ring-1 ring-amber-500/30'
              : 'bg-[#090e17] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold font-mono text-xs">
                PWM
              </div>
              <span className="text-sm font-bold text-white">Pulse Width Modulation</span>
            </div>
            {controllerType === 'pwm' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Low-cost switch that connects panels directly to battery. Requires panel Vmp to strictly
            match battery voltage (e.g. 18V panel for 12V battery), wasting extra voltage. Only
            suitable for tiny single-panel setups.
          </p>
        </div>
      </div>

      {/* Controller Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            National Electric Code Safety Margin
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1.2, 1.25, 1.3].map((margin) => (
              <button
                key={margin}
                type="button"
                onClick={() => onUpdateControllerMargin(margin)}
                className={`py-2 rounded-xl border text-xs font-bold font-mono transition ${
                  controllerSafetyMargin === margin
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {Math.round((margin - 1) * 100)}% ({margin}x)
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            1.25x (25% buffer) protects against sudden bright edge-of-cloud solar spikes.
          </p>
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <span>Controller Max PV Input Voc</span>
              <SolarHelpTooltip term="VOC" />
            </label>
            <span className="text-xs font-mono font-bold text-amber-400">{controllerMaxVoc}V Max</span>
          </div>
          <select
            value={controllerMaxVoc}
            onChange={(e) => onUpdateControllerMaxVoc(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
          >
            <option value={100}>100V Max PV Input (Entry MPPT)</option>
            <option value={150}>150V Max PV Input (Standard 40A-60A MPPT)</option>
            <option value={200}>200V Max PV Input</option>
            <option value={250}>250V Max PV Input (High-End Victron/Growatt)</option>
            <option value={500}>500V Max PV Input (High-Voltage Hybrid Inverter)</option>
          </select>
          <p className="text-[10px] text-slate-400">
            The array series open-circuit voltage Voc must strictly never exceed this rating.
          </p>
        </div>
      </div>

      {/* Voc Safety Compatibility Alert */}
      {isVocExceeded && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <strong className="text-sm text-rose-200 block">
              ⚠ DANGER: Array Voc Exceeds Controller Max Limit!
            </strong>
            <p>
              Your calculated Cold Array Voc of <strong>{arrayVocCold}V</strong> ({panelsInSeries}{' '}
              panels in series × {panelVoc}V × 1.15 cold factor) exceeds the controller&apos;s maximum
              limit of <strong>{controllerMaxVoc}V</strong>.
            </p>
            <p className="text-[11px] text-rose-300">
              High voltage will permanently fry the charge controller! Reconfigure panels into
              shorter series strings with more parallel branches, or select a controller with
              higher PV input rating (e.g. 150V, 250V, or 500V).
            </p>
          </div>
        </div>
      )}

      {/* Recommended Controller Card */}
      <div className="bg-[#0b1322] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              RECOMMENDED CHARGE CONTROLLER SPECIFICATION
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {recommendedControllerAmps}A{' '}
              <span className="text-amber-400">{controllerType.toUpperCase()}</span> Charge
              Controller
            </div>
            <p className="text-xs text-slate-400 mt-1">
              For {batteryVoltage}V Battery Bank • Max PV Input: {controllerMaxVoc}V DC
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Charging Current Requirement
            </span>
            <div className="text-xl font-extrabold text-emerald-400 font-mono">
              {requiredAmps} Amps
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              ({totalPvWattage}W ÷ {batteryVoltage}V) × {controllerSafetyMargin}x
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Nominal Charging Amps</span>
            <div className="text-white font-mono font-bold">{baseAmps.toFixed(1)} A</div>
            <span className="text-slate-400 text-[10px]">Without safety margin</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Cold Array Voc Check</span>
            <div
              className={`font-mono font-bold ${
                isVocExceeded ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {arrayVocCold}V &lt; {controllerMaxVoc}V {isVocExceeded ? '(FAILED)' : '(SAFE ✓)'}
            </div>
            <span className="text-slate-400 text-[10px]">
              {panelsInSeries} Panels in Series
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">System Voltage Compatibility</span>
            <div className="text-amber-400 font-mono font-bold">12V / 24V / 48V Auto-detect</div>
            <span className="text-slate-400 text-[10px]">Matching your {batteryVoltage}V bank</span>
          </div>
        </div>
      </div>
    </div>
  );
};
