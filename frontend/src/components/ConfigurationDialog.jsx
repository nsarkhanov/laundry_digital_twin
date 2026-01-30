import React, { useState } from 'react';
import {
    Zap, FlaskConical, Settings,
    RotateCcw, Save, Plus, Trash2, WashingMachine,
    Wind
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
import TariffsPanel, { DoubleInput } from './TariffsPanel';

export default function ConfigurationDialog({
    open,
    onOpenChange,
    config,
    setConfig,
    data,
    actions,
    currencySymbol,
    onSave,
    onReset,
    selectedChemicals,
    toggleChemical,
    setSelectedChemicals // Passed for delete cleanup
}) {
    const { locations, washingMachines, dryingMachines, ironingMachines, chemicals } = data;

    // Local state for forms
    const [showLocationDialog, setShowLocationDialog] = useState(false);
    const [showWashingMachineDialog, setShowWashingMachineDialog] = useState(false);
    const [showDryingMachineDialog, setShowDryingMachineDialog] = useState(false);
    const [showIroningMachineDialog, setShowIroningMachineDialog] = useState(false);
    const [showChemicalDialog, setShowChemicalDialog] = useState(false);

    const [newLocation, setNewLocation] = useState('');
    const [newWashingMachine, setNewWashingMachine] = useState({
        model: '', capacity_kg: 8, water_consumption_l: 50,
        energy_consumption_kwh: 1.5, cycle_duration_min: 60
    });
    const [newDryingMachine, setNewDryingMachine] = useState({
        model: '', capacity_kg: 10, energy_consumption_kwh_per_cycle: 2.0, cycle_duration_min: 45
    });
    const [newIroningMachine, setNewIroningMachine] = useState({
        model: '', ironing_labor_hours: 100.0, energy_consumption_kwh_per_hour: 3.0
    });
    const [newChemical, setNewChemical] = useState({
        name: '', type: 'washing_powder', package_price: 10,
        package_weight_g: 1000, usage_per_cycle_g: 50
    });

    const handleAddLocation = async () => {
        if (await actions.addLocation(newLocation)) {
            setNewLocation('');
            setShowLocationDialog(false);
        }
    };

    const handleAddWashingMachine = async () => {
        if (!newWashingMachine.model.trim()) return;
        if (await actions.addWashingMachine(newWashingMachine)) {
            setNewWashingMachine({
                model: '', capacity_kg: 8, water_consumption_l: 50,
                energy_consumption_kwh: 1.5, cycle_duration_min: 60
            });
            setShowWashingMachineDialog(false);
        }
    };

    const handleAddDryingMachine = async () => {
        if (!newDryingMachine.model.trim()) return;
        if (await actions.addDryingMachine(newDryingMachine)) {
            setNewDryingMachine({ model: '', capacity_kg: 10, energy_consumption_kwh_per_cycle: 2.0, cycle_duration_min: 45 });
            setShowDryingMachineDialog(false);
        }
    };

    const handleAddIroningMachine = async () => {
        if (!newIroningMachine.model.trim()) return;
        if (await actions.addIroningMachine(newIroningMachine)) {
            setNewIroningMachine({ model: '', ironing_labor_hours: 100.0, energy_consumption_kwh_per_hour: 3.0 });
            setShowIroningMachineDialog(false);
        }
    };

    const handleAddChemical = async () => {
        if (!newChemical.name.trim()) return;
        if (await actions.addChemical(newChemical)) {
            setNewChemical({
                name: '', type: 'washing_powder', package_price: 10,
                package_weight_g: 1000, usage_per_cycle_g: 50
            });
            setShowChemicalDialog(false);
        }
    };

    const handleDeleteLocation = async (id) => {
        if (await actions.deleteLocation(id)) {
            if (config.locationId === id) setConfig(prev => ({ ...prev, locationId: null }));
        }
    };

    const handleDeleteWashingMachine = async (id) => {
        if (await actions.deleteWashingMachine(id)) {
            if (config.washingMachineId === id) setConfig(prev => ({ ...prev, washingMachineId: null }));
        }
    };

    const handleDeleteDryingMachine = async (id) => {
        if (await actions.deleteDryingMachine(id)) {
            if (config.dryingMachineId === id) setConfig(prev => ({ ...prev, dryingMachineId: null }));
        }
    };

    const handleDeleteChemical = async (id) => {
        if (await actions.deleteChemical(id)) {
            setSelectedChemicals(prev => prev.filter(cid => cid !== id));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#18181b] border-white/10 max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configuration</DialogTitle>
                    <DialogDescription>Manage your laundry facility settings, machines, and chemicals.</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <Tabs defaultValue="tariffs" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1 rounded-xl mb-6">
                            <TabsTrigger value="tariffs" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                                <Zap className="w-4 h-4 mr-2" />Tariffs
                            </TabsTrigger>
                            <TabsTrigger value="machines" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                                <WashingMachine className="w-4 h-4 mr-2" />Machines
                            </TabsTrigger>
                            <TabsTrigger value="chemicals" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                                <FlaskConical className="w-4 h-4 mr-2" />Chemicals
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tariffs" className="space-y-6">
                            <TariffsPanel
                                config={config}
                                setConfig={setConfig}
                                currencySymbol={currencySymbol}
                                locations={locations}
                                showLocationDialog={showLocationDialog}
                                setShowLocationDialog={setShowLocationDialog}
                                newLocation={newLocation}
                                setNewLocation={setNewLocation}
                                addLocation={handleAddLocation}
                                deleteLocation={handleDeleteLocation}
                            />
                        </TabsContent>

                        <TabsContent value="machines" className="space-y-6">
                            {/* Washing Machines */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-heading font-semibold text-white flex items-center gap-2"><WashingMachine className="w-4 h-4 text-cyan" />Washing Machines</h3>
                                        <p className="text-sm text-gray-500">Configure washing machine specifications</p>
                                    </div>
                                    <Dialog open={showWashingMachineDialog} onOpenChange={setShowWashingMachineDialog}>
                                        <DialogTrigger asChild><Button variant="outline" size="sm" className="border-cyan/30 text-cyan hover:bg-cyan/10"><Plus className="w-4 h-4 mr-1" /> Add Machine</Button></DialogTrigger>
                                        <DialogContent className="bg-[#18181b] border-white/10">
                                            <DialogHeader><DialogTitle>Add Washing Machine</DialogTitle><DialogDescription>Enter the specifications for your washing machine.</DialogDescription></DialogHeader>
                                            <div className="space-y-4">
                                                <div><Label className="text-gray-400">Model Name</Label><Input value={newWashingMachine.model} onChange={(e) => setNewWashingMachine(prev => ({ ...prev, model: e.target.value }))} placeholder="e.g., Miele PW 6080" className="bg-black/20 border-white/10 mt-1" /></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><Label className="text-gray-400">Capacity (kg)</Label><DoubleInput step="any" value={newWashingMachine.capacity_kg} onChange={(val) => setNewWashingMachine(prev => ({ ...prev, capacity_kg: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                    <div><Label className="text-gray-400">Water (L/cycle)</Label><DoubleInput step="any" value={newWashingMachine.water_consumption_l} onChange={(val) => setNewWashingMachine(prev => ({ ...prev, water_consumption_l: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                    <div><Label className="text-gray-400">Energy (kWh/cycle)</Label><DoubleInput step="any" value={newWashingMachine.energy_consumption_kwh} onChange={(val) => setNewWashingMachine(prev => ({ ...prev, energy_consumption_kwh: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                    <div><Label className="text-gray-400">Cycle Duration (min)</Label><DoubleInput step="any" value={newWashingMachine.cycle_duration_min} onChange={(val) => setNewWashingMachine(prev => ({ ...prev, cycle_duration_min: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                </div>
                                                <div className="p-3 bg-cyan/5 border border-cyan/10 rounded-lg">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <Label className="text-gray-400 text-xs">Average Load Percentage</Label>
                                                        <span className="text-cyan font-bold text-xs">{config.loadPercentage}%</span>
                                                    </div>
                                                    <Slider
                                                        value={[config.loadPercentage]}
                                                        onValueChange={(vals) => setConfig(prev => ({ ...prev, loadPercentage: vals[0] }))}
                                                        max={100} step={0.1} className="py-2"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter><Button onClick={handleAddWashingMachine} className="bg-cyan text-black hover:bg-cyan/90">Save Machine</Button></DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <Select value={config.washingMachineId || ''} onValueChange={(value) => setConfig(prev => ({ ...prev, washingMachineId: value || null }))}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Select washing machine" /></SelectTrigger><SelectContent>{washingMachines.map(m => (<SelectItem key={m.id} value={m.id}>{m.model} ({m.capacity_kg}kg)</SelectItem>))}</SelectContent></Select>

                                {washingMachines.length > 0 && (<div className="mt-4 space-y-2">{washingMachines.map(m => (<div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg"><div><div className="font-medium text-white">{m.model}</div><div className="text-sm text-gray-400">{m.capacity_kg}kg | {m.water_consumption_l}L | {m.energy_consumption_kwh}kWh | {m.cycle_duration_min}min</div></div><Button variant="ghost" size="sm" onClick={() => handleDeleteWashingMachine(m.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></Button></div>))}</div>)}
                            </div>
                            {/* Drying Machines */}
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div><h3 className="font-heading font-semibold text-white flex items-center gap-2"><Wind className="w-4 h-4 text-purple" />Drying Machines</h3><p className="text-sm text-gray-500">Configure drying machine specifications</p></div>
                                    <Dialog open={showDryingMachineDialog} onOpenChange={setShowDryingMachineDialog}>
                                        <DialogTrigger asChild><Button variant="outline" size="sm" className="border-purple/30 text-purple hover:bg-purple/10"><Plus className="w-4 h-4 mr-1" /> Add Machine</Button></DialogTrigger>
                                        <DialogContent className="bg-[#18181b] border-white/10">
                                            <DialogHeader><DialogTitle>Add Drying Machine</DialogTitle><DialogDescription>Enter the specifications for your drying machine.</DialogDescription></DialogHeader>
                                            <div className="space-y-4">
                                                <div><Label className="text-gray-400">Model Name</Label><Input value={newDryingMachine.model} onChange={(e) => setNewDryingMachine(prev => ({ ...prev, model: e.target.value }))} placeholder="e.g., Miele PT 7136" className="bg-black/20 border-white/10 mt-1" /></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><Label className="text-gray-400">Capacity (kg)</Label><DoubleInput step="any" value={newDryingMachine.capacity_kg} onChange={(val) => setNewDryingMachine(prev => ({ ...prev, capacity_kg: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                    <div><Label className="text-gray-400">Energy (kWh/cycle)</Label><DoubleInput step="any" value={newDryingMachine.energy_consumption_kwh_per_cycle} onChange={(val) => setNewDryingMachine(prev => ({ ...prev, energy_consumption_kwh_per_cycle: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                    <div><Label className="text-gray-400">Cycle Duration (min)</Label><DoubleInput step="any" value={newDryingMachine.cycle_duration_min} onChange={(val) => setNewDryingMachine(prev => ({ ...prev, cycle_duration_min: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                </div>
                                                <div className="p-3 bg-purple/5 border border-purple/10 rounded-lg">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <Label className="text-gray-400 text-xs">Average Load Percentage</Label>
                                                        <span className="text-purple font-bold text-xs">{config.loadPercentage}%</span>
                                                    </div>
                                                    <Slider
                                                        value={[config.loadPercentage]}
                                                        onValueChange={(vals) => setConfig(prev => ({ ...prev, loadPercentage: vals[0] }))}
                                                        max={100} step={0.1} className="py-2"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter><Button onClick={handleAddDryingMachine} className="bg-purple text-white hover:bg-purple/90">Save Machine</Button></DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <Select value={config.dryingMachineId || ''} onValueChange={(value) => setConfig(prev => ({ ...prev, dryingMachineId: value || null }))}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Select drying machine" /></SelectTrigger><SelectContent>{dryingMachines.map(m => (<SelectItem key={m.id} value={m.id}>{m.model} ({m.capacity_kg || 10}kg - {m.energy_consumption_kwh_per_cycle}kWh/cycle)</SelectItem>))}</SelectContent></Select>

                                {dryingMachines.length > 0 && (<div className="mt-4 space-y-2">{dryingMachines.map(m => (<div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg"><div><div className="font-medium text-white">{m.model}</div><div className="text-sm text-gray-400">{m.capacity_kg || 10}kg | {m.energy_consumption_kwh_per_cycle} kWh/cycle | {m.cycle_duration_min || 45}min</div></div><Button variant="ghost" size="sm" onClick={() => handleDeleteDryingMachine(m.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></Button></div>))}</div>)}
                            </div>
                            {/* Ironing Machines */}
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div><h3 className="font-heading font-semibold text-white flex items-center gap-2"><Settings className="w-4 h-4 text-amber" />Ironing Machines</h3><p className="text-sm text-gray-500">Configure ironing machine specifications</p></div>
                                    <Dialog open={showIroningMachineDialog} onOpenChange={setShowIroningMachineDialog}>
                                        <DialogTrigger asChild><Button variant="outline" size="sm" className="border-amber/30 text-amber hover:bg-amber/10"><Plus className="w-4 h-4 mr-1" /> Add Machine</Button></DialogTrigger>
                                        <DialogContent className="bg-[#18181b] border-white/10">
                                            <DialogHeader><DialogTitle>Add Ironing Machine</DialogTitle><DialogDescription>Enter the specifications for your ironing machine.</DialogDescription></DialogHeader>
                                            <div className="space-y-4">
                                                <div><Label className="text-gray-400">Model Name</Label><Input value={newIroningMachine.model} onChange={(e) => setNewIroningMachine(prev => ({ ...prev, model: e.target.value }))} placeholder="e.g., Miele HM 21-140" className="bg-black/20 border-white/10 mt-1" /></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><Label className="text-gray-400">Total Ironing Labor Hours</Label><DoubleInput step="any" value={newIroningMachine.ironing_labor_hours} onChange={(val) => setNewIroningMachine(prev => ({ ...prev, ironing_labor_hours: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                    <div><Label className="text-gray-400">Energy (kWh/hour)</Label><DoubleInput step="any" value={newIroningMachine.energy_consumption_kwh_per_hour} onChange={(val) => setNewIroningMachine(prev => ({ ...prev, energy_consumption_kwh_per_hour: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                </div>
                                            </div>
                                            <DialogFooter><Button onClick={handleAddIroningMachine} className="bg-amber text-black hover:bg-amber/90">Save Machine</Button></DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <Select value={config.ironingMachineId || ''} onValueChange={(value) => setConfig(prev => ({ ...prev, ironingMachineId: value || null }))}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Select ironing machine" /></SelectTrigger><SelectContent>{ironingMachines.map(m => (<SelectItem key={m.id} value={m.id}>{m.model} ({m.ironing_labor_hours} hrs)</SelectItem>))}</SelectContent></Select>
                                {ironingMachines.length > 0 && (<div className="mt-4 space-y-2">{ironingMachines.map(m => (<div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg"><div><div className="font-medium text-white">{m.model}</div><div className="text-sm text-gray-400">{m.ironing_labor_hours} hrs | {m.energy_consumption_kwh_per_hour} kWh/hour</div></div><Button variant="ghost" size="sm" onClick={() => actions.deleteIroningMachine(m.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></Button></div>))}</div>)}
                            </div>
                        </TabsContent>

                        <TabsContent value="chemicals" className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div><h3 className="font-heading font-semibold text-white flex items-center gap-2"><FlaskConical className="w-4 h-4 text-purple" />Chemicals</h3><p className="text-sm text-gray-500">Add washing powder, stain removers, etc.</p></div>
                                <Dialog open={showChemicalDialog} onOpenChange={setShowChemicalDialog}>
                                    <DialogTrigger asChild><Button variant="outline" size="sm" className="border-purple/30 text-purple hover:bg-purple/10"><Plus className="w-4 h-4 mr-1" /> Add Chemical</Button></DialogTrigger>
                                    <DialogContent className="bg-[#18181b] border-white/10">
                                        <DialogHeader><DialogTitle>Add Chemical</DialogTitle><DialogDescription>Enter the details for your laundry chemical.</DialogDescription></DialogHeader>
                                        <div className="space-y-4">
                                            <div><Label className="text-gray-400">Name</Label><Input value={newChemical.name} onChange={(e) => setNewChemical(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Premium Detergent" className="bg-black/20 border-white/10 mt-1" /></div>
                                            <div><Label className="text-gray-400">Type</Label><Select value={newChemical.type} onValueChange={(value) => setNewChemical(prev => ({ ...prev, type: value }))}><SelectTrigger className="bg-black/20 border-white/10 mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="washing_powder">Washing Powder</SelectItem><SelectItem value="stain_remover">Stain Remover</SelectItem><SelectItem value="softener">Fabric Softener</SelectItem><SelectItem value="bleach">Bleach</SelectItem></SelectContent></Select></div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><Label className="text-gray-400">Package Price ({currencySymbol})</Label><DoubleInput step="0.01" value={newChemical.package_price} onChange={(val) => setNewChemical(prev => ({ ...prev, package_price: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                                <div><Label className="text-gray-400">Package Weight (g)</Label><DoubleInput value={newChemical.package_weight_g} onChange={(val) => setNewChemical(prev => ({ ...prev, package_weight_g: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                            </div>
                                            <div><Label className="text-gray-400">Usage per Cycle (g)</Label><DoubleInput value={newChemical.usage_per_cycle_g} onChange={(val) => setNewChemical(prev => ({ ...prev, usage_per_cycle_g: val }))} className="bg-black/20 border-white/10 mt-1" /></div>
                                        </div>
                                        <DialogFooter><Button onClick={handleAddChemical} className="bg-purple text-white hover:bg-purple/90">Save Chemical</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            {chemicals.length === 0 ? (<div className="text-center py-8 text-gray-500"><FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No chemicals added yet</p><p className="text-sm">Add chemicals to include them in cost calculation</p></div>) : (<div className="space-y-2">{chemicals.map(chem => { const isSelected = selectedChemicals.includes(chem.id); const costPerCycle = (chem.package_price / chem.package_weight_g) * chem.usage_per_cycle_g; return (<div key={chem.id} className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-purple/20 border border-purple/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`} onClick={() => toggleChemical(chem.id)}><div className="flex items-center gap-3"><div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-purple border-purple' : 'border-gray-500'}`}>{isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}</div><div><div className="font-medium text-white">{chem.name}</div><div className="text-sm text-gray-400">{chem.type.replace('_', ' ')} | {currencySymbol}{chem.package_price} / {chem.package_weight_g}g | {chem.usage_per_cycle_g}g/cycle</div><div className="text-xs text-purple mt-1">Cost per cycle: {currencySymbol}{costPerCycle.toFixed(3)}</div></div></div><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteChemical(chem.id); }} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></Button></div>); })}</div>)}
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                        <Button onClick={onSave} className="flex-1 bg-cyan text-black font-bold hover:bg-cyan/90 rounded-full py-6 btn-glow"><Save className="w-4 h-4 mr-2" />Save Configuration</Button>
                        <Button onClick={onReset} variant="outline" className="border-white/20 hover:bg-white/10 rounded-full px-6"><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
