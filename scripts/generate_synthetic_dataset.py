"""
SYNTHETIC DATA GENERATOR — used only if no real dataset was provided by the assignment.

Generates ~400,000 realistic rows for the EMIPredict AI project constrained to the ranges
documented in docs/data_dictionary.md with realistic correlations between financial metrics,
credit scores, employment, and loan eligibility / max monthly EMI.
Uses standard Python library (csv, random, math) for zero-dependency execution.
"""

import os
import csv
import random
import math

def generate_synthetic_dataset(num_samples=400000, seed=42):
    random.seed(seed)
    print(f"Generating synthetic EMI dataset with {num_samples:,} records...")

    headers = [
        "age", "gender", "marital_status", "education", "monthly_salary",
        "employment_type", "years_of_employment", "company_type", "house_type",
        "monthly_rent", "family_size", "dependents", "school_fees", "college_fees",
        "travel_expenses", "groceries_utilities", "other_monthly_expenses",
        "existing_loans", "current_emi_amount", "credit_score", "bank_balance",
        "emergency_fund", "emi_scenario", "requested_amount", "requested_tenure",
        "emi_eligibility", "max_monthly_emi"
    ]

    os.makedirs("data/raw", exist_ok=True)
    output_path = "data/raw/EMI_dataset.csv"

    company_type_map = {
        "Private": ["MNC", "Startup", "Enterprise", "Local"],
        "Government": ["Government"],
        "Self-employed": ["Local", "Enterprise"]
    }

    scenario_amt_map = {
        "E-commerce Shopping": (5000, 80000),
        "Home Appliances": (10000, 150000),
        "Vehicle": (50000, 800000),
        "Personal Loan": (30000, 1000000),
        "Education": (50000, 1200000)
    }

    tenure_choices = [6, 12, 18, 24, 36, 48, 60, 72, 84]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)

        for _ in range(num_samples):
            age = random.randint(25, 60)
            gender = random.choices(["Male", "Female"], weights=[55, 45])[0]
            marital_status = random.choices(["Single", "Married"], weights=[40, 60])[0]
            education = random.choices(["High School", "Graduate", "Post Graduate", "Professional"], weights=[15, 50, 25, 10])[0]

            # Salary log-normal approximation
            raw_salary = math.exp(random.normalvariate(10.8, 0.5))
            monthly_salary = float(min(200000, max(15000, round(raw_salary, -2))))

            employment_type = random.choices(["Private", "Government", "Self-employed"], weights=[60, 25, 15])[0]
            max_exp = max(0.5, age - 21)
            years_of_employment = round(random.uniform(0.5, 1.0) * max_exp, 1)

            company_type = random.choice(company_type_map[employment_type])
            house_type = random.choices(["Rented", "Own", "Family"], weights=[45, 35, 20])[0]

            if house_type == "Rented":
                monthly_rent = float(min(45000, max(3000, round(monthly_salary * random.uniform(0.12, 0.28), -2))))
            else:
                monthly_rent = 0.0

            if marital_status == "Married":
                family_size = random.choices([2, 3, 4, 5, 6], weights=[20, 35, 30, 10, 5])[0]
            else:
                family_size = random.choices([1, 2, 3], weights=[70, 20, 10])[0]

            max_deps = max(0, family_size - 1)
            dependents = random.randint(0, max_deps) if max_deps > 0 else 0

            school_fees = float(min(25000, round(dependents * random.uniform(1500, 5000), -2))) if dependents > 0 else 0.0
            college_fees = float(min(35000, round(random.uniform(3000, 10000), -2))) if dependents > 1 else 0.0

            travel_expenses = float(min(15000, max(1000, round(monthly_salary * random.uniform(0.04, 0.10), -2))))
            groceries_utilities = float(min(30000, max(4000, round(monthly_salary * random.uniform(0.10, 0.22), -2))))
            other_monthly_expenses = float(min(20000, max(2000, round(monthly_salary * random.uniform(0.05, 0.12), -2))))

            existing_loans = random.choices([True, False], weights=[45, 55])[0]
            current_emi_amount = float(min(50000, max(2000, round(monthly_salary * random.uniform(0.10, 0.35), -2)))) if existing_loans else 0.0

            base_credit = 550 + (monthly_salary / 200000.0) * 150 + (40 if employment_type == "Government" else 0) - (30 if existing_loans else 0)
            credit_score = int(min(850, max(300, round(random.normalvariate(base_credit, 50)))))

            bank_balance = float(min(500000, max(5000, round(monthly_salary * random.uniform(0.5, 4.0), -2))))
            emergency_fund = float(min(200000, max(2000, round(bank_balance * random.uniform(0.2, 0.6), -2))))

            emi_scenario = random.choices(
                ["E-commerce Shopping", "Home Appliances", "Vehicle", "Personal Loan", "Education"],
                weights=[25, 20, 25, 20, 10]
            )[0]

            min_a, max_a = scenario_amt_map[emi_scenario]
            requested_amount = float(round(random.uniform(min_a, max_a), -2))
            requested_tenure = random.choice(tenure_choices)

            total_obligations = (
                monthly_rent + current_emi_amount + school_fees + college_fees +
                travel_expenses + groceries_utilities + other_monthly_expenses
            )
            dti = total_obligations / monthly_salary if monthly_salary > 0 else 1.0
            surplus = max(0.0, monthly_salary - total_obligations)
            implied_emi = requested_amount / requested_tenure if requested_tenure > 0 else 1.0
            affordability = surplus / max(1.0, implied_emi)

            norm_credit = (credit_score - 300) / 550.0
            emp_weight = 1.0 if employment_type == "Government" else (0.85 if employment_type == "Private" else 0.70)
            risk_score = min(100.0, max(0.0, (norm_credit * 50) + (min(years_of_employment / 10.0, 1.0) * 25) + (emp_weight * 25) - (dti * 20)))

            if risk_score >= 60 and dti <= 0.50 and affordability >= 1.1:
                eligibility = "Eligible"
            elif risk_score >= 40 and dti <= 0.70 and affordability >= 0.7:
                eligibility = "High_Risk"
            else:
                eligibility = "Not_Eligible"

            raw_max_emi = min(surplus * 0.45, monthly_salary * 0.40)
            max_monthly_emi = float(min(50000, max(500, round(raw_max_emi, -1))))

            writer.writerow([
                age, gender, marital_status, education, monthly_salary,
                employment_type, years_of_employment, company_type, house_type,
                monthly_rent, family_size, dependents, school_fees, college_fees,
                travel_expenses, groceries_utilities, other_monthly_expenses,
                existing_loans, current_emi_amount, credit_score, bank_balance,
                emergency_fund, emi_scenario, requested_amount, requested_tenure,
                eligibility, max_monthly_emi
            ])

    print(f"Dataset successfully saved to {output_path}")

if __name__ == "__main__":
    generate_synthetic_dataset()
