import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor

np.random.seed(42)

n = 8000 

risk_score = np.random.uniform(0, 100, n)
hours_disrupted = np.random.uniform(1, 10, n)
avg_earnings = np.random.uniform(200, 1000, n)


payout = (
    (risk_score * 2) +              
    (hours_disrupted * 80) +        
    (avg_earnings * 0.3)            
)

noise = np.random.normal(0, 50, n)
payout = payout + noise

# Ensure minimum payout
payout = np.clip(payout, 50, None)

df = pd.DataFrame({
    "risk_score": risk_score,
    "hours_disrupted": hours_disrupted,
    "avg_earnings": avg_earnings,
    "payout": payout
})

X = df[["risk_score", "hours_disrupted", "avg_earnings"]]
y = df["payout"]

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=8,
    random_state=42
)

model.fit(X, y)

joblib.dump(model, "dhan.pkl")

print("✅ DHAN model trained successfully 💰🔥")