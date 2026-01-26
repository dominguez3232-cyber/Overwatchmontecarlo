import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Slider } from "@/app/components/ui/slider";
import { Play } from "lucide-react";

interface SimulationParams {
  initialPrice: number;
  expectedReturn: number;
  volatility: number;
  timeHorizon: number;
  numSimulations: number;
}

interface SimulationFormProps {
  params: SimulationParams;
  setParams: (params: SimulationParams) => void;
  onRun: () => void;
  isRunning: boolean;
}

export const SimulationForm: React.FC<SimulationFormProps> = ({
  params,
  setParams,
  onRun,
  isRunning,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams({ ...params, [name]: parseFloat(value) || 0 });
  };

  return (
    <div className="space-y-6 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           Parameters
        </h2>
        <p className="text-sm text-gray-300">Configure your GBM model settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="initialPrice" className="text-gray-200">Initial Price ($)</Label>
          <Input
            id="initialPrice"
            name="initialPrice"
            type="number"
            value={params.initialPrice}
            onChange={handleChange}
            className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedReturn" className="text-gray-200">Expected Annual Return (%)</Label>
          <Input
            id="expectedReturn"
            name="expectedReturn"
            type="number"
            value={params.expectedReturn}
            onChange={handleChange}
             className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="volatility" className="text-gray-200">Annual Volatility (%)</Label>
          <Input
            id="volatility"
            name="volatility"
            type="number"
            value={params.volatility}
            onChange={handleChange}
             className="bg-black/20 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeHorizon" className="text-gray-200">Time Horizon (Years)</Label>
          <Input
            id="timeHorizon"
            name="timeHorizon"
            type="number"
            value={params.timeHorizon}
            onChange={handleChange}
             className="bg-black/20 border-white/10 text-white"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="numSimulations" className="text-gray-200">Number of Simulations (10-500)</Label>
          <div className="flex items-center gap-4">
             <Slider
              defaultValue={[params.numSimulations]}
              max={500}
              min={10}
              step={10}
              value={[params.numSimulations]}
              onValueChange={(val) => setParams({...params, numSimulations: val[0]})}
              className="flex-1"
             />
             <span className="text-white font-mono w-12 text-right">{params.numSimulations}</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={onRun} 
        disabled={isRunning}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3"
      >
        {isRunning ? 'Running...' : <><Play className="w-4 h-4 mr-2" /> Run Simulation</>}
      </Button>
    </div>
  );
};
