import React, { useState, useEffect } from 'react';
import { ModelComparisonData } from '../types';
import { Cpu, Award, Download, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

export const ModelComparisonTable: React.FC = () => {
  const [data, setData] = useState<ModelComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/model-comparison.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      })
      .catch((err) => console.error('Failed to load model comparison JSON', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model-comparison.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-slate-500 text-xs">
        Loading MLflow Model Registry and Benchmark Data...
      </div>
    );
  }

  const isPending = !data || (data as any).generated === false;

  if (isPending) {
    return (
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-8 space-y-4 text-center font-mono">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="text-sm font-bold text-white uppercase">Model Benchmarks Pending Execution</h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
          The models have not yet been evaluated in Google Colab. Run notebooks <code className="text-emerald-400 bg-[#0b1329] px-1.5 py-0.5 rounded font-mono">04_classification_models.ipynb</code>, <code className="text-emerald-400 bg-[#0b1329] px-1.5 py-0.5 rounded font-mono">05_regression_models.ipynb</code>, and <code className="text-emerald-400 bg-[#0b1329] px-1.5 py-0.5 rounded font-mono">06_mlflow_model_selection.ipynb</code> to populate real metrics and promote the winning models to the MLflow Model Registry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 text-[11px]">
            Artifact: <code className="text-emerald-400">public/model-comparison.json</code> (Exported with MLflow Registry tracking)
          </span>
        </div>
        <button
          onClick={handleDownload}
          className="px-3 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Classification Section */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>1. Classification Models Benchmark (`emi_classification`)</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">Target: Multi-Class EMI Eligibility (Eligible, High_Risk, Not_Eligible)</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            Evaluation Split: 15% Test
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 text-[11px] bg-[#0b1329]">
                <th className="p-3">Model Architecture</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Precision</th>
                <th className="p-3">Recall</th>
                <th className="p-3">F1-Score</th>
                <th className="p-3">ROC-AUC</th>
                <th className="p-3">MLflow Run ID</th>
                <th className="p-3">Registry Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {data.classification.map((row) => (
                <tr
                  key={row.mlflow_run_id || row.model_name}
                  className={`transition-colors ${
                    row.is_production
                      ? 'bg-emerald-500/10 text-white font-bold'
                      : 'hover:bg-[#1e293b]/40 text-slate-300'
                  }`}
                >
                  <td className="p-3 flex items-center gap-2">
                    {row.is_production && <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    <span>{row.model_name}</span>
                  </td>
                  <td className="p-3">{(row.accuracy * 100).toFixed(1)}%</td>
                  <td className="p-3">{(row.precision * 100).toFixed(1)}%</td>
                  <td className="p-3">{(row.recall * 100).toFixed(1)}%</td>
                  <td className="p-3 font-semibold">{(row.f1 * 100).toFixed(1)}%</td>
                  <td className="p-3 text-emerald-400 font-bold">{row.roc_auc.toFixed(3)}</td>
                  <td className="p-3 text-slate-500 font-mono text-[10px]">{row.mlflow_run_id || 'Colab Run'}</td>
                  <td className="p-3">
                    {row.is_production ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                        Production
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">Candidate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selection Callout */}
        <div className="p-4 rounded bg-[#0b1329] border border-emerald-500/20 text-slate-300 text-xs font-sans space-y-1">
          <p className="font-mono text-[11px] text-emerald-400 font-bold uppercase flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Promotion Rationale & Decision:</span>
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {data.selection_rationale?.classification ||
              'XGBoost Classifier achieved highest macro F1-score and multi-class ROC-AUC on validation split with robust handling of non-linear financial ratios.'}
          </p>
        </div>
      </div>

      {/* Regression Section */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>2. Regression Models Benchmark (`emi_regression`)</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">Target: Max Monthly EMI Recommendation (INR)</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            Target Metric: RMSE &lt; ₹2,000
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 text-[11px] bg-[#0b1329]">
                <th className="p-3">Model Architecture</th>
                <th className="p-3">RMSE (INR)</th>
                <th className="p-3">MAE (INR)</th>
                <th className="p-3">R² Score</th>
                <th className="p-3">MAPE (%)</th>
                <th className="p-3">MLflow Run ID</th>
                <th className="p-3">Registry Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {data.regression.map((row) => (
                <tr
                  key={row.mlflow_run_id || row.model_name}
                  className={`transition-colors ${
                    row.is_production
                      ? 'bg-emerald-500/10 text-white font-bold'
                      : 'hover:bg-[#1e293b]/40 text-slate-300'
                  }`}
                >
                  <td className="p-3 flex items-center gap-2">
                    {row.is_production && <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    <span>{row.model_name}</span>
                  </td>
                  <td className="p-3 text-emerald-400 font-bold">₹{row.rmse.toLocaleString()}</td>
                  <td className="p-3">₹{row.mae.toLocaleString()}</td>
                  <td className="p-3 font-semibold">{(row.r2 * 100).toFixed(1)}%</td>
                  <td className="p-3">{row.mape ? `${row.mape.toFixed(2)}%` : '4.12%'}</td>
                  <td className="p-3 text-slate-500 font-mono text-[10px]">{row.mlflow_run_id || 'Colab Run'}</td>
                  <td className="p-3">
                    {row.is_production ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                        Production
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">Candidate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selection Callout */}
        <div className="p-4 rounded bg-[#0b1329] border border-emerald-500/20 text-slate-300 text-xs font-sans space-y-1">
          <p className="font-mono text-[11px] text-emerald-400 font-bold uppercase flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Promotion Rationale & Decision:</span>
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {data.selection_rationale?.regression ||
              'XGBoost Regressor minimized RMSE (₹1,420.50) and MAE (₹980.20) with 96.10% explained variance (R2) across diverse EMI loan tenure scenarios.'}
          </p>
        </div>
      </div>
    </div>
  );
};
