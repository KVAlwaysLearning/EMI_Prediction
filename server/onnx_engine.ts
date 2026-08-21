import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Dynamically import onnxruntime-node to avoid startup failure if native binaries differ
let ort: any = null;
try {
  ort = require('onnxruntime-node');
} catch (err) {
  console.warn('[ONNX] onnxruntime-node module not loaded:', err);
}

export const CATEGORICAL_COLS = [
  'gender',
  'marital_status',
  'education',
  'employment_type',
  'company_type',
  'house_type',
  'emi_scenario',
] as const;

export const CATEGORICAL_CATEGORIES: Record<string, string[]> = {
  gender: ['Female', 'Male'],
  marital_status: ['Married', 'Single'],
  education: ['Graduate', 'High School', 'Post Graduate', 'Professional'],
  employment_type: ['Government', 'Private', 'Self-employed'],
  company_type: ['Large Indian', 'MNC', 'Mid-size', 'Small', 'Startup'],
  house_type: ['Family', 'Own', 'Rented'],
  emi_scenario: ['E-commerce Shopping', 'Education', 'Home Appliances', 'Personal Loan', 'Vehicle'],
};

export const NUMERIC_FEATURE_ORDER = [
  'age',
  'monthly_salary',
  'years_of_employment',
  'monthly_rent',
  'family_size',
  'dependents',
  'school_fees',
  'college_fees',
  'travel_expenses',
  'groceries_utilities',
  'other_monthly_expenses',
  'existing_loans',
  'current_emi_amount',
  'credit_score',
  'bank_balance',
  'emergency_fund',
  'requested_amount',
  'requested_tenure',
  'debt_to_income_ratio',
  'expense_to_income_ratio',
  'affordability_ratio',
  'risk_score',
  'salary_credit_interaction',
  'surplus_to_requested_ratio',
];

export const ONE_HOT_FEATURE_ORDER = [
  'gender_Female', 'gender_Male',
  'marital_status_Married', 'marital_status_Single',
  'education_Graduate', 'education_High School', 'education_Post Graduate', 'education_Professional',
  'employment_type_Government', 'employment_type_Private', 'employment_type_Self-employed',
  'company_type_Large Indian', 'company_type_MNC', 'company_type_Mid-size', 'company_type_Small', 'company_type_Startup',
  'house_type_Family', 'house_type_Own', 'house_type_Rented',
  'emi_scenario_E-commerce Shopping', 'emi_scenario_Education', 'emi_scenario_Home Appliances', 'emi_scenario_Personal Loan', 'emi_scenario_Vehicle'
];

export const ALL_FEATURE_ORDER = [...NUMERIC_FEATURE_ORDER, ...ONE_HOT_FEATURE_ORDER];

export function computeDerivedMetrics(req: Record<string, any>) {
  const salary = Number(req.monthly_salary) || 0;
  const rent = Number(req.monthly_rent) || 0;
  const current_emi = Number(req.current_emi_amount) || 0;
  const school_fees = Number(req.school_fees) || 0;
  const college_fees = Number(req.college_fees) || 0;
  const travel = Number(req.travel_expenses) || 0;
  const groceries = Number(req.groceries_utilities) || 0;
  const other = Number(req.other_monthly_expenses) || 0;
  const credit_score = Number(req.credit_score) || 600;
  const years_emp = Number(req.years_of_employment) || 1;
  const emp_type = String(req.employment_type || 'Private');
  const req_amount = Number(req.requested_amount) || 10000;
  const req_tenure = Number(req.requested_tenure) || 12;

  const total_obligations = rent + current_emi + school_fees + college_fees + travel + groceries + other;
  const dti = salary > 0 ? (current_emi + rent) / salary : 1.0;
  const expense_ratio = salary > 0 ? total_obligations / salary : 1.0;
  const surplus = Math.max(0, salary - total_obligations);
  const implied_emi = req_tenure > 0 ? req_amount / req_tenure : 1.0;
  const affordability = implied_emi > 0 ? surplus / implied_emi : 0.0;

  const norm_credit = (credit_score - 300) / 550.0;
  const emp_weight = emp_type === 'Government' ? 1.0 : (emp_type === 'Private' ? 0.85 : 0.70);
  const risk_score = Math.min(100.0, Math.max(0.0, (norm_credit * 50) + (Math.min(years_emp / 10.0, 1.0) * 25) + (emp_weight * 25)));

  const salary_credit_interaction = salary * (credit_score / 850.0);
  const surplus_to_req = req_amount > 0 ? surplus / req_amount : 0.0;

  return {
    total_obligations,
    debt_to_income_ratio: Number(dti.toFixed(4)),
    expense_to_income_ratio: Number(expense_ratio.toFixed(4)),
    surplus: Number(surplus.toFixed(2)),
    affordability_ratio: Number(affordability.toFixed(4)),
    risk_score: Number(risk_score.toFixed(2)),
    salary_credit_interaction: Number(salary_credit_interaction.toFixed(2)),
    surplus_to_requested_ratio: Number(surplus_to_req.toFixed(4)),
  };
}

