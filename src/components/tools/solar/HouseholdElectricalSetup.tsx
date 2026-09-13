import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { DisclaimerBox } from '../../common/DisclaimerBox';
import {
  Home,
  Zap,
  Cable,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Layers,
  Lightbulb,
  Cpu
} from 'lucide-react';

export const HouseholdElectricalSetup: React.FC = () => {
  const [houseType, setHouseType] = useState<'small' | 'medium' | 'large'>('medium');
  const [voltage, setVoltage] = useState<number>(230);
  const [rooms, setRooms] = useState<number>(3);
  const [outlets, setOutlets] = useState<number>(14);
  const [lights, setLights] = useState<number>(12);
  const [acCount, setAcCount] = useState<number>(1);
  const [waterHeaterCount, setWaterHeaterCount] = useState<number>(1);
  const [hasRefrigerator, setHasRefrigerator] = useState<boolean>(true);
  const [hasWashingMachine, setHasWashingMachine] = useState<boolean>(true);
  const [customLoad, setCustomLoad] = useState<number | string>('');

  const handleHouseTypePreset = (type: 'small' | 'medium' | 'large') => {
    setHouseType(type);
    if (type === 'small') {
      setRooms(2);
      setOutlets(8);
      setLights(6);
      setAcCount(1);
      setWaterHeaterCount(0);
      setHasRefrigerator(true);
      setHasWashingMachine(false);
    } else if (type === 'medium') {
      setRooms(3);
      setOutlets(14);
      setLights(12);
      setAcCount(2);
      setWaterHeaterCount(1);
      setHasRefrigerator(true);
      setHasWashingMachine(true);
    } else {
      setRooms(5);
      setOutlets(24);
      setLights(22);
      setAcCount(4);
      setWaterHeaterCount(2);
      setHasRefrigerator(true);
      setHasWashingMachine(true);
    }
  };

  const reset = () => {
    handleHouseTypePreset('medium');
    setVoltage(230);
    setCustomLoad('');
  };

  const results = useMemo(() => {
    const v = Number(voltage);
    const rCount = Number(rooms) || 1;
    const oCount = Number(outlets) || 6;
    const lCount = Number(lights) || 6;
    const acs = Number(acCount) || 0;
    const heaters = Number(waterHeaterCount) || 0;

    // Load calculation:
    // General lighting: ~15W per LED point = lCount * 15
    const lightingLoad = lCount * 15;
    // General outlets: ~180W per duplex outlet allowance (PEC demand factor applied) = oCount * 100
    const outletLoad = oCount * 120;
    // AC load: ~1200W per 1.0-1.5HP inverter AC = acs * 1200
    const acLoad = acs * 1200;
    // Water heater: ~3000W each = heaters * 3000
    const heaterLoad = heaters * 3000;
    // Fridge: 250W, Washer: 500W
    const fridgeLoad = hasRefrigerator ? 300 : 0;
    const washerLoad = hasWashingMachine ? 600 : 0;

    const baseConnectedWatts =
      lightingLoad + outletLoad + acLoad + heaterLoad + fridgeLoad + washerLoad;

    const connectedLoadWatts =
      customLoad !== '' && !isNaN(Number(customLoad)) && Number(customLoad) > 0
        ? Number(customLoad)
        : Math.max(baseConnectedWatts, 3000);

    // Demand load (diversified factor 70-80% for residential)
    const demandWatts = connectedLoadWatts * 0.75;
    const totalDesignAmps = Math.round(demandWatts / v);

    // 1. Main Service Rating
    let recServiceAmps = 60;
    let mainBreakerRating = '60A 2-Pole 230V MCB';
    let mainFeederWire = '14.0 mm² (~6 AWG) THHN Copper';

    if (totalDesignAmps <= 40) {
      recServiceAmps = 60;
      mainBreakerRating = '60A 2-Pole 230V MCB';
      mainFeederWire = '14.0 mm² (~6 AWG) THHN Copper';
    } else if (totalDesignAmps <= 70) {
      recServiceAmps = 100;
      mainBreakerRating = '100A 2-Pole 230V Industrial MCB/MCCB';
      mainFeederWire = '22.0 mm² (~4 AWG) THHN Copper';
    } else if (totalDesignAmps <= 110) {
      recServiceAmps = 125;
      mainBreakerRating = '125A 2-Pole 230V MCCB';
      mainFeederWire = '38.0 mm² (~2 AWG) THHN Copper';
    } else {
      recServiceAmps = 150;
      mainBreakerRating = '150A–200A 2-Pole 230V MCCB';
      mainFeederWire = '50.0 mm² (~1/0 AWG) THHN Copper';
    }

    // 2. Branch Circuits count
    // Lighting circuits (15-20 lights max per circuit)
    const lightingCircuits = Math.max(1, Math.ceil(lCount / 12));
    // Convenience outlet circuits (6-8 outlets max per circuit)
    const outletCircuits = Math.max(1, Math.ceil(oCount / 7));
    // Kitchen dedicated circuit
    const kitchenCircuits = 1;
    // Dedicated AC circuits (1 per AC)
    const acCircuits = acs;
    // Dedicated Water heater circuits (1 per heater)
    const heaterCircuits = heaters;
    // Laundry / Appliance circuit
    const applianceCircuits = hasWashingMachine ? 1 : 0;

    const totalActiveBranches =
      lightingCircuits + outletCircuits + kitchenCircuits + acCircuits + heaterCircuits + applianceCircuits;

    // Distribution panel size: active branches + 2-4 spare spaces
    const spareSpaces = totalActiveBranches <= 6 ? 2 : totalActiveBranches <= 10 ? 4 : 6;
    const totalPanelSpaces = totalActiveBranches + spareSpaces;

    // Summary text for one-click copy
    const summaryText = `DECStudioHub — Household Electrical Setup Recommendation
• House Archetype: ${houseType.toUpperCase()} (${rCount} Rooms)
• Estimated Connected Load: ${connectedLoadWatts.toLocaleString()} Watts (~${demandWatts.toLocaleString()} W demand)
• Supply Voltage: ${v}V AC Single-Phase
• Main Service Capacity: ${recServiceAmps} Amperes
• Main Service Breaker: ${mainBreakerRating}
• Main Feeder Conductor: ${mainFeederWire}
• Distribution Panel: ${totalPanelSpaces}-Branch Space Enclosure (${totalActiveBranches} active + ${spareSpaces} spares)
• Recommended Branch Circuits:
  - Lighting: ${lightingCircuits} circuit(s) (15A, 2.0 mm² THHN)
  - General Outlets: ${outletCircuits} circuit(s) (20A, 3.5 mm² THHN)
  - Kitchen Outlets: 1 dedicated circuit (20A GFCI, 3.5 mm² THHN)
  - Air Conditioners: ${acs} dedicated circuit(s) (20A/30A, 3.5 mm² - 5.5 mm² THHN)
  - Water Heaters: ${heaters} dedicated circuit(s) (20A/30A RCBO, 5.5 mm² THHN)
• Grounding: 5/8" Copper-clad ground rod with 8.0 mm² grounding electrode conductor`;

    return {
      connectedLoadWatts,
      demandWatts: Math.round(demandWatts),
      totalDesignAmps,
      recServiceAmps,
      mainBreakerRating,
      mainFeederWire,
      lightingCircuits,
      outletCircuits,
      kitchenCircuits,
      acCircuits,
      heaterCircuits,
      applianceCircuits,
      totalActiveBranches,
      spareSpaces,
      totalPanelSpaces,
      summaryText,
      rCount,
      oCount,
      lCount,
      acs,
      heaters,
    };
  }, [
    houseType,
    voltage,
    rooms,
    outlets,
    lights,
    acCount,
    waterHeaterCount,
    hasRefrigerator,
    hasWashingMachine,
    customLoad,
  ]);

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Household Electrical Setup Planner</h2>
              <p className="text-xs text-slate-400">Generate a complete recommended residential electrical plan: Main Service, Wires, Breakers, Panel & Materials</p>
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

        {/* House Type Preset Buttons */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">House Size Archetype</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'small', label: 'Small Residence / Studio', desc: '1-2 Rooms, basic appliances' },
              { id: 'medium', label: 'Medium Household', desc: '3-4 Rooms, 1-2 ACs, heater' },
              { id: 'large', label: 'Large Multi-Level Home', desc: '4+ Rooms, multiple ACs' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleHouseTypePreset(preset.id as any)}
                className={`p-3 rounded-xl text-left border transition ${
                  houseType === preset.id
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-[#0b0f19] border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{preset.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Supply Voltage</label>
            <select
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="230">230V AC Single-Phase (Philippines standard)</option>
              <option value="120">120V AC Single-Phase (US / North America)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Number of Rooms</label>
            <input
              type="number"
              min="1"
              max="20"
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Convenience Outlets Count</label>
            <input
              type="number"
              min="2"
              max="100"
              value={outlets}
              onChange={(e) => setOutlets(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Lighting Points Count</label>
            <input
              type="number"
              min="2"
              max="100"
              value={lights}
              onChange={(e) => setLights(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Air Conditioners (Units)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={acCount}
              onChange={(e) => setAcCount(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500">Requires dedicated branch circuit</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Water Heaters (Shower Units)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={waterHeaterCount}
              onChange={(e) => setWaterHeaterCount(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500">Requires dedicated GFCI/RCBO breaker</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Major Appliances Included</label>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRefrigerator}
                  onChange={(e) => setHasRefrigerator(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Refrigerator (~300W)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWashingMachine}
                  onChange={(e) => setHasWashingMachine(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Washing Machine (~600W)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Custom Connected Load (W)</label>
            <input
              type="number"
              placeholder="Auto-calculated from appliances"
              value={customLoad}
              onChange={(e) => setCustomLoad(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500">Leave blank for auto-load</span>
          </div>
        </div>
      </div>

      {/* Results in ONE VIEW */}
      {results && (
        <div className="space-y-6">
          {/* Top Summary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121d34] via-[#0f172a] to-[#1d263b] border border-blue-500/30 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white tracking-tight uppercase">
                  Household Electrical Setup Recommendation
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton textToCopy={results.summaryText} label="Copy Setup Summary" />
                <button
                  onClick={reset}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Top Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Connected Load</span>
                <span className="text-lg font-mono font-bold text-white">
                  {results.connectedLoadWatts.toLocaleString()} W
                </span>
                <span className="text-[10px] text-slate-500 block">~{results.demandWatts.toLocaleString()}W demand</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-blue-500/30">
                <span className="text-[11px] text-blue-400 block font-medium">Service Capacity</span>
                <span className="text-lg font-mono font-bold text-blue-300">
                  {results.recServiceAmps} Amps
                </span>
                <span className="text-[10px] text-slate-500 block">@ {voltage}V Single-Phase</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Main Feeder Wire</span>
                <span className="text-sm font-mono font-bold text-white block mt-1">
                  {results.mainFeederWire.split(' ')[0]} {results.mainFeederWire.split(' ')[1]}
                </span>
                <span className="text-[10px] text-slate-500">THHN Copper</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 block font-medium">Active Circuits</span>
                <span className="text-lg font-mono font-bold text-emerald-300">
                  {results.totalActiveBranches} Circuits
                </span>
                <span className="text-[10px] text-slate-500">Dedicated breakers</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#090d16]/70 border border-purple-500/30">
                <span className="text-[11px] text-purple-400 block font-medium">Distribution Panel</span>
                <span className="text-lg font-mono font-bold text-purple-300">
                  {results.totalPanelSpaces}-Branch
                </span>
                <span className="text-[10px] text-slate-500">Includes {results.spareSpaces} spares</span>
              </div>
            </div>
          </div>

          {/* Cards Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Main Electrical Service */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span>Main Electrical Service</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Total Connected Load:</span>
                    <span className="font-mono font-bold text-white">{results.connectedLoadWatts.toLocaleString()} Watts</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Estimated Demand Load:</span>
                    <span className="font-mono font-bold text-slate-200">{results.demandWatts.toLocaleString()} Watts</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Main Service Capacity:</span>
                    <span className="font-mono font-bold text-blue-300">{results.recServiceAmps} Amperes</span>
                  </div>
                  <div className="py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">Main Service Breaker:</span>
                    <span className="font-mono font-bold text-white">{results.mainBreakerRating}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-slate-400 block mb-0.5">Distribution Enclosure:</span>
                    <span className="font-mono font-bold text-white">{results.totalPanelSpaces}-Space Load Center with Main Breaker</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Sized with diversity factor for simultaneous operation safety.</span>
            </div>

            {/* 2. Recommended Conductor / Wire Sizing */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Cable className="w-4 h-4" />
                  </div>
                  <span>Conductor / Wire Sizing</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">Main Feeder Entrance:</span>
                    <span className="font-mono font-bold text-indigo-300">{results.mainFeederWire}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Lighting Circuits:</span>
                    <span className="font-mono font-bold text-white">2.0 mm² (~14 AWG) THHN</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">General Convenience Outlets:</span>
                    <span className="font-mono font-bold text-white">3.5 mm² (~12 AWG) THHN</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Air Conditioner Circuits:</span>
                    <span className="font-mono font-bold text-indigo-300">3.5 mm² – 5.5 mm² THHN</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Water Heater Circuits:</span>
                    <span className="font-mono font-bold text-indigo-300">5.5 mm² (~10 AWG) THHN</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-amber-400/90 italic">
                Wire sizes are preliminary estimates only. Final conductor sizing must be verified according to actual load, installation method, conductor temperature rating, voltage drop and applicable Philippine electrical code.
              </p>
            </div>

            {/* 3. Circuit Breaker Sizing */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Circuit Breaker Schedule</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Main Circuit Breaker:</span>
                    <span className="font-mono font-bold text-white">{results.recServiceAmps}A 2-Pole 230V</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Lighting ({results.lightingCircuits} branch):</span>
                    <span className="font-mono font-bold text-white">15A 2-Pole MCB</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">General Outlets ({results.outletCircuits} branch):</span>
                    <span className="font-mono font-bold text-white">20A 2-Pole MCB</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Kitchen Counter Outlets:</span>
                    <span className="font-mono font-bold text-emerald-400">20A 2-Pole GFCI/RCBO</span>
                  </div>
                  {results.acs > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Air Conditioner ({results.acs} units):</span>
                      <span className="font-mono font-bold text-white">20A–30A 2-Pole MCB each</span>
                    </div>
                  )}
                  {results.heaters > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Water Heater ({results.heaters} units):</span>
                      <span className="font-mono font-bold text-rose-300">20A–30A 2-Pole 30mA RCBO</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Includes residual current (GFCI/RCBO) for wet area safety.</span>
            </div>

            {/* 4. Outlets & Receptacles */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span>Receptacles & Outlets</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">General Duplex Outlets:</span>
                    <span className="font-mono font-bold text-white">{results.oCount} Duplex Receptacles</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Kitchen Appliance Outlets:</span>
                    <span className="font-mono font-bold text-yellow-300">Dedicated GFI Protected</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Dedicated AC Outlets:</span>
                    <span className="font-mono font-bold text-white">{results.acs} Heavy-Duty Aircon Outlets</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Outdoor / Patio:</span>
                    <span className="font-mono font-bold text-white">Weather-Resistant with In-Use Cover</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Grounding pin mandatory per modern Philippine Electrical Code.</span>
            </div>

            {/* 5. Lighting Layout */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <span>Lighting Architecture</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Total Lighting Points:</span>
                    <span className="font-mono font-bold text-white">{results.lCount} Ceiling Fixtures</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Lighting Branch Circuits:</span>
                    <span className="font-mono font-bold text-white">{results.lightingCircuits} Circuits (Max 12 pts/circ)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Recommended Lamps:</span>
                    <span className="font-mono font-bold text-amber-300">9W – 15W High-Efficiency LED</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Switches:</span>
                    <span className="font-mono font-bold text-white">1-Gang, 2-Gang & 3-Way Stairwell</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">High efficiency LED draws under 15W per fixture.</span>
            </div>

            {/* 6. Distribution Panel Layout */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span>Distribution Panel Space</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Panel Size Recommended:</span>
                    <span className="font-mono font-bold text-purple-300">{results.totalPanelSpaces}-Branch Enclosure</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Main Breaker Space:</span>
                    <span className="font-mono font-bold text-white">Integrated 2-Pole Main</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Active Branch Breakers:</span>
                    <span className="font-mono font-bold text-white">{results.totalActiveBranches} Positions</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Spare Expansion Slots:</span>
                    <span className="font-mono font-bold text-emerald-400">{results.spareSpaces} Positions</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Spare slots prevent costly panel replacement during future remodeling.</span>
            </div>
          </div>

          {/* Household Material Checklist */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Recommended Materials Checklist
              </h4>
              <span className="text-xs text-slate-400 font-mono">Bill of Basic Materials</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs text-slate-300">
              {[
                `Main Distribution Panel (${results.totalPanelSpaces} Branches)`,
                `Main Circuit Breaker (${results.mainBreakerRating})`,
                `Branch Circuit Breakers (${results.totalActiveBranches} pcs)`,
                `Main Feeder Cable (${results.mainFeederWire})`,
                '3.5 mm² THHN/THWN Copper Wire (Outlets)',
                '2.0 mm² THHN/THWN Copper Wire (Lighting)',
                '5.5 mm² THHN/THWN Wire (AC & Water Heater)',
                '8.0 mm² Bare Copper Grounding Wire',
                '5/8" × 8-ft Copper-Clad Ground Rod',
                'Brass Ground Rod Clamp',
                'Utility Boxes (PVC 2×4)',
                'Junction Boxes (PVC 4×4 with covers)',
                'Duplex Convenience Outlets (3-prong grounded)',
                'Light Switches (1-Gang, 2-Gang, 3-Gang)',
                'LED Ceiling Fixtures & Downlights',
                'PVC / EMT Electrical Conduit & Fittings',
                'Conduit Clamps & Unistrut Supports',
                'Screw-On Wire Connectors (Wire Nuts)',
                'Electrical Tape (Vinyl, UL Listed)',
                'Terminal Cable Lugs & Ferrules',
                'Circuit Directory Labels & Warning Tags',
                'Type 2 AC Surge Protection Device (SPD)',
                'Residual Current Breaker (RCBO / GFCI)',
                'Weatherproof Outlet In-Use Enclosures',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-[#0b0f19] border border-slate-800/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Electrical Safety Notice */}
          <DisclaimerBox
            title="Important Electrical Safety & Licensing Disclaimer"
            text="IMPORTANT: This calculator provides preliminary estimates for planning purposes only. Final electrical design, wire sizing, breaker sizing, grounding, protection and installation must be verified by a qualified electrician and according to applicable Philippine electrical codes, equipment specifications and site conditions."
          />
        </div>
      )}
    </div>
  );
};
