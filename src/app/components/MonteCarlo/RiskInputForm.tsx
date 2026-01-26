import React from 'react';
import { Card } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Slider } from "@/app/components/ui/slider";
import { Switch } from "@/app/components/ui/switch";
import { Button } from "@/app/components/ui/button";
import { Play, AlertTriangle, Hammer, CloudRain, Truck, FileText, XCircle, Search } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  active: boolean;
  probability: number; // 0-100%
  impact: number; // Max days delay
  icon: React.ReactNode;
}

export interface ProjectParams {
  baseDuration: number;
  startDate: string;
  targetDate: string;
  risks: RiskFactor[];
  simulations: number;
}

interface RiskInputFormProps {
  params: ProjectParams;
  setParams: (params: ProjectParams) => void;
  onRun: () => void;
  isRunning: boolean;
}

export const RiskInputForm: React.FC<RiskInputFormProps> = ({
  params,
  setParams,
  onRun,
  isRunning
}) => {

  const toggleRisk = (id: string) => {
    setParams({
      ...params,
      risks: params.risks.map(r => r.id === id ? { ...r, active: !r.active } : r)
    });
  };

  const updateRisk = (id: string, updates: Partial<RiskFactor>) => {
    setParams({
      ...params,
      risks: params.risks.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  return (
    <Card className="p-6 bg-slate-900/80 backdrop-blur-md border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-cyan-50">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5" /> Risk Factors
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Define Battlefield Conditions</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-cyan-200">Base Estimate (Days)</Label>
            <Input 
              type="number" 
              value={params.baseDuration}
              onChange={(e) => setParams({...params, baseDuration: parseInt(e.target.value) || 0})}
              className="bg-slate-950/50 border-cyan-500/30 focus-visible:ring-cyan-500/50 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label className="text-cyan-200">Start Date</Label>
              <Input 
                type="date" 
                value={params.startDate}
                onChange={(e) => setParams({...params, startDate: e.target.value})}
                className="bg-slate-950/50 border-cyan-500/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cyan-200">Target Deadline</Label>
              <Input 
                type="date" 
                value={params.targetDate}
                onChange={(e) => setParams({...params, targetDate: e.target.value})}
                className="bg-slate-950/50 border-cyan-500/30 text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-cyan-900/50">
          <Label className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2 block">Active Threats ({params.risks.filter(r => r.active).length} Active)</Label>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {params.risks.map((risk) => (
              <div key={risk.id} className={`p-3 rounded-lg border transition-all ${risk.active ? 'bg-slate-950/50 border-slate-700' : 'bg-slate-950/20 border-slate-800 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${risk.active ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                      {risk.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{risk.name}</div>
                      <div className="text-xs text-slate-500">{risk.description}</div>
                    </div>
                  </div>
                  <Switch checked={risk.active} onCheckedChange={() => toggleRisk(risk.id)} />
                </div>
                
                {risk.active && (
                   <div className="mt-3 space-y-3 pl-2 pr-1 border-t border-slate-800 pt-3 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1">
                         <div className="flex justify-between text-xs text-slate-400">
                           <span>Probability</span>
                           <span>{risk.probability}%</span>
                         </div>
                         <Slider 
                           min={0} max={100} step={5} 
                           value={[risk.probability]} 
                           onValueChange={(val) => updateRisk(risk.id, { probability: val[0] })}
                           className="[&_.relative]:bg-slate-800 [&_span]:bg-amber-500"
                         />
                      </div>
                      <div className="space-y-1">
                         <div className="flex justify-between text-xs text-slate-400">
                           <span>Max Impact</span>
                           <span>{risk.impact} Days</span>
                         </div>
                         <Slider 
                           min={0} max={60} step={1} 
                           value={[risk.impact]} 
                           onValueChange={(val) => updateRisk(risk.id, { impact: val[0] })}
                           className="[&_.relative]:bg-slate-800 [&_span]:bg-rose-500"
                         />
                      </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex justify-between text-xs text-cyan-300">
            <span>Simulations: {params.simulations.toLocaleString()}</span>
            <span>Accuracy: {params.simulations >= 5000 ? 'Ultra-High' : 'High'}</span>
          </div>
          <Slider 
            min={100} 
            max={10000} 
            step={100} 
            value={[params.simulations]} 
            onValueChange={(val) => setParams({...params, simulations: val[0]})}
            className="[&_.relative]:bg-cyan-950 [&_span]:bg-cyan-500"
          />
        </div>

        <Button 
          onClick={onRun} 
          disabled={isRunning}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 tracking-wider shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all"
        >
          {isRunning ? 'CALCULATING RISKS...' : <><Play className="w-4 h-4 mr-2" /> RUN SIMULATION</>}
        </Button>
      </div>
    </Card>
  );
};
