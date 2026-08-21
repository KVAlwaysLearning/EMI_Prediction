import React from 'react';
import { ModelComparisonTable } from '../components/ModelComparisonTable';
import { Cpu, Award } from 'lucide-react';

export const ModelsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-[#1e293b] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
          <Cpu className="w-3.5 h-3.5" />
          <span>MLFLOW EXPERIMENT TRACKING & MODEL REGISTRY</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-mono tracking-tight">
          Model Comparison Dashboard & Benchmark Evaluation
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Side-by-side performance comparison of classification and regression algorithms logged in MLflow.
        </p>
      </div>

      <ModelComparisonTable />
    </div>
  );
};
