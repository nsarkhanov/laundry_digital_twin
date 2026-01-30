import React, { useState } from 'react';
import { Zap, Droplets, FlaskConical, Clock, Settings } from 'lucide-react';

/**
 * StatsGrid Component
 * 
 * Displays a grid of stat cards showing electricity, water, chemicals, and labor metrics.
 * Includes a time frame selector (Week/Month/Year) to adjust the displayed values.
 * 
 * @param {Object} props
 * @param {Object} props.costData - Cost calculation data from API
 * @param {string} props.currencySymbol - Currency symbol (€, Kč, etc.)
 * @param {number} props.selectedChemicalsCount - Number of selected chemicals
 */
export default function StatsGrid({
    costData,
    currencySymbol = '€',
    selectedChemicalsCount = 0
}) {
    const [timeFrame, setTimeFrame] = useState('month');

    // Calculate multiplier based on time frame
    const getMultiplier = () => {
        switch (timeFrame) {
            case 'year': return 12;
            case 'week': return 1 / 4.33;
            default: return 1;
        }
    };

    const multiplier = getMultiplier();

    // Get time frame prefix for labels
    const getPrefix = () => {
        switch (timeFrame) {
            case 'year': return 'Yearly';
            case 'week': return 'Weekly';
            default: return 'Monthly';
        }
    };

    const prefix = getPrefix();

    return (
        <div className="glass-card p-3 h-full">
            {/* Header with Time Frame Selector */}
            <div className="flex items-center justify-between mb-4">
                {/* Time Frame Selector Tabs */}
                <div className="inline-flex bg-white/5 p-1 rounded-lg">
                    {['week', 'month', 'year'].map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeFrame(tf)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFrame === tf
                                ? 'bg-cyan text-black shadow-lg shadow-cyan/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tf.charAt(0).toUpperCase() + tf.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    {timeFrame === 'week' ? 'Weekly' : timeFrame === 'month' ? 'Monthly' : 'Yearly'} Summary
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pb-2">
                {/* Electricity Card */}
                <StatCard
                    icon={<Zap className="w-4 h-4" />}
                    iconColor="text-yellow-400"
                    bgColor="bg-yellow-400/10"
                    label={`${prefix} Elec.`}
                    value={costData ? (costData.monthly_electricity_kwh * multiplier).toFixed(0) : '0'}
                    unit="kWh"
                    subValue={`${currencySymbol}${costData ? (costData.monthly_electricity_cost * multiplier).toFixed(2) : '0'}`}
                />

                {/* Water Card */}
                <StatCard
                    icon={<Droplets className="w-4 h-4" />}
                    iconColor="text-blue-400"
                    bgColor="bg-blue-400/10"
                    label={`${prefix} Water`}
                    value={costData ? (costData.monthly_water_m3 * multiplier).toFixed(1) : '0'}
                    unit="m³"
                    subValue={`${currencySymbol}${costData ? (costData.monthly_water_cost * multiplier).toFixed(2) : '0'}`}
                />

                {/* Chemicals Card */}
                <StatCard
                    icon={<FlaskConical className="w-4 h-4" />}
                    iconColor="text-purple"
                    bgColor="bg-purple/10"
                    label={`${prefix} Chem.`}
                    value={`${currencySymbol}${costData ? (costData.monthly_chemical_cost * multiplier).toFixed(2) : '0'}`}
                    unit=""
                    subValue={`${selectedChemicalsCount} types`}
                />

                {/* Labor Hours Card */}
                <StatCard
                    icon={<Clock className="w-4 h-4" />}
                    iconColor="text-amber"
                    bgColor="bg-amber/10"
                    label="Labor Hrs"
                    value={costData ? (costData.monthly_labor_hours * multiplier).toFixed(0) : '0'}
                    unit="h"
                    subValue={`${currencySymbol}${costData ? (costData.monthly_labor_cost * multiplier).toFixed(2) : '0'}`}
                />

                {/* Ironing Hours Card */}
                <StatCard
                    icon={<Settings className="w-4 h-4" />}
                    iconColor="text-orange-400"
                    bgColor="bg-orange-400/10"
                    label="Ironing Hrs"
                    value={costData ? (costData.monthly_ironing_hours * multiplier).toFixed(0) : '0'}
                    unit="h"
                    subValue={`${currencySymbol}${costData && costData.monthly_ironing_hours > 0 && costData.monthly_labor_hours > 0 ? ((costData.monthly_labor_cost / costData.monthly_labor_hours) * costData.monthly_ironing_hours * multiplier).toFixed(2) : '0'}`}
                />
            </div>
        </div>
    );
}

/**
 * StatCard Component
 * 
 * Individual stat card showing an icon, label, value, unit, and sub-value.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon element
 * @param {string} props.iconColor - Tailwind color class for icon
 * @param {string} props.bgColor - Tailwind background color class
 * @param {string} props.label - Card label
 * @param {string|number} props.value - Main value to display
 * @param {string} props.unit - Unit suffix for value
 * @param {string} props.subValue - Secondary value below main value
 */
function StatCard({ icon, iconColor, bgColor, label, value, unit, subValue }) {
    return (
        <div
            className="glass-card p-3 glass-card-hover relative overflow-hidden"
            data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
            <div className={`absolute top-2 right-2 w-6 h-6 rounded-md ${bgColor} flex items-center justify-center`}>
                <span className={iconColor}>{React.cloneElement(icon, { className: "w-3.5 h-3.5" })}</span>
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{label}</div>
            <div className="flex items-baseline gap-0.5 mt-1">
                <span className="stat-number text-xl font-bold text-white tracking-tight">{value}</span>
                {unit && <span className="text-[10px] text-gray-500 font-medium">{unit}</span>}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5 font-medium opacity-80">{subValue}</div>
        </div>
    );
}

// Export StatCard for potential reuse
export { StatCard };
