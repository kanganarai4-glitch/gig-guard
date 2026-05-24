import api from '../config/api';

export interface LoginPayload {
  name: string;
  email: string;
  provider: 'zomato' | 'swiggy' | 'google';
  phone?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  provider: string;
  city: string;
  zone: string;
  plan: { active: boolean; weeklyFee: number };
}

/**
 * Login / register via a social provider.
 * Creates user if they don't exist yet (upsert pattern).
 */
export const loginWithProvider = async (payload: LoginPayload): Promise<AuthUser> => {
  const { data } = await api.post('/auth/login', payload);
  // Persist token and user in localStorage
  localStorage.setItem('gg_token', data.token);
  localStorage.setItem('gg_user', JSON.stringify(data.user));
  return data.user;
};

/** Get the currently stored user from localStorage (no API call). */
export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('gg_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Clear auth state (logout). */
export const logout = () => {
  localStorage.removeItem('gg_token');
  localStorage.removeItem('gg_user');
};

/** Check if user is logged in. */
export const isLoggedIn = (): boolean => !!localStorage.getItem('gg_token');
