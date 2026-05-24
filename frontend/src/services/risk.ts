import api from '../config/api';
import { RiskData } from './dashboard';

/** Get the latest risk score for the current user. */
export const getLatestRisk = async (): Promise<RiskData | null> => {
  const { data } = await api.get('/risk/latest');
  return data.data;
};

/** Manually trigger a risk recalculation. */
export const calculateRisk = async (): Promise<RiskData> => {
  const { data } = await api.post('/risk/calculate');
  return data.data;
};
