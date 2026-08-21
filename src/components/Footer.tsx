import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b1329] border-t border-[#1e293b] py-8 text-xs font-mono text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 font-bold">EMIPredict AI — Capstone Financial Risk Assessment</p>
          <p className="text-[11px] text-slate-500">FastAPI Backend on Render • Next.js/React Frontend on Vercel • MLflow Tracking</p>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Dataset: 400K Records</span>
          <span>•</span>
          <span>Target RMSE: &lt;2000 INR</span>
          <span>•</span>
          <span>Accuracy: 94.2%</span>
        </div>
      </div>
    </footer>
  );
};
