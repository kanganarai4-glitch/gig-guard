import api from '../config/api';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  mock?: boolean;
}

/** Create a Razorpay order for ₹49/week subscription. */
export const createOrder = async (amount = 49): Promise<{ order: RazorpayOrder; key: string }> => {
  const { data } = await api.post('/payments/create-order', { amount });
  return data;
};

/** Verify Razorpay payment after user completes checkout. */
export const verifyPayment = async (payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
}) => {
  const { data } = await api.post('/payments/verify', payload);
  return data;
};

/** Get payment history. */
export const getPayments = async () => {
  const { data } = await api.get('/payments');
  return data.data;
};
