import express from 'express';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { MongoClient, Collection } from 'mongodb';
import {
  hasOnnxModels,
  runOnnxInference,
  computeDerivedMetrics,
} from './server/onnx_engine';

interface StoredRecord {
  id: string;
  applicant_name: string;
  age: number;
  gender: string;
  marital_status: string;
  education: string;
  monthly_salary: number;
  employment_type: string;
  years_of_employment: number;
  company_type: string;
  house_type: string;
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
  emi_scenario: string;
  requested_amount: number;
  requested_tenure: number;
  prediction_result: 'Eligible' | 'High_Risk' | 'Not_Eligible' | 'Pending';
  max_recommended_emi: number;
  timestamp: string;
}

let inMemoryRecords: StoredRecord[] = [];
let mongoCollection: Collection<StoredRecord> | null = null;

async function initMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI provided. Using in-memory store for records.');
    return;
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('emipredict');
    mongoCollection = db.collection<StoredRecord>('records');
    console.log('Successfully connected to MongoDB Atlas for CRUD persistence.');
  } catch (err) {
    console.warn('MongoDB connection failed. Falling back to in-memory store:', err);
    mongoCollection = null;
  }
}

function checkPythonModelsExist(): boolean {
  const classModelPath = path.join(process.cwd(), 'models', 'classification', 'best_classifier.pkl');
  const regModelPath = path.join(process.cwd(), 'models', 'regression', 'best_regressor.pkl');
  return fs.existsSync(classModelPath) && fs.existsSync(regModelPath);
}

function runPythonInference(inputData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_cli.py');
    const child = execFile('python3', [scriptPath], (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseErr) {
        reject(parseErr);
      }
    });

    if (child.stdin) {
      child.stdin.write(JSON.stringify(inputData));
      child.stdin.end();
    }
  });
}

function computeRuleBasedPrediction(body: any) {
  const salary = Number(body.monthly_salary) || 50000;
  const rent = Number(body.monthly_rent) || 0;
  const current_emi = Number(body.current_emi_amount) || 0;
  const expenses =
    (Number(body.school_fees) || 0) +
    (Number(body.college_fees) || 0) +
    (Number(body.travel_expenses) || 0) +
    (Number(body.groceries_utilities) || 0) +
    (Number(body.other_monthly_expenses) || 0) +
    rent +
    current_emi;
  const credit = Number(body.credit_score) || 650;
  const surplus = Math.max(0, salary - expenses);
  const req_amount = Number(body.requested_amount) || 100000;
  const req_tenure = Number(body.requested_tenure) || 12;
  const requested_emi = req_tenure > 0 ? req_amount / req_tenure : 0;

  const dti = salary > 0 ? (current_emi + rent) / salary : 1.0;
  const expense_ratio = salary > 0 ? expenses / salary : 1.0;
  const max_emi = Math.round(Math.min(surplus * 0.6, salary * 0.4));

  let eligibility = 'Eligible';
  let probs = { Eligible: 0.85, High_Risk: 0.10, Not_Eligible: 0.05 };

  if (credit < 550 || dti > 0.60 || expense_ratio > 0.85) {
    eligibility = 'Not_Eligible';
    probs = { Eligible: 0.05, High_Risk: 0.15, Not_Eligible: 0.80 };
  } else if (credit < 650 || dti > 0.45 || (requested_emi > 0 && max_emi < requested_emi)) {
    eligibility = 'High_Risk';
    probs = { Eligible: 0.20, High_Risk: 0.65, Not_Eligible: 0.15 };
  }

  const derived = computeDerivedMetrics(body);

  return {
    eligibility: {
      eligibility_class: eligibility,
      class_probabilities: probs,
    },
    max_emi: {
      max_monthly_emi: Math.max(0, max_emi),
      currency: 'INR',
    },
    risk_score: derived.risk_score,
    affordability_ratio: derived.affordability_ratio,
    debt_to_income_ratio: derived.debt_to_income_ratio,
    expense_to_income_ratio: derived.expense_to_income_ratio,
    engine: 'rule_based' as const,
  };
}

async function runUnifiedInference(body: any) {
  // 1. Try ONNX inference engine
  if (hasOnnxModels()) {
    try {
      const onnxRes = await runOnnxInference(body);
      return onnxRes;
    } catch (onnxErr) {
      console.warn('[Prediction Engine] ONNX execution failed, trying Python CLI fallback:', onnxErr);
    }
  }

  // 2. Try Python CLI inference
  if (checkPythonModelsExist()) {
    try {
      const pyRes = await runPythonInference(body);
      if (pyRes && !pyRes.error) {
        return { ...pyRes, engine: 'python_cli' };
      }
    } catch (pyErr) {
      console.warn('[Prediction Engine] Python CLI failed, falling back to rule-based engine:', pyErr);
    }
  }

  // 3. Fallback to Rule-Based engine
  return computeRuleBasedPrediction(body);
}

