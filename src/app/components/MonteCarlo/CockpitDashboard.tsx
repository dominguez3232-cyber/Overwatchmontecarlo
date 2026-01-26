import React from 'react';
import { Card } from "@/app/components/ui/card";
import { format } from 'date-fns';

interface CockpitDashboardProps {
  p50Date: Date;
  p90Date: Date;
  probability: number;
}

export const CockpitDashboard: React.FC<CockpitDashboardProps> = ({ p50Date, p90Date, probability }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* P50 Card - Cyan */}
      <Card className="relative overflow-hidden group bg-slate-900/60 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="p-6 relative z-10 text-center space-y-2">
          <div className="text-cyan-400 text-3xl font-bold font-mono tracking-tighter">
            P50: {format(p50Date, 'MMM dd, yyyy').toUpperCase()}
          </div>
          <div className="text-white font-medium text-lg">Most Likely Completion</div>
          <div className="text-slate-400 text-xs italic">Fecha de finalización más probable</div>
          
          <div className="mt-4 h-16 w-full flex items-end justify-center">
             {/* Abstract curve illustration */}
             <svg viewBox="0 0 100 40" className="w-3/4 h-full overflow-visible">
               <path d="M0,40 Q50,0 100,40" fill="none" stroke="rgb(34, 211, 238)" strokeWidth="2" />
               <line x1="50" y1="40" x2="50" y2="10" stroke="rgb(34, 211, 238)" strokeWidth="2" strokeDasharray="4 2" />
               <circle cx="50" cy="10" r="3" fill="rgb(34, 211, 238)" />
             </svg>
          </div>
        </div>
      </Card>

      {/* P90 Card - Amber */}
      <Card className="relative overflow-hidden group bg-slate-900/60 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
        <div className="p-6 relative z-10 text-center space-y-2">
          <div className="text-amber-400 text-3xl font-bold font-mono tracking-tighter">
            P90: {format(p90Date, 'MMM dd, yyyy').toUpperCase()}
          </div>
          <div className="text-white font-medium text-lg">High Confidence Completion</div>
          <div className="text-slate-400 text-xs italic">Fecha de finalización con alta confianza</div>
          
          <div className="mt-4 h-16 w-full flex items-end justify-center">
             {/* Abstract curve illustration skewed right */}
             <svg viewBox="0 0 100 40" className="w-3/4 h-full overflow-visible">
               <path d="M0,40 Q40,0 100,40" fill="none" stroke="rgb(251, 191, 36)" strokeWidth="2" />
               <line x1="80" y1="40" x2="80" y2="15" stroke="rgb(251, 191, 36)" strokeWidth="2" strokeDasharray="4 2" />
               <circle cx="80" cy="15" r="3" fill="rgb(251, 191, 36)" />
             </svg>
          </div>
        </div>
      </Card>

      {/* Probability Card - Green/Red */}
      <Card className={`relative overflow-hidden group bg-slate-900/60 border ${probability >= 70 ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]'}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${probability >= 70 ? 'from-emerald-500/10' : 'from-rose-500/10'} to-transparent pointer-events-none`} />
        <div className="p-6 relative z-10 text-center space-y-2">
          <div className={`${probability >= 70 ? 'text-emerald-400' : 'text-rose-400'} text-5xl font-bold font-mono tracking-tighter`}>
            {probability.toFixed(0)}%
          </div>
          <div className="text-white font-medium text-lg">On-Time Probability</div>
          <div className="text-slate-400 text-xs italic">Probabilidad vs Objetivo</div>
          
          <div className="mt-6 w-3/4 mx-auto bg-slate-800 h-4 rounded-full overflow-hidden border border-slate-700 relative">
             <div 
               className={`h-full ${probability >= 70 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`} 
               style={{ width: `${probability}%` }}
             />
             <div className="absolute top-0 bottom-0 w-0.5 bg-white/50 left-[80%]" title="Target Confidence" />
          </div>
        </div>
      </Card>
    </div>
  );
};
