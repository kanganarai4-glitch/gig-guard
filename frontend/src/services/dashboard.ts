import api from '../config/api';

export interface RiskData {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  message: string;
  rain: number;
  aqi: number;
  updatedAt: string;
}

export interface ClaimData {
  _id: string;
  claimId: string;
  date: string;
  type: 'rain' | 'aqi' | 'curfew';
  zone: string;
  amount: number;
  status: 'processing' | 'approved' | 'rejected';
  riskScore?: number;
}

export interface PaymentData {
  _id: string;
  amount: number;
  status: string;
  upiRef: string;
  description: string;
  paidAt: string;
}

export interface DashboardData {
  user: {
    name: string;
    city: string;
    zone: string;
    plan: { active: boolean; weeklyFee: number };
    whatsappConnected: boolean;
  };
  totalEarnings: number;
  protectedAmount: number;
  risk: RiskData;
  claims: ClaimData[];
  payments: PaymentData[];
  summary: {
    totalClaims: number;
    totalClaimed: number;
    totalPaid: number;
    protectedHours: number;
    totalHours: number;
    shieldPercent: number;
  };
}

/** Fetch all dashboard data for current user. */
export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get('/dashboard');
  return data.data;
};