async function startServer() {
  await initMongoDB();
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(express.json());

  // API Health & Metadata
  app.get('/api/health', (req, res) => {
    const onnxAvailable = hasOnnxModels();
    const pythonAvailable = checkPythonModelsExist();
    res.json({
      status: 'ok',
      service: 'emipredict-ai-backend',
      onnx_available: onnxAvailable,
      python_models_trained: pythonAvailable,
      active_engine: onnxAvailable ? 'onnx' : (pythonAvailable ? 'python_cli' : 'rule_based'),
    });
  });

  // Unified Predict Endpoint
  app.post('/api/predict', async (req, res) => {
    try {
      const result = await runUnifiedInference(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Inference failure' });
    }
  });

  app.post('/api/predict/eligibility', async (req, res) => {
    try {
      const result = await runUnifiedInference(req.body);
      res.json(result.eligibility);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Inference error' });
    }
  });

  app.post('/api/predict/max-emi', async (req, res) => {
    try {
      const result = await runUnifiedInference(req.body);
      res.json(result.max_emi);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Inference error' });
    }
  });

  app.post('/api/predict/combined', async (req, res) => {
    try {
      const result = await runUnifiedInference(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Inference error' });
    }
  });

  // Admin Token Auth Middleware (E1: Fail-closed if ADMIN_TOKEN is not set)
  const requireAdminAuth: express.RequestHandler = (req, res, next) => {
    const adminToken = process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN.trim() : '';
    if (!adminToken) {
      return res.status(500).json({ detail: 'Admin access is not configured: ADMIN_TOKEN is not set on the server.' });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'Unauthorized: Missing or invalid Authorization header' });
    }
    const token = authHeader.substring(7).trim();
    if (token !== adminToken) {
      return res.status(401).json({ detail: 'Unauthorized: Invalid Admin Token' });
    }
    next();
  };

  // Admin CRUD Records API (Protected by ADMIN_TOKEN)
  app.get('/api/records', requireAdminAuth, async (req, res) => {
    if (mongoCollection) {
      try {
        const records = await mongoCollection.find({}).sort({ timestamp: -1 }).toArray();
        return res.json(records);
      } catch (e) {
        console.error('MongoDB find error, falling back to in-memory:', e);
      }
    }
    res.json(inMemoryRecords);
  });

  app.post('/api/records', requireAdminAuth, async (req, res) => {
    const body = req.body;
    let predictionResult: 'Eligible' | 'High_Risk' | 'Not_Eligible' | 'Pending' = 'Pending';
    let maxEmi = 0;

    try {
      const inferred = await runUnifiedInference(body);
      predictionResult = inferred.eligibility?.eligibility_class || 'Eligible';
      maxEmi = inferred.max_emi?.max_monthly_emi || 0;
    } catch (e) {
      console.error('Inference error while saving record:', e);
    }

    const newRecord: StoredRecord = {
      id: `REC-${1000 + (mongoCollection ? await mongoCollection.countDocuments() : inMemoryRecords.length) + 1}`,
      applicant_name: body.applicant_name || 'Anonymous Applicant',
      age: Number(body.age) || 30,
      gender: body.gender || 'Male',
      marital_status: body.marital_status || 'Single',
      education: body.education || 'Graduate',
      monthly_salary: Number(body.monthly_salary) || 50000,
      employment_type: body.employment_type || 'Private',
      years_of_employment: Number(body.years_of_employment) || 3,
      company_type: body.company_type || 'MNC',
      house_type: body.house_type || 'Rented',
      monthly_rent: Number(body.monthly_rent) || 10000,
      family_size: Number(body.family_size) || 2,
      dependents: Number(body.dependents) || 0,
      school_fees: Number(body.school_fees) || 0,
      college_fees: Number(body.college_fees) || 0,
      travel_expenses: Number(body.travel_expenses) || 0,
      groceries_utilities: Number(body.groceries_utilities) || 0,
      other_monthly_expenses: Number(body.other_monthly_expenses) || 0,
      existing_loans: Boolean(body.existing_loans),
      current_emi_amount: Number(body.current_emi_amount) || 0,
      credit_score: Number(body.credit_score) || 720,
      bank_balance: Number(body.bank_balance) || 50000,
      emergency_fund: Number(body.emergency_fund) || 20000,
      emi_scenario: body.emi_scenario || 'Personal Loan',
      requested_amount: Number(body.requested_amount) || 100000,
      requested_tenure: Number(body.requested_tenure) || 12,
      prediction_result: predictionResult,
      max_recommended_emi: maxEmi,
      timestamp: new Date().toISOString(),
    };

    if (mongoCollection) {
      try {
        await mongoCollection.insertOne(newRecord);
      } catch (e) {
        console.error('MongoDB insert error, using in-memory store:', e);
        inMemoryRecords.unshift(newRecord);
      }
    } else {
      inMemoryRecords.unshift(newRecord);
    }

    res.status(201).json(newRecord);
  });

  app.put('/api/records/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    if (mongoCollection) {
      try {
        const result = await mongoCollection.findOneAndUpdate(
          { id },
          { $set: req.body },
          { returnDocument: 'after' }
        );
        if (result) {
          return res.json(result);
        }
      } catch (e) {
        console.error('MongoDB update error:', e);
      }
    }
    const index = inMemoryRecords.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ detail: 'Record not found' });
    }
    const updated = { ...inMemoryRecords[index], ...req.body };
    inMemoryRecords[index] = updated;
    res.json(updated);
  });

  app.delete('/api/records/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    if (mongoCollection) {
      try {
        await mongoCollection.deleteOne({ id });
        return res.json({ success: true });
      } catch (e) {
        console.error('MongoDB delete error:', e);
      }
    }
    inMemoryRecords = inMemoryRecords.filter((r) => r.id !== id);
    res.json({ success: true });
  });

  // Vite middleware in dev / static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EMIPredict AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
