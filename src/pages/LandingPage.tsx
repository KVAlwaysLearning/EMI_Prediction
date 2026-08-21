import React from 'react';
import { ShieldCheck, ArrowRight, BarChart3, Cpu, CheckCircle2, Zap, Lock, Sparkles, Layers } from 'lucide-react';

interface Props {
  setActiveRoute: (route: string) => void;
}

export const LandingPage: React.FC<Props> = ({ setActiveRoute }) => {
  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CAPSTONE MACHINE LEARNING PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              EMIPredict AI
            </h1>

            <p className="text-lg text-slate-300 font-normal leading-relaxed">
              AI-powered EMI eligibility and risk assessment for smarter lending decisions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveRoute('predict')}
                className="px-6 py-3 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Calculate EMI Risk Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveRoute('explore')}
                className="px-6 py-3 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-200 font-mono font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Explore EDA Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-[#0f172a] border-b border-[#1e293b] py-8 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 border-r border-[#1e293b] last:border-r-0 space-y-1">
            <p className="text-3xl font-extrabold text-emerald-400">400K</p>
            <p className="text-xs text-slate-400">Records Trained On</p>
          </div>
          <div className="p-4 border-r border-[#1e293b] last:border-r-0 space-y-1">
            <p className="text-3xl font-extrabold text-white">90%+</p>
            <p className="text-xs text-slate-400">Classification Accuracy</p>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-3xl font-extrabold text-teal-400">5</p>
            <p className="text-xs text-slate-400">EMI Scenarios Supported</p>
          </div>
        </div>
      </section>

      {/* 3-Column How It Works */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white font-mono uppercase tracking-wide">How It Works</h2>
          <p className="text-xs text-slate-400 font-mono">Three seamless steps from applicant intake to automated risk decisioning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold">
              01
            </div>
            <h3 className="font-mono text-sm font-bold text-white uppercase">Enter Your Financials</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Provide applicant income, existing debt commitments, family obligations, liquid savings, and requested loan terms.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold">
              02
            </div>
            <h3 className="font-mono text-sm font-bold text-white uppercase">AI Analyzes 22 Factors</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              FastAPI backend executes derived ratios (DTI, expense-to-income, affordability) and runs XGBoost classification + regression models.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold">
              03
            </div>
            <h3 className="font-mono text-sm font-bold text-white uppercase">Instant Eligibility + Max EMI</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Receive color-coded eligibility class (Eligible, High Risk, Not Eligible), probability distributions, and maximum recommended monthly EMI.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Links */}
      <section className="bg-[#0f172a] border-t border-[#1e293b] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div 
            onClick={() => setActiveRoute('explore')}
            className="p-6 rounded-xl bg-[#0b1329] border border-[#1e293b] hover:border-emerald-500/40 transition-all cursor-pointer space-y-3"
          >
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Exploratory Data Analysis (EDA)</h4>
            <p className="text-slate-400 font-sans text-xs">Explore interactive charts on 400K records across age brackets, employment sectors, and EMI loan scenarios.</p>
          </div>

          <div 
            onClick={() => setActiveRoute('models')}
            className="p-6 rounded-xl bg-[#0b1329] border border-[#1e293b] hover:border-emerald-500/40 transition-all cursor-pointer space-y-3"
          >
            <Cpu className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">MLflow Model Comparison</h4>
            <p className="text-slate-400 font-sans text-xs">Inspect benchmark tables across XGBoost, Random Forest, Gradient Boosting, and Linear Regression models.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
