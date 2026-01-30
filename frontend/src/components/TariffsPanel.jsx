import React from 'react';
import { Zap, Droplets, Clock, Settings, MapPin, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
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

const CURRENCIES = {
    EUR: { symbol: '€', name: 'Euro' },
    CZK: { symbol: 'Kč', name: 'Czech Koruna' }
};

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const TARIFF_MODES = ['standard', 'high', 'low'];

/**
 * TariffsPanel Component
 * 
 * Panel for configuring utility tariffs, environment settings, and operational settings.
 * 
 * @param {Object} props
 * @param {Object} props.config - Current configuration state
 * @param {Function} props.setConfig - Function to update config
 * @param {string} props.currencySymbol - Currency symbol (€, Kč)
 * @param {Array} props.locations - List of locations
 * @param {boolean} props.showLocationDialog - Location dialog visibility state
 * @param {Function} props.setShowLocationDialog - Function to toggle location dialog
 * @param {string} props.newLocation - New location input value
 * @param {Function} props.setNewLocation - Function to update new location value
 * @param {Function} props.addLocation - Function to add new location
 * @param {Function} props.deleteLocation - Function to delete location
 */
export default function TariffsPanel({
    config,
    setConfig,
    currencySymbol,
    locations,
    showLocationDialog,
    setShowLocationDialog,
    newLocation,
    setNewLocation,
    addLocation,
    deleteLocation
}) {
    return (
        <div className="space-y-6">
            {/* Utility Tariffs Section */}
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

                {/* Rate Inputs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tariff Mode Selector (Moved to First) */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <Label className="text-gray-400 text-xs flex items-center gap-1.5">
                                <Settings className="w-3 h-3 text-cyan" />
                                Tariff Mode
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 text-gray-500 hover:text-cyan"
                                onClick={() => setConfig(prev => ({ ...prev, showTariffPrice: !prev.showTariffPrice }))}
                            >
                                <Settings className="w-3 h-3" />
                            </Button>
                        </div>
                        <Select
                            value={config.tariffMode}
                            onValueChange={(value) => setConfig(prev => ({ ...prev, tariffMode: value }))}
                        >
                            <SelectTrigger className="bg-black/20 border-white/10 h-8 text-sm" data-testid="tariff-mode-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TARIFF_MODES.map(m => (
                                    <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {config.showTariffPrice && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-1 px-1">
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-[10px] text-gray-500">Percentage</Label>
                                    <div className="relative w-16">
                                        <DoubleInput
                                            step="any"
                                            value={config.tariffModePrice ? config.tariffModePrice * 100 : ''}
                                            onChange={(val) => {
                                                const newVal = val === 0 ? undefined : val / 100;
                                                setConfig(prev => ({ ...prev, tariffModePrice: newVal }));
                                            }}
                                            className="bg-black/20 border-white/10 h-6 text-xs pr-5 text-right px-1"
                                            placeholder="100"
                                        />
                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">%</span>
                                    </div>
                                </div>
                                <Slider
                                    value={[config.tariffModePrice ? config.tariffModePrice * 100 : 100]}
                                    min={0}
                                    max={200}
                                    step={0.1}
                                    onValueChange={([val]) => setConfig(prev => ({ ...prev, tariffModePrice: val / 100 }))}
                                    className="my-1"
                                />
                            </div>
                        )}
                    </div>

                    <CompactNumberInput
                        icon={<Zap className="w-4 h-4 text-cyan" />}
                        label="Electricity Rate"
                        value={config.electricityRate}
                        onChange={(v) => setConfig(prev => ({ ...prev, electricityRate: v }))}
                        min={0}
                        step="any"
                        unit={`${currencySymbol}/kWh`}
                        color="cyan"
                    />
                    <CompactNumberInput
                        icon={<Droplets className="w-4 h-4 text-blue-400" />}
                        label="Water Rate"
                        value={config.waterRate}
                        onChange={(v) => setConfig(prev => ({ ...prev, waterRate: v }))}
                        min={0}
                        step="any"
                        unit={`${currencySymbol}/m³`}
                        color="blue"
                    />
                    <CompactNumberInput
                        icon={<Clock className="w-4 h-4 text-amber" />}
                        label="Labor Rate"
                        value={config.laborRate}
                        onChange={(v) => setConfig(prev => ({ ...prev, laborRate: v }))}
                        min={0}
                        step="any"
                        unit={`${currencySymbol}/hr`}
                        color="amber"
                    />
                </div>
            </div>

            {/* Environment Settings Section */}
            <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-purple" />
                    <h3 className="font-heading font-semibold text-white">Environment Settings</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Location and seasonal adjustments</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Season Selector */}
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



                    {/* Location Selector */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-gray-400 text-sm">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                Location
                            </Label>
                            <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-cyan hover:text-cyan/80 h-6 px-2" data-testid="add-location-btn">
                                        <Plus className="w-3 h-3 mr-1" /> Add
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
                                        <span>{loc.name}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Location Tags */}
                {locations.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
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

            {/* Operational Settings Section */}
            {/* Operational Settings Section */}
            <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-amber" />
                    <h3 className="font-heading font-semibold text-white">Operational Settings</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Configure laundry volume and operation period</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <Label className="text-gray-400 text-sm mb-2 block">Volume (Weight kg)</Label>
                        <DoubleInput
                            step="any"
                            value={config.operationalVolume}
                            onChange={(val) => setConfig(prev => ({ ...prev, operationalVolume: val }))}
                            className="bg-black/20 border-white/10"
                            data-testid="operational-volume-input"
                        />
                    </div>
                    <div>
                        <Label className="text-gray-400 text-sm mb-2 block">Period</Label>
                        <Select
                            value={config.operationalPeriod || 'month'}
                            onValueChange={(value) => setConfig(prev => ({ ...prev, operationalPeriod: value }))}
                        >
                            <SelectTrigger className="bg-black/20 border-white/10" data-testid="operational-period-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">Per Day</SelectItem>
                                <SelectItem value="week">Per Week</SelectItem>
                                <SelectItem value="month">Per Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * CompactNumberInput Component
 * 
 * A compact number input with icon, label, and unit display.
 */
function CompactNumberInput({ icon, label, value, onChange, min, max, step, unit, color }) {
    return (
        <div className="mb-4">
            <Label className="text-gray-400 text-xs mb-1.5 flex items-center gap-1.5">
                {icon}
                {label}
            </Label>
            <div className="relative">
                <DoubleInput
                    value={value}
                    onChange={onChange}
                    min={min}
                    max={max}
                    step={step}
                    className={`bg-black/20 border-white/10 h-8 text-sm pr-12 focus:border-${color || 'cyan'}/50 transition-colors`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                    {unit}
                </div>
            </div>
        </div>
    );
}

/**
 * DoubleInput Component
 * 
 * A controlled numeric input that handles decimal values correctly
 * by maintaining a local string state for the display value.
 */
function DoubleInput({ value, onChange, ...props }) {
    const [displayValue, setDisplayValue] = React.useState(
        value === undefined || value === null ? '' : value.toString()
    );

    React.useEffect(() => {
        const numValue = parseFloat(displayValue);
        if (isNaN(numValue) || numValue !== value) {
            setDisplayValue(value === undefined || value === null ? '' : value.toString());
        }
    }, [value]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setDisplayValue(val);

        const num = parseFloat(val);
        if (!isNaN(num)) {
            onChange(num);
        } else if (val === '') {
            onChange(0);
        }
    };

    return (
        <Input
            {...props}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleInputChange}
        />
    );
}

// Export helper components and constants
export { CompactNumberInput, DoubleInput, CURRENCIES, SEASONS, TARIFF_MODES };
