import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const COLORS = {
  electricity: '#06b6d4', // cyan
  water: '#3b82f6',       // blue
  chemicals: '#8b5cf6',   // purple
  labor: '#f59e0b'        // amber
};

export default function CostImpactChart({ data, currencySymbol }) {
  if (!data || data.cost_per_kg === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  const chartData = [
    { 
      name: 'Electricity', 
      value: (data.electricity_cost_per_kg / data.cost_per_kg) * 100,
      absoluteValue: data.electricity_cost_per_kg,
      color: COLORS.electricity 
    },
    { 
      name: 'Water', 
      value: (data.water_cost_per_kg / data.cost_per_kg) * 100,
      absoluteValue: data.water_cost_per_kg,
      color: COLORS.water 
    },
    { 
      name: 'Chemicals', 
      value: (data.chemical_cost_per_kg / data.cost_per_kg) * 100,
      absoluteValue: data.chemical_cost_per_kg,
      color: COLORS.chemicals 
    },
    { 
      name: 'Labor', 
      value: (data.labor_cost_per_kg / data.cost_per_kg) * 100,
      absoluteValue: data.labor_cost_per_kg,
      color: COLORS.labor 
    }
  ].sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#18181b] border border-white/10 rounded-lg p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-white">{item.name}</span>
          </div>
          <div className="text-lg font-bold text-white">
            {item.value.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">
            {currencySymbol}{item.absoluteValue.toFixed(4)}/kg
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            axisLine={{ stroke: '#27272a' }}
            tickLine={{ stroke: '#27272a' }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category" 
            dataKey="name"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            axisLine={{ stroke: '#27272a' }}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar 
            dataKey="value" 
            radius={[0, 4, 4, 0]}
            barSize={24}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="transition-all duration-300"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Percentage markers */}
      <div className="flex justify-between text-xs text-gray-600 mt-2 px-20">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
