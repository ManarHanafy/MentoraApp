import { API_BASE_URL } from '../config/env';

export interface RegisterRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

export const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        return await response.json();
      }
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    } catch (e) {
      console.error('Login error', e);
      throw e;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      // Try /api/Auth/register first as per screenshot, fallback to /api/Users
      let endpoint = `${API_BASE_URL}/Auth/register`;
      
      // We check if we should use /api/Users instead if /api/Auth/register is not available
      // But for simplicity in this implementation, we'll try the one seen in the screenshot
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok && response.status === 404) {
        // Fallback to /api/Users
        endpoint = `${API_BASE_URL}/Users`;
        const fallbackRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (fallbackRes.ok) return await fallbackRes.json();
      }

      if (response.ok) {
        return await response.json();
      }
      
      const error = await response.json();
      throw new Error(error.message || error.error || 'Registration failed');
    } catch (e) {
      console.error('Registration error', e);
      throw e;
    }
  }
};
