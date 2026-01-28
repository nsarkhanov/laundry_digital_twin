import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  electricity: '#06b6d4', // cyan
  water: '#3b82f6',       // blue
  chemicals: '#8b5cf6',   // purple
  labor: '#f59e0b'        // amber
};

export default function CostBreakdownChart({ data, currencySymbol }) {
  if (!data || data.cost_per_kg === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2 opacity-30">📊</div>
          <p>No cost data available</p>
          <p className="text-sm">Adjust settings to see breakdown</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Electricity', value: data.electricity_cost_per_kg, color: COLORS.electricity },
    { name: 'Water', value: data.water_cost_per_kg, color: COLORS.water },
    { name: 'Chemicals', value: data.chemical_cost_per_kg, color: COLORS.chemicals },
    { name: 'Labor', value: data.labor_cost_per_kg, color: COLORS.labor }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = ((item.value / data.cost_per_kg) * 100).toFixed(1);
      return (
        <div className="bg-[#18181b] border border-white/10 rounded-lg p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.payload.color }}
            />
            <span className="font-medium text-white">{item.name}</span>
          </div>
          <div className="text-lg font-bold text-white">
            {currencySymbol}{item.value.toFixed(4)}/kg
          </div>
          <div className="text-sm text-gray-400">
            {percentage}% of total
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-3xl font-heading font-bold text-white">
            {currencySymbol}{data.cost_per_kg.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">per kg</div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {chartData.map((item) => {
          const percentage = ((item.value / data.cost_per_kg) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0">
                <div className="text-sm text-gray-400 truncate">{item.name}</div>
                <div className="text-sm font-medium text-white">
                  {currencySymbol}{item.value.toFixed(4)}/kg
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
