import streamlit as st
import joblib
import pandas as pd
import numpy as np
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from feature_utils import build_feature_vector, CATEGORICAL_CATEGORIES

st.set_page_config(page_title="EMIPredict AI", page_icon="\U0001F4B0", layout="centered")

@st.cache_resource
def load_models():
    base = os.path.join(os.path.dirname(__file__), '..', 'models')
    clf = joblib.load(os.path.join(base, 'classification', 'best_classifier.pkl'))
    reg = joblib.load(os.path.join(base, 'regression', 'best_regressor.pkl'))
    encoder = joblib.load(os.path.join(base, 'preprocessing', 'encoders.pkl'))
    scaler = joblib.load(os.path.join(base, 'preprocessing', 'scaler.pkl'))
    return clf, reg, encoder, scaler

st.title("\U0001F4B0 EMIPredict AI")
st.caption("Reference Streamlit app using the same trained XGBoost models as the main deployment.")

try:
    clf, reg, encoder, scaler = load_models()
    models_loaded = True
except Exception as e:
    models_loaded = False
    st.error(f"Could not load trained models: {e}")

if models_loaded:
    with st.form("emi_form"):
        st.subheader("Personal & Employment")
        col1, col2 = st.columns(2)
        with col1:
            age = st.number_input("Age", 18, 70, 32)
            gender = st.selectbox("Gender", CATEGORICAL_CATEGORIES["gender"])
            marital_status = st.selectbox("Marital Status", CATEGORICAL_CATEGORIES["marital_status"])
            education = st.selectbox("Education", CATEGORICAL_CATEGORIES["education"])
        with col2:
            employment_type = st.selectbox("Employment Type", CATEGORICAL_CATEGORIES["employment_type"])
            company_type = st.selectbox("Company Type", CATEGORICAL_CATEGORIES["company_type"])
            years_of_employment = st.number_input("Years of Employment", 0.0, 40.0, 4.5)

        st.subheader("Income & Housing")
        col3, col4 = st.columns(2)
        with col3:
            monthly_salary = st.number_input("Monthly Salary (\u20b9)", 0, 1000000, 65000)
            house_type = st.selectbox("House Type", CATEGORICAL_CATEGORIES["house_type"])
            monthly_rent = st.number_input("Monthly Rent (\u20b9)", 0, 200000, 12000)
        with col4:
            family_size = st.number_input("Family Size", 1, 15, 3)
            dependents = st.number_input("Dependents", 0, 10, 1)

        st.subheader("Monthly Expenses")
        col5, col6 = st.columns(2)
        with col5:
            school_fees = st.number_input("School Fees (\u20b9)", 0, 100000, 2500)
            college_fees = st.number_input("College Fees (\u20b9)", 0, 100000, 0)
            travel_expenses = st.number_input("Travel Expenses (\u20b9)", 0, 100000, 3500)
        with col6:
            groceries_utilities = st.number_input("Groceries & Utilities (\u20b9)", 0, 100000, 8000)
            other_monthly_expenses = st.number_input("Other Monthly Expenses (\u20b9)", 0, 100000, 3000)

        st.subheader("Financial Status & Credit History")
        col7, col8 = st.columns(2)
        with col7:
            existing_loans = st.checkbox("Existing Loans?", value=True)
            current_emi_amount = st.number_input("Current EMI Amount (\u20b9)", 0, 200000, 5000)
            credit_score = st.number_input("Credit Score", 300, 850, 750)
        with col8:
            bank_balance = st.number_input("Bank Balance (\u20b9)", 0, 10000000, 120000)
            emergency_fund = st.number_input("Emergency Fund (\u20b9)", 0, 10000000, 45000)

        st.subheader("Loan Request")
        col9, col10 = st.columns(2)
        with col9:
            emi_scenario = st.selectbox("EMI Scenario", CATEGORICAL_CATEGORIES["emi_scenario"])
            requested_amount = st.number_input("Requested Amount (\u20b9)", 1000, 5000000, 150000)
        with col10:
            requested_tenure = st.number_input("Requested Tenure (months)", 1, 84, 24)

        submitted = st.form_submit_button("Calculate EMI Eligibility")

    if submitted:
        payload = {
            "age": age, "gender": gender, "marital_status": marital_status, "education": education,
            "monthly_salary": monthly_salary, "employment_type": employment_type,
            "years_of_employment": years_of_employment, "company_type": company_type,
            "house_type": house_type, "monthly_rent": monthly_rent, "family_size": family_size,
            "dependents": dependents, "school_fees": school_fees, "college_fees": college_fees,
            "travel_expenses": travel_expenses, "groceries_utilities": groceries_utilities,
            "other_monthly_expenses": other_monthly_expenses, "existing_loans": existing_loans,
            "current_emi_amount": current_emi_amount, "credit_score": credit_score,
            "bank_balance": bank_balance, "emergency_fund": emergency_fund,
            "emi_scenario": emi_scenario, "requested_amount": requested_amount,
            "requested_tenure": requested_tenure
        }

        vector, derived = build_feature_vector(payload, encoder=encoder, scaler=scaler)
        X = np.array([vector], dtype=np.float32)

        pred_class = clf.predict(X)[0]
        pred_proba = clf.predict_proba(X)[0] if hasattr(clf, "predict_proba") else None
        pred_emi = float(reg.predict(X)[0])

        st.divider()
        badge_color = {"Eligible": "green", "High_Risk": "orange", "Not_Eligible": "red"}.get(pred_class, "blue")
        st.markdown(f"### Result: :{badge_color}[{pred_class}]")

        if pred_proba is not None and hasattr(clf, "classes_"):
            proba_df = pd.DataFrame({"Class": clf.classes_, "Probability": [f"{p:.1%}" for p in pred_proba]})
            st.table(proba_df)

        st.metric("Recommended Max Monthly EMI", f"\u20b9{max(0, pred_emi):,.2f}")

        with st.expander("Derived financial metrics"):
            st.json(derived)

st.divider()
st.caption("Minimal reference implementation using the same trained models as the main EMIPredict AI application.")
