import React, { useState } from 'react';
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Plus, Archive, RotateCcw } from "lucide-react";
import { RiskFactor } from "@/app/components/MonteCarlo/RiskInputForm";
import { CloudRain, Hammer, Truck, ScrollText, Ruler, TriangleAlert, Target, Zap } from "lucide-react";

interface RiskQuickAddProps {
  onAddRisk: (risk: RiskFactor) => void;
  existingRiskIds: string[];
}

export const RiskQuickAdd: React.FC<RiskQuickAddProps> = ({ onAddRisk, existingRiskIds }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const constructionPresets: RiskFactor[] = [
    { id: 'weather', name: 'Weather Volatility', description: 'Hurricanes, Heat Delays', active: true, probability: 30, impact: 15, icon: <CloudRain className="w-4 h-4" /> },
    { id: 'labor', name: 'Labor Variability', description: 'Productivity Gaps, Strikes', active: true, probability: 50, impact: 10, icon: <Hammer className="w-4 h-4" /> },
    { id: 'supply', name: 'Supply Chain', description: 'Material Delays', active: false, probability: 20, impact: 25, icon: <Truck className="w-4 h-4" /> },
    { id: 'permit', name: 'Permitting', description: 'Regulatory & Approval Delays', active: false, probability: 40, impact: 30, icon: <ScrollText className="w-4 h-4" /> },
    { id: 'design', name: 'Design Changes', description: 'Scope Creep & Rework', active: false, probability: 60, impact: 20, icon: <Ruler className="w-4 h-4" /> },
    { id: 'unknown', name: 'Unforeseen Conditions', description: 'Site Issues, Force Majeure', active: false, probability: 10, impact: 45, icon: <TriangleAlert className="w-4 h-4" /> },
  ];

  const handleAddCustom = () => {
    if (!newName) return;
    const newRisk: RiskFactor = {
      id: `custom-${Date.now()}`,
      name: newName,
      description: newDesc || 'Custom Risk Factor',
      active: true,
      probability: 50,
      impact: 20,
      icon: <Zap className="w-4 h-4" />
    };
    onAddRisk(newRisk);
    setNewName('');
    setNewDesc('');
    setIsAdding(false);
  };

  const handleAddPreset = (preset: RiskFactor) => {
    // If ID exists, append timestamp to make it unique or just skip? 
    // User wants to "add back", so if it's not there, add it.
    if (existingRiskIds.includes(preset.id)) {
        // If it exists, maybe alert or just do nothing? 
        // Let's assume we just want to ensure it's in the list. 
        // But the parent handles the list. 
        // If it's already there, we might want to duplicate it? No, standard logic is unique IDs.
        // Let's create a copy with a new ID if it clashes, or just warn.
        // Actually, if the user "removed" it (which isn't a feature yet, only "inactive"), 
        // then we might just want to activate it. 
        // But the user might have deleted it if we add delete functionality later.
        // For now, let's just add it with a unique ID if the ID is taken, or use the original ID.
        const riskToAdd = { ...preset, id: `${preset.id}-${Date.now()}` }; 
        onAddRisk(riskToAdd);
    } else {
        onAddRisk(preset);
    }
  };

  const missingPresets = constructionPresets.filter(p => !existingRiskIds.includes(p.id));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
      
      {/* Quick Add Custom */}
      <Card className="p-4 bg-slate-900/50 border-dashed border-slate-700 hover:border-cyan-500/50 transition-colors">
        {!isAdding ? (
          <Button 
            variant="ghost" 
            className="w-full h-auto py-4 flex flex-col gap-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-8 h-8 opacity-50" />
            <span className="text-xs font-mono uppercase tracking-widest">Add Custom Variable</span>
          </Button>
        ) : (
          <div className="space-y-3">
             <div className="flex justify-between items-center mb-2">
                <Label className="text-xs text-cyan-500 uppercase">New Risk Variable</Label>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-500" onClick={() => setIsAdding(false)}><Archive className="w-3 h-3" /></Button>
             </div>
             <Input 
                placeholder="Variable Name (e.g. Labor Strike)" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-slate-950 border-slate-700 text-sm h-8"
             />
             <Input 
                placeholder="Description (Optional)" 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="bg-slate-950 border-slate-700 text-sm h-8"
             />
             <Button 
                onClick={handleAddCustom}
                disabled={!newName}
                className="w-full bg-cyan-900/50 hover:bg-cyan-800 text-cyan-100 h-8 text-xs uppercase tracking-wider"
             >
                Initialize Variable
             </Button>
          </div>
        )}
      </Card>

      {/* Presets - Only show if there are missing standard presets or user wants to see them */}
      {missingPresets.length > 0 && (
        <div className="space-y-2">
            <Label className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">Restorable Construction Assets</Label>
            <div className="grid grid-cols-2 gap-2">
                {missingPresets.map(preset => (
                    <Button
                        key={preset.id}
                        variant="outline"
                        onClick={() => handleAddPreset(preset)}
                        className="h-8 justify-start text-xs border-slate-800 bg-slate-900/30 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-950/20"
                    >
                        <RotateCcw className="w-3 h-3 mr-2 opacity-50" />
                        {preset.name}
                    </Button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
