import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  Legend
} from 'recharts';

interface SensitivityChartProps {
  data: {
    name: string;
    maxImpact: number;
    expectedImpact: number;
    probability: number;
  }[];
}

export const SensitivityChart: React.FC<SensitivityChartProps> = ({ data }) => {
  // Sort data by Max Impact to create the "Tornado" shape (largest at top)
  const sortedData = [...data].sort((a, b) => a.maxImpact - b.maxImpact);

  if (data.length === 0) return null;

  return (
    <div className="h-[400px] w-full p-6 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-2xl flex flex-col relative overflow-hidden">
       <div className="mb-4">
           <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
             SENSITIVITY ANALYSIS
             <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">TORNADO CHART</span>
           </h3>
           <p className="text-slate-400 text-sm">
             Which risks matter most? (Expected Delay vs. Worst Case)
           </p>
        </div>

      <div className="flex-1 w-full min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 5, right: 60, left: 40, bottom: 5 }}
            barGap={-25} // Overlap the bars
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={true} />
            <XAxis 
              type="number" 
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              unit=" Days"
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={140}
              stroke="#94a3b8"
              tick={{ fill: '#e2e8f0', fontSize: 13, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
              itemStyle={{ color: '#cbd5e1' }}
              formatter={(value: number, name: string) => {
                if (name === 'maxImpact') return [`${value} Days`, 'Worst Case Scenario'];
                if (name === 'expectedImpact') return [`${value.toFixed(1)} Days`, 'Expected (Probable) Delay'];
                return [value, name];
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}/>

            {/* Background Bar (Max Impact) - Wider */}
            <Bar dataKey="maxImpact" name="Max Possible Impact" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={25} stroke="#334155" strokeWidth={1}>
               <LabelList dataKey="maxImpact" position="right" fill="#64748b" fontSize={11} formatter={(val: number) => `${val}d`} />
            </Bar>
            
            {/* Foreground Bar (Expected Impact) - Thinner and colored */}
            <Bar dataKey="expectedImpact" name="Expected Impact (Weighted)" radius={[0, 4, 4, 0]} barSize={12}>
               {sortedData.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={entry.expectedImpact > 8 ? '#f59e0b' : '#06b6d4'} />
               ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
