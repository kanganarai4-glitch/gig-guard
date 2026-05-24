from model.indra import predict_indra
from model.kavach import predict_kavach
from model.dhan import predict_dhan
from service.driver_service import get_driver_data
from service.feature_builder import build_dhan_features


def run_pipeline(data: dict):

    user_id = data.get("user_id")
    if not user_id:
        return {"success": False, "message": "user_id is required"}

    indra = predict_indra(data)

    speed = data.get("speed")
    claims = data.get("claims_last_4h")
    gps = data.get("gps_distance")

    if speed is None or claims is None or gps is None:
        return {"success": False, "message": "Missing fraud detection inputs"}

    kavach_input = {
        "speed": float(speed),
        "claims_last_4h": int(claims),
        "gps_distance": float(gps),
        "risk_score": float(indra["risk_score"])
    }

    kavach = predict_kavach(kavach_input)

    if kavach.get("fraud"):
        return {
            "success": True,
            "status": "Rejected ❌ Fraud detected",
            "indra": indra,
            "kavach": kavach
        }

    if not indra.get("auto_claim_trigger"):
        return {
            "success": True,
            "status": "No Claim ❌ Low risk",
            "indra": indra,
            "kavach": kavach
        }

    driver = get_driver_data(user_id)

    if not driver:
        return {"success": False, "message": "Driver not found"}

    dhan_features = build_dhan_features(driver, indra["risk_score"])

    payout = predict_dhan(dhan_features, driver)

    return {
        "success": True,
        "status": "Approved ✅",
        "plan": str(driver.get("plan", "basic")).lower(),
        "indra": indra,
        "kavach": kavach,
        "payout": payout
    }