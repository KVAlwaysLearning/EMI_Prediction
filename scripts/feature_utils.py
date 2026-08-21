"""
Feature engineering utilities and shared calculation logic for EMIPredict AI.
Used across notebooks, synthetic data generation, and CLI inference.
"""

CATEGORICAL_COLS = [
    'gender',
    'marital_status',
    'education',
    'employment_type',
    'company_type',
    'house_type',
    'emi_scenario',
]

CATEGORICAL_CATEGORIES = {
    'gender': ['Female', 'Male'],
    'marital_status': ['Married', 'Single'],
    'education': ['Graduate', 'High School', 'Post Graduate', 'Professional'],
    'employment_type': ['Government', 'Private', 'Self-employed'],
    'company_type': ['Large Indian', 'MNC', 'Mid-size', 'Small', 'Startup'],
    'house_type': ['Family', 'Own', 'Rented'],
    'emi_scenario': ['E-commerce Shopping', 'Education', 'Home Appliances', 'Personal Loan', 'Vehicle'],
}

BASE_NUMERIC_COLS = [
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
]

DERIVED_NUMERIC_COLS = [
    'debt_to_income_ratio',
    'expense_to_income_ratio',
    'affordability_ratio',
    'risk_score',
    'salary_credit_interaction',
    'surplus_to_requested_ratio',
]

NUMERIC_FEATURE_ORDER = BASE_NUMERIC_COLS + DERIVED_NUMERIC_COLS

ONE_HOT_FEATURE_ORDER = [
    'gender_Female', 'gender_Male',
    'marital_status_Married', 'marital_status_Single',
    'education_Graduate', 'education_High School', 'education_Post Graduate', 'education_Professional',
    'employment_type_Government', 'employment_type_Private', 'employment_type_Self-employed',
    'company_type_Large Indian', 'company_type_MNC', 'company_type_Mid-size', 'company_type_Small', 'company_type_Startup',
    'house_type_Family', 'house_type_Own', 'house_type_Rented',
    'emi_scenario_E-commerce Shopping', 'emi_scenario_Education', 'emi_scenario_Home Appliances', 'emi_scenario_Personal Loan', 'emi_scenario_Vehicle'
]

ALL_FEATURE_ORDER = NUMERIC_FEATURE_ORDER + ONE_HOT_FEATURE_ORDER

def compute_derived_metrics(data_dict):
    """
    Computes financial derived ratios and composite risk score for a single dictionary record.
    Returns:
        total_obligations (float),
        debt_to_income_ratio (float),
        expense_to_income_ratio (float),
        surplus (float),
        affordability_ratio (float),
        risk_score (float),
        salary_credit_interaction (float),
        surplus_to_requested_ratio (float)
    """
    salary = float(data_dict.get('monthly_salary', 0))
    rent = float(data_dict.get('monthly_rent', 0))
    current_emi = float(data_dict.get('current_emi_amount', 0))
    school_fees = float(data_dict.get('school_fees', 0))
    college_fees = float(data_dict.get('college_fees', 0))
    travel = float(data_dict.get('travel_expenses', 0))
    groceries = float(data_dict.get('groceries_utilities', 0))
    other = float(data_dict.get('other_monthly_expenses', 0))
    credit_score = float(data_dict.get('credit_score', 600))
    years_emp = float(data_dict.get('years_of_employment', 1))
    emp_type = str(data_dict.get('employment_type', 'Private'))
    req_amount = float(data_dict.get('requested_amount', 10000))
    req_tenure = float(data_dict.get('requested_tenure', 12))

    total_obligations = rent + current_emi + school_fees + college_fees + travel + groceries + other
    dti = (current_emi + rent) / salary if salary > 0 else 1.0
    expense_ratio = total_obligations / salary if salary > 0 else 1.0
    surplus = max(0.0, salary - total_obligations)
    implied_emi = req_amount / req_tenure if req_tenure > 0 else 1.0
    affordability = surplus / implied_emi if implied_emi > 0 else 0.0

    norm_credit = (credit_score - 300) / 550.0
    emp_weight = 1.0 if emp_type == 'Government' else (0.85 if emp_type == 'Private' else 0.70)
    risk_score = min(100.0, max(0.0, (norm_credit * 50) + (min(years_emp / 10.0, 1.0) * 25) + (emp_weight * 25)))

    salary_credit_interaction = salary * (credit_score / 850.0)
    surplus_to_req = surplus / req_amount if req_amount > 0 else 0.0

    return {
        'total_obligations': total_obligations,
        'debt_to_income_ratio': round(dti, 4),
        'expense_to_income_ratio': round(expense_ratio, 4),
        'surplus': round(surplus, 2),
        'affordability_ratio': round(affordability, 4),
        'risk_score': round(risk_score, 2),
        'salary_credit_interaction': round(salary_credit_interaction, 2),
        'surplus_to_requested_ratio': round(surplus_to_req, 4),
    }

def build_feature_vector(req_dict, encoder=None, scaler=None):
    """
    Builds a 1D list or numpy array with features in exact ALL_FEATURE_ORDER (48 features).
    Applies StandardScaler to numerical features if provided, followed by OneHotEncoder for categoricals.
    """
    derived = compute_derived_metrics(req_dict)
    
    num_values = [
        float(req_dict.get('age', 30)),
        float(req_dict.get('monthly_salary', 0)),
        float(req_dict.get('years_of_employment', 1)),
        float(req_dict.get('monthly_rent', 0)),
        float(req_dict.get('family_size', 2)),
        float(req_dict.get('dependents', 0)),
        float(req_dict.get('school_fees', 0)),
        float(req_dict.get('college_fees', 0)),
        float(req_dict.get('travel_expenses', 0)),
        float(req_dict.get('groceries_utilities', 0)),
        float(req_dict.get('other_monthly_expenses', 0)),
        1.0 if req_dict.get('existing_loans') else 0.0,
        float(req_dict.get('current_emi_amount', 0)),
        float(req_dict.get('credit_score', 600)),
        float(req_dict.get('bank_balance', 0)),
        float(req_dict.get('emergency_fund', 0)),
        float(req_dict.get('requested_amount', 10000)),
        float(req_dict.get('requested_tenure', 12)),
        derived['debt_to_income_ratio'],
        derived['expense_to_income_ratio'],
        derived['affordability_ratio'],
        derived['risk_score'],
        derived['salary_credit_interaction'],
        derived['surplus_to_requested_ratio'],
    ]

    # Standard scale numerical features if scaler is provided
    if scaler is not None:
        try:
            import numpy as np
            num_scaled = list(scaler.transform(np.array([num_values]))[0])
            num_values = num_scaled
        except Exception:
            pass

    # One-hot encoding
    if encoder is not None:
        try:
            import pandas as pd
            cat_df = pd.DataFrame([{
                col: str(req_dict.get(col, '')) for col in CATEGORICAL_COLS
            }])
            encoded_cat = list(encoder.transform(cat_df)[0])
        except Exception:
            encoded_cat = []
            for col in CATEGORICAL_COLS:
                val = str(req_dict.get(col, ''))
                for cat_opt in CATEGORICAL_CATEGORIES[col]:
                    encoded_cat.append(1.0 if val.lower() == cat_opt.lower() else 0.0)
    else:
        encoded_cat = []
        for col in CATEGORICAL_COLS:
            val = str(req_dict.get(col, ''))
            for cat_opt in CATEGORICAL_CATEGORIES[col]:
                encoded_cat.append(1.0 if val.lower() == cat_opt.lower() else 0.0)

    full_vector = num_values + encoded_cat
    return full_vector, derived
