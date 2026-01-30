import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Zap, Settings, WashingMachine } from 'lucide-react';

import HeroCostCard from './HeroCostCard';
import MonthlySummaryCard from './MonthlySummaryCard';
import StatsGrid from './StatsGrid';
import TariffsWidget from './TariffsWidget';
import ConfigurationDialog from './ConfigurationDialog';
import { useLaundryData } from '@/hooks/useLaundryData';
import { CURRENCIES } from './TariffsPanel';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const defaultConfig = {
  currency: 'EUR',
  electricityRate: 0.25,
  waterRate: 3.50,
  laborRate: 12.00,
  season: 'summer',
  tariffMode: 'standard',
  locationId: null,
  washingMachineId: null,
  dryingMachineId: null,
  ironingMachineId: null,
  cyclesPerMonth: 200,
  operationalVolume: 1000,
  operationalPeriod: 'month',
  loadPercentage: 80.0,
  tariffModePrice: 1.0
};

export default function LaundryDashboard() {
  // --- State Management ---
  const [config, setConfig] = useState(defaultConfig);
  const [costData, setCostData] = useState(null);
  const [selectedChemicals, setSelectedChemicals] = useState([]);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [isCalculating, setIsCalculating] = useState(true);

  // --- Custom Hook for Data ---
  const laundryData = useLaundryData();
  const { washingMachines, dryingMachines } = laundryData; // Destructure for calculation use

  const currencySymbol = CURRENCIES[config.currency]?.symbol || '€';

  // --- Configuration Management ---
  const fetchLatestConfig = async () => {
    try {
      const configRes = await axios.get(`${API}/configurations/latest`);
      if (configRes.data) {
        setConfig({
          currency: configRes.data.currency || 'EUR',
          electricityRate: configRes.data.electricity_rate,
          waterRate: configRes.data.water_rate,
          laborRate: configRes.data.labor_rate,
          season: configRes.data.season,
          tariffMode: configRes.data.tariff_mode,
          locationId: configRes.data.location_id,
          washingMachineId: configRes.data.washing_machine_id,
          dryingMachineId: configRes.data.drying_machine_id,
          ironingMachineId: configRes.data.ironing_machine_id, // Ensure this is loaded
          cyclesPerMonth: configRes.data.cycles_per_month,
          loadPercentage: configRes.data.load_percentage,
        });
      }
    } catch {
      // No saved config, use defaults
    }
  };

  useEffect(() => {
    fetchLatestConfig();
  }, []);

  const saveConfiguration = async () => {
    try {
      await axios.post(`${API}/configurations`, {
        name: 'Current Configuration',
        currency: config.currency,
        electricity_rate: config.electricityRate,
        water_rate: config.waterRate,
        labor_rate: config.laborRate,
        season: config.season,
        tariff_mode: config.tariffMode,
        location_id: config.locationId,
        washing_machine_id: config.washingMachineId,
        drying_machine_id: config.dryingMachineId,
        ironing_machine_id: config.ironingMachineId,
        cycles_per_month: config.cyclesPerMonth,
        load_percentage: config.loadPercentage
      });
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  const resetConfiguration = () => {
    setConfig(defaultConfig);
    setSelectedChemicals([]);
    toast.info('Configuration reset to defaults');
  };

  // --- Cost Calculation Logic ---
  const calculateCosts = useCallback(async () => {
    try {
      // Calculate cycles based on volume if a washing machine is selected
      let cycles = config.cyclesPerMonth;

      if (config.washingMachineId && config.operationalVolume) {
        const machine = washingMachines.find(m => m.id === config.washingMachineId);
        if (machine && machine.capacity_kg) {
          let multiplier = 1;
          if (config.operationalPeriod === 'day') multiplier = 30;
          if (config.operationalPeriod === 'week') multiplier = 4.33;

          const totalVolume = config.operationalVolume * multiplier;
          const effectiveCapacity = machine.capacity_kg * (config.loadPercentage / 100);
          cycles = effectiveCapacity > 0 ? Math.ceil(totalVolume / effectiveCapacity) : 0;
        }
      }

      // Calculate drying cycles (for display)
      let dryingCycles = 0;
      if (config.dryingMachineId && config.operationalVolume) {
        const machine = dryingMachines.find(m => m.id === config.dryingMachineId);
        if (machine && machine.capacity_kg) {
          let multiplier = 1;
          if (config.operationalPeriod === 'day') multiplier = 30;
          if (config.operationalPeriod === 'week') multiplier = 4.33;

          const totalVolume = config.operationalVolume * multiplier;
          const effectiveCapacity = machine.capacity_kg * (config.loadPercentage / 100);
          dryingCycles = effectiveCapacity > 0 ? Math.ceil(totalVolume / effectiveCapacity) : 0;
        }
      }

      const response = await axios.post(`${API}/calculate-cost`, {
        currency: config.currency,
        electricity_rate: config.electricityRate,
        water_rate: config.waterRate,
        labor_rate: config.laborRate,
        season: config.season,
        tariff_mode: config.tariffMode,
        cycles_per_month: cycles,
        load_percentage: config.loadPercentage,
        washing_machine_id: config.washingMachineId,
        drying_machine_id: config.dryingMachineId,
        ironing_machine_id: config.ironingMachineId,
        chemical_ids: selectedChemicals
      });

      setCostData({ ...response.data, displayedCycles: cycles, displayedDryingCycles: dryingCycles });
    } catch (error) {
      console.error('Cost calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [config, selectedChemicals, washingMachines, dryingMachines]);

  useEffect(() => {
    if (!laundryData.isLoading) {
      calculateCosts();
    }
  }, [config, selectedChemicals, laundryData.isLoading, calculateCosts]);

  const toggleChemical = (id) => {
    setSelectedChemicals(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  if (laundryData.isLoading || isCalculating && !costData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container relative z-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
            <WashingMachine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-white">
              Laundry<span className="text-cyan">Digital</span>Twin
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan/10 border border-cyan/20">
            <Zap className="w-4 h-4 text-cyan" />
            <span className="text-sm text-cyan">Live Calculation</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber/10 border border-amber/20">
            <Settings className="w-4 h-4 text-amber" />
            <span className="text-sm text-amber">Real-time Analysis</span>
          </div>
        </div>
      </header>

      {/* Top Row: Hero Cost Card & Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-9 h-full">
          <HeroCostCard
            costData={costData}
            currencySymbol={currencySymbol}
            season={config.season}
            tariffMode={config.tariffMode}
            location={laundryData.locations.find(l => l.id === config.locationId)?.name || 'Select Location'}
          />
        </div>
        <div className="lg:col-span-3 h-full">
          <MonthlySummaryCard
            costData={costData}
            currencySymbol={currencySymbol}
            cyclesPerMonth={costData?.displayedCycles || config.cyclesPerMonth}
            dryingCycles={costData?.displayedDryingCycles || 0}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 h-full">
              <TariffsWidget
                config={config}
                locationName={laundryData.locations.find(l => l.id === config.locationId)?.name}
                onOpenConfig={() => setShowConfigDialog(true)}
              />
            </div>
            <div className="lg:col-span-6 h-full">
              <StatsGrid
                costData={costData}
                currencySymbol={currencySymbol}
                selectedChemicalsCount={selectedChemicals.length}
              />
            </div>
          </div>

          <ConfigurationDialog
            open={showConfigDialog}
            onOpenChange={setShowConfigDialog}
            config={config}
            setConfig={setConfig}
            data={laundryData}
            actions={laundryData.actions}
            currencySymbol={currencySymbol}
            onSave={saveConfiguration}
            onReset={resetConfiguration}
            selectedChemicals={selectedChemicals}
            toggleChemical={toggleChemical}
            setSelectedChemicals={setSelectedChemicals}
          />
        </div>
      </div>
    </div>
  );
}
