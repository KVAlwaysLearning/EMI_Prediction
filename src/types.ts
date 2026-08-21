export interface PredictionRequestPayload {
  age: number;
  gender: 'Male' | 'Female';
  marital_status: 'Single' | 'Married';
  education: 'High School' | 'Graduate' | 'Post Graduate' | 'Professional';
  monthly_salary: number;
  employment_type: 'Private' | 'Government' | 'Self-employed';
  years_of_employment: number;
  company_type: string;
  house_type: 'Rented' | 'Own' | 'Family';
  monthly_rent: number;
  family_size: number;
  dependents: number;
  school_fees: number;
  college_fees: number;
  travel_expenses: number;
  groceries_utilities: number;
  other_monthly_expenses: number;
  existing_loans: boolean;
  current_emi_amount: number;
  credit_score: number;
  bank_balance: number;
  emergency_fund: number;
  emi_scenario: 'E-commerce Shopping' | 'Home Appliances' | 'Vehicle' | 'Personal Loan' | 'Education';
  requested_amount: number;
  requested_tenure: number;
}

export interface EligibilityResponseData {
  eligibility_class: 'Eligible' | 'High_Risk' | 'Not_Eligible';
  class_probabilities: Record<string, number>;
  probabilities_are_estimated?: boolean;
}

export interface MaxEmiResponseData {
  max_monthly_emi: number;
  currency: string;
}

export interface CombinedPredictionResponseData {
  eligibility: EligibilityResponseData;
  max_emi: MaxEmiResponseData;
  risk_score: number;
  affordability_ratio: number;
  debt_to_income_ratio?: number;
  expense_to_income_ratio?: number;
  engine?: 'onnx' | 'python_cli' | 'rule_based';
}

export interface StoredRecord extends PredictionRequestPayload {
  id: string;
  applicant_name: string;
  prediction_result: 'Eligible' | 'High_Risk' | 'Not_Eligible';
  max_recommended_emi: number;
  timestamp: string;
}

export interface ClassificationModelMetric {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  mlflow_run_id: string | null;
  is_production: boolean;
}

export interface RegressionModelMetric {
  model_name: string;
  rmse: number;
  mae: number;
  r2: number;
  mape: number;
  mlflow_run_id: string | null;
  is_production: boolean;
}

export interface ModelComparisonData {
  generated?: boolean;
  generated_at?: string;
  error?: string;
  note?: string;
  classification: ClassificationModelMetric[];
  regression: RegressionModelMetric[];
  selection_rationale?: {
    classification?: string;
    regression?: string;
  };
}

export interface EdaSummaryData {
  generated?: boolean;
  generated_at?: string;
  eligibilityByScenario: Array<{
    scenario: string;
    Eligible: number;
    High_Risk: number;
    Not_Eligible: number;
  }>;
  eligibilityByAgeBracket: Array<{
    ageBracket: string;
    approvalRate: number;
  }>;
  eligibilityByEmploymentType: Array<{
    type: string;
    approvalRate: number;
  }>;
  emiDistributionByScenario: Array<{
    scenario: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  }>;
}
