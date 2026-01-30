import React from 'react';
import { Settings, MapPin, Zap, Calendar, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * TariffsWidget Component
 * 
 * Displays a summary of the current configuration (Environment, Tariffs).
 * Provides a button to open the full TariffsPanel configuration dialog.
 */
export default function TariffsWidget({ config, locationName, onOpenConfig }) {
    return (
        <div className="glass-card p-4 h-full flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Sliders className="w-20 h-20 text-white" />
            </div>

            {/* Header - Keep only the left gear icon and title */}
            <div className="flex items-center gap-2 mb-4 relative z-10">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                    Configuration
                </span>
            </div>

            {/* Content - Three separate styled widgets */}
            <div className="grid grid-cols-3 gap-3 flex-1 relative z-10">
                {/* Active Profile Widget */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-medium uppercase mb-2">Active Profile</span>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="bg-black/20 rounded px-2 py-2 flex flex-col justify-center">
                            <span className="text-[9px] text-gray-500 uppercase">Season</span>
                            <span className="text-sm font-semibold text-white capitalize">{config.season}</span>
                        </div>
                        <div className="bg-purple/10 rounded px-2 py-2 flex flex-col justify-center border border-purple/20">
                            <span className="text-[9px] text-purple/70 uppercase">Tariff</span>
                            <span className="text-sm font-semibold text-purple capitalize">{config.tariffMode}</span>
                        </div>
                    </div>
                </div>

                {/* Location Widget */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-medium uppercase mb-2">Location</span>
                    <div className="bg-cyan/5 border border-cyan/20 rounded px-3 py-2 flex-1 flex items-center">
                        <MapPin className="w-4 h-4 text-cyan mr-2 flex-shrink-0" />
                        <span className="text-sm font-semibold text-white truncate">
                            {locationName || 'Main Branch'}
                        </span>
                    </div>
                </div>

                {/* Operational Widget */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-medium uppercase mb-2">Operational</span>
                    <div className="bg-amber/10 border border-amber/20 rounded px-3 py-2 flex-1 flex items-center">
                        <Calendar className="w-4 h-4 text-amber mr-2 flex-shrink-0" />
                        <span className="text-sm font-semibold text-amber truncate">
                            {config.operationalVolume || 0} kg / {config.operationalPeriod || 'month'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-3 relative z-10">
                <Button
                    onClick={onOpenConfig}
                    className="w-full h-8 text-xs bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/20"
                >
                    Modify Settings
                </Button>
            </div>
        </div>
    );
}
