import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Zap, Droplets, FlaskConical, Clock, Settings, 
  RotateCcw, Save, Plus, Trash2, WashingMachine, 
  Wind, MapPin, ChevronDown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CostBreakdownChart from './CostBreakdownChart';
import CostImpactChart from './CostImpactChart';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CURRENCIES = {
  EUR: { symbol: '€', name: 'Euro' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna' }
};

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const TARIFF_MODES = ['standard', 'high', 'low'];

const defaultConfig = {
  currency: 'EUR',
  electricityRate: 0.25,
  waterRate: 3.50,
  laborRate: 12.00,
  season: 'summer',
  tariffMode: 'standard',
  locationId: null,
  washingMachineId: null,
  ironingMachineId: null,
  cyclesPerMonth: 200,
  batchWeightKg: 8,
  ironingPercentage: 60,
  ironingTimePerKgMin: 5
};

export default function LaundryDashboard() {
  const [config, setConfig] = useState(defaultConfig);
  const [costData, setCostData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [washingMachines, setWashingMachines] = useState([]);
  const [ironingMachines, setIroningMachines] = useState([]);
  const [chemicals, setChemicals] = useState([]);
  const [selectedChemicals, setSelectedChemicals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showWashingMachineDialog, setShowWashingMachineDialog] = useState(false);
  const [showIroningMachineDialog, setShowIroningMachineDialog] = useState(false);
  const [showChemicalDialog, setShowChemicalDialog] = useState(false);
  
  // Form states
  const [newLocation, setNewLocation] = useState('');
  const [newWashingMachine, setNewWashingMachine] = useState({
    model: '', capacity_kg: 8, water_consumption_l: 50, 
    energy_consumption_kwh: 1.5, cycle_duration_min: 60
  });
  const [newIroningMachine, setNewIroningMachine] = useState({
    model: '', energy_consumption_kwh_per_hour: 2.0
  });
  const [newChemical, setNewChemical] = useState({
    name: '', type: 'washing_powder', package_price: 10, 
    package_weight_g: 1000, usage_per_cycle_g: 50
  });

  const currencySymbol = CURRENCIES[config.currency]?.symbol || '€';

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Calculate costs whenever config changes
  useEffect(() => {
    if (!isLoading) {
      calculateCosts();
    }
  }, [config, selectedChemicals, isLoading]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [locRes, washRes, ironRes, chemRes] = await Promise.all([
        axios.get(`${API}/locations`),
        axios.get(`${API}/washing-machines`),
        axios.get(`${API}/ironing-machines`),
        axios.get(`${API}/chemicals`)
      ]);
      
      setLocations(locRes.data);
      setWashingMachines(washRes.data);
      setIroningMachines(ironRes.data);
      setChemicals(chemRes.data);
      
      // Try to load latest configuration
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
            ironingMachineId: configRes.data.ironing_machine_id,
            cyclesPerMonth: configRes.data.cycles_per_month,
            batchWeightKg: configRes.data.batch_weight_kg,
            ironingPercentage: configRes.data.ironing_percentage,
            ironingTimePerKgMin: configRes.data.ironing_time_per_kg_min
          });
        }
      } catch {
        // No saved config, use defaults
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCosts = useCallback(async () => {
    try {
      const response = await axios.post(`${API}/calculate-cost`, {
        currency: config.currency,
        electricity_rate: config.electricityRate,
        water_rate: config.waterRate,
        labor_rate: config.laborRate,
        season: config.season,
        tariff_mode: config.tariffMode,
        cycles_per_month: config.cyclesPerMonth,
        batch_weight_kg: config.batchWeightKg,
        ironing_percentage: config.ironingPercentage,
        ironing_time_per_kg_min: config.ironingTimePerKgMin,
        washing_machine_id: config.washingMachineId,
        ironing_machine_id: config.ironingMachineId,
        chemical_ids: selectedChemicals
      });
      setCostData(response.data);
    } catch (error) {
      console.error('Cost calculation error:', error);
    }
  }, [config, selectedChemicals]);

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
        ironing_machine_id: config.ironingMachineId,
        cycles_per_month: config.cyclesPerMonth,
        batch_weight_kg: config.batchWeightKg,
        ironing_percentage: config.ironingPercentage,
        ironing_time_per_kg_min: config.ironingTimePerKgMin
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

  // CRUD operations
  const addLocation = async () => {
    if (!newLocation.trim()) return;
    try {
      const res = await axios.post(`${API}/locations`, { name: newLocation });
      setLocations([...locations, res.data]);
      setNewLocation('');
      setShowLocationDialog(false);
      toast.success('Location added');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add location');
    }
  };

  const deleteLocation = async (id) => {
    try {
      await axios.delete(`${API}/locations/${id}`);
      setLocations(locations.filter(l => l.id !== id));
      if (config.locationId === id) {
        setConfig(prev => ({ ...prev, locationId: null }));
      }
      toast.success('Location deleted');
    } catch {
      toast.error('Failed to delete location');
    }
  };

  const addWashingMachine = async () => {
    if (!newWashingMachine.model.trim()) return;
    try {
      const res = await axios.post(`${API}/washing-machines`, newWashingMachine);
      setWashingMachines([...washingMachines, res.data]);
      setNewWashingMachine({
        model: '', capacity_kg: 8, water_consumption_l: 50,
        energy_consumption_kwh: 1.5, cycle_duration_min: 60
      });
      setShowWashingMachineDialog(false);
      toast.success('Washing machine added');
    } catch {
      toast.error('Failed to add washing machine');
    }
  };

  const deleteWashingMachine = async (id) => {
    try {
      await axios.delete(`${API}/washing-machines/${id}`);
      setWashingMachines(washingMachines.filter(m => m.id !== id));
      if (config.washingMachineId === id) {
        setConfig(prev => ({ ...prev, washingMachineId: null }));
      }
      toast.success('Washing machine deleted');
    } catch {
      toast.error('Failed to delete washing machine');
    }
  };

  const addIroningMachine = async () => {
    if (!newIroningMachine.model.trim()) return;
    try {
      const res = await axios.post(`${API}/ironing-machines`, newIroningMachine);
      setIroningMachines([...ironingMachines, res.data]);
      setNewIroningMachine({ model: '', energy_consumption_kwh_per_hour: 2.0 });
      setShowIroningMachineDialog(false);
      toast.success('Ironing machine added');
    } catch {
      toast.error('Failed to add ironing machine');
    }
  };

  const deleteIroningMachine = async (id) => {
    try {
      await axios.delete(`${API}/ironing-machines/${id}`);
      setIroningMachines(ironingMachines.filter(m => m.id !== id));
      if (config.ironingMachineId === id) {
        setConfig(prev => ({ ...prev, ironingMachineId: null }));
      }
      toast.success('Ironing machine deleted');
    } catch {
      toast.error('Failed to delete ironing machine');
    }
  };

  const addChemical = async () => {
    if (!newChemical.name.trim()) return;
    try {
      const res = await axios.post(`${API}/chemicals`, newChemical);
      setChemicals([...chemicals, res.data]);
      setNewChemical({
        name: '', type: 'washing_powder', package_price: 10,
        package_weight_g: 1000, usage_per_cycle_g: 50
      });
      setShowChemicalDialog(false);
      toast.success('Chemical added');
    } catch {
      toast.error('Failed to add chemical');
    }
  };

  const deleteChemical = async (id) => {
    try {
      await axios.delete(`${API}/chemicals/${id}`);
      setChemicals(chemicals.filter(c => c.id !== id));
      setSelectedChemicals(selectedChemicals.filter(cid => cid !== id));
      toast.success('Chemical deleted');
    } catch {
      toast.error('Failed to delete chemical');
    }
  };

  const toggleChemical = (id) => {
    setSelectedChemicals(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const selectedLocation = locations.find(l => l.id === config.locationId);

  if (isLoading) {
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Hero Metric & Stats */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Cost Card */}
          <div className="glass-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400 uppercase tracking-wider">Total Cost per Kilogram</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-cyan/20 text-cyan border border-cyan/30">
                    {config.season}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple/20 text-purple border border-purple/30">
                    {config.tariffMode}
                  </span>
                </div>
                <div className="hero-metric" data-testid="cost-per-kg-display">
                  <span className="hero-metric-value text-white">
                    {currencySymbol}{costData?.cost_per_kg?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-2xl md:text-3xl text-gray-500 ml-1">/kg</span>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  <Zap className="w-4 h-4 inline mr-1 text-cyan" />
                  Real-time calculation based on your inputs
                </p>
              </div>
              
              {/* Cost Distribution Bar */}
              <div className="flex-1 max-w-md">
                <div className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Cost Distribution</div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan"></span>
                    Electricity {currencySymbol}{costData?.electricity_cost_per_kg?.toFixed(3) || '0'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Water {currencySymbol}{costData?.water_cost_per_kg?.toFixed(3) || '0'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple"></span>
                    Chemicals {currencySymbol}{costData?.chemical_cost_per_kg?.toFixed(3) || '0'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber"></span>
                    Labor {currencySymbol}{costData?.labor_cost_per_kg?.toFixed(3) || '0'}
                  </span>
                </div>
                <div className="h-4 rounded-full overflow-hidden bg-white/5 flex">
                  {costData && costData.cost_per_kg > 0 && (
                    <>
                      <div 
                        className="h-full bg-cyan transition-all duration-500"
                        style={{ width: `${(costData.electricity_cost_per_kg / costData.cost_per_kg) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(costData.water_cost_per_kg / costData.cost_per_kg) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-purple transition-all duration-500"
                        style={{ width: `${(costData.chemical_cost_per_kg / costData.cost_per_kg) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-amber transition-all duration-500"
                        style={{ width: `${(costData.labor_cost_per_kg / costData.cost_per_kg) * 100}%` }}
                      />
                    </>
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Electricity & Water</span>
                  <span>Chemicals & Labor</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={<Zap className="w-5 h-5" />}
              iconColor="text-yellow-400"
              bgColor="bg-yellow-400/10"
              label="Monthly Electricity"
              value={costData?.monthly_electricity_kwh?.toFixed(0) || '0'}
              unit="kWh"
              subValue={`${currencySymbol}${costData?.monthly_electricity_cost?.toFixed(2) || '0'}`}
            />
            <StatCard 
              icon={<Droplets className="w-5 h-5" />}
              iconColor="text-blue-400"
              bgColor="bg-blue-400/10"
              label="Monthly Water"
              value={costData?.monthly_water_m3?.toFixed(1) || '0'}
              unit="m³"
              subValue={`${currencySymbol}${costData?.monthly_water_cost?.toFixed(2) || '0'}`}
            />
            <StatCard 
              icon={<FlaskConical className="w-5 h-5" />}
              iconColor="text-purple"
              bgColor="bg-purple/10"
              label="Monthly Chemicals"
              value={`${currencySymbol}${costData?.monthly_chemical_cost?.toFixed(2) || '0'}`}
              unit=""
              subValue={`${selectedChemicals.length} chemicals`}
            />
            <StatCard 
              icon={<Clock className="w-5 h-5" />}
              iconColor="text-amber"
              bgColor="bg-amber/10"
              label="Labor Hours"
              value={costData?.monthly_labor_hours?.toFixed(0) || '0'}
              unit="hrs"
              subValue={`${currencySymbol}${costData?.monthly_labor_cost?.toFixed(2) || '0'}`}
            />
          </div>

          {/* Input Tabs */}
          <div className="glass-card p-6">
            <Tabs defaultValue="tariffs" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1 rounded-xl mb-6">
                <TabsTrigger 
                  value="tariffs" 
                  className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  data-testid="tariffs-tab"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Tariffs
                </TabsTrigger>
                <TabsTrigger 
                  value="machines" 
                  className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  data-testid="machines-tab"
                >
                  <WashingMachine className="w-4 h-4 mr-2" />
                  Machines
                </TabsTrigger>
                <TabsTrigger 
                  value="chemicals" 
                  className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  data-testid="chemicals-tab"
                >
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Chemicals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tariffs" className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-cyan" />
                    <h3 className="font-heading font-semibold text-white">Utility Tariffs</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Set your local utility rates</p>
                  
                  {/* Currency Selector */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <Label className="text-gray-400">Currency</Label>
                    <Select
                      value={config.currency}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="w-32 bg-black/20 border-white/10" data-testid="currency-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR €</SelectItem>
                        <SelectItem value="CZK">CZK Kč</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <SliderInput
                    icon={<Zap className="w-4 h-4 text-cyan" />}
                    label="Electricity Rate"
                    value={config.electricityRate}
                    onChange={(v) => setConfig(prev => ({ ...prev, electricityRate: v }))}
                    min={0.05}
                    max={0.80}
                    step={0.01}
                    unit={`${currencySymbol}/kWh`}
                    color="cyan"
                    testId="electricity-rate-slider"
                  />
                  <SliderInput
                    icon={<Droplets className="w-4 h-4 text-blue-400" />}
                    label="Water Rate"
                    value={config.waterRate}
                    onChange={(v) => setConfig(prev => ({ ...prev, waterRate: v }))}
                    min={0.50}
                    max={10.00}
                    step={0.10}
                    unit={`${currencySymbol}/m³`}
                    color="blue"
                    testId="water-rate-slider"
                  />
                  <SliderInput
                    icon={<Clock className="w-4 h-4 text-amber" />}
                    label="Labor Rate"
                    value={config.laborRate}
                    onChange={(v) => setConfig(prev => ({ ...prev, laborRate: v }))}
                    min={5}
                    max={50}
                    step={0.50}
                    unit={`${currencySymbol}/hr`}
                    color="amber"
                    testId="labor-rate-slider"
                  />
                </div>

                {/* Environment Settings */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-purple" />
                    <h3 className="font-heading font-semibold text-white">Environment Settings</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Location and seasonal adjustments</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm mb-2 block">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        Season
                      </Label>
                      <Select
                        value={config.season}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, season: value }))}
                      >
                        <SelectTrigger className="bg-black/20 border-white/10" data-testid="season-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEASONS.map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm mb-2 block">Tariff Mode</Label>
                      <Select
                        value={config.tariffMode}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, tariffMode: value }))}
                      >
                        <SelectTrigger className="bg-black/20 border-white/10" data-testid="tariff-mode-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TARIFF_MODES.map(m => (
                            <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-gray-400 text-sm">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        Location
                      </Label>
                      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-cyan hover:text-cyan/80" data-testid="add-location-btn">
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#18181b] border-white/10">
                          <DialogHeader>
                            <DialogTitle>Add Location</DialogTitle>
                            <DialogDescription>Create a new location for your laundry facility.</DialogDescription>
                          </DialogHeader>
                          <Input
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            placeholder="Location name"
                            className="bg-black/20 border-white/10"
                            data-testid="new-location-input"
                          />
                          <DialogFooter>
                            <Button onClick={addLocation} className="bg-cyan text-black hover:bg-cyan/90" data-testid="save-location-btn">
                              Save Location
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select
                      value={config.locationId || ''}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, locationId: value || null }))}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10" data-testid="location-select">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(loc => (
                          <SelectItem key={loc.id} value={loc.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{loc.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {locations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {locations.map(loc => (
                          <span 
                            key={loc.id} 
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/5 rounded-full"
                          >
                            {loc.name}
                            <button
                              onClick={() => deleteLocation(loc.id)}
                              className="text-gray-400 hover:text-red-400"
                              data-testid={`delete-location-${loc.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Operational Settings */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-amber" />
                    <h3 className="font-heading font-semibold text-white">Operational Settings</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Monthly cycles and batch configuration</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label className="text-gray-400 text-sm mb-2 block">Cycles per Month</Label>
                      <Input
                        type="number"
                        value={config.cyclesPerMonth}
                        onChange={(e) => setConfig(prev => ({ ...prev, cyclesPerMonth: parseInt(e.target.value) || 0 }))}
                        className="bg-black/20 border-white/10"
                        data-testid="cycles-per-month-input"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm mb-2 block">Batch Weight (kg)</Label>
                      <Input
                        type="number"
                        value={config.batchWeightKg}
                        onChange={(e) => setConfig(prev => ({ ...prev, batchWeightKg: parseFloat(e.target.value) || 0 }))}
                        className="bg-black/20 border-white/10"
                        data-testid="batch-weight-input"
                      />
                    </div>
                  </div>

                  <SliderInput
                    icon={<Wind className="w-4 h-4 text-purple" />}
                    label="Ironing Percentage"
                    value={config.ironingPercentage}
                    onChange={(v) => setConfig(prev => ({ ...prev, ironingPercentage: v }))}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                    color="purple"
                    testId="ironing-percentage-slider"
                  />
                </div>
              </TabsContent>

              <TabsContent value="machines" className="space-y-6">
                {/* Washing Machines */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                        <WashingMachine className="w-4 h-4 text-cyan" />
                        Washing Machines
                      </h3>
                      <p className="text-sm text-gray-500">Configure washing machine specifications</p>
                    </div>
                    <Dialog open={showWashingMachineDialog} onOpenChange={setShowWashingMachineDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-cyan/30 text-cyan hover:bg-cyan/10" data-testid="add-washing-machine-btn">
                          <Plus className="w-4 h-4 mr-1" /> Add Machine
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#18181b] border-white/10">
                        <DialogHeader>
                          <DialogTitle>Add Washing Machine</DialogTitle>
                          <DialogDescription>Enter the specifications for your washing machine.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-400">Model Name</Label>
                            <Input
                              value={newWashingMachine.model}
                              onChange={(e) => setNewWashingMachine(prev => ({ ...prev, model: e.target.value }))}
                              placeholder="e.g., Miele PW 6080"
                              className="bg-black/20 border-white/10 mt-1"
                              data-testid="new-washing-machine-model"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-400">Capacity (kg)</Label>
                              <Input
                                type="number"
                                value={newWashingMachine.capacity_kg}
                                onChange={(e) => setNewWashingMachine(prev => ({ ...prev, capacity_kg: parseFloat(e.target.value) }))}
                                className="bg-black/20 border-white/10 mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-400">Water (L/cycle)</Label>
                              <Input
                                type="number"
                                value={newWashingMachine.water_consumption_l}
                                onChange={(e) => setNewWashingMachine(prev => ({ ...prev, water_consumption_l: parseFloat(e.target.value) }))}
                                className="bg-black/20 border-white/10 mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-400">Energy (kWh/cycle)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={newWashingMachine.energy_consumption_kwh}
                                onChange={(e) => setNewWashingMachine(prev => ({ ...prev, energy_consumption_kwh: parseFloat(e.target.value) }))}
                                className="bg-black/20 border-white/10 mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-400">Cycle Duration (min)</Label>
                              <Input
                                type="number"
                                value={newWashingMachine.cycle_duration_min}
                                onChange={(e) => setNewWashingMachine(prev => ({ ...prev, cycle_duration_min: parseInt(e.target.value) }))}
                                className="bg-black/20 border-white/10 mt-1"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={addWashingMachine} className="bg-cyan text-black hover:bg-cyan/90" data-testid="save-washing-machine-btn">
                            Save Machine
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Select
                    value={config.washingMachineId || ''}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, washingMachineId: value || null }))}
                  >
                    <SelectTrigger className="bg-black/20 border-white/10" data-testid="washing-machine-select">
                      <SelectValue placeholder="Select washing machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {washingMachines.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.model} ({m.capacity_kg}kg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {washingMachines.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {washingMachines.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="font-medium text-white">{m.model}</div>
                            <div className="text-sm text-gray-400">
                              {m.capacity_kg}kg | {m.water_consumption_l}L | {m.energy_consumption_kwh}kWh | {m.cycle_duration_min}min
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWashingMachine(m.id)}
                            className="text-gray-400 hover:text-red-400"
                            data-testid={`delete-washing-machine-${m.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ironing Machines */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                        <Wind className="w-4 h-4 text-purple" />
                        Ironing Machines
                      </h3>
                      <p className="text-sm text-gray-500">Configure ironing machine specifications</p>
                    </div>
                    <Dialog open={showIroningMachineDialog} onOpenChange={setShowIroningMachineDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-purple/30 text-purple hover:bg-purple/10" data-testid="add-ironing-machine-btn">
                          <Plus className="w-4 h-4 mr-1" /> Add Machine
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#18181b] border-white/10">
                        <DialogHeader>
                          <DialogTitle>Add Ironing Machine</DialogTitle>
                          <DialogDescription>Enter the specifications for your ironing machine.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-400">Model Name</Label>
                            <Input
                              value={newIroningMachine.model}
                              onChange={(e) => setNewIroningMachine(prev => ({ ...prev, model: e.target.value }))}
                              placeholder="e.g., Miele HM 21-140"
                              className="bg-black/20 border-white/10 mt-1"
                              data-testid="new-ironing-machine-model"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400">Energy Consumption (kWh/hour)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newIroningMachine.energy_consumption_kwh_per_hour}
                              onChange={(e) => setNewIroningMachine(prev => ({ ...prev, energy_consumption_kwh_per_hour: parseFloat(e.target.value) }))}
                              className="bg-black/20 border-white/10 mt-1"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={addIroningMachine} className="bg-purple text-white hover:bg-purple/90" data-testid="save-ironing-machine-btn">
                            Save Machine
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Select
                    value={config.ironingMachineId || ''}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, ironingMachineId: value || null }))}
                  >
                    <SelectTrigger className="bg-black/20 border-white/10" data-testid="ironing-machine-select">
                      <SelectValue placeholder="Select ironing machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {ironingMachines.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.model} ({m.energy_consumption_kwh_per_hour}kWh/hr)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {ironingMachines.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {ironingMachines.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="font-medium text-white">{m.model}</div>
                            <div className="text-sm text-gray-400">
                              {m.energy_consumption_kwh_per_hour} kWh/hour
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteIroningMachine(m.id)}
                            className="text-gray-400 hover:text-red-400"
                            data-testid={`delete-ironing-machine-${m.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ironing Time Setting */}
                <div className="pt-6 border-t border-white/10">
                  <SliderInput
                    icon={<Clock className="w-4 h-4 text-amber" />}
                    label="Ironing Time per kg"
                    value={config.ironingTimePerKgMin}
                    onChange={(v) => setConfig(prev => ({ ...prev, ironingTimePerKgMin: v }))}
                    min={1}
                    max={15}
                    step={0.5}
                    unit="min/kg"
                    color="amber"
                    testId="ironing-time-slider"
                  />
                </div>
              </TabsContent>

              <TabsContent value="chemicals" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-purple" />
                      Chemicals
                    </h3>
                    <p className="text-sm text-gray-500">Add washing powder, stain removers, etc.</p>
                  </div>
                  <Dialog open={showChemicalDialog} onOpenChange={setShowChemicalDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-purple/30 text-purple hover:bg-purple/10" data-testid="add-chemical-btn">
                        <Plus className="w-4 h-4 mr-1" /> Add Chemical
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#18181b] border-white/10">
                      <DialogHeader>
                        <DialogTitle>Add Chemical</DialogTitle>
                        <DialogDescription>Enter the details for your laundry chemical.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-400">Name</Label>
                          <Input
                            value={newChemical.name}
                            onChange={(e) => setNewChemical(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Premium Detergent"
                            className="bg-black/20 border-white/10 mt-1"
                            data-testid="new-chemical-name"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-400">Type</Label>
                          <Select
                            value={newChemical.type}
                            onValueChange={(value) => setNewChemical(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger className="bg-black/20 border-white/10 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="washing_powder">Washing Powder</SelectItem>
                              <SelectItem value="stain_remover">Stain Remover</SelectItem>
                              <SelectItem value="softener">Fabric Softener</SelectItem>
                              <SelectItem value="bleach">Bleach</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-400">Package Price ({currencySymbol})</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={newChemical.package_price}
                              onChange={(e) => setNewChemical(prev => ({ ...prev, package_price: parseFloat(e.target.value) }))}
                              className="bg-black/20 border-white/10 mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400">Package Weight (g)</Label>
                            <Input
                              type="number"
                              value={newChemical.package_weight_g}
                              onChange={(e) => setNewChemical(prev => ({ ...prev, package_weight_g: parseFloat(e.target.value) }))}
                              className="bg-black/20 border-white/10 mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-400">Usage per Cycle (g)</Label>
                          <Input
                            type="number"
                            value={newChemical.usage_per_cycle_g}
                            onChange={(e) => setNewChemical(prev => ({ ...prev, usage_per_cycle_g: parseFloat(e.target.value) }))}
                            className="bg-black/20 border-white/10 mt-1"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addChemical} className="bg-purple text-white hover:bg-purple/90" data-testid="save-chemical-btn">
                          Save Chemical
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {chemicals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No chemicals added yet</p>
                    <p className="text-sm">Add chemicals to include them in cost calculation</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chemicals.map(chem => {
                      const isSelected = selectedChemicals.includes(chem.id);
                      const costPerCycle = (chem.package_price / chem.package_weight_g) * chem.usage_per_cycle_g;
                      return (
                        <div 
                          key={chem.id} 
                          className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                            isSelected ? 'bg-purple/20 border border-purple/30' : 'bg-white/5 border border-transparent hover:bg-white/10'
                          }`}
                          onClick={() => toggleChemical(chem.id)}
                          data-testid={`chemical-item-${chem.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-purple border-purple' : 'border-gray-500'
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <div>
                              <div className="font-medium text-white">{chem.name}</div>
                              <div className="text-sm text-gray-400">
                                {chem.type.replace('_', ' ')} | {currencySymbol}{chem.package_price} / {chem.package_weight_g}g | {chem.usage_per_cycle_g}g/cycle
                              </div>
                              <div className="text-xs text-purple mt-1">
                                Cost per cycle: {currencySymbol}{costPerCycle.toFixed(3)}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); deleteChemical(chem.id); }}
                            className="text-gray-400 hover:text-red-400"
                            data-testid={`delete-chemical-${chem.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
              <Button 
                onClick={saveConfiguration}
                className="flex-1 bg-cyan text-black font-bold hover:bg-cyan/90 rounded-full py-6 btn-glow"
                data-testid="save-config-btn"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button 
                onClick={resetConfiguration}
                variant="outline"
                className="border-white/20 hover:bg-white/10 rounded-full px-6"
                data-testid="reset-config-btn"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Charts & Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cost Breakdown Donut */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-purple" />
                  Cost Breakdown per kg
                </h3>
                <p className="text-sm text-gray-500">Distribution of costs across categories</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-heading font-bold text-white">
                  {currencySymbol}{costData?.cost_per_kg?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-gray-500">per kg total</div>
              </div>
            </div>
            <CostBreakdownChart 
              data={costData} 
              currencySymbol={currencySymbol}
            />
          </div>

          {/* Cost Impact Analysis */}
          <div className="glass-card p-6">
            <div className="mb-4">
              <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber" />
                Cost Impact Analysis
              </h3>
              <p className="text-sm text-gray-500">Which inputs have the most impact on cost</p>
            </div>
            <CostImpactChart 
              data={costData}
              currencySymbol={currencySymbol}
            />
          </div>

          {/* Monthly Summary */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-cyan" />
              <h3 className="font-heading font-semibold text-white">Monthly Summary</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Based on {config.cyclesPerMonth} cycles × {config.batchWeightKg}kg = {costData?.total_kg_processed || 0}kg/month
            </p>

            <div className="space-y-3">
              <SummaryRow 
                label="Total Monthly Cost" 
                value={`${currencySymbol}${costData?.total_monthly_cost?.toFixed(2) || '0.00'}`}
                highlight
              />
              <SummaryRow 
                label="Cost per Cycle" 
                value={`${currencySymbol}${costData?.cost_per_cycle?.toFixed(2) || '0.00'}`}
              />
              <SummaryRow 
                label="Total kg Processed" 
                value={`${costData?.total_kg_processed?.toFixed(0) || '0'} kg`}
              />
            </div>

            {costData && (
              <div className="mt-6 p-4 bg-amber/10 border border-amber/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber mt-0.5" />
                  <div>
                    <div className="font-medium text-amber mb-1">Key Insight</div>
                    <p className="text-sm text-gray-300">
                      {getKeyInsight(costData)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, iconColor, bgColor, label, value, unit, subValue }) {
  return (
    <div className="glass-card p-4 glass-card-hover" data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="stat-number text-2xl text-white">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      <div className="text-sm text-gray-500 mt-1">{subValue}</div>
    </div>
  );
}

function SliderInput({ icon, label, value, onChange, min, max, step, unit, color, testId }) {
  const colorClasses = {
    cyan: 'bg-cyan',
    blue: 'bg-blue-400',
    amber: 'bg-amber',
    purple: 'bg-purple'
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-gray-400 flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <span className="text-white font-medium">
          {typeof value === 'number' ? value.toFixed(2) : value} <span className="text-gray-500">{unit}</span>
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="custom-slider"
        data-testid={testId}
      />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className={`flex items-center justify-between py-2 ${highlight ? 'border-t border-white/10 pt-3 mt-3' : ''}`}>
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${highlight ? 'text-xl text-white' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function getKeyInsight(costData) {
  if (!costData) return '';
  
  const costs = [
    { name: 'Labor', value: costData.labor_cost_per_kg },
    { name: 'Electricity', value: costData.electricity_cost_per_kg },
    { name: 'Water', value: costData.water_cost_per_kg },
    { name: 'Chemicals', value: costData.chemical_cost_per_kg }
  ];
  
  const highest = costs.reduce((a, b) => a.value > b.value ? a : b);
  const percentage = ((highest.value / costData.cost_per_kg) * 100).toFixed(1);
  
  const insights = {
    Labor: `Labor costs dominate at ${percentage}%. Consider automation or efficiency improvements.`,
    Electricity: `Electricity is your biggest expense at ${percentage}%. Look into energy-efficient machines or off-peak tariffs.`,
    Water: `Water costs are highest at ${percentage}%. Consider water recycling or more efficient machines.`,
    Chemicals: `Chemicals make up ${percentage}% of costs. Review supplier pricing or dosage optimization.`
  };
  
  return insights[highest.name];
}
