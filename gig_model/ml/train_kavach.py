import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier

np.random.seed(42)
n = 8000

speed = np.random.uniform(0, 120, n)
claims_last_4h = np.random.randint(0, 5, n)
gps_distance = np.random.uniform(0, 1000, n)
risk_score = np.random.uniform(0, 100, n)

fraud_score = (
    (speed > 80) * 30 +
    (claims_last_4h > 1) * 25 +
    (gps_distance > 500) * 30 +
    (risk_score < 30) * 15
).astype(float)

fraud_score += np.random.normal(0, 5, n)

fraud_prob = fraud_score / 100
fraud_prob = np.clip(fraud_prob, 0, 1)

random_vals = np.random.rand(n)
fraud_label = (random_vals < fraud_prob).astype(int)

df = pd.DataFrame({
    "speed": speed,
    "claims": claims_last_4h,
    "gps_distance": gps_distance,
    "risk_score": risk_score,
    "fraud": fraud_label
})

X = df[["speed", "claims", "gps_distance", "risk_score"]]
y = df["fraud"]

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=8,
    random_state=42
)

model.fit(X, y)

joblib.dump(model, "kavach.pkl")

print("KAVACH model trained")