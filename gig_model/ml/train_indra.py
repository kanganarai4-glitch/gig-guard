import numpy as np
import pandas as pd
import joblib
from lightgbm import LGBMClassifier
from sklearn.utils import resample
from sklearn.calibration import CalibratedClassifierCV

np.random.seed(42)
n = 10000  

rain = np.random.gamma(2, 10, n)
aqi = np.random.randint(50, 400, n)
wind = np.random.uniform(0, 100, n)
visibility = np.random.uniform(0.5, 10, n)
humidity = np.random.uniform(20, 100, n)
temp = np.random.uniform(10, 45, n)
pressure = np.random.uniform(980, 1030, n)
hour = np.random.randint(0, 24, n)
location_risk = np.random.randint(20, 90, n)
curfew = np.random.randint(0, 2, n)

rain_aqi = rain * (aqi / 400)
low_visibility_impact = (1 / visibility) * 15

risk_score = (
    (rain / 100) * 15 +
    (aqi / 400) * 25 +
    (wind / 100) * 8 +
    low_visibility_impact +
    (humidity / 100) * 5 +
    (location_risk / 100) * 15 +
    curfew * 10 +
    (rain_aqi / 100) * 10
)

noise = np.random.normal(0, 5, n)
risk_score = risk_score + noise

risk_score = np.clip(risk_score, 0, 100)


condition_boost = (
    ((aqi > 200) & (visibility < 3)) * 10 +
    ((curfew == 1) & (location_risk > 60)) * 10
)

risk_score = risk_score + condition_boost
risk_score = np.clip(risk_score, 0, 100)


risk_label = (risk_score > 65).astype(int)


df = pd.DataFrame({
    "rain": rain,
    "aqi": aqi,
    "wind": wind,
    "visibility": visibility,
    "humidity": humidity,
    "temp": temp,
    "pressure": pressure,
    "hour": hour,
    "location_risk": location_risk,
    "curfew": curfew,
    "risk": risk_label
})


df_majority = df[df.risk == 0]
df_minority = df[df.risk == 1]

df_minority_upsampled = resample(
    df_minority,
    replace=True,
    n_samples=len(df_majority),
    random_state=42
)

df_balanced = pd.concat([df_majority, df_minority_upsampled])
df_balanced = df_balanced.sample(frac=1, random_state=42)

X = df_balanced.drop("risk", axis=1)
y = df_balanced["risk"]

base_model = LGBMClassifier(
    n_estimators=250,
    learning_rate=0.05,
    max_depth=7
)
model = CalibratedClassifierCV(base_model, method='sigmoid')
model.fit(X, y)

joblib.dump(model, "indra.pkl")

print("INDRA REALISTIC MODEL TRAINED ✅🔥")