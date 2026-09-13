import { ApplianceLoad, SolarWizardState } from './solarTypes';

export function calculateApplianceWh(watts: number, hours: number, qty: number): number {
  return Math.round(watts * hours * qty);
}

export function calculateApplianceTotals(appliances: ApplianceLoad[]) {
  let totalDailyWh = 0;
  let continuousWatts = 0;
  let surgeWatts = 0;

  for (const app of appliances) {
    const wh = calculateApplianceWh(app.watts, app.hoursPerDay, app.quantity);
    totalDailyWh += wh;
    const running = app.watts * app.quantity;
    continuousWatts += running;

    // Detect inductive / compressor / motor loads for surge estimation
    const isInductive = /air\s*con|refrig|pump|compressor|wash|motor|drill/i.test(app.name);
    const surgeMultiplier = isInductive ? 3.0 : 1.25;
    surgeWatts += running * surgeMultiplier;
  }

  return {
    totalDailyWh,
    totalDailyKwh: Math.round((totalDailyWh / 1000) * 100) / 100,
    continuousWatts: Math.round(continuousWatts),
    surgeWatts: Math.round(surgeWatts),
  };
}

// Recommended standard metric cable mm² table with ampacity at 30°C in conduit
export const CABLE_OPTIONS = [
  { mm2: 1.5, ampacity: 15, resistancePerKm: 12.1 },
  { mm2: 2.0, ampacity: 20, resistancePerKm: 9.1 },
  { mm2: 2.5, ampacity: 24, resistancePerKm: 7.41 },
  { mm2: 3.5, ampacity: 30, resistancePerKm: 5.2 },
  { mm2: 4.0, ampacity: 34, resistancePerKm: 4.61 },
  { mm2: 5.5, ampacity: 40, resistancePerKm: 3.3 },
  { mm2: 6.0, ampacity: 44, resistancePerKm: 3.08 },
  { mm2: 8.0, ampacity: 55, resistancePerKm: 2.3 },
  { mm2: 10, ampacity: 65, resistancePerKm: 1.83 },
  { mm2: 16, ampacity: 85, resistancePerKm: 1.15 },
  { mm2: 25, ampacity: 115, resistancePerKm: 0.727 },
  { mm2: 35, ampacity: 145, resistancePerKm: 0.524 },
  { mm2: 50, ampacity: 180, resistancePerKm: 0.387 },
  { mm2: 70, ampacity: 225, resistancePerKm: 0.268 },
  { mm2: 95, ampacity: 275, resistancePerKm: 0.193 },
];

export function sizeCable(
  currentAmps: number,
  lengthMeters: number,
  circuitVoltage: number,
  maxDropPercent = 3.0
): { recommendedMm2: number; ampacity: number; actualDropVolts: number; actualDropPercent: number } {
  const current = Math.max(0.5, currentAmps);
  const v = Math.max(12, circuitVoltage);
  const maxDropVolts = (v * maxDropPercent) / 100;

  for (const cable of CABLE_OPTIONS) {
    if (cable.ampacity >= current) {
      // 2-wire circuit round trip distance = 2 * lengthMeters
      const loopLengthKm = (2 * lengthMeters) / 1000;
      const resistance = cable.resistancePerKm * loopLengthKm;
      const dropVolts = current * resistance;
      const dropPercent = (dropVolts / v) * 100;

      if (dropVolts <= maxDropVolts) {
        return {
          recommendedMm2: cable.mm2,
          ampacity: cable.ampacity,
          actualDropVolts: Math.round(dropVolts * 100) / 100,
          actualDropPercent: Math.round(dropPercent * 10) / 10,
        };
      }
    }
  }

  // Fallback to largest cable
  const largest = CABLE_OPTIONS[CABLE_OPTIONS.length - 1];
  return {
    recommendedMm2: largest.mm2,
    ampacity: largest.ampacity,
    actualDropVolts: 0.5,
    actualDropPercent: 1.0,
  };
}
