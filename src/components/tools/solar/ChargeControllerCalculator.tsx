import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck, Sun, Battery } from 'lucide-react';
import { SolarHelpTooltip } from './SolarHelpTooltip';

export const ChargeControllerCalculator: React.FC = () => {
  const [solarWatts, setSolarWatts] = useState<number>(1800);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(24);
  const [controllerType, setControllerType] = useState<'mppt' | 'pwm'>('mppt');
  const [panelVoc, setPanelVoc] = useState<number>(41.5);
  const [panelsInSeries, setPanelsInSeries] = useState<number>(3);
  const [safetyMargin, setSafetyMargin] = useState<number>(1.25);
  const [controllerMaxVoc, setControllerMaxVoc] = useState<number>(150);

  const baseAmps = solarWatts / Math.max(12, batteryVoltage);
  const requiredAmps = Math.round(baseAmps * safetyMargin * 10) / 10;

  const standardRatings = [20, 30, 40, 60, 80, 100];
  const recommendedAmps =
    standardRatings.find((r) => r >= requiredAmps) || Math.ceil(requiredAmps / 10) * 10;

  const coldVoc = Math.round(panelsInSeries * panelVoc * 1.15 * 10) / 10;
  const isVocExceeded = coldVoc > controllerMaxVoc;

  const handleReset = () => {
    setSolarWatts(1800);
    setBatteryVoltage(24);
    setControllerType('mppt');
    setPanelVoc(41.5);
    setPanelsInSeries(3);
    setSafetyMargin(1.25);
    setControllerMaxVoc(150);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Solar Charge Controller Calculator</h1>
            <p className="text-xs text-slate-400">
              Size MPPT & PWM charge controllers and verify string open-circuit voltage against maximum limits.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Total Solar Array Watts</label>
          <div className="relative">
            <input
              type="number"
              min="100"
              step="50"
              value={solarWatts}
              onChange={(e) => setSolarWatts(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
            />
            <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">Watts</span>
          </div>
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Battery Bank Voltage</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[12, 24, 36, 48].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setBatteryVoltage(v)}
                className={`py-2 rounded-xl border text-xs font-bold font-mono transition ${
                  batteryVoltage === v
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {v}V
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Controller Type</span>
            <SolarHelpTooltip term="MPPT" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setControllerType('mppt')}
              className={`py-2 rounded-xl border text-xs font-bold transition ${
                controllerType === 'mppt'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              MPPT (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setControllerType('pwm')}
              className={`py-2 rounded-xl border text-xs font-bold transition ${
                controllerType === 'pwm'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              PWM (Budget)
            </button>
          </div>
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center">
            <span>Single Panel Voc</span>
            <SolarHelpTooltip term="VOC" />
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={panelVoc}
              onChange={(e) => setPanelVoc(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
            />
            <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">Volts</span>
          </div>
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Panels in Series per String</label>
          <input
            type="number"
            min="1"
            max="12"
            value={panelsInSeries}
            onChange={(e) => setPanelsInSeries(parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Controller Max PV Input Voc</label>
          <select
            value={controllerMaxVoc}
            onChange={(e) => setControllerMaxVoc(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
          >
            <option value={100}>100V Max (Small MPPT)</option>
            <option value={150}>150V Max (Standard MPPT)</option>
            <option value={200}>200V Max</option>
            <option value={250}>250V Max (High-End)</option>
            <option value={500}>500V Max (High-Voltage Hybrid)</option>
          </select>
        </div>
      </div>

      {/* Safety Warning if Voc Exceeded */}
      {isVocExceeded && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <strong className="text-sm text-rose-200 block">⚠ Critical: String Voc Exceeds Controller Max Input!</strong>
            <p>
              Calculated Cold String Voc ({coldVoc}V) exceeds the controller limit ({controllerMaxVoc}V).
              Reduce panels in series or choose a controller with a higher input voltage threshold.
            </p>
          </div>
        </div>
      )}

      {/* Output Recommendation Card */}
      <div className="bg-[#0b1322] border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              RECOMMENDED CONTROLLER SPECIFICATION
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {recommendedAmps}A <span className="text-amber-400">{controllerType.toUpperCase()}</span> Controller
            </div>
            <p className="text-xs text-slate-400 mt-1">
              For {batteryVoltage}V Battery Bank • Minimum rated charging capacity: {requiredAmps}A
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Max Cold PV Voc</span>
            <div className={`text-xl font-extrabold font-mono ${isVocExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
              {coldVoc}V &lt; {controllerMaxVoc}V
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {isVocExceeded ? 'Voltage Warning!' : 'Safe Operating Voltage ✓'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Nominal Charging Current</span>
            <div className="text-white font-mono font-bold">{baseAmps.toFixed(1)} Amps</div>
            <span className="text-slate-400 text-[10px]">Watts ÷ Battery Voltage</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">NEC 1.25x Safety Amps</span>
            <div className="text-amber-400 font-mono font-bold">{requiredAmps} Amps</div>
            <span className="text-slate-400 text-[10px]">Accounts for solar irradiance peaks</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Efficiency Harvest</span>
            <div className="text-emerald-400 font-mono font-bold">
              {controllerType === 'mppt' ? '97% – 99% Peak' : '70% – 75% Average'}
            </div>
            <span className="text-slate-400 text-[10px]">
              {controllerType === 'mppt' ? '+30% more energy harvested' : 'Direct PWM clamping'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
