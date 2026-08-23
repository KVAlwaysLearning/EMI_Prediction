import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  data: Array<{ ageBracket: string; approvalRate: number }>;
}

export const EligibilityByAgeChart: React.FC<Props> = ({ data }) => {
  const rates = data.map(d => d.approvalRate);
  const max = Math.max(...rates);
  const min = Math.min(...rates);
  const spread = max - min;
  const top = data.find(d => d.approvalRate === max);

  const insight = spread < 3
    ? `Approval rate is essentially flat across age brackets (${min.toFixed(1)}%-${max.toFixed(1)}%) — age is not a meaningful differentiator in this data.`
    : `Approval rate peaks in the ${top?.ageBracket} bracket at ${max.toFixed(1)}%, ranging down to ${min.toFixed(1)}% elsewhere.`;

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4">
      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
        Loan Approval Rate by Applicant Age Bracket (%)
      </h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="ageBracket" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', color: '#fff', fontSize: '12px' }} />
            <Bar dataKey="approvalRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 font-sans leading-relaxed">
        <strong>Business Insight:</strong> {insight}
      </p>
    </div>
  );
};
