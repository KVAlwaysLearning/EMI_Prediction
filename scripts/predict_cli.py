import sys
import json
import os

# Add scripts directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from feature_utils import build_feature_vector, compute_derived_metrics

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            print(json.dumps({"error": "Empty input received"}))
            sys.exit(1)
        
        req = json.loads(raw_input)
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        class_path = os.path.join(base_dir, "models", "classification", "best_classifier.pkl")
        reg_path = os.path.join(base_dir, "models", "regression", "best_regressor.pkl")
        encoder_path = os.path.join(base_dir, "models", "preprocessing", "encoders.pkl")
        scaler_path = os.path.join(base_dir, "models", "preprocessing", "scaler.pkl")

        if not (os.path.exists(class_path) and os.path.exists(reg_path)):
            print(json.dumps({"error": "Model not yet trained. Run notebooks 01-07 and export models before using this endpoint."}))
            sys.exit(0)

        try:
            import joblib
            import numpy as np
        except ImportError:
            print(json.dumps({"error": "Python ML dependencies (joblib, scikit-learn, numpy) are required for model inference."}))
            sys.exit(0)

        clf = joblib.load(class_path)
        reg = joblib.load(reg_path)
        encoder = joblib.load(encoder_path) if os.path.exists(encoder_path) else None
        scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None

        feature_vector, derived = build_feature_vector(req, encoder=encoder, scaler=scaler)
        X_input = np.array([feature_vector])

        pred_class = clf.predict(X_input)[0]
        if hasattr(clf, "predict_proba"):
            probs = clf.predict_proba(X_input)[0]
            classes = list(getattr(clf, "classes_", ["Eligible", "High_Risk", "Not_Eligible"]))
            class_probs = {str(cls): round(float(prob), 4) for cls, prob in zip(classes, probs)}
        else:
            class_probs = {str(pred_class): 1.0}

        pred_max_emi = float(reg.predict(X_input)[0])

        output = {
            "eligibility": {
                "eligibility_class": str(pred_class),
                "class_probabilities": class_probs
            },
            "max_emi": {
                "max_monthly_emi": round(pred_max_emi, 2),
                "currency": "INR"
            },
            "risk_score": derived['risk_score'],
            "affordability_ratio": derived['affordability_ratio'],
            "debt_to_income_ratio": derived['debt_to_income_ratio'],
            "expense_to_income_ratio": derived['expense_to_income_ratio']
        }
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
