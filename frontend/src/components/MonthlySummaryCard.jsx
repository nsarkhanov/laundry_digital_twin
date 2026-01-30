import React from 'react';
import { Settings, Zap, Calendar } from 'lucide-react';

/**
 * MonthlySummaryCard Component
 * 
 * Displays a summary of monthly costs appearing as a side-kick 
 * to the HeroCostCard, sharing its visual language.
 */
export default function MonthlySummaryCard({
    costData,
    currencySymbol = '€',
    cyclesPerMonth = 200,
    dryingCycles = 0
}) {
    return (
        <div className="glass-card p-4 h-full flex flex-col relative overflow-hidden">
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <Calendar className="w-24 h-24 text-white" />
            </div>

            {/* Combined Header & Primary Metric */}
            <div className="flex justify-between items-start mb-2 relative z-10 min-h-[40px]">
                {/* Left: Context */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                        Monthly Context
                    </span>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                        <span className="w-fit px-2 py-0.5 text-[10px] rounded-full bg-cyan/10 text-cyan border border-cyan/20 font-medium whitespace-nowrap">
                            {cyclesPerMonth} Wash
                        </span>
                        {dryingCycles > 0 && (
                            <span className="w-fit px-2 py-0.5 text-[10px] rounded-full bg-amber/10 text-amber border border-amber/20 font-medium whitespace-nowrap">
                                + {dryingCycles} Dry
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Cost */}
                <div className="text-right mt-6">
                    <div className="text-2xl lg:text-3xl font-semibold text-white tracking-normal shadow-glow mb-1 flex items-baseline justify-end">
                        <span className="text-sm lg:text-base text-gray-400 mr-1.5 font-medium transform -translate-y-0.5">{currencySymbol}</span>
                        {costData?.total_monthly_cost?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                        Estimated Monthly Cost
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-between relative z-10">


                {/* Secondary Metrics List */}
                <div className="space-y-2 mb-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Projected Output</span>
                            <Zap className="w-3.5 h-3.5 text-amber opacity-75" />
                        </div>
                        <div className="flex justify-between items-baseline">
                            <div className="text-sm text-gray-300">Total Weight</div>
                            <div className="text-sm font-semibold text-white">{costData?.total_kg_processed?.toFixed(1) || '0.0'} kg</div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Efficiency</span>
                            <Settings className="w-3.5 h-3.5 text-purple opacity-75" />
                        </div>
                        <div className="flex justify-between items-baseline">
                            <div className="text-sm text-gray-300">Cost / Cycle</div>
                            <div className="text-sm font-semibold text-white">
                                <span className="text-xs text-gray-500 font-normal mr-0.5">{currencySymbol}</span>{costData?.cost_per_cycle?.toFixed(2) || '0.00'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto">
                    <p className="text-[10px] text-gray-500 opacity-60">
                        *Projections based on current configuration.
                    </p>
                </div>
            </div>
        </div>
    );
}
