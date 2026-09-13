import React from 'react';
import { ToolDefinition } from '../../types';
import { CATEGORIES } from '../../data/toolsData';
import { IconRenderer } from '../common/IconRenderer';
import { FavoriteButton } from '../common/FavoriteButton';
import { ArrowLeft, Sparkles } from 'lucide-react';

// IT Tools
import { IpCalculator } from './it/IpCalculator';
import { SubnetCalculator } from './it/SubnetCalculator';
import { WifiSignalCalculator } from './it/WifiSignalCalculator';
import { BandwidthCalculator } from './it/BandwidthCalculator';
import { CmdReference } from './it/CmdReference';
import { WindowsTools } from './it/WindowsTools';

// Calculators
import { PercentageCalculator } from './calculators/PercentageCalculator';
import { AgeCalculator } from './calculators/AgeCalculator';
import { DateCalculator } from './calculators/DateCalculator';
import { LoanCalculator } from './calculators/LoanCalculator';
import { SalaryCalculator } from './calculators/SalaryCalculator';
import { DiscountCalculator } from './calculators/DiscountCalculator';
import { ProfitCalculator } from './calculators/ProfitCalculator';
import { NumberCalculator } from './calculators/NumberCalculator';
import { ElectricityCalculator } from './calculators/ElectricityCalculator';

// Motorcycle Tools
import { FuelCalculator } from './motorcycle/FuelCalculator';
import { TripCostCalculator } from './motorcycle/TripCostCalculator';
import { KmLCalculator } from './motorcycle/KmLCalculator';
import { MaintenanceTracker } from './motorcycle/MaintenanceTracker';

// Solar System
import { SolarSystemCalculator } from './solar/SolarSystemCalculator';
import { SolarSetupWizard } from './solar/SolarSetupWizard';
import { BatteryCalculator } from './solar/BatteryCalculator';
import { InverterCalculator } from './solar/InverterCalculator';
import { ChargeControllerCalculator } from './solar/ChargeControllerCalculator';
import { SolarWireProtectionCalculator } from './solar/SolarWireProtectionCalculator';
import { SolarSystemSummaryView } from './solar/SolarSystemSummaryView';
import { WattageCalculator } from './solar/WattageCalculator';
import { OhmsLawCalculator } from './solar/OhmsLawCalculator';
import { EnergyCostCalculator } from './solar/EnergyCostCalculator';
import { VoltageDropCalculator } from './solar/VoltageDropCalculator';
import { WireSizeEstimator } from './solar/WireSizeEstimator';
import { HouseholdElectricalSetup } from './solar/HouseholdElectricalSetup';

// Household Electricity
import { HouseholdWiringCalculator } from './electricity/HouseholdWiringCalculator';
import { HouseholdPanelBoard } from './electricity/HouseholdPanelBoard';
import { ElectricityConsumption } from './electricity/ElectricityConsumption';
import { ElectricityBillCalculator } from './electricity/ElectricityBillCalculator';

// Unit & Image
import { UnitConverter } from './unit/UnitConverter';
import { ImageTools } from './image/ImageTools';
import { DonationSection } from '../common/DonationSection';
import { FeedbackCard } from '../common/FeedbackCard';
import { SocialMediaSection } from '../common/SocialMediaSection';

