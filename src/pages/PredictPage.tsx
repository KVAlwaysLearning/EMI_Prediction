import React from 'react';
import { PredictionForm } from '../components/PredictionForm';

interface Props {
  setActiveRoute: (route: string) => void;
}

export const PredictPage: React.FC<Props> = ({ setActiveRoute }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold font-mono text-white tracking-wide uppercase">
          Financial Risk Assessment & Max EMI Calculator
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Enter applicant details below to run the ML inference pipeline.
        </p>
      </div>

      <PredictionForm
        onSuccessSave={() => {
          setActiveRoute('admin');
        }}
      />
    </div>
  );
};
