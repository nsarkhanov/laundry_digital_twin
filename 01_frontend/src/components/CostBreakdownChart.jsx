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
          <p>No cost data generated yet</p>
          <p className="text-xs mt-2">Adjust settings to see breakdown</p>
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

  // Calculate percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col md:flex-row items-center h-64">
      {/* Legend Left - Single Column */}
      <div className="w-full md:w-1/3 space-y-3 pr-4">
        {chartData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-300">{entry.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {currencySymbol}{entry.value.toFixed(3)}
              </div>
              <div className="text-xs text-gray-500">
                {((entry.value / total) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Right - Bigger */}
      <div className="w-full md:w-2/3 h-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90} // Increased size
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="custom-tooltip">
                      <p className="font-medium text-white mb-1">{payload[0].name}</p>
                      <p className="text-cyan text-sm">
                        {currencySymbol}{payload[0].value.toFixed(4)}/kg
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-lg font-bold text-white">
            {currencySymbol}{data.cost_per_kg.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
