import React from 'react';
import { Zap, Droplets, FlaskConical, Clock, TrendingUp, Activity, MapPin, Scale, RotateCw, Info, BarChart3 } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

/**
 * HeroCostCard Component
 * 
 * Layout: 3 Columns
 * 1. Overview (Location/Season/Tariff, Per Kg, Per Cycle, Footer)
 * 2. Detailed Breakdown List
 * 3. Cost Impact (Percentage Horizontal Bar Chart)
 * 
 * Compact version for shared row layout.
 */
export default function HeroCostCard({
    costData,
    currencySymbol = '€',
    season = 'summer',
    tariffMode = 'standard',
    location = 'Main Branch'
}) {
    const totalPerKg = costData?.cost_per_kg || 1;

    // Data preparation
    const costBreakdown = [
        { label: 'Electricity', shortLabel: 'Elec', value: costData?.electricity_cost_per_kg || 0, icon: Zap, color: '#06b6d4', fullColor: 'cyan' },
        { label: 'Water', shortLabel: 'Water', value: costData?.water_cost_per_kg || 0, icon: Droplets, color: '#3b82f6', fullColor: 'blue' },
        { label: 'Chemicals', shortLabel: 'Chem', value: costData?.chemical_cost_per_kg || 0, icon: FlaskConical, color: '#a855f7', fullColor: 'purple' },
        { label: 'Labor', shortLabel: 'Labor', value: costData?.labor_cost_per_kg || 0, icon: Clock, color: '#f59e0b', fullColor: 'amber' }
    ];

    // Filter non-zero for chart and calculate percentages
    const chartData = costBreakdown.map(item => ({
        name: item.shortLabel,
        fullName: item.label,
        value: item.value,
        percentage: totalPerKg > 0 ? (item.value / totalPerKg) * 100 : 0,
        color: item.color
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[#18181b] border border-white/10 p-2 rounded text-xs shadow-lg z-50">
                    <span className="block font-bold text-white mb-1">{data.fullName}</span>
                    <span className="text-cyan block font-medium mb-0.5">{data.percentage.toFixed(1)}%</span>
                    <span className="text-gray-400 block text-[10px]">{currencySymbol} {data.value.toFixed(2)}</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-card p-4 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6 items-start h-full">

                {/* COL 1: Overview & Main Metrics */}
                <div className="flex flex-col h-full relative">
                    {/* Background Icon */}
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                        <TrendingUp className="w-32 h-32 text-white" />
                    </div>

                    {/* Header Section */}
                    <div className="min-h-[40px] mb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                                Total Cost Overview
                            </span>
                        </div>
                        {/* Badges Row */}
                        <div className="flex flex-wrap gap-2">
                            <div className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span>{location}</span>
                            </div>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-cyan/10 text-cyan border border-cyan/20 capitalize font-medium">
                                {season}
                            </span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple/10 text-purple border border-purple/20 capitalize font-medium">
                                {tariffMode}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                        {/* Metrics Cards */}
                        <div className="grid gap-2 mb-3">
                            {/* Primary: Cost per Kg */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                <div className="absolute right-3 top-3 p-1 rounded-full bg-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <Scale className="w-3.5 h-3.5 text-cyan" />
                                </div>
                                <div className="text-xs text-gray-400 mb-0.5 font-semibold uppercase tracking-wide">Cost per Kilogram</div>
                                <div className="flex items-baseline gap-1.5">
                                    <div className="text-3xl lg:text-4xl font-bold text-white tracking-tight shadow-glow flex items-baseline">
                                        <span className="text-lg text-gray-400 mr-1 font-medium transform -translate-y-1">{currencySymbol}</span>
                                        {costData?.cost_per_kg?.toFixed(2) || '0.00'}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">/kg</span>
                                </div>
                            </div>

                            {/* Secondary: Cost per Cycle */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                <div className="absolute right-3 top-3 p-1 rounded-full bg-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <RotateCw className="w-3.5 h-3.5 text-purple" />
                                </div>
                                <div className="text-xs text-gray-400 mb-0.5 font-semibold uppercase tracking-wide">Cost per Cycle</div>
                                <div className="flex items-baseline gap-1.5">
                                    <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-baseline">
                                        <span className="text-base text-gray-500 mr-1 font-medium transform -translate-y-0.5">{currencySymbol}</span>
                                        {costData?.cost_per_cycle?.toFixed(2) || '0.00'}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">/cycle</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto">
                            <p className="text-[10px] text-gray-400 flex items-center gap-2 opacity-90 whitespace-nowrap overflow-hidden text-ellipsis">
                                <Zap className="w-3.5 h-3.5 text-cyan shrink-0" />
                                Real-time calculation based on specs.
                            </p>
                        </div>
                    </div>
                </div>

                {/* COL 2: Detailed Breakdown */}
                <div className="lg:border-l lg:border-r border-white/5 lg:px-4 xl:px-6 flex flex-col h-full relative">
                    {/* Header Section */}
                    <div className="min-h-[40px] mb-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-300 font-bold flex items-center gap-2 uppercase tracking-wide">
                                <FlaskConical className="w-4 h-4 text-purple" />
                                Cost Breakdown
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-gray-500" />
                            Detailed breakdown per kg.
                        </p>
                    </div>

                    <div className="space-y-2 pt-1 flex-1 overflow-y-auto">
                        {costBreakdown.map((item) => {
                            const percentage = totalPerKg > 0 ? (item.value / totalPerKg) * 100 : 0;
                            const IconComponent = item.icon;

                            return (
                                <div key={item.label} className="group">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <IconComponent className="w-4 h-4" style={{ color: item.color }} />
                                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">{item.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-white block">
                                                <span className="text-xs text-gray-500 font-normal mr-0.5">{currencySymbol}</span>{item.value.toFixed(3)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: item.color
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-gray-500 w-8 text-right font-mono">{percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* COL 3: Impact Analysis Chart (Horizontal) */}
                <div className="flex flex-col h-full pl-2">
                    {/* Header Section */}
                    <div className="min-h-[40px] mb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-amber" />
                            <span className="text-xs text-gray-300 font-bold uppercase tracking-wide">Impact Comparison</span>
                        </div>
                        <p className="text-[10px] text-gray-400 opacity-60 flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
                            Relative cost distribution (%)
                        </p>
                    </div>

                    <div className="flex-1 flex justify-center -mt-2">
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 0, right: 35, left: 0, bottom: 0 }}
                                barSize={16}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis
                                    type="number"
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `${val}%`}
                                    domain={[0, 100]}
                                    hide
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={40}
                                />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                    <LabelList
                                        dataKey="percentage"
                                        position="right"
                                        formatter={(val) => `${val.toFixed(1)}%`}
                                        fill="#9ca3af"
                                        fontSize={11}
                                        fontWeight={500}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
