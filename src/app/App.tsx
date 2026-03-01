import React, { useState, useEffect } from 'react';
import { RiskInputForm, ProjectParams, RiskFactor } from "@/app/components/MonteCarlo/RiskInputForm";
import { RiskQuickAdd } from "@/app/components/MonteCarlo/RiskQuickAdd";
import { OutcomeHistogram } from "@/app/components/MonteCarlo/OutcomeHistogram";
import { CockpitDashboard } from "@/app/components/MonteCarlo/CockpitDashboard";
import { SensitivityChart } from "@/app/components/MonteCarlo/SensitivityChart";
import { DraggablePanel, useDraggablePanels } from "@/app/components/MonteCarlo/DraggablePanel";
import { addDays, differenceInDays, format } from 'date-fns';
import { Target, CloudRain, Hammer, Truck, ScrollText, Ruler, TriangleAlert, Info, Lock, Unlock, RotateCcw, Move, Scaling } from "lucide-react";

// Import Assets
import backgroundImage from "figma:asset/dc9703d5168e6711d7ef0481d87e0acfcf40c9b8.png";

const App: React.FC = () => {
  const [params, setParams] = useState<ProjectParams>({
    baseDuration: 180,
    startDate: new Date().toISOString().split('T')[0],
    targetDate: addDays(new Date(), 240).toISOString().split('T')[0],
    risks: [
      { 
        id: 'entitlement', name: 'Entitlement Risk', description: 'Zoning/Permit Stalls (PD-12)', 
        active: true, probability: 65, impact: 45, 
        icon: <ScrollText className="w-4 h-4" /> 
      },
      { 
        id: 'liability', name: 'Latent Liabilities', description: 'Hidden Fees (e.g. City Impact)', 
        active: true, probability: 25, impact: 30, 
        icon: <TriangleAlert className="w-4 h-4" /> 
      },
      { 
        id: 'capital', name: 'Capital Adequacy', description: 'Funding Freeze / Draw Delays', 
        active: true, probability: 40, impact: 90, 
        icon: <Target className="w-4 h-4" /> 
      },
      { 
        id: 'labor', name: 'Subcontractor Default', description: 'Trade Availability & Disputes', 
        active: false, probability: 30, impact: 20, 
        icon: <Hammer className="w-4 h-4" /> 
      },
      { 
        id: 'market', name: 'Market Volatility', description: 'Cost Escalaton / Interest Rates', 
        active: false, probability: 50, impact: 25, 
        icon: <CloudRain className="w-4 h-4" /> 
      },
      { 
        id: 'design', name: 'Scope Creep', description: 'Design/Spec Changes', 
        active: false, probability: 35, impact: 15, 
        icon: <Ruler className="w-4 h-4" /> 
      },
    ],
    simulations: 10000,
  });

  const [histogramData, setHistogramData] = useState<any[]>([]);
  const [sensitivityData, setSensitivityData] = useState<any[]>([]); // New state
  const [p50Date, setP50Date] = useState<Date>(new Date());
  const [p90Date, setP90Date] = useState<Date>(new Date());
  const [probability, setProbability] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const PANEL_IDS = ['riskForm', 'quickAdd', 'cockpit', 'forensics', 'sensitivity', 'histogram'];
  const {
    positions,
    sizes,
    zIndices,
    isLocked,
    hasCustomLayout,
    updatePosition,
    updateSize,
    bringToFront,
    resetLayout,
    toggleLock,
  } = useDraggablePanels(PANEL_IDS);

  useEffect(() => {
    // Run initial small simulation
    runSimulation();
  }, []);

  const handleAddRisk = (newRisk: RiskFactor) => {
    setParams(prev => ({
      ...prev,
      risks: [...prev.risks, newRisk]
    }));
  };

  const runSimulation = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const results: number[] = [];
      const { baseDuration, risks, simulations } = params;
      const targetDays = differenceInDays(new Date(params.targetDate), new Date(params.startDate));

      // Calculate Sensitivity Data
      const sensData = risks.filter(r => r.active).map(r => ({
          name: r.name,
          maxImpact: r.impact,
          expectedImpact: r.impact * (r.probability / 100),
          probability: r.probability
      }));
      setSensitivityData(sensData);

      // Monte Carlo Logic
      for (let i = 0; i < simulations; i++) {
        let duration = baseDuration;
        
        // Loop through all active risks
        risks.filter(r => r.active).forEach(risk => {
             // Roll the dice (0-100)
             const roll = Math.random() * 100;
             if (roll < risk.probability) {
                 // Risk Event Occurs
                 // Calculate impact: Random variation between 10% and 100% of max impact
                 const severity = 0.1 + (Math.random() * 0.9);
                 duration += Math.round(risk.impact * severity);
             }
        });
        
        // Always add some small inherent noise (white noise) +/- 5%
        duration += (Math.random() - 0.5) * (baseDuration * 0.05);

        results.push(Math.round(duration));
      }

      // Analyze Results
      results.sort((a, b) => a - b);
      
      const p50Index = Math.floor(simulations * 0.5);
      const p90Index = Math.floor(simulations * 0.9);
      
      const p50Days = results[p50Index];
      const p90Days = results[p90Index];
      
      const p50DateVal = addDays(new Date(params.startDate), p50Days);
      const p90DateVal = addDays(new Date(params.startDate), p90Days);
      
      // Calculate Probability of hitting target
      const successCount = results.filter(d => d <= targetDays).length;
      const prob = (successCount / simulations) * 100;

      // Build Histogram Data
      const min = results[0];
      const max = results[results.length - 1];
      const buckets = 30; // Increased buckets for higher resolution
      const range = max - min;
      const bucketSize = Math.max(1, Math.ceil(range / buckets));
      
      const hist = new Array(buckets + 1).fill(0).map((_, i) => ({
          days: min + (i * bucketSize),
          frequency: 0
      }));

      results.forEach(val => {
          const bucketIndex = Math.floor((val - min) / bucketSize);
          if (hist[bucketIndex]) hist[bucketIndex].frequency++;
      });

      // Filter out empty tail buckets
      const cleanHist = hist.filter(h => h.frequency > 0);

      setHistogramData(cleanHist);
      setP50Date(p50DateVal);
      setP90Date(p90DateVal);
      setProbability(prob);
      setHasRun(true);
      setIsRunning(false);
    }, 200); // UI delay
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white relative font-sans selection:bg-cyan-500/30">
      
      {/* Background with Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) contrast(110%) brightness(0.6)'
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-zinc-900/90 via-zinc-900/80 to-black/90 pointer-events-none" />
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#52525b 1px, transparent 1px), linear-gradient(90deg, #52525b 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-cyan-900/30 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-5xl font-black text-zinc-100 tracking-tighter uppercase leading-none">
                OVERWATCH<span className="align-top text-3xl">³</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-90">// DECISION OS</span>
              </h1>
              <div className="text-sm font-mono text-cyan-500/80 tracking-[0.3em] mt-3 pl-1">OPERATING SYSTEM FOR BUSINESS EXCELLENCE</div>

            </div>
          </div>
          
          <div className="text-right hidden md:block">
            <div className="text-xs text-zinc-500 font-mono">SYSTEM STATUS</div>
            <div className="flex items-center justify-end gap-2 text-emerald-500 font-mono text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ONLINE // v3.0.0
            </div>
          </div>
        </header>

        {/* Layout Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLock}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border ${
                isLocked
                  ? 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  LAYOUT LOCKED
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  LAYOUT UNLOCKED
                </>
              )}
            </button>

            {!isLocked && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-900/40 px-3 py-2 rounded-lg border border-slate-800">
                <Move className="w-3 h-3" />
                DRAG TO MOVE
                <span className="text-slate-700 mx-1">|</span>
                <Scaling className="w-3 h-3" />
                EDGES & CORNERS TO RESIZE
              </div>
            )}
          </div>

          {hasCustomLayout && (
            <button
              onClick={resetLayout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider bg-slate-900/60 border border-amber-500/30 text-amber-400 hover:bg-amber-950/30 hover:border-amber-500/50 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET LAYOUT
            </button>
          )}
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-8">
            <DraggablePanel
              id="riskForm"
              position={positions.riskForm || { x: 0, y: 0 }}
              onPositionChange={updatePosition}
              size={sizes.riskForm || { width: 'auto', height: 'auto' }}
              onSizeChange={updateSize}
              zIndex={zIndices.riskForm || 1}
              onBringToFront={bringToFront}
              isLocked={isLocked}
            >
              <RiskInputForm 
                params={params} 
                setParams={setParams} 
                onRun={runSimulation} 
                isRunning={isRunning} 
              />
            </DraggablePanel>
            
            <DraggablePanel
              id="quickAdd"
              position={positions.quickAdd || { x: 0, y: 0 }}
              onPositionChange={updatePosition}
              size={sizes.quickAdd || { width: 'auto', height: 'auto' }}
              onSizeChange={updateSize}
              zIndex={zIndices.quickAdd || 2}
              onBringToFront={bringToFront}
              isLocked={isLocked}
            >
              <RiskQuickAdd 
                onAddRisk={handleAddRisk}
                existingRiskIds={params.risks.map(r => r.id)}
              />
            </DraggablePanel>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {hasRun ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* 1. Cockpit Dashboard */}
                <DraggablePanel
                  id="cockpit"
                  position={positions.cockpit || { x: 0, y: 0 }}
                  onPositionChange={updatePosition}
                  size={sizes.cockpit || { width: 'auto', height: 'auto' }}
                  onSizeChange={updateSize}
                  zIndex={zIndices.cockpit || 3}
                  onBringToFront={bringToFront}
                  isLocked={isLocked}
                >
                  <CockpitDashboard 
                    p50Date={p50Date} 
                    p90Date={p90Date} 
                    probability={probability} 
                  />
                </DraggablePanel>
                
                {/* 2. Insight Banner - High Prominence */}
                <DraggablePanel
                  id="forensics"
                  position={positions.forensics || { x: 0, y: 0 }}
                  onPositionChange={updatePosition}
                  size={sizes.forensics || { width: 'auto', height: 'auto' }}
                  onSizeChange={updateSize}
                  zIndex={zIndices.forensics || 4}
                  onBringToFront={bringToFront}
                  isLocked={isLocked}
                >
                  <div className="p-5 bg-gradient-to-r from-cyan-950/60 to-slate-900/60 border border-cyan-500/30 rounded-xl flex items-start gap-4 shadow-lg backdrop-blur-md">
                     <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 mt-1">
                        <Info className="w-6 h-6" />
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-cyan-400 font-bold font-mono tracking-wider text-sm flex items-center gap-2">
                          DECISION FORENSICS BRIEF <span className="text-xs bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300">{params.simulations.toLocaleString()} Scenarios</span>
                        </h3>
                        <p className="text-zinc-200 leading-relaxed text-sm">
                           Based on active <strong>Entitlement & Capital Risks</strong>, there is a <span className="font-bold text-white text-base">{probability.toFixed(1)}% probability</span> of meeting the target. 
                           To achieve <strong>90% Confidence (P90)</strong>, the project requires a buffer of <span className="font-bold text-white border-b border-dashed border-cyan-500">{differenceInDays(p90Date, new Date(params.targetDate))} days</span>.
                        </p>
                     </div>
                  </div>
                </DraggablePanel>

                {/* 3. Sensitivity Chart - Full Width */}
                <DraggablePanel
                  id="sensitivity"
                  position={positions.sensitivity || { x: 0, y: 0 }}
                  onPositionChange={updatePosition}
                  size={sizes.sensitivity || { width: 'auto', height: 'auto' }}
                  onSizeChange={updateSize}
                  zIndex={zIndices.sensitivity || 5}
                  onBringToFront={bringToFront}
                  isLocked={isLocked}
                >
                  <SensitivityChart data={sensitivityData} />
                </DraggablePanel>

                {/* 4. Histogram - Full Width */}
                <DraggablePanel
                  id="histogram"
                  position={positions.histogram || { x: 0, y: 0 }}
                  onPositionChange={updatePosition}
                  size={sizes.histogram || { width: 'auto', height: 'auto' }}
                  onSizeChange={updateSize}
                  zIndex={zIndices.histogram || 6}
                  onBringToFront={bringToFront}
                  isLocked={isLocked}
                >
                  <OutcomeHistogram 
                    data={histogramData} 
                    p50={differenceInDays(p50Date, new Date(params.startDate))}
                    p90={differenceInDays(p90Date, new Date(params.startDate))}
                    baseEstimate={params.baseDuration}
                  />
                </DraggablePanel>
                
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-700/50 rounded-3xl text-zinc-500 bg-zinc-900/30">
                <Target className="w-16 h-16 mb-4 opacity-40" />
                <h3 className="text-xl font-medium">Ready to Simulate</h3>
                <p>Configure parameters and initialize the Monte Carlo engine.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;