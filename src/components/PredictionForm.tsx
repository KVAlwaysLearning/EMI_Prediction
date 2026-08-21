import React, { useState } from 'react';
import { PredictionRequestPayload, CombinedPredictionResponseData } from '../types';
import { predictCombined, ApiError } from '../lib/api';
import { ResultCard } from './ResultCard';
import { User, Briefcase, Home, CreditCard, ShieldAlert, FileText, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

interface PredictionFormProps {
  onSuccessSave?: () => void;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onSuccessSave }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CombinedPredictionResponseData | null>(null);

  const [formData, setFormData] = useState<PredictionRequestPayload>({
    age: 32,
    gender: 'Male',
    marital_status: 'Married',
    education: 'Graduate',
    monthly_salary: 85000,
    employment_type: 'Private',
    years_of_employment: 6.5,
    company_type: 'MNC',
    house_type: 'Rented',
    monthly_rent: 15000,
    family_size: 3,
    dependents: 1,
    school_fees: 4000,
    college_fees: 0,
    travel_expenses: 3500,
    groceries_utilities: 8000,
    other_monthly_expenses: 5000,
    existing_loans: true,
    current_emi_amount: 8000,
    credit_score: 750,
    bank_balance: 120000,
    emergency_fund: 50000,
    emi_scenario: 'Personal Loan',
    requested_amount: 300000,
    requested_tenure: 24,
  });

  const updateField = (field: keyof PredictionRequestPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const steps = [
    { num: 1, title: 'Demographics', icon: User },
    { num: 2, title: 'Employment', icon: Briefcase },
    { num: 3, title: 'Housing & Family', icon: Home },
    { num: 4, title: 'Monthly Expenses', icon: CreditCard },
    { num: 5, title: 'Financial Status', icon: ShieldAlert },
    { num: 6, title: 'Loan Details', icon: FileText },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await predictCombined(formData);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to process risk assessment');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ResultCard
        result={result}
        onReset={() => {
          setResult(null);
          setStep(1);
        }}
        onSaveToAdmin={onSuccessSave}
      />
    );
  }

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-6">
        <div>
          <h2 className="text-base font-bold text-white font-mono tracking-wide flex items-center gap-2">
            <span>22-Factor Loan Risk Assessment Form</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Step {step} of 6
            </span>
          </h2>
          <p className="text-xs text-slate-400">Fill in financial details for instant EMI classification and max limit calculation.</p>
        </div>
      </div>

      {/* Progress Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 font-mono text-[11px]">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`p-2.5 rounded border flex items-center gap-2 cursor-pointer transition-all ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                  : isDone
                  ? 'bg-[#1e293b] border-[#334155] text-slate-300'
                  : 'bg-[#0b1329] border-[#1e293b] text-slate-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{s.title}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Multi-Step Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Age (25 - 60)</label>
              <input
                type="number"
                min={25}
                max={60}
                value={formData.age}
                onChange={(e) => updateField('age', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value as any)}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              >
                <option value="Male" className="bg-[#0f172a]">Male</option>
                <option value="Female" className="bg-[#0f172a]">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Marital Status</label>
              <select
                value={formData.marital_status}
                onChange={(e) => updateField('marital_status', e.target.value as any)}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              >
                <option value="Single" className="bg-[#0f172a]">Single</option>
                <option value="Married" className="bg-[#0f172a]">Married</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Education Level</label>
              <select
                value={formData.education}
                onChange={(e) => updateField('education', e.target.value as any)}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              >
                <option value="High School" className="bg-[#0f172a]">High School</option>
                <option value="Graduate" className="bg-[#0f172a]">Graduate</option>
                <option value="Post Graduate" className="bg-[#0f172a]">Post Graduate</option>
                <option value="Professional" className="bg-[#0f172a]">Professional</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Monthly Salary (INR)</label>
              <input
                type="number"
                min={15000}
                max={200000}
                value={formData.monthly_salary}
                onChange={(e) => updateField('monthly_salary', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Employment Type</label>
              <select
                value={formData.employment_type}
                onChange={(e) => updateField('employment_type', e.target.value as any)}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              >
                <option value="Private" className="bg-[#0f172a]">Private Sector</option>
                <option value="Government" className="bg-[#0f172a]">Government Sector</option>
                <option value="Self-employed" className="bg-[#0f172a]">Self Employed</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Years of Work Experience</label>
              <input
                type="number"
                step="0.5"
                min={0}
                value={formData.years_of_employment}
                onChange={(e) => updateField('years_of_employment', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Company Type</label>
              <select
                value={formData.company_type}
                onChange={(e) => updateField('company_type', e.target.value)}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              >
                <option value="MNC" className="bg-[#0f172a]">MNC (Multinational)</option>
                <option value="Enterprise" className="bg-[#0f172a]">Enterprise / Corporate</option>
                <option value="Startup" className="bg-[#0f172a]">Startup</option>
                <option value="Government" className="bg-[#0f172a]">Government / PSU</option>
                <option value="Local" className="bg-[#0f172a]">Local Business / SME</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Housing Arrangement</label>
              <select
                value={formData.house_type}
                onChange={(e) => updateField('house_type', e.target.value as any)}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              >
                <option value="Rented" className="bg-[#0f172a]">Rented</option>
                <option value="Own" className="bg-[#0f172a]">Owned</option>
                <option value="Family" className="bg-[#0f172a]">Family House</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Monthly Rent Obligation (INR)</label>
              <input
                type="number"
                min={0}
                value={formData.monthly_rent}
                onChange={(e) => updateField('monthly_rent', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Family Size</label>
              <input
                type="number"
                min={1}
                value={formData.family_size}
                onChange={(e) => updateField('family_size', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Financial Dependents</label>
              <input
                type="number"
                min={0}
                value={formData.dependents}
                onChange={(e) => updateField('dependents', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">School Fees (INR)</label>
              <input
                type="number"
                min={0}
                value={formData.school_fees}
                onChange={(e) => updateField('school_fees', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">College Fees (INR)</label>
              <input
                type="number"
                min={0}
                value={formData.college_fees}
                onChange={(e) => updateField('college_fees', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Travel Expenses (INR)</label>
              <input
                type="number"
                min={0}
                value={formData.travel_expenses}
                onChange={(e) => updateField('travel_expenses', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Groceries & Utilities (INR)</label>
              <input
                type="number"
                min={0}
                value={formData.groceries_utilities}
                onChange={(e) => updateField('groceries_utilities', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Other Monthly Expenses (INR)</label>
              <input
                type="number"
                min={0}
                value={formData.other_monthly_expenses}
                onChange={(e) => updateField('other_monthly_expenses', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Credit Score (300 - 850)</label>
              <input
                type="number"
                min={300}
                max={850}
                value={formData.credit_score}
                onChange={(e) => updateField('credit_score', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Existing Active Loans</label>
              <select
                value={formData.existing_loans ? 'true' : 'false'}
                onChange={(e) => updateField('existing_loans', e.target.value === 'true')}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              >
                <option value="true" className="bg-[#0f172a]">Yes, Active Loans</option>
                <option value="false" className="bg-[#0f172a]">No Existing Loans</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Current Monthly EMI Commitments (INR)</label>
              <input
                type="number"
                min={0}
                value={formData.current_emi_amount}
                onChange={(e) => updateField('current_emi_amount', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Bank Account Liquid Balance (INR)</label>
              <input
                type="number"
                min={0}
                value={formData.bank_balance}
                onChange={(e) => updateField('bank_balance', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Emergency Fund Savings (INR)</label>
              <input
                type="number"
                min={0}
                value={formData.emergency_fund}
                onChange={(e) => updateField('emergency_fund', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">EMI Loan Scenario Purpose</label>
              <select
                value={formData.emi_scenario}
                onChange={(e) => updateField('emi_scenario', e.target.value as any)}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              >
                <option value="Personal Loan" className="bg-[#0f172a]">Personal Loan</option>
                <option value="E-commerce Shopping" className="bg-[#0f172a]">E-commerce Shopping</option>
                <option value="Home Appliances" className="bg-[#0f172a]">Home Appliances</option>
                <option value="Vehicle" className="bg-[#0f172a]">Vehicle Loan</option>
                <option value="Education" className="bg-[#0f172a]">Education Loan</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Requested Loan Principal (INR)</label>
              <input
                type="number"
                min={1000}
                value={formData.requested_amount}
                onChange={(e) => updateField('requested_amount', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Requested Tenure (Months)</label>
              <input
                type="number"
                min={1}
                max={84}
                value={formData.requested_tenure}
                onChange={(e) => updateField('requested_tenure', Number(e.target.value))}
                className="w-full p-2.5 bg-[#0b1329] border border-[#1e293b] rounded text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Navigation & Submit Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1e293b]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing ML Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Risk Assessment</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
