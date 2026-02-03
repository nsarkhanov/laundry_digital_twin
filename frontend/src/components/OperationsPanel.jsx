import React from 'react';
import { Settings, MapPin, Truck, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DoubleInput } from './TariffsPanel';

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

/**
 * OperationsPanel Component
 * 
 * Panel for configuring environment settings, operational settings, and transport costs.
 */
export default function OperationsPanel({
    config,
    setConfig,
    currencySymbol,
    locations,
    onAddLocation,
}) {
    // Dynamic period label based on operational period
    const periodLabel = config.operationalPeriod === 'day' ? 'day'
        : config.operationalPeriod === 'week' ? 'week'
            : 'month';
    return (
        <div className="space-y-6">
            {/* Environment Settings Section */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-purple" />
                    <h3 className="font-heading font-semibold text-white">Environment Settings</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Location and seasonal adjustments</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <SelectTrigger className="bg-black/20 border-white/10">
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
                        <Label className="text-gray-400 text-sm mb-2 block">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            Location
                        </Label>
                        <div className="flex items-center gap-2">
                            <Select
                                value={config.locationId || ''}
                                onValueChange={(value) => setConfig(prev => ({ ...prev, locationId: value || null }))}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10 flex-1">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map(loc => (
                                        <SelectItem key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {onAddLocation && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onAddLocation}
                                    className="border-amber/30 text-amber hover:bg-amber/10 shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Settings Section */}
            <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-amber" />
                    <h3 className="font-heading font-semibold text-white">Operational Settings</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Configure laundry volume and operation period</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-gray-400 text-sm mb-2 block">Volume (Weight kg)</Label>
                        <DoubleInput
                            step="any"
                            value={config.operationalVolume}
                            onChange={(val) => setConfig(prev => ({ ...prev, operationalVolume: val }))}
                            className="bg-black/20 border-white/10"
                        />
                    </div>
                    <div>
                        <Label className="text-gray-400 text-sm mb-2 block">Period</Label>
                        <Select
                            value={config.operationalPeriod || 'month'}
                            onValueChange={(value) => setConfig(prev => ({ ...prev, operationalPeriod: value }))}
                        >
                            <SelectTrigger className="bg-black/20 border-white/10">
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

            {/* Transport Section */}
            <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-400" />
                        <h3 className="font-heading font-semibold text-white">Transport Costs</h3>
                    </div>
                    <button
                        onClick={() => setConfig(prev => ({ ...prev, transportEnabled: !prev.transportEnabled }))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${config.transportEnabled
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10'
                            }`}
                    >
                        {config.transportEnabled ? (
                            <><ToggleRight className="w-4 h-4" /> Enabled</>
                        ) : (
                            <><ToggleLeft className="w-4 h-4" /> Disabled</>
                        )}
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-6">Add transportation costs to your calculations</p>

                {config.transportEnabled && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        {/* Transport Mode Selection */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfig(prev => ({ ...prev, transportMode: 'fixed' }))}
                                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${config.transportMode === 'fixed'
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                            >
                                Fixed Total Amount
                            </button>
                            <button
                                onClick={() => setConfig(prev => ({ ...prev, transportMode: 'calculated' }))}
                                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${config.transportMode === 'calculated'
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                            >
                                Calculate from Distance
                            </button>
                        </div>

                        {/* Inputs based on mode */}
                        {config.transportMode === 'fixed' ? (
                            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                                <Label className="text-gray-400 text-sm mb-2 block">
                                    Total Transport Cost (per {periodLabel})
                                </Label>
                                <div className="relative">
                                    <DoubleInput
                                        step="any"
                                        value={config.transportFixedCost}
                                        onChange={(val) => setConfig(prev => ({ ...prev, transportFixedCost: val }))}
                                        className="bg-black/20 border-white/10 pr-16"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                        {currencySymbol}/{periodLabel}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 space-y-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <Label className="text-gray-400 text-sm mb-2 block">
                                            Distance (per {periodLabel})
                                        </Label>
                                        <div className="relative">
                                            <DoubleInput
                                                step="any"
                                                value={config.transportDistanceKm}
                                                onChange={(val) => setConfig(prev => ({ ...prev, transportDistanceKm: val }))}
                                                className="bg-black/20 border-white/10 pr-12"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                                km
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-400 text-sm mb-2 block">
                                            Fuel Rate
                                        </Label>
                                        <div className="relative">
                                            <DoubleInput
                                                step="any"
                                                value={config.transportFuelRate}
                                                onChange={(val) => setConfig(prev => ({ ...prev, transportFuelRate: val }))}
                                                className="bg-black/20 border-white/10 pr-14"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                                {currencySymbol}/km
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-400 text-sm mb-2 block">
                                            Time (Hours)
                                        </Label>
                                        <div className="relative">
                                            <DoubleInput
                                                step="any"
                                                value={config.transportTimeHours}
                                                onChange={(val) => setConfig(prev => ({ ...prev, transportTimeHours: val }))}
                                                className="bg-black/20 border-white/10 pr-14"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                                hours
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-400 text-sm mb-2 block">
                                            Labor Rate
                                        </Label>
                                        <div className="relative">
                                            <DoubleInput
                                                step="any"
                                                value={config.transportLaborRate}
                                                onChange={(val) => setConfig(prev => ({ ...prev, transportLaborRate: val }))}
                                                className="bg-black/20 border-white/10 pr-14"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                                {currencySymbol}/hr
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Calculated preview */}
                                {((config.transportDistanceKm > 0 && config.transportFuelRate > 0) || (config.transportTimeHours > 0 && config.transportLaborRate > 0)) && (
                                    <div className="pt-3 border-t border-green-500/20 flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>Fuel Cost: {currencySymbol}{(config.transportDistanceKm * config.transportFuelRate).toFixed(2)}</span>
                                            <span>+</span>
                                            <span>Labor Cost: {currencySymbol}{(config.transportTimeHours * config.transportLaborRate).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">Total Calculated {periodLabel}ly cost:</span>
                                            <span className="text-lg font-bold text-green-400">
                                                {currencySymbol}{((config.transportDistanceKm * config.transportFuelRate) + (config.transportTimeHours * config.transportLaborRate)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export { SEASONS };
