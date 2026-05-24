import joblib

model = joblib.load("kavach.pkl")


def predict_kavach(data: dict):

    features = [[
        data["speed"],
        data["claims_last_4h"],
        data["gps_distance"],
        data["risk_score"]
    ]]
    prob = model.predict_proba(features)[0][1]

    prob = 0.7 * prob + 0.3 * 0.5

    return {
            "fraud": bool(prob > 0.6),
            "fraud_score": float(round(prob, 3))
        }