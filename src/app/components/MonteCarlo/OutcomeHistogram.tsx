import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

interface OutcomeHistogramProps {
  data: { days: number, frequency: number }[];
  p50: number;
  p90: number;
  baseEstimate: number;
}

export const OutcomeHistogram: React.FC<OutcomeHistogramProps> = ({ data, p50, p90, baseEstimate }) => {
  if (!data || data.length === 0) {
     return (
       <div className="h-[400px] flex items-center justify-center bg-slate-900/50 border border-slate-800 rounded-xl text-slate-500 font-mono uppercase tracking-widest">
         Awaiting Simulation Data...
       </div>
     );
  }

  return (
    <div className="h-[500px] w-full p-6 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-2xl flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
           <h3 className="text-xl font-bold text-white tracking-wide">DISTRIBUTION OF OUTCOMES</h3>
           <p className="text-slate-400 text-sm">Monte Carlo Iterations showing probability density</p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-cyan-500 rounded-full"></div> P50 (Likely)
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-amber-500 rounded-full"></div> P90 (Safe)
           </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap={0}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="days" 
              label={{ value: 'Project Duration (Days)', position: 'insideBottom', offset: -10, fill: '#64748b' }} 
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value: number) => [value, 'Occurrences']}
              labelFormatter={(label) => `${label} Days`}
            />
            <Bar dataKey="frequency" fill="#3b82f6" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => {
                 // Color logic for histogram bars
                 if (entry.days <= baseEstimate) return <Cell key={`cell-${index}`} fill="#10b981" opacity={0.6} />;
                 if (entry.days > p90) return <Cell key={`cell-${index}`} fill="#f43f5e" opacity={0.6} />;
                 return <Cell key={`cell-${index}`} fill="#3b82f6" opacity={0.4} />;
              })}
            </Bar>
            
            {/* P50 Line */}
            <ReferenceLine x={p50} stroke="#06b6d4" strokeDasharray="3 3" strokeWidth={2}>
            </ReferenceLine>
            
            {/* P90 Line */}
            <ReferenceLine x={p90} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2}>
            </ReferenceLine>

          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative background elements for "Tech" feel */}
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-cyan-500/20 rounded-bl-3xl pointer-events-none"></div>
    </div>
  );
};
