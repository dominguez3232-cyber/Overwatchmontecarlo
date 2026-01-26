import React from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

interface SimulationStatsProps {
  finalPrices: number[];
  initialPrice: number;
}

export const SimulationStats: React.FC<SimulationStatsProps> = ({ finalPrices, initialPrice }) => {
  if (!finalPrices || finalPrices.length === 0) return null;

  // Calculate statistics
  const n = finalPrices.length;
  const sum = finalPrices.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  
  const sortedPrices = [...finalPrices].sort((a, b) => a - b);
  const median = sortedPrices[Math.floor(n / 2)];
  const min = sortedPrices[0];
  const max = sortedPrices[n - 1];
  
  const percentile5 = sortedPrices[Math.floor(n * 0.05)];
  const percentile95 = sortedPrices[Math.floor(n * 0.95)];

  const totalReturn = ((mean - initialPrice) / initialPrice) * 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard 
        title="Expected Price (Mean)" 
        value={`$${mean.toFixed(2)}`} 
        subtext={`${totalReturn > 0 ? '+' : ''}${totalReturn.toFixed(2)}% Return`}
        icon={<Target className="text-blue-400" />}
        trend={totalReturn > 0 ? 'up' : 'down'}
      />
      <StatCard 
        title="Median Price" 
        value={`$${median.toFixed(2)}`} 
        subtext="50th Percentile"
        icon={<Activity className="text-purple-400" />}
      />
      <StatCard 
        title="90% Confidence Interval" 
        value={`$${percentile5.toFixed(0)} - $${percentile95.toFixed(0)}`} 
        subtext="Range of likely outcomes"
        icon={<TrendingUp className="text-green-400" />}
      />
      <StatCard 
        title="Extreme Range" 
        value={`$${min.toFixed(0)} - $${max.toFixed(0)}`} 
        subtext="Worst to Best Case"
        icon={<TrendingDown className="text-red-400" />}
      />
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon, trend }: any) => (
  <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-xs mt-1 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
        {subtext}
      </div>
    </CardContent>
  </Card>
);
