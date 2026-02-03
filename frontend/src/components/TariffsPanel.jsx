import React from 'react';
import { Zap, Droplets, Clock, DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const CURRENCIES = {
    EUR: { symbol: '€', name: 'Euro' },
    CZK: { symbol: 'Kč', name: 'Czech Koruna' }
};

const TARIFF_MODES = ['standard', 'high', 'low'];

/**
 * TariffsPanel Component
 * 
 * Panel for configuring utility tariffs with separate categories.
 */
export default function TariffsPanel({
    config,
    setConfig,
    currencySymbol,
}) {
    return (
        <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 p-4 rounded-xl border border-gray-500/20">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-md bg-gray-500/20">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <h3 className="font-heading font-semibold text-white">General Settings</h3>
                </div>

                <div className="flex items-center justify-between">
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
            </div>

            {/* Energy Costs */}
            <div className="bg-gradient-to-br from-cyan/10 to-cyan/5 p-4 rounded-xl border border-cyan/20">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-md bg-cyan/20">
                        <Zap className="w-4 h-4 text-cyan" />
                    </div>
                    <h3 className="font-heading font-semibold text-white">Energy Costs</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <TariffModeSelector
                        label="Electricity Tariff"
                        value={config.electricityTariffMode}
                        onChange={(mode) => setConfig(prev => ({ ...prev, electricityTariffMode: mode }))}
                        priceMultiplier={config.electricityTariffPrice || 1.0}
                        onPriceChange={(price) => setConfig(prev => ({ ...prev, electricityTariffPrice: price }))}
                        color="cyan"
                    />
                </div>
            </div>

            {/* Water Costs */}
            <div className="bg-gradient-to-br from-blue-400/10 to-blue-500/5 p-4 rounded-xl border border-blue-400/20">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-md bg-blue-400/20">
                        <Droplets className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="font-heading font-semibold text-white">Water Costs</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <TariffModeSelector
                        label="Water Tariff"
                        value={config.waterTariffMode}
                        onChange={(mode) => setConfig(prev => ({ ...prev, waterTariffMode: mode }))}
                        priceMultiplier={config.waterTariffPrice || 1.0}
                        onPriceChange={(price) => setConfig(prev => ({ ...prev, waterTariffPrice: price }))}
                        color="blue"
                    />
                </div>
            </div>

            {/* Labor Costs */}
            <div className="bg-gradient-to-br from-amber/10 to-amber/5 p-4 rounded-xl border border-amber/20">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-md bg-amber/20">
                        <Clock className="w-4 h-4 text-amber" />
                    </div>
                    <h3 className="font-heading font-semibold text-white">Labor Costs</h3>
                </div>

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
    );
}

/**
 * TariffModeSelector Component with dynamic slider
 */
function TariffModeSelector({ label, value, onChange, priceMultiplier, onPriceChange, color }) {
    const isHigh = value === 'high';
    const isLow = value === 'low';
    const hasAdjustment = isHigh || isLow;

    // Calculate display percentage
    const displayPercent = isHigh
        ? Math.round((priceMultiplier || 1.25) * 100 - 100)
        : Math.round(100 - (priceMultiplier || 0.75) * 100);

    return (
        <div>
            <Label className="text-gray-400 text-xs flex items-center gap-1.5 mb-1.5">
                {label} Mode
            </Label>
            <Select
                value={value}
                onValueChange={(newMode) => {
                    onChange(newMode);
                    // Set default price multiplier based on mode
                    if (newMode === 'high') onPriceChange(1.25);
                    else if (newMode === 'low') onPriceChange(0.75);
                    else onPriceChange(1.0);
                }}
            >
                <SelectTrigger className="bg-black/20 border-white/10 h-8 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {TARIFF_MODES.map(m => (
                        <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasAdjustment && (
                <div className={`mt-3 p-3 rounded-lg border animate-in fade-in slide-in-from-top-1 ${isHigh
                    ? 'bg-orange-500/5 border-orange-500/20'
                    : 'bg-green-500/5 border-green-500/20'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-[10px] text-gray-400">
                            {isHigh ? 'Premium over Standard' : 'Discount from Standard'}
                        </Label>
                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${isHigh
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-green-500/20 text-green-400'
                            }`}>
                            {isHigh ? `+${displayPercent}%` : `-${displayPercent}%`}
                        </span>
                    </div>
                    <Slider
                        value={[isHigh
                            ? ((priceMultiplier || 1.25) - 1) * 100
                            : (1 - (priceMultiplier || 0.75)) * 100
                        ]}
                        min={0}
                        max={isHigh ? 100 : 50}
                        step={5}
                        onValueChange={([val]) => {
                            const price = isHigh
                                ? 1 + val / 100
                                : 1 - val / 100;
                            onPriceChange(price);
                        }}
                        className="my-1"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                        <span>0%</span>
                        <span className="text-gray-600">
                            {isHigh ? 'More expensive →' : 'Cheaper →'}
                        </span>
                        <span>{isHigh ? '+100%' : '-50%'}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * CompactNumberInput Component
 */
function CompactNumberInput({ icon, label, value, onChange, min, max, step, unit, color }) {
    return (
        <div className="mb-2">
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
 */
function DoubleInput({ value, onChange, ...props }) {
    const [displayValue, setDisplayValue] = React.useState(
        value === undefined || value === null ? '' : value.toString()
    );

    React.useEffect(() => {
        setDisplayValue(value === undefined || value === null ? '' : value.toString());
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

export { CompactNumberInput, DoubleInput, CURRENCIES, TARIFF_MODES };
