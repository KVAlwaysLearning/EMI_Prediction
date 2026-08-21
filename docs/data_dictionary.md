# EMIPredict AI — Data Dictionary

| Column Name | Data Type | Expected Range / Categories | Description |
| :--- | :--- | :--- | :--- |
| **Personal Demographics** | | | |
| `age` | Integer | 25 - 60 | Applicant age in years |
| `gender` | Categorical | Male, Female | Applicant gender |
| `marital_status` | Categorical | Single, Married | Marital status |
| `education` | Categorical | High School, Graduate, Post Graduate, Professional | Highest education level completed |
| **Employment & Income** | | | |
| `monthly_salary` | Float | 15,000 - 200,000 INR | Gross monthly salary income |
| `employment_type` | Categorical | Private, Government, Self-employed | Employment sector/status |
| `years_of_employment` | Float | 0.0 - 40.0 | Work experience in years |
| `company_type` | Categorical | Large Indian, MNC, Mid-size, Small, Startup | Type of employing organization |
| **Housing & Family** | | | |
| `house_type` | Categorical | Rented, Own, Family | Current housing arrangement |
| `monthly_rent` | Float | >= 0 INR | Monthly rent obligation |
| `family_size` | Integer | >= 1 | Total family members |
| `dependents` | Integer | >= 0 | Number of financial dependents |
| **Monthly Financial Obligations** | | | |
| `school_fees` | Float | >= 0 INR | Monthly school tuition fees |
| `college_fees` | Float | >= 0 INR | Monthly college fees |
| `travel_expenses` | Float | >= 0 INR | Monthly commute/travel expenses |
| `groceries_utilities` | Float | >= 0 INR | Monthly grocery and utility bills |
| `other_monthly_expenses` | Float | >= 0 INR | Miscellaneous monthly expenses |
| **Financial Status & Credit History** | | | |
| `existing_loans` | Boolean | True, False | Whether applicant has active loans |
| `current_emi_amount` | Float | >= 0 INR | Sum of existing monthly EMI commitments |
| `credit_score` | Integer | 300 - 850 | Credit bureau score |
| `bank_balance` | Float | >= 0 INR | Current liquid bank account balance |
| `emergency_fund` | Float | >= 0 INR | Reserved emergency savings |
| **Loan Application Details** | | | |
| `emi_scenario` | Categorical | E-commerce Shopping, Home Appliances, Vehicle, Personal Loan, Education | Loan request purpose category |
| `requested_amount` | Float | > 0 INR | Principal loan amount requested |
| `requested_tenure` | Integer | 1 - 84 Months | Loan tenure requested in months |
| **Target Variables** | | | |
| `emi_eligibility` | Categorical | Eligible, High_Risk, Not_Eligible | Classification target for loan approval risk |
| `max_monthly_emi` | Float | 500 - 50,000 INR | Regression target for maximum recommended monthly EMI |
