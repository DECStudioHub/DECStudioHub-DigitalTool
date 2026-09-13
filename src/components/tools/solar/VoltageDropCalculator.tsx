import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { DisclaimerBox } from '../../common/DisclaimerBox';
import { ShieldAlert, RotateCcw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const WIRE_SIZES = [
  { name: '1.5 mm² (~16 AWG)', area: 1.5 },
  { name: '2.5 mm² (~14 AWG)', area: 2.5 },
  { name: '4.0 mm² (~12 AWG / Solar standard)', area: 4.0 },
  { name: '6.0 mm² (~10 AWG / Solar standard)', area: 6.0 },
  { name: '10.0 mm² (~8 AWG)', area: 10.0 },
  { name: '16.0 mm² (~6 AWG)', area: 16.0 },
  { name: '25.0 mm² (~4 AWG)', area: 25.0 },
  { name: '35.0 mm² (~2 AWG)', area: 35.0 },
  { name: '50.0 mm² (~1/0 AWG)', area: 50.0 },
  { name: '70.0 mm² (~2/0 AWG)', area: 70.0 },
];

export const VoltageDropCalculator: React.FC = () => {
  const [voltage, setVoltage] = useState<number | string>(12);
  const [currentAmps, setCurrentAmps] = useState<number | string>(15);
  const [lengthMeters, setLengthMeters] = useState<number | string>(10);
  const [wireArea, setWireArea] = useState<number>(4.0);

  const reset = () => {
    setVoltage(12);
    setCurrentAmps(15);
    setLengthMeters(10);
    setWireArea(4.0);
  };

  const calculation = useMemo(() => {
    const v = Number(voltage);
    const i = Number(currentAmps);
    const l = Number(lengthMeters);
    const area = Number(wireArea);

    if (isNaN(v) || isNaN(i) || isNaN(l) || isNaN(area)) return null;
    if (v <= 0 || i <= 0 || l <= 0 || area <= 0) return null;

    // Copper resistivity at 25°C = 0.0175 Ω·mm²/m
    // Round trip loop length = 2 * length
    const loopLength = 2 * l;
    const totalResistance = (0.0175 * loopLength) / area;
    const voltageDrop = i * totalResistance;
    const percentDrop = (voltageDrop / v) * 100;
    const voltageAtLoad = Math.max(0, v - voltageDrop);
    const powerLossWatts = voltageDrop * i;

    let status = 'pass';
    let statusText = 'Acceptable (<3% optimal for critical PV & branch)';
    let statusColor = 'text-emerald-400';
    let statusBg = 'border-emerald-500/30 bg-emerald-500/10';
    let StatusIcon = CheckCircle;

    if (percentDrop > 5) {
      status = 'danger';
      statusText = 'Excessive Drop (>5%)! Increased risk of malfunction & cable heating';
      statusColor = 'text-rose-400';
      statusBg = 'border-rose-500/30 bg-rose-500/10';
      StatusIcon = XCircle;
    } else if (percentDrop > 3) {
      status = 'warning';
      statusText = 'Marginal (3%–5% limit for general non-critical circuits)';
      statusColor = 'text-amber-400';
      statusBg = 'border-amber-500/30 bg-amber-500/10';
      StatusIcon = AlertTriangle;
    }

    return {
      voltageDrop: Math.round(voltageDrop * 100) / 100,
      percentDrop: Math.round(percentDrop * 100) / 100,
      voltageAtLoad: Math.round(voltageAtLoad * 100) / 100,
      totalResistance: Math.round(totalResistance * 1000) / 1000,
      powerLossWatts: Math.round(powerLossWatts * 10) / 10,
      status,
      statusText,
      statusColor,
      statusBg,
      StatusIcon,
    };
  }, [voltage, currentAmps, lengthMeters, wireArea]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Cable Voltage Drop & Line Loss Calculator</h3>
              <p className="text-xs text-slate-400">Calculate line resistance, voltage drop percentage, and end-of-line voltage</p>
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
              Source Voltage (V)
            </label>
            <select
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            >
              <option value="12">12V DC</option>
              <option value="24">24V DC</option>
              <option value="48">48V DC</option>
              <option value="120">120V AC (US/JP)</option>
              <option value="230">230V AC (PH/EU)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Circuit Current (Amps)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.1"
              value={currentAmps}
              onChange={(e) => setCurrentAmps(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              One-Way Distance (Meters)
            </label>
            <input
              type="number"
              min="1"
              value={lengthMeters}
              onChange={(e) => setLengthMeters(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-500 transition"
            />
            <span className="text-[11px] text-slate-500">Distance to device (round-trip calculated automatically)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Copper Conductor Gauge
            </label>
            <select
              value={wireArea}
              onChange={(e) => setWireArea(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            >
              {WIRE_SIZES.map((w) => (
                <option key={w.area} value={w.area}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {calculation && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#252011] border border-yellow-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-400 font-medium">Voltage Drop %</span>
                <CopyButton textToCopy={`${calculation.percentDrop}% (${calculation.voltageDrop}V)`} variant="icon" />
              </div>
              <div className="my-2">
                <span className={`text-4xl font-mono font-bold tracking-tight ${calculation.statusColor}`}>
                  {calculation.percentDrop}%
                </span>
                <span className="text-sm font-mono text-slate-400 ml-2">({calculation.voltageDrop} V lost)</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">Total loop R: {calculation.totalResistance} Ω</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Delivered Voltage at Load</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  {calculation.voltageAtLoad}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">Volts</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">Original: {voltage} V</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Wire Heat Dissipation (Loss)</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-rose-400 tracking-tight">
                  {calculation.powerLossWatts}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">Watts</span>
              </div>
              <div className="text-xs text-slate-500">I²R energy wasted as cable heat</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${calculation.statusBg}`}>
            <calculation.StatusIcon className={`w-5 h-5 shrink-0 ${calculation.statusColor}`} />
            <span className={calculation.statusColor}>{calculation.statusText}</span>
          </div>

          <DisclaimerBox
            title="Electrical Code Compliance Notice"
            text="National Electrical Code (NEC) Article 210.19(A) recommends that voltage drop should not exceed 3% on branch circuits and 5% for overall feeder plus branch combined to ensure operating efficiency. Always consider ambient temperature derating, conduit fill factors, and insulation thermal ratings (e.g. THHN/THWN 75°C / 90°C)."
          />
        </div>
      )}
    </div>
  );
};
