import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { ArrowRightLeft, RotateCcw, Scale } from 'lucide-react';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'speed' | 'storage' | 'area' | 'pressure';

interface UnitDef {
  id: string;
  name: string;
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
}

const CATEGORIES: Record<
  UnitCategory,
  { name: string; baseUnit: string; units: Record<string, UnitDef> }
> = {
  length: {
    name: 'Length & Distance',
    baseUnit: 'meter',
    units: {
      mm: { id: 'mm', name: 'Millimeter (mm)', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      cm: { id: 'cm', name: 'Centimeter (cm)', toBase: (v) => v / 100, fromBase: (b) => b * 100 },
      m: { id: 'm', name: 'Meter (m)', toBase: (v) => v, fromBase: (b) => b },
      km: { id: 'km', name: 'Kilometer (km)', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      inch: { id: 'inch', name: 'Inch (in)', toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
      ft: { id: 'ft', name: 'Foot (ft)', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      yd: { id: 'yd', name: 'Yard (yd)', toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      mile: { id: 'mile', name: 'Mile (mi)', toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
    },
  },
  weight: {
    name: 'Mass & Weight',
    baseUnit: 'kilogram',
    units: {
      mg: { id: 'mg', name: 'Milligram (mg)', toBase: (v) => v / 1000000, fromBase: (b) => b * 1000000 },
      g: { id: 'g', name: 'Gram (g)', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      kg: { id: 'kg', name: 'Kilogram (kg)', toBase: (v) => v, fromBase: (b) => b },
      ton: { id: 'ton', name: 'Metric Ton (t)', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      oz: { id: 'oz', name: 'Ounce (oz)', toBase: (v) => v * 0.0283495, fromBase: (b) => b / 0.0283495 },
      lb: { id: 'lb', name: 'Pound (lb)', toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
      stone: { id: 'stone', name: 'Stone (st)', toBase: (v) => v * 6.35029, fromBase: (b) => b / 6.35029 },
    },
  },
  temperature: {
    name: 'Temperature',
    baseUnit: 'celsius',
    units: {
      c: { id: 'c', name: 'Celsius (°C)', toBase: (v) => v, fromBase: (b) => b },
      f: { id: 'f', name: 'Fahrenheit (°F)', toBase: (v) => (v - 32) * (5 / 9), fromBase: (b) => b * (9 / 5) + 32 },
      k: { id: 'k', name: 'Kelvin (K)', toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
    },
  },
  speed: {
    name: 'Speed & Velocity',
    baseUnit: 'mps',
    units: {
      mps: { id: 'mps', name: 'Meters/sec (m/s)', toBase: (v) => v, fromBase: (b) => b },
      kmh: { id: 'kmh', name: 'Kilometers/hour (km/h)', toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      mph: { id: 'mph', name: 'Miles/hour (mph)', toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      knot: { id: 'knot', name: 'Knots (kn)', toBase: (v) => v * 0.514444, fromBase: (b) => b / 0.514444 },
    },
  },
  storage: {
    name: 'Digital Data Storage',
    baseUnit: 'bytes',
    units: {
      b: { id: 'b', name: 'Bytes (B)', toBase: (v) => v, fromBase: (b) => b },
      kb: { id: 'kb', name: 'Kilobytes (KB - 1000)', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      kib: { id: 'kib', name: 'Kibibytes (KiB - 1024)', toBase: (v) => v * 1024, fromBase: (b) => b / 1024 },
      mb: { id: 'mb', name: 'Megabytes (MB - 1000)', toBase: (v) => v * 1000000, fromBase: (b) => b / 1000000 },
      mib: { id: 'mib', name: 'Mebibytes (MiB - 1024)', toBase: (v) => v * 1048576, fromBase: (b) => b / 1048576 },
      gb: { id: 'gb', name: 'Gigabytes (GB - 1000)', toBase: (v) => v * 1e9, fromBase: (b) => b / 1e9 },
      gib: { id: 'gib', name: 'Gibibytes (GiB - 1024)', toBase: (v) => v * 1073741824, fromBase: (b) => b / 1073741824 },
      tb: { id: 'tb', name: 'Terabytes (TB)', toBase: (v) => v * 1e12, fromBase: (b) => b / 1e12 },
    },
  },
  area: {
    name: 'Area & Surface',
    baseUnit: 'sqm',
    units: {
      sqm: { id: 'sqm', name: 'Square Meters (m²)', toBase: (v) => v, fromBase: (b) => b },
      sqft: { id: 'sqft', name: 'Square Feet (ft²)', toBase: (v) => v * 0.092903, fromBase: (b) => b / 0.092903 },
      sqkm: { id: 'sqkm', name: 'Square Kilometers (km²)', toBase: (v) => v * 1000000, fromBase: (b) => b / 1000000 },
      acre: { id: 'acre', name: 'Acres (ac)', toBase: (v) => v * 4046.86, fromBase: (b) => b / 4046.86 },
      ha: { id: 'ha', name: 'Hectares (ha)', toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
    },
  },
  pressure: {
    name: 'Pressure',
    baseUnit: 'pascal',
    units: {
      pa: { id: 'pa', name: 'Pascal (Pa)', toBase: (v) => v, fromBase: (b) => b },
      kpa: { id: 'kpa', name: 'Kilopascal (kPa)', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      bar: { id: 'bar', name: 'Bar (bar)', toBase: (v) => v * 100000, fromBase: (b) => b / 100000 },
      psi: { id: 'psi', name: 'PSI (Pounds/sq in)', toBase: (v) => v * 6894.76, fromBase: (b) => b / 6894.76 },
      atm: { id: 'atm', name: 'Standard Atmosphere (atm)', toBase: (v) => v * 101325, fromBase: (b) => b / 101325 },
    },
  },
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<number | string>(100);
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const keys = Object.keys(CATEGORIES[newCat].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const reset = () => {
    handleCategoryChange('length');
    setInputValue(100);
  };

  const convertedValue = useMemo(() => {
    const val = Number(inputValue);
    if (isNaN(val)) return '';

    const catData = CATEGORIES[category];
    const source = catData.units[fromUnit];
    const target = catData.units[toUnit];

    if (!source || !target) return '';

    const baseVal = source.toBase(val);
    const targetVal = target.fromBase(baseVal);

    // Format output cleanly
    if (Math.abs(targetVal) < 0.0001 && targetVal !== 0) {
      return targetVal.toExponential(4);
    }
    return Math.round(targetVal * 100000) / 100000;
  }, [category, inputValue, fromUnit, toUnit]);

  const currentUnits: Record<string, UnitDef> = CATEGORIES[category].units;
  const unitsList: UnitDef[] = Object.values(currentUnits);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Universal Metric & Imperial Unit Converter</h3>
              <p className="text-xs text-slate-400">Accurately translate length, weight, speed, temperature, pressure, and digital data storage</p>
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

        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
          {(Object.keys(CATEGORIES) as UnitCategory[]).map((catKey) => (
            <button
              key={catKey}
              onClick={() => handleCategoryChange(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                category === catKey
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {CATEGORIES[catKey].name}
            </button>
          ))}
        </div>

        {/* Conversion Controls */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
          {/* From */}
          <div className="p-4 bg-[#0b0f19] border border-slate-700/80 rounded-2xl space-y-2">
            <label className="block text-xs font-medium text-slate-400">From</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-mono text-white focus:outline-none focus:border-indigo-500"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {unitsList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-1 md:my-0">
            <button
              onClick={swapUnits}
              title="Swap units"
              className="p-3 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition shadow"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To */}
          <div className="p-4 bg-[#0b0f19] border border-slate-700/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-400">To (Result)</label>
              <CopyButton textToCopy={convertedValue.toString()} variant="icon" />
            </div>
            <div className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-mono text-indigo-400 font-bold truncate">
              {convertedValue !== '' ? convertedValue : '—'}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {unitsList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick common comparisons table */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 block mb-2">Equivalent In All {CATEGORIES[category].name} Units:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {unitsList.map((u) => {
              const base = currentUnits[fromUnit]?.toBase(Number(inputValue) || 0) || 0;
              const converted = u.fromBase(base);
              const formatted =
                Math.abs(converted) < 0.0001 && converted !== 0
                  ? converted.toExponential(3)
                  : Math.round(converted * 1000) / 1000;

              return (
                <div key={u.id} className="p-2 rounded-xl bg-[#0b0f19] border border-slate-800/80 text-xs">
                  <div className="text-[11px] text-slate-500 truncate">{u.name}</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5 truncate">{formatted}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
