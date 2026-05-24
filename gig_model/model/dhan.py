import joblib
from constants.plans import PLANS

model = joblib.load("dhan.pkl")


def predict_dhan(features: dict, driver: dict):

    input_data = [[
        float(features["risk_score"]),
        float(features["hours_disrupted"]),
        float(features["avg_earnings"])
    ]]

    predicted_payout = float(model.predict(input_data)[0])

    plan = driver.get("plan", "basic").lower()
    plan_data = PLANS.get(plan, PLANS["basic"])

    final_payout = min(predicted_payout, plan_data["max_payout"])

    return {
        "plan": plan,
        "plan_cost": plan_data["cost"],
        "predicted_payout": round(predicted_payout, 2),
        "final_payout": round(final_payout, 2)
    }