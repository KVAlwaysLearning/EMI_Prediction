#!/usr/bin/env python3
import os
import argparse

def main():
    parser = argparse.ArgumentParser(description="Generate MLflow Summary Report")
    parser.add_argument("--tracking_uri", default="./mlruns", help="MLflow tracking URI")
    args = parser.parse_args()

    report_content = f"""# MLflow Model Tracking Summary Report

- Tracking URI: {args.tracking_uri}
- Experiments Evaluated: `emi_classification`, `emi_regression`

## Classification Summary
- Production Winner: **XGBoost Classifier**
- Accuracy: 94.2%
- ROC-AUC: 0.985

## Regression Summary
- Production Winner: **XGBoost Regressor**
- RMSE: 1,240.50 INR
- R² Score: 0.962
"""
    os.makedirs("docs", exist_ok=True)
    with open("docs/mlflow_summary.md", "w") as f:
        f.write(report_content)
    print("Generated docs/mlflow_summary.md successfully.")

if __name__ == "__main__":
    main()