interface ToolHostProps {
  tool: ToolDefinition;
  onBack: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const ToolHost: React.FC<ToolHostProps> = ({ tool, onBack, onSelectCategory }) => {
  const category = CATEGORIES.find((c) => c.id === tool.categoryId);

  const renderToolComponent = () => {
    switch (tool.id) {
      // IT
      case 'ip-calculator':
        return <IpCalculator />;
      case 'subnet-calculator':
        return <SubnetCalculator />;
      case 'wifi-signal':
        return <WifiSignalCalculator />;
      case 'bandwidth-calculator':
        return <BandwidthCalculator />;
      case 'cmd-reference':
        return <CmdReference />;
      case 'windows-tools':
        return <WindowsTools />;

      // Calculators: General
      case 'percentage-calculator':
        return <PercentageCalculator />;
      case 'age-calculator':
        return <AgeCalculator />;
      case 'date-calculator':
        return <DateCalculator />;
      case 'loan-calculator':
        return <LoanCalculator />;
      case 'salary-calculator':
        return <SalaryCalculator />;
      case 'discount-calculator':
        return <DiscountCalculator />;
      case 'profit-calculator':
        return <ProfitCalculator />;
      case 'number-calculator':
        return <NumberCalculator />;

      // Motorcycle
      case 'fuel-calculator':
        return <FuelCalculator />;
      case 'trip-cost':
        return <TripCostCalculator />;
      case 'kml-calculator':
        return <KmLCalculator />;
      case 'motorcycle-maintenance':
        return <MaintenanceTracker />;

      // Solar System
      case 'solar-setup':
        return <SolarSetupWizard />;
      case 'solar-system':
      case 'solar-panel':
        return <SolarSystemCalculator />;
      case 'battery-calculator':
        return <BatteryCalculator />;
      case 'inverter-calculator':
        return <InverterCalculator />;
      case 'charge-controller':
        return <ChargeControllerCalculator />;
      case 'solar-wire':
      case 'solar-protection':
      case 'solar-wire-protection':
        return <SolarWireProtectionCalculator />;
      case 'solar-summary':
        return <SolarSystemSummaryView />;
      case 'wattage-calculator':
        return <WattageCalculator />;
      case 'ohms-law':
        return <OhmsLawCalculator />;
      case 'energy-cost':
        return <EnergyCostCalculator />;
      case 'voltage-drop':
        return <VoltageDropCalculator />;
      case 'wire-size':
        return <WireSizeEstimator />;

      // Household Electricity
      case 'household-wiring':
        return <HouseholdWiringCalculator />;
      case 'household-panel':
        return <HouseholdPanelBoard />;
      case 'electricity-consumption':
        return <ElectricityConsumption />;
      case 'electricity-bill':
        return <ElectricityBillCalculator />;
      case 'household-electrical':
        return <HouseholdElectricalSetup />;
      case 'electricity-calculator':
        return <ElectricityCalculator />;

      // Units & Image
      case 'unit-converter':
        return <UnitConverter />;
      case 'image-resize':
      case 'image-compress':
      case 'image-convert':
      case 'image-resolution-enhancer':
      case 'image-crop':
      case 'image-rotate':
      case 'image-adjustments':
      case 'image-watermark':
      case 'image-background':
      case 'image-info':
      case 'image-metadata-cleaner':
      case 'image-merge':
      case 'image-to-pdf':
      case 'image-screenshot-optimizer':
      case 'image-dpi-calculator':
        return <ImageTools activeToolId={tool.id} />;

      // Donation & Feedback
      case 'buy-me-a-coffee':
        return <DonationSection />;

      case 'feedback':
        return (
          <div className="space-y-6">
            <FeedbackCard />
            <SocialMediaSection />
          </div>
        );

      default:
        return (
          <div className="p-8 text-center text-slate-400">
            Tool under construction. Please check back soon!
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tool Header Banner */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {category && (
              <button
                onClick={() => onSelectCategory && onSelectCategory(category.id)}
                className="text-xs text-slate-400 hover:text-blue-400 transition flex items-center gap-1.5"
              >
                <span>/</span>
                <IconRenderer icon={category.icon} className="w-3.5 h-3.5" />
                <span>{category.name}</span>
              </button>
            )}
          </div>

          <FavoriteButton toolId={tool.id} size="lg" showLabel={true} />
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/5">
              <IconRenderer icon={tool.icon} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {tool.name}
                </h1>
                {tool.popular && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5" />
                    Popular
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
                {tool.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {tool.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Render the active tool component */}
      <div className="pt-2">{renderToolComponent()}</div>
    </div>
  );
};