export function buildFeatureVector(req: Record<string, any>): { vector: number[]; derived: ReturnType<typeof computeDerivedMetrics> } {
  const derived = computeDerivedMetrics(req);

  const num_values = [
    Number(req.age) || 30,
    Number(req.monthly_salary) || 0,
    Number(req.years_of_employment) || 1,
    Number(req.monthly_rent) || 0,
    Number(req.family_size) || 2,
    Number(req.dependents) || 0,
    Number(req.school_fees) || 0,
    Number(req.college_fees) || 0,
    Number(req.travel_expenses) || 0,
    Number(req.groceries_utilities) || 0,
    Number(req.other_monthly_expenses) || 0,
    req.existing_loans ? 1.0 : 0.0,
    Number(req.current_emi_amount) || 0,
    Number(req.credit_score) || 600,
    Number(req.bank_balance) || 0,
    Number(req.emergency_fund) || 0,
    Number(req.requested_amount) || 10000,
    Number(req.requested_tenure) || 12,
    derived.debt_to_income_ratio,
    derived.expense_to_income_ratio,
    derived.affordability_ratio,
    derived.risk_score,
    derived.salary_credit_interaction,
    derived.surplus_to_requested_ratio,
  ];

  const cat_values: number[] = [];
  for (const col of CATEGORICAL_COLS) {
    const val = String(req[col] || '').trim().toLowerCase();
    for (const cat of CATEGORICAL_CATEGORIES[col]) {
      cat_values.push(val === cat.toLowerCase() ? 1.0 : 0.0);
    }
  }

  const full_vector = [...num_values, ...cat_values];
  return { vector: full_vector, derived };
}

let classSession: any = null;
let regSession: any = null;
let hasWarnedMissingProba = false;
let scalerParams: { mean: number[]; scale: number[]; applies_to_first_n_columns: number } | null = null;

function loadScalerParams(): boolean {
  try {
    const scalerPath = path.join(process.cwd(), 'models', 'preprocessing', 'scaler_params.json');
    if (!fs.existsSync(scalerPath)) return false;
    const raw = fs.readFileSync(scalerPath, 'utf-8');
    scalerParams = JSON.parse(raw);
    return true;
  } catch (err) {
    console.warn('[ONNX] Could not load scaler_params.json:', err);
    return false;
  }
}

export function applyScaling(vector: number[]): number[] {
  if (!scalerParams) {
    throw new Error('scaler_params.json not loaded — cannot apply scaling before ONNX inference');
  }
  const { mean, scale, applies_to_first_n_columns } = scalerParams;
  return vector.map((v, i) => (i < applies_to_first_n_columns ? (v - mean[i]) / scale[i] : v));
}

export async function initOnnxSessions(): Promise<boolean> {
  if (!ort) return false;
  try {
    const classPath = path.join(process.cwd(), 'models', 'classification', 'best_classifier.onnx');
    const regPath = path.join(process.cwd(), 'models', 'regression', 'best_regressor.onnx');

    const scalerLoaded = loadScalerParams();
    if (!scalerLoaded) {
      console.warn('[ONNX] scaler_params.json missing — cannot initialize ONNX sessions safely');
      return false;
    }

    if (fs.existsSync(classPath) && fs.existsSync(regPath)) {
      classSession = await ort.InferenceSession.create(classPath);
      regSession = await ort.InferenceSession.create(regPath);
      console.log('[ONNX] Successfully loaded classifier and regressor ONNX models + scaler params');
      return true;
    }
  } catch (err) {
    console.warn('[ONNX] Could not initialize ONNX models:', err);
  }
  return false;
}

