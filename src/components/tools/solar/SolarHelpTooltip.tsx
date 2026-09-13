import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export const SOLAR_GLOSSARY: Record<string, { title: string; full: string; explanation: string }> = {
  PMAX: {
    title: 'Pmax — Maximum Power',
    full: 'Maximum Power Output under STC (Watts)',
    explanation:
      'The highest wattage a solar panel can produce under Standard Test Conditions (1000 W/m² irradiance, 25°C cell temperature). For example, a 550W panel has Pmax = 550W.',
  },
  VOC: {
    title: 'Voc — Open Circuit Voltage',
    full: 'Open-Circuit Voltage (Volts)',
    explanation:
      'The maximum voltage across panel terminals when not connected to any load. In cold weather, Voc rises. Your total series Voc MUST never exceed the charge controller maximum PV input voltage limit.',
  },
  VMP: {
    title: 'Vmp — Maximum Power Voltage',
    full: 'Voltage at Maximum Power (Volts)',
    explanation:
      'The voltage output when the panel is actively generating maximum power under load. For a 24V or 48V system, Vmp of strings determines how efficiently your MPPT controller operates.',
  },
  ISC: {
    title: 'Isc — Short Circuit Current',
    full: 'Short-Circuit Current (Amps)',
    explanation:
      'The absolute maximum current when panel positive and negative leads are shorted together. Electrical codes require sizing fuses and conductors to at least 125% to 156% of Isc.',
  },
  IMP: {
    title: 'Imp — Maximum Power Current',
    full: 'Current at Maximum Power (Amps)',
    explanation:
      'The working current delivered when the solar panel is operating at peak wattage. Parallel solar strings add Imp together.',
  },
  DOD: {
    title: 'DOD — Depth of Discharge',
    full: 'Depth of Discharge (%)',
    explanation:
      'The percentage of battery capacity used up during a cycle. For Lead-Acid batteries, keep DOD at 50% max to prevent premature death. For Lithium (LiFePO4), 80% to 90% DOD is safe and standard.',
  },
  MPPT: {
    title: 'MPPT — Max Power Point Tracking',
    full: 'Maximum Power Point Tracking Controller',
    explanation:
      'A smart electronic DC-to-DC converter that continuously tracks optimal panel voltage and converts excess voltage into extra charging current, harvesting up to 30% more energy than basic PWM controllers.',
  },
  PWM: {
    title: 'PWM — Pulse Width Modulation',
    full: 'Pulse Width Modulation Controller',
    explanation:
      'A simpler, lower-cost controller that connects panels directly to batteries. It forces panel voltage down to battery voltage, wasting excess voltage. Only recommended for small budget 12V single-panel setups.',
  },
  PSW: {
    title: 'PSW — Pure Sine Wave',
    full: 'Pure Sine Wave Inverter',
    explanation:
      'Produces clean, smooth AC electricity identical to or cleaner than utility power. Essential for refrigerators, air conditioners, fans, pumps, power tools, and sensitive electronics.',
  },
  MSW: {
    title: 'MSW — Modified Sine Wave',
    full: 'Modified Sine Wave Inverter',
    explanation:
      'Produces a choppy, stepped square wave. Cheaper, but causes humming, buzzing, motor overheating, efficiency loss, and can permanently damage refrigerators, digital electronics, and pumps.',
  },
  Ah: {
    title: 'Ah — Ampere-hour',
    full: 'Ampere-hour (Electric Charge Capacity)',
    explanation:
      'Measures electric storage capacity. A 100Ah battery can theoretically supply 5 Amps for 20 hours or 10 Amps for 10 hours at its nominal voltage.',
  },
  Wh: {
    title: 'Wh — Watt-hour',
    full: 'Watt-hour (Electrical Energy)',
    explanation:
      'The fundamental unit of energy consumed or stored over time. Wh = Watts × Hours. For example, a 65W laptop running for 4 hours consumes 260 Wh/day.',
  },
  kWh: {
    title: 'kWh — Kilowatt-hour',
    full: 'Kilowatt-hour (1,000 Watt-hours)',
    explanation:
      'Equal to 1,000 Watt-hours. Electricity utility meters measure your bill in kWh. For example, 3,850 Wh equals 3.85 kWh.',
  },
};

interface SolarHelpTooltipProps {
  term: string;
  label?: string;
  className?: string;
}

export const SolarHelpTooltip: React.FC<SolarHelpTooltipProps> = ({ term, label, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = SOLAR_GLOSSARY[term.toUpperCase()] || {
    title: term,
    full: term,
    explanation: 'Technical term used in solar photovoltaic and electrical design.',
  };

  return (
    <span className={`inline-flex items-center gap-1 relative ${className}`}>
      {label && <span>{label}</span>}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title={`What is ${term}? Click for explanation.`}
        className="inline-flex items-center justify-center text-amber-400 hover:text-amber-300 p-0.5 rounded hover:bg-amber-500/20 transition cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#0f172a] border border-amber-500/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-3 text-left animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-bold">
                  {term.toUpperCase()}
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">{info.title}</h4>
                <p className="text-[11px] text-slate-400">{info.full}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              {info.explanation}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};
