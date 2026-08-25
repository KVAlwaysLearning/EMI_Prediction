# EMIPredict AI — Intelligent Financial Risk Assessment Platform

EMIPredict AI is an end-to-end Machine Learning and Full-Stack Web Application for real-time financial EMI eligibility classification and maximum monthly EMI recommendation. Built on a standardized **48-feature pipeline** (24 numeric/derived financial metrics and 24 one-hot encoded categorical indicators) across 5 loan scenarios (*E-commerce Shopping, Home Appliances, Vehicle, Personal Loan, Education*), the platform combines automated feature engineering, **DagsHub remote MLflow experiment tracking**, **ONNX Runtime Node.js inference**, Python CLI subprocess inference, and a responsive React underwriting dashboard.

---

## Important Links:

Live Render App: https://emipredict-ai-0v9r.onrender.com/

Streamlit App: https://emiprediction-00.streamlit.app

---

## 1. Repository Structure

```
emipredict-ai/
├── README.md
├── requirements.txt                         # Pinned Python ML dependencies
├── package.json                             # Node.js dependencies & scripts
├── metadata.json
├── .env.example                             # Environment configuration template
├── docs/
│   ├── Project_Report.docx
│   ├── EDA_Report.docx
│   ├── Model_Comparison_Report.docx
│   ├── Business_Impact_Assessment.docx
│   ├── data_dictionary.md
│   ├── mlflow_summary.md
│   └── architecture-diagram.png
├── data/
│   ├── raw/ (EMI_dataset.csv)
│   └── processed/ (cleaned_dataset.csv, engineered_dataset.csv)
├── notebooks/
│   ├── 01_data_loading_and_cleaning.ipynb   # Missing values, outliers, types
│   ├── 02_exploratory_data_analysis.ipynb   # Distributions, correlation matrices
│   ├── 03_feature_engineering.ipynb         # 48-feature vector (feature_utils.py)
│   ├── 04_classification_models.ipynb       # LR, RF, GBDT, XGBoost + DagsHub MLflow
│   ├── 05_regression_models.ipynb           # Linear, RF, GBDT, XGBoost + DagsHub MLflow
│   ├── 06_mlflow_model_selection.ipynb      # Model Registry, promotion & JSON export
│   └── 07_export_artifacts_for_deployment.ipynb # ONNX export & parity validation
├── models/
│   ├── best_classifier.onnx                 # Production ONNX classification model
│   ├── best_regressor.onnx                  # Production ONNX regression model
│   ├── classification/
│   │   ├── best_classifier.pkl              # Scikit-learn/XGBoost candidate model
│   │   └── classifier_metadata.json         # 48-feature schema & metrics
│   ├── regression/
│   │   ├── best_regressor.pkl               # Scikit-learn/XGBoost candidate model
│   │   └── regressor_metadata.json          # 48-feature schema & metrics
│   └── preprocessing/
│       └── encoders.pkl                     # One-hot encoders & reference metadata
├── scripts/
│   ├── feature_utils.py                     # Single Source of Truth for 48 features
│   ├── predict_cli.py                       # CLI inference bridge
│   ├── generate_synthetic_dataset.py        # 400,000-record generator
│   └── generate_mlflow_report.py
├── public/
│   └── model-comparison.json                # Benchmark metrics for frontend dashboard
├── server/
│   └── onnx_engine.ts                       # Zero-Python ONNX inference engine
├── src/                                     # React UI & Underwriting Dashboard
│   ├── components/ (PredictionForm, ResultCard, ModelComparisonTable)
│   ├── pages/ (PredictPage, ExplorePage, ModelsPage, AdminPage)
│   └── lib/api.ts
└── server.ts                                # Express Full-Stack Server & API routes
```

---

## 2. Machine Learning Pipeline Architecture

### 48-Feature Vector (`scripts/feature_utils.py`)
All notebooks and inference engines use the exact same feature engineering module:
- **24 Numerical Features**: Age, salary, rent, family size, dependents, school fees, college fees, travel expenses, groceries/utilities, other expenses, current EMI, credit score, bank balance, emergency fund, requested amount, requested tenure, total monthly expenses, disposable income, surplus income, debt-to-income ratio (DTI), expense-to-income ratio, affordability ratio, emergency fund ratio, and financial risk score.
- **24 One-Hot Encoded Features**:
  - `gender` (2: Female, Male)
  - `marital_status` (2: Married, Single)
  - `education` (4: Graduate, High School, Post Graduate, Professional)
  - `employment_type` (3: Government, Private, Self-employed)
  - `company_type` (5: Large Indian, MNC, Mid-size, Small, Startup)
  - `house_type` (3: Family, Own, Rented)
  - `emi_scenario` (5: E-commerce Shopping, Education, Home Appliances, Personal Loan, Vehicle)

### Inference Engine Hierarchy (`server.ts` & `server/onnx_engine.ts`)
1. **ONNX Runtime Engine (Primary)**: Directly loads `models/best_classifier.onnx` and `models/best_regressor.onnx` via `onnxruntime-node` for low-latency, zero-Python in-process inference.
2. **Python CLI Subprocess (Secondary)**: Invokes `scripts/predict_cli.py` with `joblib` models.
3. **Rule-Based Engine (Fallback)**: Instant fallback calculation for seamless development and zero downtime before artifacts are trained.

---

## 3. Remote MLflow Experiment Tracking with DagsHub

The notebooks (`04_`, `05_`, `06_`) are pre-configured to log metrics, parameters, confusion matrices, and model artifacts directly to DagsHub.

### DagsHub Setup Steps:
1. Create a free account at [dagshub.com](https://dagshub.com) and create repository `emipredict-ai`.
2. Under the repository header, copy your tracking URI:
   ```
   https://dagshub.com/<username>/emipredict-ai.mlflow
   ```
3. Generate a Personal Access Token in **DagsHub Settings > Tokens**.
4. In Google Colab, add the following secrets via the Key icon:
   - `DAGSHUB_MLFLOW_URI`: `https://dagshub.com/<username>/emipredict-ai.mlflow`
   - `DAGSHUB_USERNAME`: `<your-dagshub-username>`
   - `DAGSHUB_TOKEN`: `<your-dagshub-token>`
5. Execute notebooks `01_` through `07_`. All runs and the registered `Production` models will automatically appear in your DagsHub MLflow dashboard.

---

## 4. Full-Stack Web Application Setup

### Development Mode
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive underwriting console, model comparison dashboard, and CRUD records manager.

### Production Build & Launch
```bash
npm run build
npm start
```

---

## 5. API Endpoints

- `GET /api/health`: Reports server status, ONNX availability, and active inference engine.
- `POST /api/predict`: Combined prediction returning eligibility classification, probabilities, recommended maximum monthly EMI (INR), and financial ratios.
- `POST /api/predict/eligibility`: Returns eligibility decision (`Eligible`, `High_Risk`, `Not_Eligible`).
- `POST /api/predict/max-emi`: Returns maximum recommended monthly EMI limit.
- `GET /api/records`: Retrieves stored loan application records (MongoDB or in-memory fallback).
- `POST /api/records`: Creates a new evaluated loan application record.
- `PUT /api/records/:id`: Updates applicant details.
- `DELETE /api/records/:id`: Removes a record.
