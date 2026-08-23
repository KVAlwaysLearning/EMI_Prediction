import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface Props {
  data: Array<{ scenario: string; Eligible: number; High_Risk: number; Not_Eligible: number }>;
}

export const EligibilityByScenarioChart: React.FC<Props> = ({ data }) => {
  const best = [...data].sort((a, b) => b.Eligible - a.Eligible)[0];
  const worst = [...data].sort((a, b) => a.Eligible - b.Eligible)[0];

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4">
      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
        Eligibility Class Distribution by EMI Scenario (%)
      </h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="scenario" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', color: '#fff', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Bar dataKey="Eligible" stackId="a" fill="#10b981" />
            <Bar dataKey="High_Risk" stackId="a" fill="#f59e0b" />
            <Bar dataKey="Not_Eligible" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {best && worst && (
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          <strong>Business Insight:</strong> {best.scenario} has the highest approval rate ({best.Eligible.toFixed(1)}% Eligible), while {worst.scenario} has the lowest ({worst.Eligible.toFixed(1)}% Eligible, {worst.Not_Eligible.toFixed(1)}% Not_Eligible) — reflecting how loan purpose drives eligibility more than any single applicant attribute.
        </p>
      )}
    </div>
  );
};
