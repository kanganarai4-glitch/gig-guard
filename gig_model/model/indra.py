import joblib

model = joblib.load("indra.pkl")


def predict_indra(data: dict) -> dict:

    features = [[
        data["rain"],
        data["aqi"],
        data["wind"],
        data["visibility"],
        data["humidity"],
        data["temp"],
        data["pressure"],
        data["hour"],
        data["location_risk"],
        data["curfew"]
    ]]

    probability = model.predict_proba(features)[0][1]

    risk_score = float(round(probability * 100, 2))

    auto_claim_trigger = bool(risk_score > 65)

    return {
        "risk_score": risk_score,
        "risk_label": "HIGH" if auto_claim_trigger else "LOW",
        "auto_claim_trigger": auto_claim_trigger,
        "raw_probability": float(round(probability, 3))
    }