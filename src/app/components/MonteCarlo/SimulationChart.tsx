import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface SimulationChartProps {
  data: any[];
  numSimulations: number;
}

export const SimulationChart: React.FC<SimulationChartProps> = ({ data, numSimulations }) => {
  // Cap visualized lines to avoid performance issues
  const maxVisualized = 100;
  const simulationKeys = Array.from({ length: Math.min(numSimulations, maxVisualized) }, (_, i) => `sim_${i}`);

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-gray-400">
        Run simulation to see results
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4 shrink-0">Price Projection Paths</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="step" 
              label={{ value: 'Days', position: 'insideBottomRight', offset: -5, fill: '#9ca3af' }} 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
              itemStyle={{ color: '#d1d5db' }}
              labelStyle={{ color: '#9ca3af' }}
              labelFormatter={(label) => `Day ${label}`}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              // Only show the mean in tooltip to avoid clutter
              filterNull={false}
            />
            
            {/* Individual Simulation Paths */}
            {simulationKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke="#6366f1"
                strokeWidth={1}
                strokeOpacity={0.15}
                dot={false}
                isAnimationActive={false} 
              />
            ))}

            {/* Mean Path */}
            <Line
              type="monotone"
              dataKey="mean"
              stroke="#f43f5e"
              strokeWidth={3}
              dot={false}
              name="Average"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
