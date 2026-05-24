import api from '../config/api';

export interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface RiskZone {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  radius?: number;
  message?: string;
  rain?: number;
  aqi?: number;
}

export interface ClaimMapItem {
  _id: string;
  claimId: string;
  type: string;
  amount: number;
  status: string;
  zone: string;
  lat: number;
  lng: number;
  createdAt: string;
}

/** Send user's GPS coordinates to backend */
export const updateLocation = async (payload: LocationPayload) => {
  const { data } = await api.post('/location/update', payload);
  return data.data;
};

/** Get risk zones for map display */
export const getRiskZones = async (): Promise<{ userZones: RiskZone[]; staticZones: RiskZone[] }> => {
  const { data } = await api.get('/location/risk-zones');
  return data.data;
};

/** Get claims with coordinates for map pins */
export const getClaimsMap = async (): Promise<ClaimMapItem[]> => {
  const { data } = await api.get('/location/claims-map');
  return data.data;
};

/**
 * Get user's current GPS position using browser API.
 * Returns coords or falls back to Mumbai centre.
 */
export const getUserLocation = (): Promise<{ latitude: number; longitude: number; accuracy: number }> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported — using Mumbai fallback');
      return resolve({ latitude: 19.076, longitude: 72.8777, accuracy: 5000 });
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        console.warn('Geolocation denied/failed:', err.message, '— using Mumbai fallback');
        resolve({ latitude: 19.076, longitude: 72.8777, accuracy: 5000 });
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: true }
    );
  });
