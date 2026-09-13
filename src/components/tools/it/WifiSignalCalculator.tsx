import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { DisclaimerBox } from '../../common/DisclaimerBox';
import { RotateCcw, Wifi, Radio, AlertCircle } from 'lucide-react';

export const WifiSignalCalculator: React.FC = () => {
  const [txPower, setTxPower] = useState<number | string>(20); // dBm (~100mW)
  const [txGain, setTxGain] = useState<number | string>(3); // dBi
  const [rxGain, setRxGain] = useState<number | string>(2); // dBi (client device)
  const [distance, setDistance] = useState<number | string>(15); // meters
  const [distanceUnit, setDistanceUnit] = useState<'m' | 'km'>('m');
  const [frequencyPreset, setFrequencyPreset] = useState<'2.4' | '5' | '6' | 'custom'>('5');
  const [customFreqMHz, setCustomFreqMHz] = useState<number | string>(5200);
  const [losses, setLosses] = useState<number | string>(5); // dB (e.g. 1 drywall wall)

  const reset = () => {
    setTxPower(20);
    setTxGain(3);
    setRxGain(2);
    setDistance(15);
    setDistanceUnit('m');
    setFrequencyPreset('5');
    setCustomFreqMHz(5200);
    setLosses(5);
  };

  const calculation = useMemo(() => {
    const pTx = Number(txPower);
    const gTx = Number(txGain);
    const gRx = Number(rxGain);
    const distRaw = Number(distance);
    const loss = Number(losses);

    let freqMHz = 2412;
    if (frequencyPreset === '2.4') freqMHz = 2437;
    else if (frequencyPreset === '5') freqMHz = 5200;
    else if (frequencyPreset === '6') freqMHz = 6100;
    else freqMHz = Number(customFreqMHz);

    if (isNaN(pTx) || isNaN(gTx) || isNaN(gRx) || isNaN(distRaw) || isNaN(loss) || isNaN(freqMHz)) {
      return { error: 'Please enter valid numerical parameters' };
    }
    if (distRaw <= 0) {
      return { error: 'Distance must be greater than 0' };
    }
    if (freqMHz <= 0) {
      return { error: 'Frequency must be greater than 0 MHz' };
    }

    // Convert distance to meters
    const distMeters = distanceUnit === 'km' ? distRaw * 1000 : distRaw;

    // FSPL (Free Space Path Loss) formula in dB:
    // FSPL = 20*log10(d in meters) + 20*log10(f in MHz) - 27.55
    const fspl = 20 * Math.log10(distMeters) + 20 * Math.log10(freqMHz) - 27.55;

    // RSSI = Ptx + Gtx + Grx - FSPL - AdditionalLosses
    const rssi = pTx + gTx + gRx - fspl - loss;

    // Signal Quality
    let rating = 'Weak';
    let ratingColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    let ratingDesc = 'Marginal connection; potential for speed drops and packet loss.';

    if (rssi >= -50) {
      rating = 'Excellent';
      ratingColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      ratingDesc = 'Maximum throughput, minimal latency, ideal for gaming & 4K streams.';
    } else if (rssi >= -65) {
      rating = 'Very Good';
      ratingColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      ratingDesc = 'Solid, dependable connection suitable for high-res streaming & video calls.';
    } else if (rssi >= -75) {
      rating = 'Fair / Adequate';
      ratingColor = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      ratingDesc = 'Adequate for light web browsing and text messaging.';
    } else {
      rating = 'Poor / Unstable';
      ratingColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      ratingDesc = 'Borderline disconnection or severe packet retransmissions.';
    }

    // EIRP (Equivalent Isotropically Radiated Power) = TxPower + TxGain
    const eirp = pTx + gTx;

    return {
      error: null,
      rssi: Math.round(rssi * 10) / 10,
      fspl: Math.round(fspl * 10) / 10,
      eirp: Math.round(eirp * 10) / 10,
      distMeters,
      freqMHz,
      rating,
      ratingColor,
      ratingDesc,
    };
  }, [txPower, txGain, rxGain, distance, distanceUnit, frequencyPreset, customFreqMHz, losses]);

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">WiFi RF Signal & Path Loss Calculator</h3>
              <p className="text-xs text-slate-400">Calculate Free Space Path Loss (FSPL) and estimated RSSI reception</p>
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

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              AP Transmit Power (dBm)
            </label>
            <input
              type="number"
              id="wifi-tx-power"
              value={txPower}
              onChange={(e) => setTxPower(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition"
            />
            <span className="text-[11px] text-slate-500">Standard router: 15–23 dBm</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Antenna Gains (AP + Client dBi)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                id="wifi-tx-gain"
                placeholder="AP (dBi)"
                value={txGain}
                onChange={(e) => setTxGain(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition"
              />
              <input
                type="number"
                id="wifi-rx-gain"
                placeholder="Client (dBi)"
                value={rxGain}
                onChange={(e) => setRxGain(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <span className="text-[11px] text-slate-500">AP gain: 3dBi, Phone: ~1-2dBi</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Distance from AP
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                id="wifi-distance"
                min="0.1"
                step="0.5"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition"
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value as 'm' | 'km')}
                className="bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="m">Meters</option>
                <option value="km">Kilometers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              WiFi Frequency Band
            </label>
            <select
              value={frequencyPreset}
              onChange={(e) => setFrequencyPreset(e.target.value as any)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="2.4">2.4 GHz Band (2437 MHz)</option>
              <option value="5">5 GHz Band (5200 MHz)</option>
              <option value="6">6 GHz Band (WiFi 6E/7, 6100 MHz)</option>
              <option value="custom">Custom Frequency (MHz)</option>
            </select>
          </div>

          {frequencyPreset === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Custom Frequency (MHz)
              </label>
              <input
                type="number"
                value={customFreqMHz}
                onChange={(e) => setCustomFreqMHz(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Additional Clutter / Obstacle Loss (dB)
            </label>
            <input
              type="number"
              id="wifi-additional-loss"
              value={losses}
              onChange={(e) => setLosses(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition"
            />
            <span className="text-[11px] text-slate-500">Drywall: 3-5dB, Concrete: 12-18dB</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Estimated Received Signal (RSSI)</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  {calculation.rssi}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">dBm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Calculated receiver power</span>
                <CopyButton textToCopy={`${calculation.rssi} dBm`} variant="icon" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Free Space Path Loss (FSPL)</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-cyan-400 tracking-tight">
                  {calculation.fspl}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">dB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">At {calculation.distMeters}m ({calculation.freqMHz} MHz)</span>
                <CopyButton textToCopy={`${calculation.fspl} dB`} variant="icon" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Transmit EIRP</span>
              <div className="my-2">
                <span className="text-3xl font-mono font-bold text-amber-400 tracking-tight">
                  {calculation.eirp}
                </span>
                <span className="text-sm font-mono text-slate-400 ml-1.5">dBm</span>
              </div>
              <span className="text-xs text-slate-500">AP Tx Power + Antenna Gain</span>
            </div>
          </div>

          {/* Rating banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${calculation.ratingColor}`}>
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-sm font-bold uppercase tracking-wider">
                  Link Quality: {calculation.rating}
                </div>
                <div className="text-xs opacity-90">{calculation.ratingDesc}</div>
              </div>
            </div>
            <CopyButton
              textToCopy={`WiFi Signal Estimate: ${calculation.rssi} dBm (Rating: ${calculation.rating})`}
              label="Copy Summary"
            />
          </div>

          <DisclaimerBox
            title="Radio Frequency Estimation Disclaimer"
            text="WiFi received signal strength and path loss values are theoretical approximations calculated using the Free Space Path Loss (FSPL) model. Real-world indoor and outdoor propagation varies significantly with multipath reflections, building construction materials (steel, concrete, glass), antenna radiation patterns, and electromagnetic interference. Always perform a physical RF site survey for mission-critical deployments."
          />
        </div>
      )}
    </div>
  );
};
