export interface ApplianceLoad {
  id: string;
  name: string;
  watts: number;
  amps?: number;
  volts?: number;
  hoursPerDay: number;
  quantity: number;
  whPerDay: number;
}

export interface SolarWizardState {
  // Step 1 & 2: Appliances
  appliances: ApplianceLoad[];
  dailyEnergyWh: number;
  dailyEnergyKwh: number;
  totalContinuousWatts: number;
  totalSurgeWatts: number;

  // Step 3: Losses & Margins
  solarLossPercent: number;
  batteryLossPercent: number;
  inverterLossPercent: number;
  wireLossPercent: number;
  systemLossPercent: number;
  safetyMarginPercent: number;
  adjustedDailyWh: number;

  // Step 4: Battery
  batteryType: 'lithium' | 'lead_acid';
  batteryBankVoltage: number; // 12, 24, 36, 48
  batteryUnitCapacityAh: number; // e.g. 100Ah, 200Ah
  backupHours: number;
  batteryDodPercent: number; // e.g. 80% for lithium, 50% for lead acid
  batteryEfficiencyPercent: number; // 90-95%
  requiredBatteryWh: number;
  requiredBatteryAh: number;
  recommendedBatteryAh: number;
  batterySeriesCount: number;
  batteryParallelCount: number;
  totalBatteryCount: number;
  usableBatteryWh: number;

  // Step 5: Solar Array
  peakSunHours: number;
  panelPmax: number; // Watts
  panelVoc: number; // Volts
  panelVmp: number; // Volts
  panelIsc: number; // Amps
  panelImp: number; // Amps
  panelMaxSystemVoltage: number; // Volts, e.g. 1000
  panelMaxSeriesFuse: number; // Amps, e.g. 25
  panelModuleApplication: string; // Free text, e.g. "Class A / Residential Rooftop"
  requiredPvWattage: number;
  recommendedPanelWattage: number;
  totalPanels: number;
  panelsInSeries: number;
  panelsInParallel: number;
  totalPvWattage: number;
  estimatedDailyPvProductionWh: number;
  arrayVoc: number;
  arrayVmp: number;
  arrayIsc: number;
  arrayImp: number;

  // Step 6: Charge Controller
  controllerType: 'mppt' | 'pwm';
  controllerSafetyMargin: number; // 1.25
  requiredControllerAmps: number;
  recommendedControllerAmps: number;
  recommendedControllerVoltage: number;
  controllerMaxPvVoc: number; // e.g. 150V, 250V
  isPvVoltageExceeded: boolean;

  // Step 7: Inverter
  inverterType: 'psw' | 'msw';
  inverterEfficiency: number; // e.g. 90%
  inverterSafetyMargin: number; // 25%
  requiredContinuousWattage: number;
  estimatedSurgeWattage: number;
  recommendedInverterWattage: number;
  acOutputVoltage: number; // 230V
  acOutputCurrentAmps: number;
  batteryDcDrawAmps: number;

  // Step 8: Protection
  pvDcBreakerRating: number;
  pvDcIsolatorRating: number;
  pvSpdRecommended: boolean;
  pvCombinerBoxRequired: boolean;
  batteryFuseRating: number;
  batteryDcDisconnectRating: number;
  inverterAcBreakerRating: number;
  houseMainBreakerRating: number;

  // Step 9: Wiring
  pvCableLengthMeters: number;
  pvCableMm2: number;
  batteryCableLengthMeters: number;
  batteryCableMm2: number;
  inverterAcCableLengthMeters: number;
  inverterAcCableMm2: number;
  groundingCableMm2: number;

  // Step 10: Household Outlets
  generalOutletsCount: number;
  lightingPointsCount: number;
  dedicatedCircuitsCount: number;
}

export const PRESET_APPLIANCES: Omit<ApplianceLoad, 'id' | 'whPerDay'>[] = [
  { name: 'LED Light Bulbs', watts: 10, hoursPerDay: 6, quantity: 6 },
  { name: 'Electric Fan', watts: 60, hoursPerDay: 8, quantity: 2 },
  { name: 'Refrigerator (Inverter)', watts: 150, hoursPerDay: 12, quantity: 1 },
  { name: 'Television (Smart TV)', watts: 100, hoursPerDay: 4, quantity: 1 },
  { name: 'Laptop Computer', watts: 65, hoursPerDay: 4, quantity: 1 },
  { name: 'WiFi Router', watts: 15, hoursPerDay: 24, quantity: 1 },
  { name: 'Smartphone Chargers', watts: 15, hoursPerDay: 3, quantity: 2 },
  { name: 'Rice Cooker', watts: 600, hoursPerDay: 1, quantity: 1 },
  { name: 'Washing Machine', watts: 500, hoursPerDay: 1, quantity: 1 },
  { name: 'Water Pump (0.5 HP)', watts: 750, hoursPerDay: 1, quantity: 1 },
  { name: 'Air Conditioner (1.0 HP)', watts: 1000, hoursPerDay: 6, quantity: 1 },
];

export const INITIAL_APPLIANCES: ApplianceLoad[] = [
  { id: 'app-1', name: 'LED Light Bulbs', watts: 10, hoursPerDay: 6, quantity: 6, whPerDay: 360 },
  { id: 'app-2', name: 'Electric Fan', watts: 60, hoursPerDay: 8, quantity: 2, whPerDay: 960 },
  { id: 'app-3', name: 'Refrigerator (Inverter)', watts: 150, hoursPerDay: 12, quantity: 1, whPerDay: 1800 },
  { id: 'app-4', name: 'WiFi Router', watts: 15, hoursPerDay: 24, quantity: 1, whPerDay: 360 },
  { id: 'app-5', name: 'Laptop & Phones', watts: 65, hoursPerDay: 4, quantity: 1, whPerDay: 260 },
  { id: 'app-6', name: 'Television', watts: 100, hoursPerDay: 3, quantity: 1, whPerDay: 300 },
];