export function hasOnnxModels(): boolean {
  const classPath = path.join(process.cwd(), 'models', 'classification', 'best_classifier.onnx');
  const regPath = path.join(process.cwd(), 'models', 'regression', 'best_regressor.onnx');
  const scalerPath = path.join(process.cwd(), 'models', 'preprocessing', 'scaler_params.json');
  return fs.existsSync(classPath) && fs.existsSync(regPath) && fs.existsSync(scalerPath);
}

export async function runOnnxInference(req: Record<string, any>) {
  if (!ort) {
    throw new Error('onnxruntime-node is not available in runtime');
  }

  if (!classSession || !regSession) {
    const loaded = await initOnnxSessions();
    if (!loaded) {
      throw new Error('ONNX model files not found or failed to load');
    }
  }

  const { vector, derived } = buildFeatureVector(req);
  const scaledVector = applyScaling(vector);
  const inputTensor = new ort.Tensor('float32', new Float32Array(scaledVector), [1, scaledVector.length]);

  const classFeeds: Record<string, any> = {};
  const classInputName = classSession.inputNames[0] || 'float_input';
  classFeeds[classInputName] = inputTensor;
  const classResults = await classSession.run(classFeeds);
  const classOutput = classResults[classSession.outputNames[0]].data;

  let predClass = 'Eligible';
  if (typeof classOutput[0] === 'string') {
    predClass = classOutput[0];
  } else if (typeof classOutput[0] === 'number' || typeof classOutput[0] === 'bigint') {
    const classMap: Record<number, string> = { 0: 'Eligible', 1: 'High_Risk', 2: 'Not_Eligible' };
    predClass = classMap[Number(classOutput[0])] || 'Eligible';
  }

  let classProbs: Record<string, number> = {
    Eligible: predClass === 'Eligible' ? 1.0 : 0.0,
    High_Risk: predClass === 'High_Risk' ? 1.0 : 0.0,
    Not_Eligible: predClass === 'Not_Eligible' ? 1.0 : 0.0,
  };
  let probabilitiesAreEstimated = true;

  // Check if probability tensor is available in ONNX model outputs (D2)
  if (classSession.outputNames.length > 1) {
    const probOutput = classResults[classSession.outputNames[1]];
    if (probOutput && probOutput.data) {
      const probs = Array.from(probOutput.data) as number[];
      if (probs.length >= 3) {
        classProbs = {
          Eligible: Number(probs[0].toFixed(4)),
          High_Risk: Number(probs[1].toFixed(4)),
          Not_Eligible: Number(probs[2].toFixed(4)),
        };
        probabilitiesAreEstimated = false;
      }
    }
  }

  if (probabilitiesAreEstimated && !hasWarnedMissingProba) {
    hasWarnedMissingProba = true;
    console.warn(
      '[ONNX Warning] The loaded classifier ONNX model does not expose predict_proba output tensors. Using deterministic one-hot probabilities. To enable real confidence distributions, re-export from notebook 07 with zipmap/probability output options enabled.'
    );
  }

  const regFeeds: Record<string, any> = {};
  const regInputName = regSession.inputNames[0] || 'float_input';
  regFeeds[regInputName] = inputTensor;
  const regResults = await regSession.run(regFeeds);
  const regOutput = regResults[regSession.outputNames[0]].data;
  const maxEmi = Number(regOutput[0]) || 0;

  return {
    eligibility: {
      eligibility_class: predClass,
      class_probabilities: classProbs,
      probabilities_are_estimated: probabilitiesAreEstimated,
    },
    max_emi: {
      max_monthly_emi: Number(Math.max(0, maxEmi).toFixed(2)),
      currency: 'INR',
    },
    risk_score: derived.risk_score,
    affordability_ratio: derived.affordability_ratio,
    debt_to_income_ratio: derived.debt_to_income_ratio,
    expense_to_income_ratio: derived.expense_to_income_ratio,
    engine: 'onnx' as const,
  };
}
