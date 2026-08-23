import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  data: Array<{ scenario: string; min: number; median: number; max: number }>;
}

export const MaxEmiByScenarioChart: React.FC<Props> = ({ data }) => {
  const overallMax = Math.max(...data.map(d => d.max));
  const topScenario = data.find(d => d.max === overallMax);
  const medians = data.map(d => d.median);
  const medianLow = Math.min(...medians);
  const medianHigh = Math.max(...medians);

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4">
      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
        Max Recommended Monthly EMI Distribution by Scenario (INR)
      </h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="scenario" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'INR']}
              contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', color: '#fff', fontSize: '12px' }}
            />
            <Bar dataKey="median" fill="#10b981" radius={[4, 4, 0, 0]} name="Median Max EMI" />
            <Bar dataKey="max" fill="#0284c7" radius={[4, 4, 0, 0]} name="Upper Boundary" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {topScenario && (
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          <strong>Business Insight:</strong> Median recommended EMI stays in a narrow ₹{medianLow.toLocaleString()}-₹{medianHigh.toLocaleString()} band across every scenario, but {topScenario.scenario} reaches the highest ceiling observed (up to ₹{overallMax.toLocaleString()}) — a small higher-income segment drives a long right tail rather than a uniformly wide spread.
        </p>
      )}
    </div>
  );
};
