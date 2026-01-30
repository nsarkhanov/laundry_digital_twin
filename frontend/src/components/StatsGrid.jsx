// ... (imports remain same)
import React, { useState } from 'react';
import { Zap, Droplets, FlaskConical, Clock, Settings } from 'lucide-react';

/**
 * StatsGrid Component
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
        <div className="glass-card p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
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

            {/* Stats Cards Grid - 2 rows on mobile, 1 row on desktop if possible, or wrap */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 flex-1">
                <StatCard
                    icon={<Zap className="w-4 h-4" />}
                    iconColor="text-yellow-400"
                    bgColor="bg-yellow-400/10"
                    label={`${prefix} Elec.`}
                    value={costData ? (costData.monthly_electricity_kwh * multiplier).toFixed(0) : '0'}
                    unit="kWh"
                    subValue={`${currencySymbol}${costData ? (costData.monthly_electricity_cost * multiplier).toFixed(2) : '0'}`}
                />

                <StatCard
                    icon={<Droplets className="w-4 h-4" />}
                    iconColor="text-blue-400"
                    bgColor="bg-blue-400/10"
                    label={`${prefix} Water`}
                    value={costData ? (costData.monthly_water_m3 * multiplier).toFixed(1) : '0'}
                    unit="m³"
                    subValue={`${currencySymbol}${costData ? (costData.monthly_water_cost * multiplier).toFixed(2) : '0'}`}
                />

                <StatCard
                    icon={<FlaskConical className="w-4 h-4" />}
                    iconColor="text-purple"
                    bgColor="bg-purple/10"
                    label={`${prefix} Chem.`}
                    value={`${currencySymbol}${costData ? (costData.monthly_chemical_cost * multiplier).toFixed(2) : '0'}`}
                    unit=""
                    subValue={`${selectedChemicalsCount} types`}
                />

                <StatCard
                    icon={<Clock className="w-4 h-4" />}
                    iconColor="text-amber"
                    bgColor="bg-amber/10"
                    label="Labor Hrs"
                    value={costData ? (costData.monthly_labor_hours * multiplier).toFixed(0) : '0'}
                    unit="h"
                    subValue={`${currencySymbol}${costData ? (costData.monthly_labor_cost * multiplier).toFixed(2) : '0'}`}
                />

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

function StatCard({ icon, iconColor, bgColor, label, value, unit, subValue }) {
    return (
        <div className="glass-card p-3.5 flex flex-col justify-between h-full hover:bg-white/5 transition-colors group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold leading-tight max-w-[70%]">
                    {label}
                </span>
                <div className={`p-1.5 rounded-md ${bgColor} group-hover:bg-opacity-80 transition-all`}>
                    <span className={iconColor}>{icon}</span>
                </div>
            </div>

            <div className="mt-auto">
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white tracking-tight leading-none">{value}</span>
                    {unit && <span className="text-[10px] text-gray-500 font-medium">{unit}</span>}
                </div>
                <div className="text-[10px] text-gray-500 mt-1 font-medium bg-white/5 inline-block px-1.5 py-0.5 rounded border border-white/5 border-t-white/10">
                    {subValue}
                </div>
            </div>
        </div>
    );
}

export { StatCard };
