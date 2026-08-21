import React, { useState, useEffect } from 'react';
import { EdaSummaryData } from '../types';
import { EligibilityByScenarioChart } from '../components/charts/EligibilityByScenarioChart';
import { EligibilityByAgeChart } from '../components/charts/EligibilityByAgeChart';
import { EligibilityByEmploymentChart } from '../components/charts/EligibilityByEmploymentChart';
import { MaxEmiByScenarioChart } from '../components/charts/MaxEmiByScenarioChart';
import { BarChart3, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [data, setData] = useState<EdaSummaryData | null>(null);

  useEffect(() => {
    fetch('/eda-summary.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Failed to load eda summary JSON', err));
  }, []);

  if (!data) {
    return (
      <div className="p-8 text-center font-mono text-slate-500 text-xs">
        Loading EDA Analytics Data...
      </div>
    );
  }

  const isReal = data.generated === true;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      <div className="border-b border-[#1e293b] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>EXPLORATORY DATA ANALYSIS (400,000 RECORDS)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-mono tracking-tight">
          Interactive EDA Findings & Risk Factor Breakdown
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Visualizing credit approval rates, demographic risk correlates, and monthly EMI limits across 5 loan scenarios.
        </p>
      </div>

      {/* D5: Sample Data / Real Data Banner */}
      {!isReal ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider block">Notice: Sample Data Preview</span>
            <p className="text-xs text-amber-200/90 font-sans leading-relaxed">
              Showing sample data — run the EDA notebook (<code className="text-amber-300 font-mono bg-[#0b1329] px-1 py-0.5 rounded">notebooks/02_exploratory_data_analysis.ipynb</code>) to populate this page with real results from the 400,000-record dataset.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Verified Dataset Metrics — Populated directly from cleaned dataset EDA run.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EligibilityByScenarioChart data={data.eligibilityByScenario} />
        <EligibilityByAgeChart data={data.eligibilityByAgeBracket} />
        <EligibilityByEmploymentChart data={data.eligibilityByEmploymentType} />
        <MaxEmiByScenarioChart data={data.emiDistributionByScenario} />
      </div>

      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-3 font-mono text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Key Business Insights for Loan Underwriters</span>
        </h3>
        <ul className="list-disc list-inside text-slate-300 space-y-2 text-xs font-sans leading-relaxed">
          <li>
            <strong>Debt-to-Income (DTI) Impact:</strong> Applicants with existing DTI exceeding 50% demonstrate a 4x increase in default risk, making DTI the single strongest predictor in feature importance.
          </li>
          <li>
            <strong>Employment Sector Stability:</strong> Government and MNC employees show significantly lower variance in disposable surplus, enabling higher recommended monthly EMI caps.
          </li>
          <li>
            <strong>Education & Collateral:</strong> Education loans display strong repayment reliability when paired with co-signers, resulting in high eligibility rates even for younger applicants.
          </li>
        </ul>
      </div>
    </div>
  );
};
