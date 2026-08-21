import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  data: Array<{ ageBracket: string; approvalRate: number }>;
}

export const EligibilityByAgeChart: React.FC<Props> = ({ data }) => {
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
        <strong>Business Insight:</strong> Applicants aged 31–50 demonstrate peak credit stability and income growth, resulting in approval rates above 78% compared to younger applicants entering the workforce.
      </p>
    </div>
  );
};
