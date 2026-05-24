from pydantic import BaseModel

class IndraInput(BaseModel):
    rain: float
    aqi: int
    wind: float
    visibility: float
    humidity: float
    temp: float
    pressure: float
    hour: int
    location_risk: int
    curfew: int
    
    

class DhanInput(BaseModel):
    user_id: str
    risk_score: float
    hours_disrupted: float
    avg_earnings: float
class KavachInput(BaseModel):
    speed: float
    claims_last_4h: int
    gps_distance: float
    risk_score: float