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
      
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        if (Array.isArray(error.errors) && error.errors.length > 0) {
          // Backend returns [{code, field, description}] — show field-level details first
          errorMessage = error.errors.map((e: any) => e.description || e.message || String(e)).join('\n');
        } else if (error.errors && typeof error.errors === 'object') {
          errorMessage = Object.values(error.errors).flat().join('\n');
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.title && typeof error.title === 'string') {
          errorMessage = error.title;
        }
      } catch {
        errorMessage = `Server Error (${response.status})`;
      }
      throw new Error(errorMessage);
    } catch (e) {
      console.warn('Login error', e);
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
      
      let errorMessage = 'Registration failed';
      try {
        const error = await response.json();
        if (Array.isArray(error.errors) && error.errors.length > 0) {
          // Backend returns [{code, field, description}] — show field-level details first
          errorMessage = error.errors.map((e: any) => e.description || e.message || String(e)).join('\n');
        } else if (error.errors && typeof error.errors === 'object') {
          errorMessage = Object.values(error.errors).flat().join('\n');
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.title && typeof error.title === 'string') {
          errorMessage = error.title;
        }
      } catch {
        errorMessage = `Server Error (${response.status})`;
      }
      throw new Error(errorMessage);
    } catch (e) {
      console.warn('Registration error', e);
      throw e;
    }
  }
};
