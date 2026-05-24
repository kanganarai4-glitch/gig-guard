def build_dhan_features(driver, risk_score):
    
    avg_earnings = driver["earnings"]["average_monthly_income"]
    
    total_hours = driver["work_history"]["total_hours_online"]
    
    # convert to daily approx
    hours_disrupted = total_hours / driver["work_history"]["total_working_days"]

    return {
        "risk_score": risk_score,
        "hours_disrupted": round(hours_disrupted, 2),
        "avg_earnings": avg_earnings
    }