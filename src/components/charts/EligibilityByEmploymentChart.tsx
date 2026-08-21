import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  data: Array<{ type: string; approvalRate: number }>;
}

export const EligibilityByEmploymentChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4">
      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
        Loan Approval Rate by Employment Sector (%)
      </h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="type" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', color: '#fff', fontSize: '12px' }} />
            <Bar dataKey="approvalRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 font-sans leading-relaxed">
        <strong>Business Insight:</strong> Government employees enjoy an 86% approval rate owing to high job security, whereas self-employed borrowers face stricter cash-flow verification.
      </p>
    </div>
  );
};
